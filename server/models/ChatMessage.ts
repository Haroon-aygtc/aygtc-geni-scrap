/**
 * Chat Message Model
 *
 * This module defines the schema and methods for chat message entities.
 */

import { v4 as uuidv4 } from "uuid";

export interface ChatMessageAttributes {
  id?: string;
  messageId?: string;
  sessionId: string;
  userId?: string;
  content: string;
  role: "user" | "assistant" | "system";
  metadata?: Record<string, any>;
  createdAt?: string;
}

export class ChatMessage {
  id: string;
  messageId: string;
  sessionId: string;
  userId: string | null;
  content: string;
  role: "user" | "assistant" | "system";
  metadata: Record<string, any> | null;
  createdAt: string;

  constructor(data: ChatMessageAttributes = {} as ChatMessageAttributes) {
    this.id = data.id || uuidv4();
    this.messageId = data.messageId || uuidv4();
    this.sessionId = data.sessionId || "";
    this.userId = data.userId || null;
    this.content = data.content || "";
    this.role = data.role || "user";
    this.metadata = data.metadata || null;
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  static fromDatabase(dbRecord: any): ChatMessage | null {
    if (!dbRecord) return null;

    return new ChatMessage({
      id: dbRecord.id,
      messageId: dbRecord.message_id,
      sessionId: dbRecord.session_id,
      userId: dbRecord.user_id,
      content: dbRecord.content,
      role: dbRecord.role,
      metadata: dbRecord.metadata ? JSON.parse(dbRecord.metadata) : null,
      createdAt: dbRecord.created_at,
    });
  }

  toDatabase(): Record<string, any> {
    return {
      id: this.id,
      message_id: this.messageId,
      session_id: this.sessionId,
      user_id: this.userId,
      content: this.content,
      role: this.role,
      metadata: this.metadata ? JSON.stringify(this.metadata) : null,
      created_at: this.createdAt,
    };
  }
}
