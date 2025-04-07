/**
 * Analytics Model
 *
 * This module defines the schema and methods for analytics data.
 */

const { v4: uuidv4 } = require("uuid");

class Analytics {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.userId = data.userId || null;
    this.eventType = data.eventType || "";
    this.eventData = data.eventData || {};
    this.sessionId = data.sessionId || null;
    this.ipAddress = data.ipAddress || null;
    this.userAgent = data.userAgent || null;
    this.timestamp = data.timestamp || new Date().toISOString();
  }

  static fromDatabase(dbRecord) {
    if (!dbRecord) return null;

    return {
      id: dbRecord.id,
      userId: dbRecord.user_id,
      eventType: dbRecord.event_type,
      eventData: dbRecord.event_data ? JSON.parse(dbRecord.event_data) : {},
      sessionId: dbRecord.session_id,
      ipAddress: dbRecord.ip_address,
      userAgent: dbRecord.user_agent,
      timestamp: dbRecord.timestamp,
    };
  }

  static toDatabase(model) {
    return {
      id: model.id,
      user_id: model.userId,
      event_type: model.eventType,
      event_data: model.eventData ? JSON.stringify(model.eventData) : null,
      session_id: model.sessionId,
      ip_address: model.ipAddress,
      user_agent: model.userAgent,
      timestamp: model.timestamp,
    };
  }
}

module.exports = Analytics;
