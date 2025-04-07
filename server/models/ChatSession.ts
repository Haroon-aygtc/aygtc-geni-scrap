/**
 * Chat Session Model
 *
 * This module defines the schema and methods for chat session entities.
 */

import { v4 as uuidv4 } from "uuid";

export interface ChatSessionAttributes {
  id?: string;
  sessionId?: string;
  userId?: string;
  widgetId?: string;
  status?: "active" | "closed" | "archived";
  metadata?: Record<string, any>;
  lastMessageAt?: string;
  messageCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export class ChatSession {
  id: string;
  sessionId: string;
  userId: string | null;
  widgetId: string | null;
  status: "active" | "closed" | "archived";
  metadata: Record<string, any> | null;
  lastMessageAt: string | null;
  messageCount: number;
  createdAt: string;
  updatedAt: string;

  constructor(data: ChatSessionAttributes = {} as ChatSessionAttributes) {
    this.id = data.id || uuidv4();
    this.sessionId = data.sessionId || uuidv4();
    this.userId = data.userId || null;
    this.widgetId = data.widgetId || null;
    this.status = data.status || "active";
    this.metadata = data.metadata || null;
    this.lastMessageAt = data.lastMessageAt || null;
    this.messageCount = data.messageCount || 0;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  static fromDatabase(dbRecord: any): ChatSession | null {
    if (!dbRecord) return null;

    return new ChatSession({
      id: dbRecord.id,
      sessionId: dbRecord.session_id,
      userId: dbRecord.user_id,
      widgetId: dbRecord.widget_id,
      status: dbRecord.status,
      metadata: dbRecord.metadata ? JSON.parse(dbRecord.metadata) : null,
      lastMessageAt: dbRecord.last_message_at,
      messageCount: dbRecord.message_count,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
    });
  }

  toDatabase(): Record<string, any> {
    return {
      id: this.id,
      session_id: this.sessionId,
      user_id: this.userId,
      widget_id: this.widgetId,
      status: this.status,
      metadata: this.metadata ? JSON.stringify(this.metadata) : null,
      last_message_at: this.lastMessageAt,
      message_count: this.messageCount,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }
}
