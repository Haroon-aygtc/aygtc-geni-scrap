/**
 * User Service Module
 *
 * This module provides functionality for user management.
 */

import logger from "@/utils/logger";
import { getMySQLClient, QueryTypes } from "@/services/mysqlClient";
import User, { getSafeUser } from "@/models/User";
import UserActivity from "@/models/UserActivity";

/**
 * User profile interface
 */
export interface UserProfile {
  id: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
  role: "admin" | "user" | "guest";
  isActive: boolean;
  metadata?: Record<string, any>;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * User activity interface
 */
export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

/**
 * Convert a User model to UserProfile interface
 * @param user User model instance
 * @returns UserProfile object
 */
const mapUserToProfile = (user: any): UserProfile => {
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    avatarUrl: user.avatar_url,
    role: user.role || "user",
    isActive: user.is_active,
    metadata: user.metadata,
    lastLoginAt: user.last_login_at,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
};

/**
 * Convert a UserActivity model to UserActivity interface
 * @param activity UserActivity model instance
 * @returns UserActivity object
 */
const mapActivityToInterface = (activity: any): UserActivity => {
  return {
    id: activity.id,
    userId: activity.user_id,
    action: activity.action,
    ipAddress: activity.ip_address,
    userAgent: activity.user_agent,
    metadata: activity.metadata,
    createdAt: activity.created_at,
  };
};

/**
 * Get a user by ID
 * @param userId User ID
 * @returns User profile or null if not found
 */
export const getUser = async (userId: string): Promise<UserProfile | null> => {
  try {
    const sequelize = await getMySQLClient();
    const users = await sequelize.query(
      "SELECT * FROM users WHERE id = :userId LIMIT 1",
      {
        replacements: { userId },
        type: QueryTypes.SELECT,
      },
    );

    if (!users || users.length === 0) {
      return null;
    }

    return mapUserToProfile(users[0]);
  } catch (error) {
    logger.error(`Error getting user ${userId}`, error);
    return null;
  }
};

/**
 * Get all users
 * @param limit Maximum number of users to return
 * @param offset Offset for pagination
 * @param includeInactive Include inactive users
 * @returns Array of user profiles
 */
export const getUsers = async (
  limit: number = 50,
  offset: number = 0,
  includeInactive: boolean = false,
): Promise<UserProfile[]> => {
  try {
    const sequelize = await getMySQLClient();

    let query = "SELECT * FROM users";
    const replacements: any = {};

    if (!includeInactive) {
      query += " WHERE is_active = :isActive";
      replacements.isActive = true;
    }

    query += " ORDER BY created_at DESC LIMIT :limit OFFSET :offset";
    replacements.limit = limit;
    replacements.offset = offset;

    const users = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    return users.map(mapUserToProfile);
  } catch (error) {
    logger.error("Error getting users", error);
    return [];
  }
};

/**
 * Update a user profile
 * @param userId User ID
 * @param updates Updates to apply
 * @returns Updated user profile
 */
export const updateUser = async (
  userId: string,
  updates: Partial<UserProfile>,
): Promise<UserProfile | null> => {
  try {
    const sequelize = await getMySQLClient();

    // Convert from UserProfile format to database format
    const updateData: Record<string, any> = {};
    if (updates.fullName !== undefined) updateData.full_name = updates.fullName;
    if (updates.avatarUrl !== undefined)
      updateData.avatar_url = updates.avatarUrl;
    if (updates.role !== undefined) updateData.role = updates.role;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.metadata !== undefined)
      updateData.metadata = JSON.stringify(updates.metadata);

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    // Build SET clause for SQL
    const setClause = Object.keys(updateData)
      .map((key) => `${key} = :${key}`)
      .join(", ");

    // Add userId to replacements
    const replacements = { ...updateData, userId };

    await sequelize.query(`UPDATE users SET ${setClause} WHERE id = :userId`, {
      replacements,
      type: QueryTypes.UPDATE,
    });

    // Get the updated user
    return getUser(userId);
  } catch (error) {
    logger.error(`Error updating user ${userId}`, error);
    throw error;
  }
};

/**
 * Deactivate a user
 * @param userId User ID
 * @returns Success status
 */
export const deactivateUser = async (userId: string): Promise<boolean> => {
  try {
    const sequelize = await getMySQLClient();

    await sequelize.query(
      "UPDATE users SET is_active = false, updated_at = :now WHERE id = :userId",
      {
        replacements: {
          userId,
          now: new Date().toISOString(),
        },
        type: QueryTypes.UPDATE,
      },
    );

    // Log the deactivation
    await logUserActivity(userId, "account_deactivated");

    return true;
  } catch (error) {
    logger.error(`Error deactivating user ${userId}`, error);
    throw error;
  }
};

