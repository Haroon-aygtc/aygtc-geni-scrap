/**
 * Guest Session Model
 *
 * This module defines the schema and methods for guest session entities.
 */

const { v4: uuidv4 } = require("uuid");

class GuestSession {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.guestId = data.guestId || null;
    this.sessionToken = data.sessionToken || null;
    this.expiresAt = data.expiresAt || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  static fromDatabase(dbRecord) {
    if (!dbRecord) return null;

    return {
      id: dbRecord.id,
      guestId: dbRecord.guest_id,
      sessionToken: dbRecord.session_token,
      expiresAt: dbRecord.expires_at,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
    };
  }

  static toDatabase(model) {
    return {
      id: model.id,
      guest_id: model.guestId,
      session_token: model.sessionToken,
      expires_at: model.expiresAt,
      created_at: model.createdAt,
      updated_at: model.updatedAt,
    };
  }
}

module.exports = GuestSession;
