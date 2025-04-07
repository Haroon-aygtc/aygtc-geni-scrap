/**
 * Predefined Question Set Model
 *
 * This module defines the schema and methods for predefined question set entities.
 */

import { v4 as uuidv4 } from "uuid";

export interface PredefinedQuestionSetAttributes {
  id?: string;
  configId: string;
  name: string;
  description?: string;
  triggerKeywords?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export class PredefinedQuestionSet {
  id: string;
  configId: string;
  name: string;
  description: string | null;
  triggerKeywords: string[];
  createdAt: string;
  updatedAt: string;

  constructor(
    data: PredefinedQuestionSetAttributes = {} as PredefinedQuestionSetAttributes,
  ) {
    this.id = data.id || uuidv4();
    this.configId = data.configId || "";
    this.name = data.name || "";
    this.description = data.description || null;
    this.triggerKeywords = data.triggerKeywords || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  static fromDatabase(dbRecord: any): PredefinedQuestionSet | null {
    if (!dbRecord) return null;

    return new PredefinedQuestionSet({
      id: dbRecord.id,
      configId: dbRecord.config_id,
      name: dbRecord.name,
      description: dbRecord.description,
      triggerKeywords: dbRecord.trigger_keywords
        ? JSON.parse(dbRecord.trigger_keywords)
        : [],
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
    });
  }

  toDatabase(): Record<string, any> {
    return {
      id: this.id,
      config_id: this.configId,
      name: this.name,
      description: this.description,
      trigger_keywords:
        this.triggerKeywords.length > 0
          ? JSON.stringify(this.triggerKeywords)
          : null,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }
}
