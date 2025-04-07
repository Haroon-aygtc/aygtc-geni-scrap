/**
 * Widget Controller
 *
 * This module provides controller functions for widget operations,
 * including public endpoints that don't require authentication.
 */

import { formatResponse } from "../utils/responseFormatter.js";
import { getMySQLClient } from "../utils/dbHelpers.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Get widget configuration by ID
 * Public endpoint - no authentication required
 */
export const getWidgetConfig = async (req, res) => {
  try {
    const { widgetId } = req.params;

    if (!widgetId) {
      return res.status(400).json(
        formatResponse(null, {
          message: "Widget ID is required",
          code: "ERR_400",
        }),
      );
    }

    const db = await getMySQLClient();
    const [rows] = await db.execute(
      `SELECT * FROM widget_configs WHERE widget_id = ? AND is_active = 1`,
      [widgetId],
    );

    if (rows.length === 0) {
      return res.status(404).json(
        formatResponse(null, {
          message: "Widget configuration not found",
          code: "ERR_404",
        }),
      );
    }

    // Get context rule if specified
    let contextRule = null;
    if (rows[0].context_rule_id) {
      const [ruleRows] = await db.execute(
        `SELECT * FROM context_rules WHERE id = ?`,
        [rows[0].context_rule_id],
      );
      if (ruleRows.length > 0) {
        contextRule = ruleRows[0];
      }
    }

    // Format the response
    const config = {
      id: rows[0].id,
      widgetId: rows[0].widget_id,
      name: rows[0].name,
      settings: JSON.parse(rows[0].settings || "{}"),
      contextRuleId: rows[0].context_rule_id,
      contextRule: contextRule,
      createdAt: rows[0].created_at,
      updatedAt: rows[0].updated_at,
    };

    return res.json(formatResponse(config));
  } catch (error) {
    console.error("Error getting widget configuration:", error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};

/**
 * Process chat message for widget
 * Public endpoint - no authentication required
 */
export const processWidgetChat = async (req, res) => {
  try {
    const { widgetId } = req.params;
    const { message, sessionId: existingSessionId } = req.body;

    if (!widgetId || !message) {
      return res.status(400).json(
        formatResponse(null, {
          message: "Widget ID and message are required",
          code: "ERR_400",
        }),
      );
    }

    const db = await getMySQLClient();

    // Verify widget exists and is active
    const [widgetRows] = await db.execute(
      `SELECT * FROM widget_configs WHERE widget_id = ? AND is_active = 1`,
      [widgetId],
    );

    if (widgetRows.length === 0) {
      return res.status(404).json(
        formatResponse(null, {
          message: "Widget not found or inactive",
          code: "ERR_404",
        }),
      );
    }

    // Create or get session
    let sessionId = existingSessionId;
    if (!sessionId) {
      sessionId = uuidv4();
      await db.execute(
        `INSERT INTO chat_sessions (session_id, user_id, widget_id, status, created_at, updated_at) 
         VALUES (?, ?, ?, 'active', NOW(), NOW())`,
        [sessionId, null, widgetId],
      );
    }

    // Store user message
    const messageId = uuidv4();
    await db.execute(
      `INSERT INTO chat_messages (message_id, session_id, content, role, created_at) 
       VALUES (?, ?, ?, 'user', NOW())`,
      [messageId, sessionId, message],
    );

    // Get context rule if specified
    let contextRule = null;
    if (widgetRows[0].context_rule_id) {
      const [ruleRows] = await db.execute(
        `SELECT * FROM context_rules WHERE id = ?`,
        [widgetRows[0].context_rule_id],
      );
      if (ruleRows.length > 0) {
        contextRule = ruleRows[0];
      }
    }

    // Process message with AI (simplified for this example)
    let aiResponse;
    if (contextRule) {
      // Use context-specific processing
      aiResponse = `This is a context-specific response for rule: ${contextRule.name}. Your message: "${message}"`;
    } else {
      // Use general processing
      aiResponse = `Thank you for your message: "${message}". How can I assist you further?`;
    }

    // Store AI response
    const aiMessageId = uuidv4();
    await db.execute(
      `INSERT INTO chat_messages (message_id, session_id, content, role, created_at) 
       VALUES (?, ?, ?, 'assistant', NOW())`,
      [aiMessageId, sessionId, aiResponse],
    );

    // Update session
    await db.execute(
      `UPDATE chat_sessions SET updated_at = NOW() WHERE session_id = ?`,
      [sessionId],
    );

    return res.json(
      formatResponse({
        sessionId,
        messageId: aiMessageId,
        content: aiResponse,
        timestamp: new Date().toISOString(),
      }),
    );
  } catch (error) {
    console.error("Error processing widget chat:", error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};
