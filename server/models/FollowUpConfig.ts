/**
 * Follow-Up Configuration Model
 *
 * This module defines the schema and methods for follow-up configuration entities.
 */

import { v4 as uuidv4 } from "uuid";

export interface FollowUpConfigAttributes {
  id?: string;
  userId: string;
  name: string;
  isEnabled?: boolean;
  maxQuestions?: number;
  displayMode?: "buttons" | "chips" | "list";
  generateDynamically?: boolean;
  aiPrompt?: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export class FollowUpConfig {
  id: string;
  userId: string;
  name: string;
  isEnabled: boolean;
  maxQuestions: number;
  displayMode: "buttons" | "chips" | "list";
  generateDynamically: boolean;
  aiPrompt: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;

  constructor(data: FollowUpConfigAttributes = {} as FollowUpConfigAttributes) {
    this.id = data.id || uuidv4();
    this.userId = data.userId || "";
    this.name = data.name || "Default Configuration";
    this.isEnabled = data.isEnabled !== undefined ? data.isEnabled : true;
    this.maxQuestions = data.maxQuestions || 3;
    this.displayMode = data.displayMode || "buttons";
    this.generateDynamically =
      data.generateDynamically !== undefined ? data.generateDynamically : false;
    this.aiPrompt =
      data.aiPrompt ||
      "Generate follow-up questions based on the conversation context.";
    this.isDefault = data.isDefault !== undefined ? data.isDefault : false;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  static fromDatabase(dbRecord: any): FollowUpConfig | null {
    if (!dbRecord) return null;

    return new FollowUpConfig({
      id: dbRecord.id,
      userId: dbRecord.user_id,
      name: dbRecord.name,
      isEnabled: dbRecord.is_enabled === 1,
      maxQuestions: dbRecord.max_questions,
      displayMode: dbRecord.display_mode,
      generateDynamically: dbRecord.generate_dynamically === 1,
      aiPrompt: dbRecord.ai_prompt,
      isDefault: dbRecord.is_default === 1,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
    });
  }

  toDatabase(): Record<string, any> {
    return {
      id: this.id,
      user_id: this.userId,
      name: this.name,
      is_enabled: this.isEnabled ? 1 : 0,
      max_questions: this.maxQuestions,
      display_mode: this.displayMode,
      generate_dynamically: this.generateDynamically ? 1 : 0,
      ai_prompt: this.aiPrompt,
      is_default: this.isDefault ? 1 : 0,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }
}
