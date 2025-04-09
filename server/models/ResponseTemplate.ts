/**
 * Response Template Model
 *
 * This module defines the schema and methods for response template entities.
 */

import { v4 as uuidv4 } from "uuid";

export interface ResponseTemplateAttributes {
  id?: string;
  userId: string;
  name: string;
  template: string;
  description?: string;
  category?: string;
  tags?: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export class ResponseTemplate {
  id: string;
  userId: string;
  name: string;
  template: string;
  description: string | null;
  category: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  constructor(
    data: ResponseTemplateAttributes = {} as ResponseTemplateAttributes,
  ) {
    this.id = data.id || uuidv4();
    this.userId = data.userId || "";
    this.name = data.name || "";
    this.template = data.template || "";
    this.description = data.description || null;
    this.category = data.category || "general";
    this.tags = data.tags || [];
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  static fromDatabase(dbRecord: any): ResponseTemplate | null {
    if (!dbRecord) return null;

    return new ResponseTemplate({
      id: dbRecord.id,
      userId: dbRecord.user_id,
      name: dbRecord.name,
      template: dbRecord.template,
      description: dbRecord.description,
      category: dbRecord.category,
      tags: dbRecord.tags ? JSON.parse(dbRecord.tags) : [],
      isActive: dbRecord.is_active === 1,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
    });
  }

  toDatabase(): Record<string, any> {
    return {
      id: this.id,
      user_id: this.userId,
      name: this.name,
      template: this.template,
      description: this.description,
      category: this.category,
      tags: this.tags.length > 0 ? JSON.stringify(this.tags) : null,
      is_active: this.isActive ? 1 : 0,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }
}
