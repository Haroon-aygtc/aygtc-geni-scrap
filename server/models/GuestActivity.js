/**
 * Guest Activity Model
 *
 * This module defines the schema and methods for guest activity entities.
 */

const { v4: uuidv4 } = require("uuid");

class GuestActivity {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.guestId = data.guestId || null;
    this.action = data.action || "";
    this.metadata = data.metadata || null;
    this.ipAddress = data.ipAddress || null;
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  static fromDatabase(dbRecord) {
    if (!dbRecord) return null;

    return {
      id: dbRecord.id,
      guestId: dbRecord.guest_id,
      action: dbRecord.action,
      metadata: dbRecord.metadata ? JSON.parse(dbRecord.metadata) : null,
      ipAddress: dbRecord.ip_address,
      createdAt: dbRecord.created_at,
    };
  }

  static toDatabase(model) {
    return {
      id: model.id,
      guest_id: model.guestId,
      action: model.action,
      metadata: model.metadata ? JSON.stringify(model.metadata) : null,
      ip_address: model.ipAddress,
      created_at: model.createdAt,
    };
  }
}

module.exports = GuestActivity;
