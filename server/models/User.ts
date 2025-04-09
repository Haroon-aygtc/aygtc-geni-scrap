/**
 * User Model
 *
 * This module defines the schema and methods for user entities.
 */

import { v4 as uuidv4 } from "uuid";

export interface UserAttributes {
  id?: string;
  email: string;
  password?: string;
  name?: string;
  role?: "admin" | "user";
  status?: "active" | "inactive" | "suspended";
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class User {
  id: string;
  email: string;
  password: string | null;
  name: string | null;
  role: "admin" | "user";
  status: "active" | "inactive" | "suspended";
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;

  constructor(data: UserAttributes = {} as UserAttributes) {
    this.id = data.id || uuidv4();
    this.email = data.email || "";
    this.password = data.password || null;
    this.name = data.name || null;
    this.role = data.role || "user";
    this.status = data.status || "active";
    this.lastLoginAt = data.lastLoginAt || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  static fromDatabase(dbRecord: any): User | null {
    if (!dbRecord) return null;

    return new User({
      id: dbRecord.id,
      email: dbRecord.email,
      password: dbRecord.password,
      name: dbRecord.name,
      role: dbRecord.role,
      status: dbRecord.status,
      lastLoginAt: dbRecord.last_login_at,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
    });
  }

  toDatabase(): Record<string, any> {
    return {
      id: this.id,
      email: this.email,
      password: this.password,
      name: this.name,
      role: this.role,
      status: this.status,
      last_login_at: this.lastLoginAt,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }

  // Exclude sensitive data when converting to JSON
  toJSON(): Record<string, any> {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}
