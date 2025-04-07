/**
 * AI Interaction Log Model
 *
 * This module defines the schema and methods for AI interaction log entities.
 */

import { v4 as uuidv4 } from "uuid";

export interface AIInteractionLogAttributes {
  id?: string;
  userId?: string;
  sessionId?: string;
  prompt: string;
  response: string;
  model: string;
  duration?: number;
  tokens?: number;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
}

export class AIInteractionLog {
  id: string;
  userId: string | null;
  sessionId: string | null;
  prompt: string;
  response: string;
  model: string;
  duration: number;
  tokens: number;
  success: boolean;
  errorMessage: string | null;
  metadata: Record<string, any> | null;
  createdAt: string;

  constructor(
    data: AIInteractionLogAttributes = {} as AIInteractionLogAttributes,
  ) {
    this.id = data.id || uuidv4();
    this.userId = data.userId || null;
    this.sessionId = data.sessionId || null;
    this.prompt = data.prompt || "";
    this.response = data.response || "";
    this.model = data.model || "unknown";
    this.duration = data.duration || 0;
    this.tokens = data.tokens || 0;
    this.success = data.success !== undefined ? data.success : true;
    this.errorMessage = data.errorMessage || null;
    this.metadata = data.metadata || null;
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  static fromDatabase(dbRecord: any): AIInteractionLog | null {
    if (!dbRecord) return null;

    return new AIInteractionLog({
      id: dbRecord.id,
      userId: dbRecord.user_id,
      sessionId: dbRecord.session_id,
      prompt: dbRecord.prompt,
      response: dbRecord.response,
      model: dbRecord.model,
      duration: dbRecord.duration,
      tokens: dbRecord.tokens,
      success: dbRecord.success === 1,
      errorMessage: dbRecord.error_message,
      metadata: dbRecord.metadata ? JSON.parse(dbRecord.metadata) : null,
      createdAt: dbRecord.created_at,
    });
  }

  toDatabase(): Record<string, any> {
    return {
      id: this.id,
      user_id: this.userId,
      session_id: this.sessionId,
      prompt: this.prompt,
      response: this.response,
      model: this.model,
      duration: this.duration,
      tokens: this.tokens,
      success: this.success ? 1 : 0,
      error_message: this.errorMessage,
      metadata: this.metadata ? JSON.stringify(this.metadata) : null,
      created_at: this.createdAt,
    };
  }
}
