/**
 * Knowledge Base Model
 *
 * This module defines the schema and methods for knowledge base entities.
 */

const { v4: uuidv4 } = require("uuid");

class KnowledgeBase {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.name = data.name || "";
    this.description = data.description || "";
    this.sourceType = data.sourceType || "manual";
    this.sourceUrl = data.sourceUrl || null;
    this.content = data.content || null;
    this.userId = data.userId || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  static fromDatabase(dbRecord) {
    if (!dbRecord) return null;

    return {
      id: dbRecord.id,
      name: dbRecord.name,
      description: dbRecord.description,
      sourceType: dbRecord.source_type,
      sourceUrl: dbRecord.source_url,
      content: dbRecord.content,
      userId: dbRecord.user_id,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
    };
  }

  static toDatabase(model) {
    return {
      id: model.id,
      name: model.name,
      description: model.description,
      source_type: model.sourceType,
      source_url: model.sourceUrl,
      content: model.content,
      user_id: model.userId,
      created_at: model.createdAt,
      updated_at: model.updatedAt,
    };
  }
}

module.exports = KnowledgeBase;
