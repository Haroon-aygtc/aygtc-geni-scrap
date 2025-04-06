import axios from "axios";
import { getMySQLClient, QueryTypes } from "./mysqlClient.js";
import { v4 as uuidv4 } from "uuid";
import logger from "@/utils/logger";
import aiModelFactory from "./ai/aiModelFactory";
import { AIModelRequest, AIModelResponse } from "./ai/types";

interface AIInteractionLogsParams {
  page: number;
  pageSize: number;
  query?: string;
  modelUsed?: string;
  contextRuleId?: string;
  startDate?: string;
  endDate?: string;
}

interface GenerateResponseOptions {
  query: string;
  contextRuleId?: string;
  userId: string;
  knowledgeBaseIds?: string[];
  promptTemplate?: string;
  systemPrompt?: string;
  preferredModel?: string;
  maxTokens?: number;
  temperature?: number;
  additionalParams?: Record<string, any>;
}

interface ModelPerformanceParams {
  timeRange?: string;
  startDate?: string;
  endDate?: string;
}

const aiService = {
  /**
   * Generate a response using AI models
   */
  generateResponse: async (
    options: GenerateResponseOptions,
  ): Promise<AIModelResponse> => {
    try {
      // Convert options to AIModelRequest format
      const modelRequest: AIModelRequest = {
        query: options.query,
        contextRuleId: options.contextRuleId,
        userId: options.userId,
        knowledgeBaseIds: options.knowledgeBaseIds,
        promptTemplate: options.promptTemplate,
        systemPrompt: options.systemPrompt,
        preferredModel: options.preferredModel,
        maxTokens: options.maxTokens,
        temperature: options.temperature,
        additionalParams: options.additionalParams,
      };

      // Generate response using the AI model factory
      const response = await aiModelFactory.generateResponse(modelRequest);

      // Log the interaction
      await aiService.logInteraction({
        userId: options.userId,
        query: options.query,
        response: response.content,
        modelUsed: response.modelUsed,
        contextRuleId: options.contextRuleId,
        knowledgeBaseResults: response.knowledgeBaseResults || 0,
        knowledgeBaseIds: response.knowledgeBaseIds || [],
        metadata: response.metadata,
      });

      return response;
    } catch (error) {
      logger.error("Error generating AI response:", error);

      // Return a fallback response
      const fallbackResponse = {
        content:
          "I'm sorry, I encountered an error processing your request. Please try again later.",
        modelUsed: "fallback-model",
      };

      // Try to log the error
      try {
        await aiService.logInteraction({
          userId: options.userId,
          query: options.query,
          response: fallbackResponse.content,
          modelUsed: fallbackResponse.modelUsed,
          contextRuleId: options.contextRuleId,
          metadata: {
            error: error instanceof Error ? error.message : String(error),
          },
        });
      } catch (logError) {
        logger.error("Failed to log AI interaction error:", logError);
      }

      return fallbackResponse;
    }
  },

  /**
   * Log an AI interaction to the database
   */
  logInteraction: async (data: {
    userId: string;
    query: string;
    response: string;
    modelUsed: string;
    contextRuleId?: string;
    knowledgeBaseResults?: number;
    knowledgeBaseIds?: string[];
    metadata?: Record<string, any>;
  }) => {
    try {
      const sequelize = await getMySQLClient();
      const logId = uuidv4();

      await sequelize.query(
        `INSERT INTO ai_interaction_logs (
          id, user_id, query, response, model_used, context_rule_id,
          knowledge_base_results, knowledge_base_ids, metadata, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        {
          replacements: [
            logId,
            data.userId,
            data.query,
            data.response,
            data.modelUsed,
            data.contextRuleId || null,
            data.knowledgeBaseResults || 0,
            data.knowledgeBaseIds ? data.knowledgeBaseIds.join(",") : null,
            data.metadata ? JSON.stringify(data.metadata) : null,
            new Date(),
          ],
          type: QueryTypes.INSERT,
        },
      );

      return true;
    } catch (error) {
      logger.error("Error logging AI interaction:", error);
      return false;
    }
  },

  /**
   * Get AI interaction logs with pagination and filtering
   */
  getInteractionLogs: async (params: AIInteractionLogsParams) => {
    try {
      const sequelize = await getMySQLClient();
      const { page = 1, pageSize = 20 } = params;
      const offset = (page - 1) * pageSize;

      // Build WHERE clause based on filters
      const whereConditions = [];
      const replacements: any[] = [];

      if (params.query) {
        whereConditions.push("(query LIKE ? OR response LIKE ?)");
        const searchTerm = `%${params.query}%`;
        replacements.push(searchTerm, searchTerm);
      }

      if (params.modelUsed) {
        whereConditions.push("model_used = ?");
        replacements.push(params.modelUsed);
      }

      if (params.contextRuleId) {
        whereConditions.push("context_rule_id = ?");
        replacements.push(params.contextRuleId);
      }

      if (params.startDate) {
        whereConditions.push("created_at >= ?");
        replacements.push(new Date(params.startDate));
      }

      if (params.endDate) {
        whereConditions.push("created_at <= ?");
        replacements.push(new Date(params.endDate));
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      // Get total count for pagination
      const [countResult] = await sequelize.query(
        `SELECT COUNT(*) as total FROM ai_interaction_logs ${whereClause}`,
        {
          replacements,
          type: QueryTypes.SELECT,
        },
      );

      const totalItems = (countResult as any).total;
      const totalPages = Math.ceil(totalItems / pageSize);

      // Get logs with pagination
      const logs = await sequelize.query(
        `SELECT * FROM ai_interaction_logs 
         ${whereClause}
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        {
          replacements: [...replacements, pageSize, offset],
          type: QueryTypes.SELECT,
        },
      );

      return {
        logs,
        totalItems,
        totalPages,
        currentPage: page,
      };
    } catch (error) {
      logger.error("Error getting AI interaction logs:", error);
      return {
        logs: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: params.page,
      };
    }
  },

  /**
   * Get available AI models
   */
  getAvailableModels: async () => {
    try {
      const models = aiModelFactory.getAllModels();
      const availableModels = [];

      for (const model of models) {
        const isAvailable = await model.isAvailable();
        if (isAvailable) {
          availableModels.push({
            id: model.id,
            name: model.name,
            provider: model.provider,
          });
        }
      }

      return availableModels;
    } catch (error) {
      logger.error("Error getting available AI models:", error);
      return [];
    }
  },

  /**
   * Set the default AI model
   */
  setDefaultModel: (modelId: string) => {
    try {
      aiModelFactory.setDefaultModelId(modelId);
      return true;
    } catch (error) {
      logger.error("Error setting default AI model:", error);
      return false;
    }
  },

  /**
   * Get the default AI model
   */
  getDefaultModel: () => {
    try {
      const model = aiModelFactory.getDefaultModel();
      return {
        id: model.id,
        name: model.name,
        provider: model.provider,
      };
    } catch (error) {
      logger.error("Error getting default AI model:", error);
      return null;
    }
  },

  /**
   * Get AI model performance metrics
   */
  getModelPerformance: async (params: ModelPerformanceParams = {}) => {
    try {
      const sequelize = await getMySQLClient();
      const { timeRange = "7d", startDate, endDate } = params;

      // Calculate date range based on timeRange or explicit dates
      let startDateTime = startDate ? new Date(startDate) : new Date();
      let endDateTime = endDate ? new Date(endDate) : new Date();

      if (!startDate) {
        // Parse timeRange (e.g., '7d', '30d', '24h')
        const match = timeRange.match(/^(\d+)([dh])$/);
        if (match) {
          const value = parseInt(match[1]);
          const unit = match[2];

          if (unit === "d") {
            startDateTime.setDate(startDateTime.getDate() - value);
          } else if (unit === "h") {
            startDateTime.setHours(startDateTime.getHours() - value);
          }
        }
      }

      // Format dates for SQL
      const formattedStartDate = startDateTime
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      const formattedEndDate = endDateTime
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      // Get model usage counts
      const modelUsage = await sequelize.query(
        `SELECT model_used as model, COUNT(*) as count 
         FROM ai_interaction_logs 
         WHERE created_at BETWEEN ? AND ? 
         GROUP BY model_used 
         ORDER BY count DESC`,
        {
          replacements: [formattedStartDate, formattedEndDate],
          type: QueryTypes.SELECT,
        },
      );

      // Get daily usage
      const dailyUsage = await sequelize.query(
        `SELECT DATE(created_at) as date, COUNT(*) as count 
         FROM ai_interaction_logs 
         WHERE created_at BETWEEN ? AND ? 
         GROUP BY DATE(created_at) 
         ORDER BY date ASC`,
        {
          replacements: [formattedStartDate, formattedEndDate],
          type: QueryTypes.SELECT,
        },
      );

      // Calculate average response times (based on metadata if available)
      // This assumes metadata might contain a responseTime field
      const avgResponseTimes = await sequelize.query(
        `SELECT model_used as model, 
         AVG(JSON_EXTRACT(metadata, '$.responseTime')) as avgTime 
         FROM ai_interaction_logs 
         WHERE created_at BETWEEN ? AND ? 
         AND metadata IS NOT NULL 
         AND JSON_EXTRACT(metadata, '$.responseTime') IS NOT NULL 
         GROUP BY model_used`,
        {
          replacements: [formattedStartDate, formattedEndDate],
          type: QueryTypes.SELECT,
        },
      );

      return {
        modelUsage,
        avgResponseTimes,
        dailyUsage,
        timeRange,
      };
    } catch (error) {
      logger.error("Error getting AI model performance metrics:", error);
      return {
        modelUsage: [],
        avgResponseTimes: [],
        dailyUsage: [],
        timeRange: params.timeRange || "7d",
      };
    }
  },
};

// Add default export
export default aiService;

// Also keep named exports if needed
export { aiService };
