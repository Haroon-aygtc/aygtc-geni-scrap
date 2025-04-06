/**
 * Knowledge Base API Service
 *
 * This service provides methods for interacting with knowledge base endpoints.
 */

import { api, ApiResponse } from "../middleware/apiMiddleware";
import { QueryResult } from "@/types/knowledgeBase";

export interface KnowledgeBaseConfig {
  id: string;
  name: string;
  type: "api" | "database" | "cms" | "vector" | "file";
  endpoint?: string;
  apiKey?: string;
  connectionString?: string;
  refreshInterval?: number; // in minutes
  lastSyncedAt?: string;
  parameters?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeBaseQueryRequest {
  query: string;
  filters?: Record<string, any>;
  limit?: number;
  contextRuleId?: string;
  userId?: string;
}

export const knowledgeBaseApi = {
  /**
   * Get all knowledge base configurations
   */
  getAllConfigs: async (): Promise<ApiResponse<KnowledgeBaseConfig[]>> => {
    return api.get<KnowledgeBaseConfig[]>("/knowledge-base/configs");
  },

  /**
   * Get a knowledge base configuration by ID
   */
  getConfigById: async (
    id: string,
  ): Promise<ApiResponse<KnowledgeBaseConfig>> => {
    return api.get<KnowledgeBaseConfig>(`/knowledge-base/configs/${id}`);
  },

  /**
   * Create a new knowledge base configuration
   */
  createConfig: async (
    config: Omit<KnowledgeBaseConfig, "id" | "createdAt" | "updatedAt">,
  ): Promise<ApiResponse<KnowledgeBaseConfig>> => {
    return api.post<KnowledgeBaseConfig>("/knowledge-base/configs", config);
  },

  /**
   * Update a knowledge base configuration
   */
  updateConfig: async (
    id: string,
    config: Partial<KnowledgeBaseConfig>,
  ): Promise<ApiResponse<KnowledgeBaseConfig>> => {
    return api.put<KnowledgeBaseConfig>(
      `/knowledge-base/configs/${id}`,
      config,
    );
  },

  /**
   * Delete a knowledge base configuration
   */
  deleteConfig: async (id: string): Promise<ApiResponse<boolean>> => {
    return api.delete<boolean>(`/knowledge-base/configs/${id}`);
  },

  /**
   * Query knowledge bases
   */
  query: async (
    params: KnowledgeBaseQueryRequest,
  ): Promise<ApiResponse<QueryResult[]>> => {
    return api.post<QueryResult[]>("/knowledge-base/query", params);
  },

  /**
   * Sync a knowledge base to update its content
   */
  syncKnowledgeBase: async (id: string): Promise<ApiResponse<boolean>> => {
    return api.post<boolean>(`/knowledge-base/configs/${id}/sync`);
  },

  /**
   * Log a knowledge base query for analytics
   */
  logQuery: async (params: {
    userId: string;
    query: string;
    contextRuleId?: string;
    knowledgeBaseIds: string[];
    results: number;
  }): Promise<ApiResponse<{ id: string }>> => {
    return api.post<{ id: string }>("/knowledge-base/logs", params);
  },
};
