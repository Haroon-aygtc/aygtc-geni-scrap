/**
 * Follow-Up Configuration Model
 *
 * This module defines the schema and methods for follow-up configuration entities.
 */

const { v4: uuidv4 } = require("uuid");

class FollowUpConfig {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.userId = data.userId || null;
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

  static fromDatabase(dbRecord) {
    if (!dbRecord) return null;

    return {
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
    };
  }

  static toDatabase(model) {
    return {
      id: model.id,
      user_id: model.userId,
      name: model.name,
      is_enabled: model.isEnabled ? 1 : 0,
      max_questions: model.maxQuestions,
      display_mode: model.displayMode,
      generate_dynamically: model.generateDynamically ? 1 : 0,
      ai_prompt: model.aiPrompt,
      is_default: model.isDefault ? 1 : 0,
      created_at: model.createdAt,
      updated_at: model.updatedAt,
    };
  }
}

module.exports = FollowUpConfig;
