/**
 * User Activity Service
 * Handles user activity tracking using MySQL database
 */

import axios from "axios";
import logger from "@/utils/logger";
import { getMySQLClient } from "./mysqlClient";
import { v4 as uuidv4 } from "uuid";

export interface UserActivity {
  id?: string;
  user_id: string;
  action: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface UserSession {
  id?: string;
  user_id: string;
  device_info: {
    type: string;
    name: string;
    browser: string;
    os: string;
  };
  ip_address?: string;
  location?: string;
  last_active_at: string;
  created_at?: string;
  is_active: boolean;
}

const userActivityService = {
  /**
   * Log a user activity
   */
  logActivity: async (activity: UserActivity): Promise<void> => {
    try {
      // Get IP address and user agent from browser if not provided
      if (!activity.ip_address || !activity.user_agent) {
        try {
          const response = await fetch("https://api.ipify.org?format=json");
          const data = await response.json();
          activity.ip_address = activity.ip_address || data.ip;
          activity.user_agent = activity.user_agent || navigator.userAgent;
        } catch (error) {
          // Silently fail if we can't get IP address
          logger.warn("Failed to get IP address", error);
        }
      }

      const sequelize = await getMySQLClient();
      const now = new Date().toISOString();
      const id = uuidv4();

      await sequelize.query(
        `INSERT INTO user_activity 
         (id, user_id, action, ip_address, user_agent, metadata, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            id,
            activity.user_id,
            activity.action,
            activity.ip_address || null,
            activity.user_agent || null,
            activity.metadata ? JSON.stringify(activity.metadata) : null,
            activity.created_at || now,
          ],
          type: sequelize.QueryTypes.INSERT,
        },
      );
    } catch (error) {
      logger.error("Error logging user activity:", error);
      // Don't throw error to prevent disrupting user flow
    }
  },

  /**
   * Get user activity history
   */
  getUserActivity: async (
    userId: string,
    limit = 20,
  ): Promise<UserActivity[]> => {
    try {
      const sequelize = await getMySQLClient();

      const activities = await sequelize.query(
        `SELECT * FROM user_activity 
         WHERE user_id = ? 
         ORDER BY created_at DESC 
         LIMIT ?`,
        {
          replacements: [userId, limit],
          type: sequelize.QueryTypes.SELECT,
        },
      );

      return activities.map((activity: any) => ({
        id: activity.id,
        user_id: activity.user_id,
        action: activity.action,
        ip_address: activity.ip_address,
        user_agent: activity.user_agent,
        metadata: activity.metadata ? JSON.parse(activity.metadata) : undefined,
        created_at: activity.created_at,
      }));
    } catch (error) {
      logger.error("Error fetching user activity:", error);
      throw error;
    }
  },

  /**
   * Create or update a user session
   */
  updateSession: async (session: UserSession): Promise<void> => {
    try {
      const sequelize = await getMySQLClient();
      const now = new Date().toISOString();

      // Check if session exists
      const existingSessions = await sequelize.query(
        `SELECT id FROM user_sessions 
         WHERE user_id = ? 
         AND JSON_EXTRACT(device_info, '$.name') = ? 
         AND JSON_EXTRACT(device_info, '$.browser') = ?`,
        {
          replacements: [
            session.user_id,
            session.device_info.name,
            session.device_info.browser,
          ],
          type: sequelize.QueryTypes.SELECT,
        },
      );

      if (existingSessions.length > 0) {
        // Update existing session
        const existingSession = existingSessions[0];
        await sequelize.query(
          `UPDATE user_sessions 
           SET last_active_at = ?, 
               is_active = ?, 
               ip_address = ?, 
               location = ? 
           WHERE id = ?`,
          {
            replacements: [
              now,
              session.is_active,
              session.ip_address || null,
              session.location || null,
              existingSession.id,
            ],
            type: sequelize.QueryTypes.UPDATE,
          },
        );
      } else {
        // Create new session
        const id = uuidv4();
        await sequelize.query(
          `INSERT INTO user_sessions 
           (id, user_id, device_info, ip_address, location, last_active_at, created_at, is_active) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          {
            replacements: [
              id,
              session.user_id,
              JSON.stringify(session.device_info),
              session.ip_address || null,
              session.location || null,
              now,
              session.created_at || now,
              session.is_active,
            ],
            type: sequelize.QueryTypes.INSERT,
          },
        );
      }
    } catch (error) {
      logger.error("Error updating user session:", error);
      // Don't throw error to prevent disrupting user flow
    }
  },

  /**
   * Get active user sessions
   */
  getUserSessions: async (userId: string): Promise<UserSession[]> => {
    try {
      const sequelize = await getMySQLClient();

      const sessions = await sequelize.query(
        `SELECT * FROM user_sessions 
         WHERE user_id = ? 
         AND is_active = true 
         ORDER BY last_active_at DESC`,
        {
          replacements: [userId],
          type: sequelize.QueryTypes.SELECT,
        },
      );

      return sessions.map((session: any) => ({
        id: session.id,
        user_id: session.user_id,
        device_info:
          typeof session.device_info === "string"
            ? JSON.parse(session.device_info)
            : session.device_info,
        ip_address: session.ip_address,
        location: session.location,
        last_active_at: session.last_active_at,
        created_at: session.created_at,
        is_active: session.is_active,
      }));
    } catch (error) {
      logger.error("Error fetching user sessions:", error);
      throw error;
    }
  },

  /**
   * Terminate a specific user session
   */
  terminateSession: async (sessionId: string): Promise<void> => {
    try {
      const sequelize = await getMySQLClient();

      await sequelize.query(
        `UPDATE user_sessions 
         SET is_active = false 
         WHERE id = ?`,
        {
          replacements: [sessionId],
          type: sequelize.QueryTypes.UPDATE,
        },
      );
    } catch (error) {
      logger.error("Error terminating user session:", error);
      throw error;
    }
  },

  /**
   * Terminate all user sessions except the current one
   */
  terminateAllSessions: async (
    userId: string,
    currentSessionId: string,
  ): Promise<void> => {
    try {
      const sequelize = await getMySQLClient();

      await sequelize.query(
        `UPDATE user_sessions 
         SET is_active = false 
         WHERE user_id = ? 
         AND id != ?`,
        {
          replacements: [userId, currentSessionId],
          type: sequelize.QueryTypes.UPDATE,
        },
      );
    } catch (error) {
      logger.error("Error terminating all user sessions:", error);
      throw error;
    }
  },

  /**
   * Log a login attempt (successful or failed)
   */
  logLoginAttempt: async (
    userId: string,
    success: boolean,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> => {
    return userActivityService.logActivity({
      user_id: userId,
      action: success ? "login_success" : "login_failed",
      ip_address: ipAddress,
      user_agent: userAgent,
      metadata: { success },
    });
  },

  /**
   * Log a security event (password change, MFA setup, etc.)
   */
  logSecurityEvent: async (
    userId: string,
    eventType: string,
    metadata?: Record<string, any>,
  ): Promise<void> => {
    return userActivityService.logActivity({
      user_id: userId,
      action: `security_${eventType}`,
      metadata,
    });
  },
};

export default userActivityService;
