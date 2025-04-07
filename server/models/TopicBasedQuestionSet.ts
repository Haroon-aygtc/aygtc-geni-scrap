/**
 * Topic-Based Question Set Model
 *
 * This module defines the schema and methods for topic-based question set entities.
 */

import { v4 as uuidv4 } from "uuid";

export interface TopicBasedQuestionSetAttributes {
  id?: string;
  configId: string;
  topic: string;
  createdAt?: string;
  updatedAt?: string;
}

export class TopicBasedQuestionSet {
  id: string;
  configId: string;
  topic: string;
  createdAt: string;
  updatedAt: string;

  constructor(
    data: TopicBasedQuestionSetAttributes = {} as TopicBasedQuestionSetAttributes,
  ) {
    this.id = data.id || uuidv4();
    this.configId = data.configId || "";
    this.topic = data.topic || "";
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  static fromDatabase(dbRecord: any): TopicBasedQuestionSet | null {
    if (!dbRecord) return null;

    return new TopicBasedQuestionSet({
      id: dbRecord.id,
      configId: dbRecord.config_id,
      topic: dbRecord.topic,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
    });
  }

  toDatabase(): Record<string, any> {
    return {
      id: this.id,
      config_id: this.configId,
      topic: this.topic,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }
}
