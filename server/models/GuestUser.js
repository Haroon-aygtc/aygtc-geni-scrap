/**
 * Guest User Model
 *
 * This module defines the schema and methods for guest user entities.
 */

const { v4: uuidv4 } = require("uuid");

class GuestUser {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.fullName = data.fullName || "";
    this.phoneNumber = data.phoneNumber || "";
    this.email = data.email || null;
    this.ipAddress = data.ipAddress || null;
    this.userAgent = data.userAgent || null;
    this.status = data.status || "active";
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  static fromDatabase(dbRecord) {
    if (!dbRecord) return null;

    return {
      id: dbRecord.id,
      fullName: dbRecord.full_name,
      phoneNumber: dbRecord.phone_number,
      email: dbRecord.email,
      ipAddress: dbRecord.ip_address,
      userAgent: dbRecord.user_agent,
      status: dbRecord.status,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
    };
  }

  static toDatabase(model) {
    return {
      id: model.id,
      full_name: model.fullName,
      phone_number: model.phoneNumber,
      email: model.email,
      ip_address: model.ipAddress,
      user_agent: model.userAgent,
      status: model.status,
      created_at: model.createdAt,
      updated_at: model.updatedAt,
    };
  }
}

module.exports = GuestUser;
