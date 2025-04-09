/**
 * Follow-Up Question Model
 *
 * This module defines the schema and methods for follow-up question entities.
 */

const { v4: uuidv4 } = require("uuid");

class FollowUpQuestion {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.configId = data.configId || null;
    this.question = data.question || "";
    this.displayOrder = data.displayOrder || 0;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.category = data.category || "general";
    this.tags = data.tags || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  static fromDatabase(dbRecord) {
    if (!dbRecord) return null;

    return {
      id: dbRecord.id,
      configId: dbRecord.config_id,
      question: dbRecord.question,
      displayOrder: dbRecord.display_order,
      isActive: dbRecord.is_active === 1,
      category: dbRecord.category,
      tags: dbRecord.tags ? JSON.parse(dbRecord.tags) : [],
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
    };
  }

  static toDatabase(model) {
    return {
      id: model.id,
      config_id: model.configId,
      question: model.question,
      display_order: model.displayOrder,
      is_active: model.isActive ? 1 : 0,
      category: model.category,
      tags: model.tags ? JSON.stringify(model.tags) : null,
      created_at: model.createdAt,
      updated_at: model.updatedAt,
    };
  }
}

module.exports = FollowUpQuestion;
