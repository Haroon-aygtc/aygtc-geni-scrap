/**
 * Response Formatting Configuration Model
 *
 * This module defines the schema and methods for response formatting configuration entities.
 */

import { v4 as uuidv4 } from "uuid";

export interface ResponseFormattingConfigAttributes {
  id?: string;
  userId: string;
  name: string;
  formatType?: "markdown" | "html" | "text";
  includeHeadings?: boolean;
  includeBulletPoints?: boolean;
  includeNumberedLists?: boolean;
  includeEmphasis?: boolean;
  maxResponseLength?: number;
  responseStyle?: "concise" | "detailed" | "balanced";
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export class ResponseFormattingConfig {
  id: string;
  userId: string;
  name: string;
  formatType: "markdown" | "html" | "text";
  includeHeadings: boolean;
  includeBulletPoints: boolean;
  includeNumberedLists: boolean;
  includeEmphasis: boolean;
  maxResponseLength: number;
  responseStyle: "concise" | "detailed" | "balanced";
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;

  constructor(
    data: ResponseFormattingConfigAttributes = {} as ResponseFormattingConfigAttributes,
  ) {
    this.id = data.id || uuidv4();
    this.userId = data.userId || "";
    this.name = data.name || "Default Formatting";
    this.formatType = data.formatType || "markdown";
    this.includeHeadings =
      data.includeHeadings !== undefined ? data.includeHeadings : true;
    this.includeBulletPoints =
      data.includeBulletPoints !== undefined ? data.includeBulletPoints : true;
    this.includeNumberedLists =
      data.includeNumberedLists !== undefined
        ? data.includeNumberedLists
        : true;
    this.includeEmphasis =
      data.includeEmphasis !== undefined ? data.includeEmphasis : true;
    this.maxResponseLength = data.maxResponseLength || 1000;
    this.responseStyle = data.responseStyle || "balanced";
    this.isDefault = data.isDefault !== undefined ? data.isDefault : false;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  static fromDatabase(dbRecord: any): ResponseFormattingConfig | null {
    if (!dbRecord) return null;

    return new ResponseFormattingConfig({
      id: dbRecord.id,
      userId: dbRecord.user_id,
      name: dbRecord.name,
      formatType: dbRecord.format_type,
      includeHeadings: dbRecord.include_headings === 1,
      includeBulletPoints: dbRecord.include_bullet_points === 1,
      includeNumberedLists: dbRecord.include_numbered_lists === 1,
      includeEmphasis: dbRecord.include_emphasis === 1,
      maxResponseLength: dbRecord.max_response_length,
      responseStyle: dbRecord.response_style,
      isDefault: dbRecord.is_default === 1,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
    });
  }

  toDatabase(): Record<string, any> {
    return {
      id: this.id,
      user_id: this.userId,
      name: this.name,
      format_type: this.formatType,
      include_headings: this.includeHeadings ? 1 : 0,
      include_bullet_points: this.includeBulletPoints ? 1 : 0,
      include_numbered_lists: this.includeNumberedLists ? 1 : 0,
      include_emphasis: this.includeEmphasis ? 1 : 0,
      max_response_length: this.maxResponseLength,
      response_style: this.responseStyle,
      is_default: this.isDefault ? 1 : 0,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }
}
