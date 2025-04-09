/**
 * Widget Configuration Model
 *
 * This module defines the schema and methods for widget configuration entities.
 */

import { v4 as uuidv4 } from "uuid";

export interface WidgetConfigAttributes {
  id?: string;
  widgetId?: string;
  userId: string;
  name: string;
  settings?: Record<string, any>;
  contextRuleId?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export class WidgetConfig {
  id: string;
  widgetId: string;
  userId: string;
  name: string;
  settings: Record<string, any>;
  contextRuleId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  constructor(data: WidgetConfigAttributes = {} as WidgetConfigAttributes) {
    this.id = data.id || uuidv4();
    this.widgetId = data.widgetId || uuidv4();
    this.userId = data.userId || "";
    this.name = data.name || "Default Widget";
    this.settings = data.settings || {
      primaryColor: "#4f46e5",
      position: "bottom-right",
      initialMessage: "Hello! How can I help you today?",
    };
    this.contextRuleId = data.contextRuleId || null;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  static fromDatabase(dbRecord: any): WidgetConfig | null {
    if (!dbRecord) return null;

    return new WidgetConfig({
      id: dbRecord.id,
      widgetId: dbRecord.widget_id,
      userId: dbRecord.user_id,
      name: dbRecord.name,
      settings: dbRecord.settings ? JSON.parse(dbRecord.settings) : {},
      contextRuleId: dbRecord.context_rule_id,
      isActive: dbRecord.is_active === 1,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
    });
  }

  toDatabase(): Record<string, any> {
    return {
      id: this.id,
      widget_id: this.widgetId,
      user_id: this.userId,
      name: this.name,
      settings: JSON.stringify(this.settings),
      context_rule_id: this.contextRuleId,
      is_active: this.isActive ? 1 : 0,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }
}
