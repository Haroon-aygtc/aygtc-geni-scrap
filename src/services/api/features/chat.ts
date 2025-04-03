/**
 * Chat Service Module
 *
 * This module provides functionality for managing chat sessions and messages.
 */

import { v4 as uuidv4 } from "uuid";
import logger from "@/utils/logger";
import { executeQuery, executeTransaction } from "../core/mysql";
import { moderationService } from "./moderation";
import { websocketService } from "../core/websocket";
import { realtimeService } from "../core/realtime";

export interface ChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  message: string;
  messageType: "user" | "system" | "ai";
  metadata?: Record<string, any>;
  createdAt: string;
  attachments?: ChatAttachment[];
  status?: "pending" | "delivered" | "read" | "moderated";
}

export interface ChatAttachment {
  id: string;
  messageId: string;
  type: "image" | "file" | "audio" | "video";
  url: string;
  filename: string;
  filesize: number;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  sessionId: string;
  userId: string;
  contextRuleId?: string;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
}

/**
 * Service for managing chat sessions and messages
 */
class ChatService {
  /**
   * Create a new chat session
   */
  async createSession(
    userId: string,
    contextRuleId?: string,
    metadata?: Record<string, any>,
  ): Promise<ChatSession | null> {
    try {
      const sessionId = uuidv4();
      const now = new Date().toISOString();
      const id = uuidv4();

      const sql = `
        INSERT INTO chat_sessions 
        (id, session_id, user_id, context_rule_id, is_active, metadata, created_at, updated_at, last_message_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await executeQuery(
        sql,
        [
          id,
          sessionId,
          userId,
          contextRuleId || null,
          true,
          metadata ? JSON.stringify(metadata) : JSON.stringify({}),
          now,
          now,
          now,
        ],
        "INSERT",
      );

      // Fetch the created session
      const selectSql = `SELECT * FROM chat_sessions WHERE id = ?`;
      const [sessionData] = await executeQuery(selectSql, [id]);

      return this.mapSessionFromDb(sessionData);
    } catch (error) {
      logger.error(
        "Error creating chat session",
        error instanceof Error ? error : new Error(String(error)),
      );
      return null;
    }
  }

  /**
   * Get a chat session by ID
   */
  async getSession(sessionId: string): Promise<ChatSession | null> {
    try {
      const sql = `SELECT * FROM chat_sessions WHERE session_id = ? LIMIT 1`;
      const results = await executeQuery(sql, [sessionId]);

      if (!results || results.length === 0) return null;

      return this.mapSessionFromDb(results[0]);
    } catch (error) {
      logger.error(
        `Error fetching chat session ${sessionId}`,
        error instanceof Error ? error : new Error(String(error)),
      );
      return null;
    }
  }

  /**
   * Get all chat sessions for a user
   */
  async getUserSessions(
    userId: string,
    activeOnly = true,
  ): Promise<ChatSession[]> {
    try {
      let sql = `
        SELECT * FROM chat_sessions 
        WHERE user_id = ? 
      `;

      const params = [userId];

      if (activeOnly) {
        sql += ` AND is_active = ?`;
        params.push(true);
      }

      sql += ` ORDER BY last_message_at DESC`;

      const results = await executeQuery(sql, params);

      return results.map(this.mapSessionFromDb);
    } catch (error) {
      logger.error(
        `Error fetching user chat sessions for ${userId}`,
        error instanceof Error ? error : new Error(String(error)),
      );
      return [];
    }
  }

  /**
   * Update a chat session
   */
  async updateSession(
    sessionId: string,
    updates: Partial<
      Omit<
        ChatSession,
        | "id"
        | "sessionId"
        | "userId"
        | "createdAt"
        | "updatedAt"
        | "lastMessageAt"
      >
    >,
  ): Promise<ChatSession | null> {
    try {
      const setClauses = [];
      const params = [];

      if (updates.contextRuleId !== undefined) {
        setClauses.push("context_rule_id = ?");
        params.push(updates.contextRuleId);
      }

      if (updates.isActive !== undefined) {
        setClauses.push("is_active = ?");
        params.push(updates.isActive);
      }

      if (updates.metadata !== undefined) {
        setClauses.push("metadata = ?");
        params.push(JSON.stringify(updates.metadata));
      }

      // Always update the updated_at timestamp
      const now = new Date().toISOString();
      setClauses.push("updated_at = ?");
      params.push(now);

      // Add the session ID to the params
      params.push(sessionId);

      if (setClauses.length > 0) {
        const sql = `
          UPDATE chat_sessions 
          SET ${setClauses.join(", ")} 
          WHERE session_id = ?
        `;

        await executeQuery(sql, params, "UPDATE");
      }

      // Fetch the updated session
      return await this.getSession(sessionId);
    } catch (error) {
      logger.error(
        `Error updating chat session ${sessionId}`,
        error instanceof Error ? error : new Error(String(error)),
      );
      return null;
    }
  }

  /**
   * Send a message in a chat session
   */
  async sendMessage(
    sessionId: string,
    userId: string,
    message: string,
    messageType: "user" | "system" | "ai" = "user",
    metadata?: Record<string, any>,
    attachments?: Omit<ChatAttachment, "id" | "messageId" | "createdAt">[],
  ): Promise<ChatMessage | null> {
    try {
      // Check if the session exists
      const session = await this.getSession(sessionId);
      if (!session) {
        throw new Error(`Chat session ${sessionId} not found`);
      }

      // Check if user is banned (for user messages only)
      if (messageType === "user") {
        const isBanned = await moderationService.isUserBanned(userId);
        if (isBanned) {
          throw new Error("User is banned from sending messages");
        }

        // Check content against moderation rules
        const moderationResult = await moderationService.checkContent(
          message,
          userId,
        );

        // If content is not allowed, return early
        if (!moderationResult.isAllowed) {
          return null;
        }

        // If content was modified, use the modified version
        if (moderationResult.modifiedContent) {
          message = moderationResult.modifiedContent;
          metadata = { ...metadata, moderated: true };
        }

        // If content was flagged, add to metadata
        if (moderationResult.flagged) {
          metadata = { ...metadata, flagged: true };
        }
      }

      // Generate a unique ID for the message
      const messageId = uuidv4();
      const now = new Date().toISOString();

      // Prepare queries for transaction
      const queries = [];

      // Insert message query
      queries.push({
        sql: `
          INSERT INTO chat_messages 
          (id, session_id, user_id, message, message_type, metadata, status, created_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        replacements: [
          messageId,
          sessionId,
          userId,
          message,
          messageType,
          metadata ? JSON.stringify(metadata) : JSON.stringify({}),
          "pending",
          now,
        ],
        queryType: "INSERT",
      });

      // Update session's last_message_at
      queries.push({
        sql: `
          UPDATE chat_sessions 
          SET last_message_at = ?, updated_at = ? 
          WHERE session_id = ?
        `,
        replacements: [now, now, sessionId],
        queryType: "UPDATE",
      });

      // Process attachments if any
      if (attachments && attachments.length > 0) {
        for (const attachment of attachments) {
          const attachmentId = uuidv4();
          queries.push({
            sql: `
              INSERT INTO chat_attachments 
              (id, message_id, type, url, filename, filesize, metadata, created_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            replacements: [
              attachmentId,
              messageId,
              attachment.type,
              attachment.url,
              attachment.filename,
              attachment.filesize,
              attachment.metadata
                ? JSON.stringify(attachment.metadata)
                : JSON.stringify({}),
              now,
            ],
            queryType: "INSERT",
          });
        }
      }

      // Mark as delivered
      queries.push({
        sql: `UPDATE chat_messages SET status = ? WHERE id = ?`,
        replacements: ["delivered", messageId],
        queryType: "UPDATE",
      });

      // Execute all queries in a transaction
      await executeTransaction(queries);

      // Also send via WebSocket if available
      this.sendMessageViaWebSocket(
        sessionId,
        userId,
        message,
        messageType,
        metadata,
        attachments,
      );

      // Get the complete message with attachments
      return this.getMessageById(messageId);
    } catch (error) {
      logger.error(
        `Error sending message to session ${sessionId}`,
        error instanceof Error ? error : new Error(String(error)),
      );
      return null;
    }
  }

  /**
   * Send a message via WebSocket for immediate delivery
   */
  private sendMessageViaWebSocket(
    sessionId: string,
    userId: string,
    message: string,
    messageType: "user" | "system" | "ai",
    metadata?: Record<string, any>,
    attachments?: Omit<ChatAttachment, "id" | "messageId" | "createdAt">[],
  ): void {
    try {
      websocketService.sendMessage({
        type: "chat_message",
        data: {
          session_id: sessionId,
          user_id: userId,
          message,
          message_type: messageType,
          metadata: metadata || {},
          attachments: attachments || [],
          created_at: new Date().toISOString(),
          status: "delivered",
        },
      });
    } catch (error) {
      logger.error(
        "Error sending message via WebSocket",
        error instanceof Error ? error : new Error(String(error)),
      );
      // Continue execution - WebSocket is just for immediate delivery,
      // the message is already saved in the database
    }
  }

  /**
   * Get messages for a chat session
   */
  async getSessionMessages(
    sessionId: string,
    limit = 50,
    before?: string,
  ): Promise<ChatMessage[]> {
    try {
      let sql = `
        SELECT m.*, a.id as attachment_id, a.type as attachment_type, 
               a.url as attachment_url, a.filename as attachment_filename, 
               a.filesize as attachment_filesize, a.metadata as attachment_metadata, 
               a.created_at as attachment_created_at
        FROM chat_messages m
        LEFT JOIN chat_attachments a ON m.id = a.message_id
        WHERE m.session_id = ?
      `;

      const params = [sessionId];

      if (before) {
        sql += ` AND m.created_at < ?`;
        params.push(before);
      }

      sql += ` ORDER BY m.created_at DESC LIMIT ?`;
      params.push(limit);

      const results = await executeQuery(sql, params);

      // Group by message ID to handle attachments
      const messageMap = new Map<string, any>();

      for (const row of results) {
        if (!messageMap.has(row.id)) {
          messageMap.set(row.id, {
            ...row,
            attachments: [],
          });
        }

        // Add attachment if it exists
        if (row.attachment_id) {
          const message = messageMap.get(row.id);
          message.attachments.push({
            id: row.attachment_id,
            messageId: row.id,
            type: row.attachment_type,
            url: row.attachment_url,
            filename: row.attachment_filename,
            filesize: row.attachment_filesize,
            metadata: this.parseJsonField(row.attachment_metadata),
            createdAt: row.attachment_created_at,
          });
        }
      }

      // Convert map to array and map to ChatMessage objects
      const messages = Array.from(messageMap.values()).map(
        this.mapMessageWithAttachmentsFromDb.bind(this),
      );

      // Return in chronological order (oldest first)
      return messages.reverse();
    } catch (error) {
      logger.error(
        `Error fetching messages for session ${sessionId}`,
        error instanceof Error ? error : new Error(String(error)),
      );
      return [];
    }
  }

  /**
   * Get a message by ID
   */
  async getMessageById(messageId: string): Promise<ChatMessage | null> {
    try {
      const sql = `
        SELECT m.*, a.id as attachment_id, a.type as attachment_type, 
               a.url as attachment_url, a.filename as attachment_filename, 
               a.filesize as attachment_filesize, a.metadata as attachment_metadata, 
               a.created_at as attachment_created_at
        FROM chat_messages m
        LEFT JOIN chat_attachments a ON m.id = a.message_id
        WHERE m.id = ?
      `;

      const results = await executeQuery(sql, [messageId]);

      if (!results || results.length === 0) return null;

      // Group attachments with the message
      const message = {
        ...results[0],
        attachments: [],
      };

      // Add attachments if they exist
      for (const row of results) {
        if (row.attachment_id) {
          message.attachments.push({
            id: row.attachment_id,
            messageId: row.id,
            type: row.attachment_type,
            url: row.attachment_url,
            filename: row.attachment_filename,
            filesize: row.attachment_filesize,
            metadata: this.parseJsonField(row.attachment_metadata),
            createdAt: row.attachment_created_at,
          });
        }
      }

      return this.mapMessageWithAttachmentsFromDb(message);
    } catch (error) {
      logger.error(
        `Error fetching message ${messageId}`,
        error instanceof Error ? error : new Error(String(error)),
      );
      return null;
    }
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(
    sessionId: string,
    userId: string,
    messageIds: string[],
  ): Promise<boolean> {
    try {
      if (!messageIds.length) return true;

      // Only mark messages that aren't from this user
      const placeholders = messageIds.map(() => "?").join(",");
      const sql = `
        UPDATE chat_messages 
        SET status = 'read' 
        WHERE id IN (${placeholders}) 
          AND session_id = ? 
          AND user_id != ?
      `;

      const params = [...messageIds, sessionId, userId];

      await executeQuery(sql, params, "UPDATE");

      // Notify via WebSocket that messages were read
      websocketService.sendMessage({
        type: "messages_read",
        data: {
          session_id: sessionId,
          user_id: userId,
          message_ids: messageIds,
          timestamp: new Date().toISOString(),
        },
      });

      return true;
    } catch (error) {
      logger.error(
        `Error marking messages as read in session ${sessionId}`,
        error instanceof Error ? error : new Error(String(error)),
      );
      return false;
    }
  }

  /**
   * Upload a file attachment
   */
  async uploadAttachment(
    file: File,
    sessionId: string,
    userId: string,
  ): Promise<{ url: string; filename: string; filesize: number } | null> {
    try {
      // Generate a unique filename
      const fileExt = file.name.split(".").pop();
      const filename = `${uuidv4()}.${fileExt}`;
      const filePath = `attachments/${sessionId}/${filename}`;

      // For MySQL implementation, we would need to handle file storage differently
      // This could be using a file system, S3, or another storage solution
      // For now, we'll implement a placeholder that returns a mock URL

      logger.info(
        `File upload requested for session ${sessionId} by user ${userId}`,
      );

      // Mock implementation - in a real app, replace with actual file storage
      const mockUrl = `/api/attachments/${filePath}`;

      return {
        url: mockUrl,
        filename: file.name,
        filesize: file.size,
      };
    } catch (error) {
      logger.error(
        `Error uploading attachment for session ${sessionId}`,
        error instanceof Error ? error : new Error(String(error)),
      );
      return null;
    }
  }

  /**
   * Subscribe to new messages in a chat session
   */
  subscribeToMessages(
    sessionId: string,
    callback: (message: ChatMessage) => void,
  ) {
    return realtimeService.subscribeToChatMessages(sessionId, (payload) => {
      if (payload.eventType === "INSERT") {
        callback(this.mapMessageFromDb(payload.new));
      }
    });
  }

  /**
   * Subscribe to changes in a chat session
   */
  subscribeToSession(
    sessionId: string,
    callback: (session: ChatSession) => void,
  ) {
    return realtimeService.subscribeToChatSession(sessionId, (payload) => {
      if (payload.eventType === "UPDATE") {
        callback(this.mapSessionFromDb(payload.new));
      }
    });
  }

  /**
   * Parse a JSON field from the database
   */
  private parseJsonField(field: any): any {
    if (!field) return {};

    try {
      return typeof field === "string" ? JSON.parse(field) : field;
    } catch (error) {
      logger.warn("Error parsing JSON field", error);
      return {};
    }
  }

  /**
   * Map database object to ChatSession
   */
  private mapSessionFromDb(data: any): ChatSession {
    return {
      id: data.id,
      sessionId: data.session_id,
      userId: data.user_id,
      contextRuleId: data.context_rule_id,
      isActive: data.is_active,
      metadata: this.parseJsonField(data.metadata),
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      lastMessageAt: data.last_message_at,
    };
  }

  /**
   * Map database object to ChatMessage
   */
  private mapMessageFromDb(data: any): ChatMessage {
    return {
      id: data.id,
      sessionId: data.session_id,
      userId: data.user_id,
      message: data.message,
      messageType: data.message_type,
      metadata: this.parseJsonField(data.metadata),
      status: data.status,
      createdAt: data.created_at,
    };
  }

  /**
   * Map database object to ChatMessage with attachments
   */
  private mapMessageWithAttachmentsFromDb(data: any): ChatMessage {
    const message = this.mapMessageFromDb(data);

    // Add attachments if they exist
    if (data.attachments && Array.isArray(data.attachments)) {
      message.attachments = data.attachments.map((attachment: any) => ({
        id: attachment.id,
        messageId: attachment.message_id || message.id,
        type: attachment.type,
        url: attachment.url,
        filename: attachment.filename,
        filesize: attachment.filesize,
        metadata: this.parseJsonField(attachment.metadata),
        createdAt: attachment.createdAt || attachment.created_at,
      }));
    }

    return message;
  }
}

// Create a singleton instance
const chatService = new ChatService();

export { chatService };
export default chatService;