/**
 * Reactivate a user
 * @param userId User ID
 * @returns Success status
 */
export const reactivateUser = async (userId: string): Promise<boolean> => {
  try {
    const sequelize = await getMySQLClient();

    await sequelize.query(
      "UPDATE users SET is_active = true, updated_at = :now WHERE id = :userId",
      {
        replacements: {
          userId,
          now: new Date().toISOString(),
        },
        type: QueryTypes.UPDATE,
      },
    );

    // Log the reactivation
    await logUserActivity(userId, "account_reactivated");

    return true;
  } catch (error) {
    logger.error(`Error reactivating user ${userId}`, error);
    throw error;
  }
};

/**
 * Get user activity
 * @param userId User ID
 * @param limit Maximum number of activities to return
 * @param offset Offset for pagination
 * @returns Array of user activities
 */
export const getUserActivity = async (
  userId: string,
  limit: number = 50,
  offset: number = 0,
): Promise<UserActivity[]> => {
  try {
    const sequelize = await getMySQLClient();
    const activities = await sequelize.query(
      "SELECT * FROM user_activity WHERE user_id = :userId ORDER BY created_at DESC LIMIT :limit OFFSET :offset",
      {
        replacements: { userId, limit, offset },
        type: QueryTypes.SELECT,
      },
    );

    return activities.map(mapActivityToInterface);
  } catch (error) {
    logger.error(`Error getting activity for user ${userId}`, error);
    return [];
  }
};

/**
 * Log user activity
 * @param userId User ID
 * @param action Activity action
 * @param metadata Optional metadata
 * @param ipAddress Optional IP address
 * @param userAgent Optional user agent
 */
export const logUserActivity = async (
  userId: string,
  action: string,
  metadata?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string,
): Promise<void> => {
  try {
    const sequelize = await getMySQLClient();

    await sequelize.query(
      "INSERT INTO user_activity (id, user_id, action, ip_address, user_agent, metadata, created_at) VALUES (UUID(), :userId, :action, :ipAddress, :userAgent, :metadata, :createdAt)",
      {
        replacements: {
          userId,
          action,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
          metadata: metadata ? JSON.stringify(metadata) : null,
          createdAt: new Date().toISOString(),
        },
        type: QueryTypes.INSERT,
      },
    );

    // Update last_login_at if action is login
    if (action === "login") {
      await sequelize.query(
        "UPDATE users SET last_login_at = :now WHERE id = :userId",
        {
          replacements: {
            now: new Date().toISOString(),
            userId,
          },
          type: QueryTypes.UPDATE,
        },
      );
    }
  } catch (error) {
    logger.error(`Error logging activity for user ${userId}`, error);
    // Don't throw - logging failures shouldn't break the application
  }
};

/**
 * Get user statistics
 * @returns User statistics
 */
export const getUserStats = async (): Promise<any> => {
  try {
    const sequelize = await getMySQLClient();

    // Get total users count
    const [totalUsersResult] = await sequelize.query(
      "SELECT COUNT(*) as count FROM users",
      { type: QueryTypes.SELECT },
    );
    const totalUsers = totalUsersResult.count;

    // Get active users count
    const [activeUsersResult] = await sequelize.query(
      "SELECT COUNT(*) as count FROM users WHERE is_active = true",
      { type: QueryTypes.SELECT },
    );
    const activeUsers = activeUsersResult.count;

    // Get users by role
    const roleData = await sequelize.query(
      "SELECT role, COUNT(*) as count FROM users GROUP BY role",
      { type: QueryTypes.SELECT },
    );

    // Get new users in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [newUsersResult] = await sequelize.query(
      "SELECT COUNT(*) as count FROM users WHERE created_at >= :thirtyDaysAgo",
      {
        replacements: { thirtyDaysAgo: thirtyDaysAgo.toISOString() },
        type: QueryTypes.SELECT,
      },
    );
    const newUsers = newUsersResult.count;

    return {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      inactiveUsers: (totalUsers || 0) - (activeUsers || 0),
      newUsersLast30Days: newUsers || 0,
      usersByRole: roleData || [],
    };
  } catch (error) {
    logger.error("Error getting user statistics", error);
    throw error;
  }
};
