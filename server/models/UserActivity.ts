/**
 * User Activity Model
 *
 * This module defines the schema and methods for user activity entities.
 */

import { v4 as uuidv4 } from "uuid";

export interface UserActivityAttributes {
  id?: string;
  userId: string;
  action: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: string;
}

export class UserActivity {
  id: string;
  userId: string;
  action: string;
  metadata: Record<string, any> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;

  constructor(data: UserActivityAttributes = {} as UserActivityAttributes) {
    this.id = data.id || uuidv4();
    this.userId = data.userId || "";
    this.action = data.action || "";
    this.metadata = data.metadata || null;
    this.ipAddress = data.ipAddress || null;
    this.userAgent = data.userAgent || null;
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  static fromDatabase(dbRecord: any): UserActivity | null {
    if (!dbRecord) return null;

    return new UserActivity({
      id: dbRecord.id,
      userId: dbRecord.user_id,
      action: dbRecord.action,
      metadata: dbRecord.metadata ? JSON.parse(dbRecord.metadata) : null,
      ipAddress: dbRecord.ip_address,
      userAgent: dbRecord.user_agent,
      createdAt: dbRecord.created_at,
    });
  }

  toDatabase(): Record<string, any> {
    return {
      id: this.id,
      user_id: this.userId,
      action: this.action,
      metadata: this.metadata ? JSON.stringify(this.metadata) : null,
      ip_address: this.ipAddress,
      user_agent: this.userAgent,
      created_at: this.createdAt,
    };
  }
}
