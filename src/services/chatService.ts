import { getMySQLClient, QueryTypes } from "./mysqlClient.js";
import { v4 as uuidv4 } from "uuid";
import logger from "@/utils/logger";

export interface ChatMessage {
  id: string;
  session_id: string;
  user_id?: string;
  content: string;
  type: "user" | "assistant" | "system";
  metadata?: Record<string, any>;
  created_at: Date;
}

export interface ChatSession {
  id: string;
  user_id?: string;
  widget_id?: string;
  status: "active" | "closed" | "archived";
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

const chatService = {
  /**
   * Create a new chat session
   */
  createSession: async (
    userId?: string,
    widgetId?: string,
    metadata?: Record<string, any>,
  ): Promise<ChatSession> => {
    try {
      const sessionId = uuidv4();
      const db = await getMySQLClient();

      await db.query(
        "INSERT INTO chat_sessions (id, user_id, widget_id, status, metadata, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())",
        {
          replacements: [
            sessionId,
            userId || null,
            widgetId || null,
            "active",
            metadata ? JSON.stringify(metadata) : null,
          ],
          type: QueryTypes.INSERT,
        },
      );

      return chatService.getSessionById(sessionId) as Promise<ChatSession>;
    } catch (error) {
      logger.error("Error creating chat session:", error);
      throw new Error(`Failed to create chat session: ${error.message}`);
    }
  },

  /**
   * Get a chat session by ID
   */
  getSessionById: async (sessionId: string): Promise<ChatSession | null> => {
    try {
      const db = await getMySQLClient();
      const sessions = await db.query(
        "SELECT * FROM chat_sessions WHERE id = ?",
        {
          replacements: [sessionId],
          type: QueryTypes.SELECT,
        },
      );

      return sessions.length > 0 ? (sessions[0] as ChatSession) : null;
    } catch (error) {
      logger.error(`Error fetching chat session ${sessionId}:`, error);
      throw new Error(`Failed to fetch chat session: ${error.message}`);
    }
  },

  /**
   * Get all chat sessions for a user
   */
  getSessionsByUserId: async (userId: string): Promise<ChatSession[]> => {
    try {
      const db = await getMySQLClient();
      const sessions = await db.query(
        "SELECT * FROM chat_sessions WHERE user_id = ? ORDER BY updated_at DESC",
        {
          replacements: [userId],
          type: QueryTypes.SELECT,
        },
      );

      return sessions as ChatSession[];
    } catch (error) {
      logger.error(`Error fetching chat sessions for user ${userId}:`, error);
      throw new Error(`Failed to fetch chat sessions: ${error.message}`);
    }
  },

  /**
   * Get all chat sessions for a widget
   */
  getSessionsByWidgetId: async (widgetId: string): Promise<ChatSession[]> => {
    try {
      const db = await getMySQLClient();
      const sessions = await db.query(
        "SELECT * FROM chat_sessions WHERE widget_id = ? ORDER BY updated_at DESC",
        {
          replacements: [widgetId],
          type: QueryTypes.SELECT,
        },
      );

      return sessions as ChatSession[];
    } catch (error) {
      logger.error(
        `Error fetching chat sessions for widget ${widgetId}:`,
        error,
      );
      throw new Error(`Failed to fetch chat sessions: ${error.message}`);
    }
  },

  /**
   * Update a chat session
   */
  updateSession: async (
    sessionId: string,
    data: Partial<ChatSession>,
  ): Promise<ChatSession> => {
    try {
      const db = await getMySQLClient();
      const updateFields = [];
      const replacements = [];

      if (data.status !== undefined) {
        updateFields.push("status = ?");
        replacements.push(data.status);
      }

      if (data.metadata !== undefined) {
        updateFields.push("metadata = ?");
        replacements.push(JSON.stringify(data.metadata));
      }

      if (data.user_id !== undefined) {
        updateFields.push("user_id = ?");
        replacements.push(data.user_id);
      }

      if (data.widget_id !== undefined) {
        updateFields.push("widget_id = ?");
        replacements.push(data.widget_id);
      }

      // Always update the updated_at timestamp
      updateFields.push("updated_at = NOW()");

      // Add the session ID to the replacements
      replacements.push(sessionId);

      if (updateFields.length > 0) {
        await db.query(
          `UPDATE chat_sessions SET ${updateFields.join(", ")} WHERE id = ?`,
          {
            replacements,
            type: QueryTypes.UPDATE,
          },
        );
      }

      return chatService.getSessionById(sessionId) as Promise<ChatSession>;
    } catch (error) {
      logger.error(`Error updating chat session ${sessionId}:`, error);
      throw new Error(`Failed to update chat session: ${error.message}`);
    }
  },

  /**
   * Add a message to a chat session
   */
  addMessage: async (
    message: Omit<ChatMessage, "id" | "created_at">,
  ): Promise<ChatMessage> => {
    try {
      const messageId = uuidv4();
      const db = await getMySQLClient();

      await db.query(
        "INSERT INTO chat_messages (id, session_id, user_id, content, type, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
        {
          replacements: [
            messageId,
            message.session_id,
            message.user_id || null,
            message.content,
            message.type,
            message.metadata ? JSON.stringify(message.metadata) : null,
          ],
          type: QueryTypes.INSERT,
        },
      );

      // Update the session's updated_at timestamp
      await db.query(
        "UPDATE chat_sessions SET updated_at = NOW() WHERE id = ?",
        {
          replacements: [message.session_id],
          type: QueryTypes.UPDATE,
        },
      );

      // Fetch the created message
      const messages = await db.query(
        "SELECT * FROM chat_messages WHERE id = ?",
        {
          replacements: [messageId],
          type: QueryTypes.SELECT,
        },
      );

      return messages[0] as ChatMessage;
    } catch (error) {
      logger.error("Error adding chat message:", error);
      throw new Error(`Failed to add chat message: ${error.message}`);
    }
  },

  /**
   * Get messages for a chat session
   */
  getMessagesBySessionId: async (sessionId: string): Promise<ChatMessage[]> => {
    try {
      const db = await getMySQLClient();
      const messages = await db.query(
        "SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC",
        {
          replacements: [sessionId],
          type: QueryTypes.SELECT,
        },
      );

      return messages as ChatMessage[];
    } catch (error) {
      logger.error(`Error fetching messages for session ${sessionId}:`, error);
      throw new Error(`Failed to fetch chat messages: ${error.message}`);
    }
  },

  /**
   * Delete a chat session and all its messages
   */
  deleteSession: async (sessionId: string): Promise<boolean> => {
    try {
      const db = await getMySQLClient();
      const transaction = await db.transaction();

      try {
        // Delete all messages for this session
        await db.query("DELETE FROM chat_messages WHERE session_id = ?", {
          replacements: [sessionId],
          type: QueryTypes.DELETE,
          transaction,
        });

        // Delete the session
        await db.query("DELETE FROM chat_sessions WHERE id = ?", {
          replacements: [sessionId],
          type: QueryTypes.DELETE,
          transaction,
        });

        await transaction.commit();
        return true;
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      logger.error(`Error deleting chat session ${sessionId}:`, error);
      throw new Error(`Failed to delete chat session: ${error.message}`);
    }
  },

  /**
   * Archive a chat session
   */
  archiveSession: async (sessionId: string): Promise<ChatSession> => {
    return chatService.updateSession(sessionId, { status: "archived" });
  },

  /**
   * Close a chat session
   */
  closeSession: async (sessionId: string): Promise<ChatSession> => {
    return chatService.updateSession(sessionId, { status: "closed" });
  },

  /**
   * Reopen a chat session
   */
  reopenSession: async (sessionId: string): Promise<ChatSession> => {
    return chatService.updateSession(sessionId, { status: "active" });
  },
};

// Add named export for chatService
export { chatService };
export default chatService;
