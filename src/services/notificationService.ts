/**
 * Notification Service
 *
 * This service handles notifications using the API layer
 * instead of direct database access.
 */

import logger from "@/utils/logger";
import { notificationApi, Notification } from "./api/features/notification";

const notificationService = {
  /**
   * Get notifications for a user
   */
  getUserNotifications: async (
    userId: string,
    limit: number = 5,
    includeRead: boolean = false,
  ): Promise<Notification[]> => {
    try {
      const response = await notificationApi.getUserNotifications(
        userId,
        limit,
        includeRead,
      );

      if (!response.success) {
        throw new Error(
          response.error?.message || "Failed to fetch user notifications",
        );
      }

      return response.data || [];
    } catch (error) {
      logger.error("Error getting user notifications:", error);
      return [];
    }
  },

  /**
   * Mark notifications as read
   */
  markNotificationsAsRead: async (
    notificationIds: string[],
  ): Promise<boolean> => {
    try {
      if (notificationIds.length === 0) return true;

      const response =
        await notificationApi.markNotificationsAsRead(notificationIds);

      if (!response.success) {
        throw new Error(
          response.error?.message || "Failed to mark notifications as read",
        );
      }

      return true;
    } catch (error) {
      logger.error("Error marking notifications as read:", error);
      return false;
    }
  },

  /**
   * Get a notification by ID
   */
  getNotification: async (id: string): Promise<Notification | null> => {
    try {
      const response = await notificationApi.getNotification(id);

      if (!response.success) {
        throw new Error(
          response.error?.message || "Failed to fetch notification",
        );
      }

      return response.data || null;
    } catch (error) {
      logger.error("Error getting notification:", error);
      return null;
    }
  },

  /**
   * Create a notification
   */
  createNotification: async (
    notification: Omit<Notification, "id" | "createdAt" | "isRead">,
  ): Promise<Notification | null> => {
    try {
      const response = await notificationApi.createNotification(notification);

      if (!response.success) {
        throw new Error(
          response.error?.message || "Failed to create notification",
        );
      }

      return response.data || null;
    } catch (error) {
      logger.error("Error creating notification:", error);
      return null;
    }
  },

  /**
   * Delete a notification
   */
  deleteNotification: async (id: string): Promise<boolean> => {
    try {
      const response = await notificationApi.deleteNotification(id);

      if (!response.success) {
        throw new Error(
          response.error?.message || "Failed to delete notification",
        );
      }

      return true;
    } catch (error) {
      logger.error("Error deleting notification:", error);
      return false;
    }
  },
};

export default notificationService;
