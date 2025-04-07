/**
 * Moderation Controller
 *
 * This module provides controller functions for content moderation.
 * Refactored to use the API layer instead of direct database access.
 */

import { formatResponse } from "../utils/responseFormatter.js";
import { moderationApi } from "../services/api/features/moderation.js";

/**
 * Check content against moderation rules
 */
export const checkContent = async (req, res) => {
  try {
    const { content, userId } = req.body;

    if (!content) {
      return res.status(400).json(
        formatResponse(null, {
          message: "Content is required",
          code: "ERR_400",
        }),
      );
    }

    // Check if user is banned first
    const isBannedResponse = await moderationApi.isUserBanned(userId);
    if (!isBannedResponse.success) {
      throw new Error(
        isBannedResponse.error?.message || "Failed to check if user is banned",
      );
    }

    const isBanned = isBannedResponse.data;
    if (isBanned) {
      return res.json(
        formatResponse({
          isAllowed: false,
          flagged: true,
          reason: "User is banned",
        }),
      );
    }

    // Get active moderation rules
    const rulesResponse = await moderationApi.getModerationRules(true);
    if (!rulesResponse.success) {
      throw new Error(
        rulesResponse.error?.message || "Failed to get moderation rules",
      );
    }

    const rules = rulesResponse.data || [];

    // Default result
    let result = {
      isAllowed: true,
      flagged: false,
    };

    // Apply each rule
    let modifiedContent = content;

    for (const rule of rules) {
      // Skip inactive rules
      if (!rule.isActive) continue;

      let matched = false;

      if (rule.type === "keyword") {
        // Simple keyword matching
        const keywords = rule.pattern
          .split(",")
          .map((k) => k.trim().toLowerCase());
        matched = keywords.some((keyword) =>
          content.toLowerCase().includes(keyword),
        );
      } else if (rule.type === "regex") {
        // Regex matching
        try {
          const regex = new RegExp(rule.pattern, "i");
          matched = regex.test(content);

          // If it's a modification action, apply the replacement
          if (matched && rule.action === "modify" && rule.replacement) {
            modifiedContent = modifiedContent.replace(regex, rule.replacement);
          }
        } catch (regexError) {
          console.error(
            `Invalid regex in moderation rule ${rule.id}`,
            regexError,
          );
        }
      }

      // Handle match based on action
      if (matched) {
        // Log the moderation event using the API
        await moderationApi.logModerationEvent({
          userId,
          content,
          ruleId: rule.id,
          action: rule.action,
          severity: rule.severity,
        });

        if (rule.action === "block") {
          // Block the content
          return res.json(
            formatResponse({
              isAllowed: false,
              flagged: true,
              reason: `Content blocked by rule: ${rule.name}`,
            }),
          );
        } else if (rule.action === "flag") {
          // Flag the content but allow it
          result.flagged = true;
        } else if (rule.action === "modify") {
          // Content has already been modified above
          result.modifiedContent = modifiedContent;
          result.flagged = true;
        }
      }
    }

    // If content was modified, return the modified version
    if (modifiedContent !== content) {
      result.modifiedContent = modifiedContent;
    }

    return res.json(formatResponse(result));
  } catch (error) {
    console.error("Error checking content moderation", error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};

/**
 * Check if a user is banned
 */
export const isUserBanned = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json(
        formatResponse(null, {
          message: "User ID is required",
          code: "ERR_400",
        }),
      );
    }

    const response = await moderationApi.isUserBanned(userId);
    if (!response.success) {
      throw new Error(
        response.error?.message || "Failed to check if user is banned",
      );
    }

    return res.json(formatResponse(response.data));
  } catch (error) {
    console.error(`Error checking if user is banned`, error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};

/**
 * Ban a user
 */
export const banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason, expiresAt, adminId } = req.body;

    if (!userId || !reason) {
      return res.status(400).json(
        formatResponse(null, {
          message: "User ID and reason are required",
          code: "ERR_400",
        }),
      );
    }

    const response = await moderationApi.banUser(
      userId,
      reason,
      expiresAt,
      adminId || req.user?.id || null,
    );

    if (!response.success) {
      throw new Error(response.error?.message || "Failed to ban user");
    }

    return res.json(formatResponse(true));
  } catch (error) {
    console.error(`Error banning user`, error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};

/**
 * Unban a user
 */
export const unbanUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { adminId } = req.body;

    if (!userId) {
      return res.status(400).json(
        formatResponse(null, {
          message: "User ID is required",
          code: "ERR_400",
        }),
      );
    }

    const response = await moderationApi.unbanUser(
      userId,
      adminId || req.user?.id || null,
    );

    if (!response.success) {
      throw new Error(response.error?.message || "Failed to unban user");
    }

    return res.json(formatResponse(true));
  } catch (error) {
    console.error(`Error unbanning user`, error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};

/**
 * Get all moderation rules
 */
export const getModerationRules = async (req, res) => {
  try {
    const { activeOnly } = req.query;

    const response = await moderationApi.getModerationRules(
      activeOnly === "true" || activeOnly === undefined,
    );

    if (!response.success) {
      throw new Error(
        response.error?.message || "Failed to get moderation rules",
      );
    }

    return res.json(formatResponse(response.data));
  } catch (error) {
    console.error("Error getting moderation rules", error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};

/**
 * Create a new moderation rule
 */
export const createModerationRule = async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      pattern,
      action,
      replacement,
      severity,
      isActive,
    } = req.body;

    if (!name || !type || !pattern || !action || !severity) {
      return res.status(400).json(
        formatResponse(null, {
          message: "Missing required fields",
          code: "ERR_400",
        }),
      );
    }

    const response = await moderationApi.createModerationRule({
      name,
      description: description || null,
      type,
      pattern,
      action,
      replacement: replacement || null,
      severity,
      isActive: isActive !== undefined ? isActive : true,
    });

    if (!response.success || !response.data) {
      throw new Error(
        response.error?.message || "Failed to create moderation rule",
      );
    }

    return res.json(formatResponse(response.data));
  } catch (error) {
    console.error("Error creating moderation rule", error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};

/**
 * Update a moderation rule
 */
export const updateModerationRule = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id) {
      return res.status(400).json(
        formatResponse(null, {
          message: "Rule ID is required",
          code: "ERR_400",
        }),
      );
    }

    const updateData = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined)
      updateData.description = updates.description;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.pattern !== undefined) updateData.pattern = updates.pattern;
    if (updates.action !== undefined) updateData.action = updates.action;
    if (updates.replacement !== undefined)
      updateData.replacement = updates.replacement;
    if (updates.severity !== undefined) updateData.severity = updates.severity;
    if (updates.isActive !== undefined) updateData.isActive = updates.isActive;

    const response = await moderationApi.updateModerationRule(id, updateData);

    if (!response.success || !response.data) {
      throw new Error(
        response.error?.message || "Failed to update moderation rule",
      );
    }

    return res.json(formatResponse(response.data));
  } catch (error) {
    console.error(`Error updating moderation rule`, error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};

/**
 * Delete a moderation rule
 */
export const deleteModerationRule = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json(
        formatResponse(null, {
          message: "Rule ID is required",
          code: "ERR_400",
        }),
      );
    }

    const response = await moderationApi.deleteModerationRule(id);

    if (!response.success) {
      throw new Error(
        response.error?.message || "Failed to delete moderation rule",
      );
    }

    return res.json(formatResponse(true));
  } catch (error) {
    console.error(`Error deleting moderation rule`, error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};

/**
 * Get moderation events
 */
export const getModerationEvents = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const response = await moderationApi.getModerationEvents(
      parseInt(limit),
      parseInt(offset),
    );

    if (!response.success) {
      throw new Error(
        response.error?.message || "Failed to get moderation events",
      );
    }

    return res.json(formatResponse(response.data));
  } catch (error) {
    console.error("Error getting moderation events", error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};
