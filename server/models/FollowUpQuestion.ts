/**
 * Follow-Up Question Model
 *
 * This module defines the schema and methods for follow-up question entities.
 */

import { v4 as uuidv4 } from "uuid";

export interface FollowUpQuestionAttributes {
  id?: string;
  configId: string;
  question: string;
  displayOrder?: number;
  isActive?: boolean;
  category?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export class FollowUpQuestion {
  id: string;
  configId: string;
  question: string;
  displayOrder: number;
  isActive: boolean;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;

  constructor(
    data: FollowUpQuestionAttributes = {} as FollowUpQuestionAttributes,
  ) {
    this.id = data.id || uuidv4();
    this.configId = data.configId || "";
    this.question = data.question || "";
    this.displayOrder = data.displayOrder || 0;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.category = data.category || "general";
    this.tags = data.tags || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  static fromDatabase(dbRecord: any): FollowUpQuestion | null {
    if (!dbRecord) return null;

    return new FollowUpQuestion({
      id: dbRecord.id,
      configId: dbRecord.config_id,
      question: dbRecord.question,
      displayOrder: dbRecord.display_order,
      isActive: dbRecord.is_active === 1,
      category: dbRecord.category,
      tags: dbRecord.tags ? JSON.parse(dbRecord.tags) : [],
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
    });
  }

  toDatabase(): Record<string, any> {
    return {
      id: this.id,
      config_id: this.configId,
      question: this.question,
      display_order: this.displayOrder,
      is_active: this.isActive ? 1 : 0,
      category: this.category,
      tags: this.tags.length > 0 ? JSON.stringify(this.tags) : null,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }
}
