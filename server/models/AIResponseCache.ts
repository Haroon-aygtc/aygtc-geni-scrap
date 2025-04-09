/**
 * AI Response Cache Model
 *
 * This module defines the schema and methods for AI response cache entities.
 */

import { v4 as uuidv4 } from "uuid";

export interface AIResponseCacheAttributes {
  id?: string;
  promptHash: string;
  prompt: string;
  response: string;
  model: string;
  metadata?: Record<string, any>;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class AIResponseCache {
  id: string;
  promptHash: string;
  prompt: string;
  response: string;
  model: string;
  metadata: Record<string, any> | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;

  constructor(
    data: AIResponseCacheAttributes = {} as AIResponseCacheAttributes,
  ) {
    this.id = data.id || uuidv4();
    this.promptHash = data.promptHash || "";
    this.prompt = data.prompt || "";
    this.response = data.response || "";
    this.model = data.model || "unknown";
    this.metadata = data.metadata || null;
    this.expiresAt = data.expiresAt || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  static fromDatabase(dbRecord: any): AIResponseCache | null {
    if (!dbRecord) return null;

    return new AIResponseCache({
      id: dbRecord.id,
      promptHash: dbRecord.prompt_hash,
      prompt: dbRecord.prompt,
      response: dbRecord.response,
      model: dbRecord.model,
      metadata: dbRecord.metadata ? JSON.parse(dbRecord.metadata) : null,
      expiresAt: dbRecord.expires_at,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
    });
  }

  toDatabase(): Record<string, any> {
    return {
      id: this.id,
      prompt_hash: this.promptHash,
      prompt: this.prompt,
      response: this.response,
      model: this.model,
      metadata: this.metadata ? JSON.stringify(this.metadata) : null,
      expires_at: this.expiresAt,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }
}
