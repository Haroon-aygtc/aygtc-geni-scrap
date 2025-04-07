/**
 * Follow-Up Controller
 *
 * This module provides controller functions for follow-up question management.
 */

import { getMySQLClient, QueryTypes } from "../utils/dbHelpers.js";
import { v4 as uuidv4 } from "uuid";
import { formatResponse } from "../utils/responseFormatter.js";
import { FollowUpConfig, FollowUpQuestion } from "../models/index.js";

/**
 * Create a new follow-up configuration
 */
export const createFollowUpConfig = async (req, res) => {
  try {
    const {
      name,
      isEnabled,
      maxQuestions,
      displayMode,
      generateDynamically,
      aiPrompt,
      isDefault,
    } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json(
        formatResponse(null, {
          message: "Configuration name is required",
          code: "ERR_400",
        }),
      );
    }

    const db = await getMySQLClient();
    const configId = uuidv4();
    const now = new Date().toISOString();

    // If this is set as default, unset any existing default
    if (isDefault) {
      await db.query(
        "UPDATE follow_up_configs SET is_default = 0 WHERE user_id = ?",
        {
          replacements: [userId],
          type: QueryTypes.UPDATE,
        },
      );
    }

    // Create config
    const configData = {
      id: configId,
      user_id: userId,
      name,
      is_enabled: isEnabled ? 1 : 0,
      max_questions: maxQuestions || 3,
      display_mode: displayMode || "buttons",
      generate_dynamically: generateDynamically ? 1 : 0,
      ai_prompt:
        aiPrompt ||
        "Generate follow-up questions based on the conversation context.",
      is_default: isDefault ? 1 : 0,
      created_at: now,
      updated_at: now,
    };

    await db.query(
      `INSERT INTO follow_up_configs 
       (id, user_id, name, is_enabled, max_questions, display_mode, generate_dynamically, ai_prompt, is_default, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          configData.id,
          configData.user_id,
          configData.name,
          configData.is_enabled,
          configData.max_questions,
          configData.display_mode,
          configData.generate_dynamically,
          configData.ai_prompt,
          configData.is_default,
          configData.created_at,
          configData.updated_at,
        ],
        type: QueryTypes.INSERT,
      },
    );

    // Get created config
    const [config] = await db.query(
      "SELECT * FROM follow_up_configs WHERE id = ?",
      {
        replacements: [configId],
        type: QueryTypes.SELECT,
      },
    );

    // Format response
    const formattedConfig = FollowUpConfig.fromDatabase(config);

    return res.json(formatResponse(formattedConfig));
  } catch (error) {
    console.error("Error creating follow-up config:", error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};

/**
 * Get all follow-up configurations for a user
 */
export const getAllFollowUpConfigs = async (req, res) => {
  try {
    const userId = req.user.id;

    const db = await getMySQLClient();

    // Get configs
    const configs = await db.query(
      "SELECT * FROM follow_up_configs WHERE user_id = ? ORDER BY created_at DESC",
      {
        replacements: [userId],
        type: QueryTypes.SELECT,
      },
    );

    // Format configs
    const formattedConfigs = configs.map(FollowUpConfig.fromDatabase);

    return res.json(formatResponse(formattedConfigs));
  } catch (error) {
    console.error("Error getting follow-up configs:", error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};

/**
 * Get follow-up configuration by ID
 */
export const getFollowUpConfigById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!id) {
      return res.status(400).json(
        formatResponse(null, {
          message: "Configuration ID is required",
          code: "ERR_400",
        }),
      );
    }

    const db = await getMySQLClient();

    // Get config
    const [config] = await db.query(
      "SELECT * FROM follow_up_configs WHERE id = ? AND user_id = ?",
      {
        replacements: [id, userId],
        type: QueryTypes.SELECT,
      },
    );

    if (!config) {
      return res.status(404).json(
        formatResponse(null, {
          message: "Follow-up configuration not found",
          code: "ERR_404",
        }),
      );
    }

    // Format and return config
    const formattedConfig = FollowUpConfig.fromDatabase(config);
    return res.json(formatResponse(formattedConfig));
  } catch (error) {
    console.error("Error getting follow-up config by ID:", error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};

/**
 * Update follow-up configuration
 */
export const updateFollowUpConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      isEnabled,
      maxQuestions,
      displayMode,
      generateDynamically,
      aiPrompt,
      isDefault,
    } = req.body;
    const userId = req.user.id;

    if (!id) {
      return res.status(400).json(
        formatResponse(null, {
          message: "Configuration ID is required",
          code: "ERR_400",
        }),
      );
    }

    const db = await getMySQLClient();

    // Check if config exists and belongs to user
    const [existingConfig] = await db.query(
      "SELECT * FROM follow_up_configs WHERE id = ? AND user_id = ?",
      {
        replacements: [id, userId],
        type: QueryTypes.SELECT,
      },
    );

    if (!existingConfig) {
      return res.status(404).json(
        formatResponse(null, {
          message: "Follow-up configuration not found",
          code: "ERR_404",
        }),
      );
    }

    // If this is set as default, unset any existing default
    if (isDefault) {
      await db.query(
        "UPDATE follow_up_configs SET is_default = 0 WHERE user_id = ? AND id != ?",
        {
          replacements: [userId, id],
          type: QueryTypes.UPDATE,
        },
      );
    }

    // Build update fields
    const updateFields = [];
    const updateParams = [];

    if (name !== undefined) {
      updateFields.push("name = ?");
      updateParams.push(name);
    }

    if (isEnabled !== undefined) {
      updateFields.push("is_enabled = ?");
      updateParams.push(isEnabled ? 1 : 0);
    }

    if (maxQuestions !== undefined) {
      updateFields.push("max_questions = ?");
      updateParams.push(maxQuestions);
    }

    if (displayMode !== undefined) {
      updateFields.push("display_mode = ?");
      updateParams.push(displayMode);
    }

    if (generateDynamically !== undefined) {
      updateFields.push("generate_dynamically = ?");
      updateParams.push(generateDynamically ? 1 : 0);
    }

    if (aiPrompt !== undefined) {
      updateFields.push("ai_prompt = ?");
      updateParams.push(aiPrompt);
    }

    if (isDefault !== undefined) {
      updateFields.push("is_default = ?");
      updateParams.push(isDefault ? 1 : 0);
    }

    // Add updated_at
    updateFields.push("updated_at = ?");
    updateParams.push(new Date().toISOString());

    // Add id and user_id to params
    updateParams.push(id, userId);

    // Update config
    await db.query(
      `UPDATE follow_up_configs SET ${updateFields.join(", ")} WHERE id = ? AND user_id = ?`,
      {
        replacements: updateParams,
        type: QueryTypes.UPDATE,
      },
    );

    // Get updated config
    const [updatedConfig] = await db.query(
      "SELECT * FROM follow_up_configs WHERE id = ?",
      {
        replacements: [id],
        type: QueryTypes.SELECT,
      },
    );

    // Format and return config
    const formattedConfig = FollowUpConfig.fromDatabase(updatedConfig);
    return res.json(formatResponse(formattedConfig));
  } catch (error) {
    console.error("Error updating follow-up config:", error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};

/**
 * Delete follow-up configuration
 */
export const deleteFollowUpConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!id) {
      return res.status(400).json(
        formatResponse(null, {
          message: "Configuration ID is required",
          code: "ERR_400",
        }),
      );
    }

    const db = await getMySQLClient();

    // Check if config exists and belongs to user
    const [existingConfig] = await db.query(
      "SELECT * FROM follow_up_configs WHERE id = ? AND user_id = ?",
      {
        replacements: [id, userId],
        type: QueryTypes.SELECT,
      },
    );

    if (!existingConfig) {
      return res.status(404).json(
        formatResponse(null, {
          message: "Follow-up configuration not found",
          code: "ERR_404",
        }),
      );
    }

    // Delete config
    await db.query(
      "DELETE FROM follow_up_configs WHERE id = ? AND user_id = ?",
      {
        replacements: [id, userId],
        type: QueryTypes.DELETE,
      },
    );

    return res.json(
      formatResponse({
        success: true,
        message: "Follow-up configuration deleted successfully",
      }),
    );
  } catch (error) {
    console.error("Error deleting follow-up config:", error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};

/**
 * Get default follow-up configuration for a user
 */
export const getDefaultFollowUpConfig = async (req, res) => {
  try {
    const userId = req.user.id;

    const db = await getMySQLClient();

    // Get default config
    const [config] = await db.query(
      "SELECT * FROM follow_up_configs WHERE user_id = ? AND is_default = 1",
      {
        replacements: [userId],
        type: QueryTypes.SELECT,
      },
    );

    if (!config) {
      return res.status(404).json(
        formatResponse(null, {
          message: "Default follow-up configuration not found",
          code: "ERR_404",
        }),
      );
    }

    // Format and return config
    const formattedConfig = FollowUpConfig.fromDatabase(config);
    return res.json(formatResponse(formattedConfig));
  } catch (error) {
    console.error("Error getting default follow-up config:", error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};

/**
 * Create a new follow-up question
 */
export const createFollowUpQuestion = async (req, res) => {
  try {
    const { configId, question, displayOrder, isActive, category, tags } =
      req.body;
    const userId = req.user.id;

    if (!configId || !question) {
      return res.status(400).json(
        formatResponse(null, {
          message: "Configuration ID and question are required",
          code: "ERR_400",
        }),
      );
    }

    const db = await getMySQLClient();

    // Check if config exists and belongs to user
    const [config] = await db.query(
      "SELECT * FROM follow_up_configs WHERE id = ? AND user_id = ?",
      {
        replacements: [configId, userId],
        type: QueryTypes.SELECT,
      },
    );

    if (!config) {
      return res.status(404).json(
        formatResponse(null, {
          message: "Follow-up configuration not found",
          code: "ERR_404",
        }),
      );
    }

    const questionId = uuidv4();
    const now = new Date().toISOString();

    // Create question
    const questionData = {
      id: questionId,
      config_id: configId,
      question,
      display_order: displayOrder || 0,
      is_active: isActive !== undefined ? (isActive ? 1 : 0) : 1,
      category: category || "general",
      tags: tags ? JSON.stringify(tags) : null,
      created_at: now,
      updated_at: now,
    };

    await db.query(
      `INSERT INTO follow_up_questions 
       (id, config_id, question, display_order, is_active, category, tags, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          questionData.id,
          questionData.config_id,
          questionData.question,
          questionData.display_order,
          questionData.is_active,
          questionData.category,
          questionData.tags,
          questionData.created_at,
          questionData.updated_at,
        ],
        type: QueryTypes.INSERT,
      },
    );

    // Get created question
    const [createdQuestion] = await db.query(
      "SELECT * FROM follow_up_questions WHERE id = ?",
      {
        replacements: [questionId],
        type: QueryTypes.SELECT,
      },
    );

    // Format response
    const formattedQuestion = FollowUpQuestion.fromDatabase(createdQuestion);

    return res.json(formatResponse(formattedQuestion));
  } catch (error) {
    console.error("Error creating follow-up question:", error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};

/**
 * Get all follow-up questions for a configuration
 */
export const getFollowUpQuestions = async (req, res) => {
  try {
    const { configId } = req.params;
    const userId = req.user.id;

    if (!configId) {
      return res.status(400).json(
        formatResponse(null, {
          message: "Configuration ID is required",
          code: "ERR_400",
        }),
      );
    }

    const db = await getMySQLClient();

    // Check if config exists and belongs to user
    const [config] = await db.query(
      "SELECT * FROM follow_up_configs WHERE id = ? AND user_id = ?",
      {
        replacements: [configId, userId],
        type: QueryTypes.SELECT,
      },
    );

    if (!config) {
      return res.status(404).json(
        formatResponse(null, {
          message: "Follow-up configuration not found",
          code: "ERR_404",
        }),
      );
    }

    // Get questions
    const questions = await db.query(
      "SELECT * FROM follow_up_questions WHERE config_id = ? ORDER BY display_order ASC",
      {
        replacements: [configId],
        type: QueryTypes.SELECT,
      },
    );

    // Format questions
    const formattedQuestions = questions.map(FollowUpQuestion.fromDatabase);

    return res.json(formatResponse(formattedQuestions));
  } catch (error) {
    console.error("Error getting follow-up questions:", error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};

/**
 * Update follow-up question
 */
export const updateFollowUpQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, displayOrder, isActive, category, tags } = req.body;
    const userId = req.user.id;

    if (!id) {
      return res.status(400).json(
        formatResponse(null, {
          message: "Question ID is required",
          code: "ERR_400",
        }),
      );
    }

    const db = await getMySQLClient();

    // Get question to check if it belongs to user's config
    const [existingQuestion] = await db.query(
      `SELECT q.* FROM follow_up_questions q 
       JOIN follow_up_configs c ON q.config_id = c.id 
       WHERE q.id = ? AND c.user_id = ?`,
      {
        replacements: [id, userId],
        type: QueryTypes.SELECT,
      },
    );

    if (!existingQuestion) {
      return res.status(404).json(
        formatResponse(null, {
          message: "Follow-up question not found",
          code: "ERR_404",
        }),
      );
    }

    // Build update fields
    const updateFields = [];
    const updateParams = [];

    if (question !== undefined) {
      updateFields.push("question = ?");
      updateParams.push(question);
    }

    if (displayOrder !== undefined) {
      updateFields.push("display_order = ?");
      updateParams.push(displayOrder);
    }

    if (isActive !== undefined) {
      updateFields.push("is_active = ?");
      updateParams.push(isActive ? 1 : 0);
    }

    if (category !== undefined) {
      updateFields.push("category = ?");
      updateParams.push(category);
    }

    if (tags !== undefined) {
      updateFields.push("tags = ?");
      updateParams.push(JSON.stringify(tags));
    }

    // Add updated_at
    updateFields.push("updated_at = ?");
    updateParams.push(new Date().toISOString());

    // Add id to params
    updateParams.push(id);

    // Update question
    await db.query(
      `UPDATE follow_up_questions SET ${updateFields.join(", ")} WHERE id = ?`,
      {
        replacements: updateParams,
        type: QueryTypes.UPDATE,
      },
    );

    // Get updated question
    const [updatedQuestion] = await db.query(
      "SELECT * FROM follow_up_questions WHERE id = ?",
      {
        replacements: [id],
        type: QueryTypes.SELECT,
      },
    );

    // Format and return question
    const formattedQuestion = FollowUpQuestion.fromDatabase(updatedQuestion);
    return res.json(formatResponse(formattedQuestion));
  } catch (error) {
    console.error("Error updating follow-up question:", error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};

/**
 * Delete follow-up question
 */
export const deleteFollowUpQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!id) {
      return res.status(400).json(
        formatResponse(null, {
          message: "Question ID is required",
          code: "ERR_400",
        }),
      );
    }

    const db = await getMySQLClient();

    // Get question to check if it belongs to user's config
    const [existingQuestion] = await db.query(
      `SELECT q.* FROM follow_up_questions q 
       JOIN follow_up_configs c ON q.config_id = c.id 
       WHERE q.id = ? AND c.user_id = ?`,
      {
        replacements: [id, userId],
        type: QueryTypes.SELECT,
      },
    );

    if (!existingQuestion) {
      return res.status(404).json(
        formatResponse(null, {
          message: "Follow-up question not found",
          code: "ERR_404",
        }),
      );
    }

    // Delete question
    await db.query("DELETE FROM follow_up_questions WHERE id = ?", {
      replacements: [id],
      type: QueryTypes.DELETE,
    });

    return res.json(
      formatResponse({
        success: true,
        message: "Follow-up question deleted successfully",
      }),
    );
  } catch (error) {
    console.error("Error deleting follow-up question:", error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};

/**
 * Generate follow-up questions using AI
 */
export const generateFollowUpQuestions = async (req, res) => {
  try {
    const { configId, chatHistory, count } = req.body;
    const userId = req.user.id;

    if (!configId || !chatHistory) {
      return res.status(400).json(
        formatResponse(null, {
          message: "Configuration ID and chat history are required",
          code: "ERR_400",
        }),
      );
    }

    const db = await getMySQLClient();

    // Check if config exists and belongs to user
    const [config] = await db.query(
      "SELECT * FROM follow_up_configs WHERE id = ? AND user_id = ?",
      {
        replacements: [configId, userId],
        type: QueryTypes.SELECT,
      },
    );

    if (!config) {
      return res.status(404).json(
        formatResponse(null, {
          message: "Follow-up configuration not found",
          code: "ERR_404",
        }),
      );
    }

    // In a real implementation, this would call an AI service
    // For now, we'll return some sample questions
    const generatedQuestions = [
      "Can you tell me more about that?",
      "How does this impact your business?",
      "What other solutions have you tried?",
      "When did you first notice this issue?",
      "Would you like me to explain any part in more detail?",
    ];

    // Limit to requested count
    const limitedQuestions = generatedQuestions.slice(0, count || 3);

    return res.json(
      formatResponse({
        questions: limitedQuestions,
        configId,
      }),
    );
  } catch (error) {
    console.error("Error generating follow-up questions:", error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};
