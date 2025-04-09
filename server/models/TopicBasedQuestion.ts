/**
 * Topic-Based Question Model
 *
 * This module defines the schema and methods for topic-based question entities.
 */

import { v4 as uuidv4 } from "uuid";

export interface TopicBasedQuestionAttributes {
  id?: string;
  setId: string;
  questionText: string;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export class TopicBasedQuestion {
  id: string;
  setId: string;
  questionText: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;

  constructor(
    data: TopicBasedQuestionAttributes = {} as TopicBasedQuestionAttributes,
  ) {
    this.id = data.id || uuidv4();
    this.setId = data.setId || "";
    this.questionText = data.questionText || "";
    this.displayOrder = data.displayOrder || 0;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  static fromDatabase(dbRecord: any): TopicBasedQuestion | null {
    if (!dbRecord) return null;

    return new TopicBasedQuestion({
      id: dbRecord.id,
      setId: dbRecord.set_id,
      questionText: dbRecord.question_text,
      displayOrder: dbRecord.display_order,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
    });
  }

  toDatabase(): Record<string, any> {
    return {
      id: this.id,
      set_id: this.setId,
      question_text: this.questionText,
      display_order: this.displayOrder,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }
}
