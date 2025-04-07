import logger from "@/utils/logger";
import {
  moderationApi,
  ModerationResult,
  ModerationRule,
  ModerationEvent,
} from "./api/features/moderation";

export interface FlaggedContent {
  id: string;
  contentId: string;
  contentType: "message" | "user" | "attachment";
  reason: string;
  status: "pending" | "approved" | "rejected";
  reportedBy: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}

class ModerationService {
  /**
   * Check content against moderation rules
   */
  async checkContent(
    content: string,
    userId: string,
  ): Promise<{
    isAllowed: boolean;
    flagged: boolean;
    modifiedContent?: string;
  }> {
    try {
      const response = await moderationApi.checkContent(content, userId);

      if (!response.success) {
        throw new Error(
          response.error?.message || "Failed to check content moderation",
        );
      }

      return response.data || { isAllowed: true, flagged: false };
    } catch (error) {
      logger.error(
        "Error checking content against moderation rules",
        error instanceof Error ? error : new Error(String(error)),
      );

      // Default to allowing content if there's an error
      return { isAllowed: true, flagged: false };
    }
  }

  /**
   * Get moderation rules
   */
  async getRules(activeOnly = true): Promise<ModerationRule[]> {
    try {
      const response = await moderationApi.getModerationRules(activeOnly);

      if (!response.success) {
        throw new Error(
          response.error?.message || "Failed to get moderation rules",
        );
      }

      return response.data || [];
    } catch (error) {
      logger.error(
        "Error fetching moderation rules",
        error instanceof Error ? error : new Error(String(error)),
      );
      return [];
    }
  }

  /**
   * Create or update moderation rule
   */
  async saveRule(
    rule: Omit<ModerationRule, "id" | "createdAt" | "updatedAt"> & {
      id?: string;
    },
  ): Promise<ModerationRule | null> {
    try {
      let response;

      if (rule.id) {
        // Update existing rule
        const { id, ...updates } = rule;
        response = await moderationApi.updateModerationRule(id, updates);
      } else {
        // Create new rule
        response = await moderationApi.createModerationRule(rule);
      }

      if (!response.success || !response.data) {
        throw new Error(
          response.error?.message || "Failed to save moderation rule",
        );
      }

      return response.data;
    } catch (error) {
      logger.error(
        "Error saving moderation rule",
        error instanceof Error ? error : new Error(String(error)),
      );
      return null;
    }
  }

  /**
   * Delete a moderation rule
   */
  async deleteRule(ruleId: string): Promise<boolean> {
    try {
      const response = await moderationApi.deleteModerationRule(ruleId);

      if (!response.success) {
        throw new Error(
          response.error?.message || "Failed to delete moderation rule",
        );
      }

      return true;
    } catch (error) {
      logger.error(
        "Error deleting moderation rule",
        error instanceof Error ? error : new Error(String(error)),
      );
      return false;
    }
  }

  /**
   * Check if a user is banned
   */
  async isUserBanned(userId: string): Promise<boolean> {
    try {
      const response = await moderationApi.isUserBanned(userId);

      if (!response.success) {
        throw new Error(
          response.error?.message || "Failed to check if user is banned",
        );
      }

      return response.data || false;
    } catch (error) {
      logger.error(
        "Error checking if user is banned",
        error instanceof Error ? error : new Error(String(error)),
      );
      return false;
    }
  }

  /**
   * Ban a user
   */
  async banUser(
    userId: string,
    reason: string,
    adminId?: string,
    expiresAt?: string,
  ): Promise<boolean> {
    try {
      const response = await moderationApi.banUser(
        userId,
        reason,
        expiresAt,
        adminId,
      );

      if (!response.success) {
        throw new Error(response.error?.message || "Failed to ban user");
      }

      return true;
    } catch (error) {
      logger.error(
        "Error banning user",
        error instanceof Error ? error : new Error(String(error)),
      );
      return false;
    }
  }

  /**
   * Unban a user
   */
  async unbanUser(userId: string, adminId?: string): Promise<boolean> {
    try {
      const response = await moderationApi.unbanUser(userId, adminId);

      if (!response.success) {
        throw new Error(response.error?.message || "Failed to unban user");
      }

      return true;
    } catch (error) {
      logger.error(
        "Error unbanning user",
        error instanceof Error ? error : new Error(String(error)),
      );
      return false;
    }
  }

  /**
   * Get moderation events
   */
  async getEvents(
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ events: ModerationEvent[]; totalCount: number }> {
    try {
      const response = await moderationApi.getModerationEvents(limit, offset);

      if (!response.success) {
        throw new Error(
          response.error?.message || "Failed to get moderation events",
        );
      }

      return response.data || { events: [], totalCount: 0 };
    } catch (error) {
      logger.error(
        "Error fetching moderation events",
        error instanceof Error ? error : new Error(String(error)),
      );
      return { events: [], totalCount: 0 };
    }
  }
}

// Create a singleton instance
const moderationService = new ModerationService();

export default moderationService;
