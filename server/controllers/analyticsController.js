/**
 * Analytics Controller
 *
 * This module provides controller functions for analytics data management.
 */

import { getMySQLClient, QueryTypes } from "../utils/dbHelpers.js";
import { v4 as uuidv4 } from "uuid";
import { formatResponse } from "../utils/responseFormatter.js";
import { Analytics } from "../models/index.js";

/**
 * Log an analytics event
 */
export const logAnalyticsEvent = async (req, res) => {
  try {
    const { eventType, eventData, sessionId } = req.body;
    const userId = req.user ? req.user.id : null;
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || null;
    const userAgent = req.headers["user-agent"] || null;

    if (!eventType) {
      return res.status(400).json(
        formatResponse(null, {
          message: "Event type is required",
          code: "ERR_400",
        }),
      );
    }

    const db = await getMySQLClient();
    const eventId = uuidv4();
    const now = new Date().toISOString();

    // Create analytics event
    const eventDataObj = {
      id: eventId,
      user_id: userId,
      event_type: eventType,
      event_data: eventData ? JSON.stringify(eventData) : null,
      session_id: sessionId,
      ip_address: ipAddress,
      user_agent: userAgent,
      timestamp: now,
    };

    await db.query(
      `INSERT INTO analytics_events 
       (id, user_id, event_type, event_data, session_id, ip_address, user_agent, timestamp) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          eventDataObj.id,
          eventDataObj.user_id,
          eventDataObj.event_type,
          eventDataObj.event_data,
          eventDataObj.session_id,
          eventDataObj.ip_address,
          eventDataObj.user_agent,
          eventDataObj.timestamp,
        ],
        type: QueryTypes.INSERT,
      },
    );

    // Get created event
    const [event] = await db.query(
      "SELECT * FROM analytics_events WHERE id = ?",
      {
        replacements: [eventId],
        type: QueryTypes.SELECT,
      },
    );

    // Format response
    const formattedEvent = Analytics.fromDatabase(event);

    return res.json(formatResponse(formattedEvent));
  } catch (error) {
    console.error("Error logging analytics event:", error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};

/**
 * Get analytics events with filtering and pagination
 */
export const getAnalyticsEvents = async (req, res) => {
  try {
    const {
      limit = 50,
      offset = 0,
      eventType,
      userId,
      sessionId,
      startDate,
      endDate,
    } = req.query;

    // Only admins can access this endpoint
    if (req.user.role !== "admin") {
      return res.status(403).json(
        formatResponse(null, {
          message: "Unauthorized access",
          code: "ERR_403",
        }),
      );
    }

    const db = await getMySQLClient();

    // Build query conditions
    let conditions = [];
    const replacements = [];

    if (eventType) {
      conditions.push("event_type = ?");
      replacements.push(eventType);
    }

    if (userId) {
      conditions.push("user_id = ?");
      replacements.push(userId);
    }

    if (sessionId) {
      conditions.push("session_id = ?");
      replacements.push(sessionId);
    }

    if (startDate) {
      conditions.push("timestamp >= ?");
      replacements.push(startDate);
    }

    if (endDate) {
      conditions.push("timestamp <= ?");
      replacements.push(endDate);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Get total count
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM analytics_events ${whereClause}`,
      {
        replacements,
        type: QueryTypes.SELECT,
      },
    );

    // Get events with pagination
    const events = await db.query(
      `SELECT * FROM analytics_events ${whereClause} ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
      {
        replacements: [...replacements, parseInt(limit), parseInt(offset)],
        type: QueryTypes.SELECT,
      },
    );

    // Format events
    const formattedEvents = events.map(Analytics.fromDatabase);

    return res.json(
      formatResponse({
        events: formattedEvents,
        totalCount: countResult.total,
        page: Math.floor(offset / limit) + 1,
        pageSize: parseInt(limit),
      }),
    );
  } catch (error) {
    console.error("Error getting analytics events:", error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};

/**
 * Get analytics dashboard data
 */
export const getAnalyticsDashboard = async (req, res) => {
  try {
    // Only admins can access this endpoint
    if (req.user.role !== "admin") {
      return res.status(403).json(
        formatResponse(null, {
          message: "Unauthorized access",
          code: "ERR_403",
        }),
      );
    }

    const db = await getMySQLClient();

    // Get total users
    const [userCount] = await db.query("SELECT COUNT(*) as total FROM users", {
      type: QueryTypes.SELECT,
    });

    // Get total guest users
    const [guestCount] = await db.query(
      "SELECT COUNT(*) as total FROM guest_users",
      {
        type: QueryTypes.SELECT,
      },
    );

    // Get total chat sessions
    const [sessionCount] = await db.query(
      "SELECT COUNT(*) as total FROM chat_sessions",
      {
        type: QueryTypes.SELECT,
      },
    );

    // Get total chat messages
    const [messageCount] = await db.query(
      "SELECT COUNT(*) as total FROM chat_messages",
      {
        type: QueryTypes.SELECT,
      },
    );

    // Get events by type
    const eventsByType = await db.query(
      "SELECT event_type, COUNT(*) as count FROM analytics_events GROUP BY event_type ORDER BY count DESC LIMIT 10",
      {
        type: QueryTypes.SELECT,
      },
    );

    // Get events by day (last 30 days)
    const eventsByDay = await db.query(
      "SELECT DATE(timestamp) as date, COUNT(*) as count FROM analytics_events WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY DATE(timestamp) ORDER BY date",
      {
        type: QueryTypes.SELECT,
      },
    );

    // Get active users by day (last 30 days)
    const activeUsersByDay = await db.query(
      "SELECT DATE(timestamp) as date, COUNT(DISTINCT user_id) as count FROM analytics_events WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND user_id IS NOT NULL GROUP BY DATE(timestamp) ORDER BY date",
      {
        type: QueryTypes.SELECT,
      },
    );

    return res.json(
      formatResponse({
        summary: {
          totalUsers: userCount.total,
          totalGuestUsers: guestCount.total,
          totalChatSessions: sessionCount.total,
          totalChatMessages: messageCount.total,
        },
        eventsByType,
        eventsByDay,
        activeUsersByDay,
      }),
    );
  } catch (error) {
    console.error("Error getting analytics dashboard:", error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};

/**
 * Get user activity analytics
 */
export const getUserActivityAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;

    // Only admins or the user themselves can access this endpoint
    if (req.user.role !== "admin" && req.user.id !== userId) {
      return res.status(403).json(
        formatResponse(null, {
          message: "Unauthorized access",
          code: "ERR_403",
        }),
      );
    }

    const db = await getMySQLClient();

    // Get user details
    const [user] = await db.query("SELECT * FROM users WHERE id = ?", {
      replacements: [userId],
      type: QueryTypes.SELECT,
    });

    if (!user) {
      return res.status(404).json(
        formatResponse(null, {
          message: "User not found",
          code: "ERR_404",
        }),
      );
    }

    // Get user's sessions
    const sessions = await db.query(
      "SELECT * FROM chat_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 10",
      {
        replacements: [userId],
        type: QueryTypes.SELECT,
      },
    );

    // Get user's recent events
    const events = await db.query(
      "SELECT * FROM analytics_events WHERE user_id = ? ORDER BY timestamp DESC LIMIT 50",
      {
        replacements: [userId],
        type: QueryTypes.SELECT,
      },
    );

    // Get event counts by type
    const eventsByType = await db.query(
      "SELECT event_type, COUNT(*) as count FROM analytics_events WHERE user_id = ? GROUP BY event_type ORDER BY count DESC",
      {
        replacements: [userId],
        type: QueryTypes.SELECT,
      },
    );

    // Get activity by day (last 30 days)
    const activityByDay = await db.query(
      "SELECT DATE(timestamp) as date, COUNT(*) as count FROM analytics_events WHERE user_id = ? AND timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY DATE(timestamp) ORDER BY date",
      {
        replacements: [userId],
        type: QueryTypes.SELECT,
      },
    );

    return res.json(
      formatResponse({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.created_at,
          lastLoginAt: user.last_login_at,
        },
        sessions: sessions.map((session) => ({
          id: session.id,
          createdAt: session.created_at,
          lastMessageAt: session.last_message_at,
          messageCount: session.message_count,
        })),
        recentEvents: events.map(Analytics.fromDatabase),
        eventsByType,
        activityByDay,
      }),
    );
  } catch (error) {
    console.error("Error getting user activity analytics:", error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};

/**
 * Get chat analytics
 */
export const getChatAnalytics = async (req, res) => {
  try {
    // Only admins can access this endpoint
    if (req.user.role !== "admin") {
      return res.status(403).json(
        formatResponse(null, {
          message: "Unauthorized access",
          code: "ERR_403",
        }),
      );
    }

    const db = await getMySQLClient();

    // Get total chat sessions
    const [sessionCount] = await db.query(
      "SELECT COUNT(*) as total FROM chat_sessions",
      {
        type: QueryTypes.SELECT,
      },
    );

    // Get total chat messages
    const [messageCount] = await db.query(
      "SELECT COUNT(*) as total FROM chat_messages",
      {
        type: QueryTypes.SELECT,
      },
    );

    // Get average messages per session
    const [avgMessages] = await db.query(
      "SELECT AVG(message_count) as average FROM chat_sessions",
      {
        type: QueryTypes.SELECT,
      },
    );

    // Get sessions by day (last 30 days)
    const sessionsByDay = await db.query(
      "SELECT DATE(created_at) as date, COUNT(*) as count FROM chat_sessions WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY DATE(created_at) ORDER BY date",
      {
        type: QueryTypes.SELECT,
      },
    );

    // Get messages by day (last 30 days)
    const messagesByDay = await db.query(
      "SELECT DATE(created_at) as date, COUNT(*) as count FROM chat_messages WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY DATE(created_at) ORDER BY date",
      {
        type: QueryTypes.SELECT,
      },
    );

    // Get top users by message count
    const topUsers = await db.query(
      `SELECT u.id, u.name, u.email, COUNT(m.id) as message_count 
       FROM users u 
       JOIN chat_messages m ON u.id = m.user_id 
       GROUP BY u.id 
       ORDER BY message_count DESC 
       LIMIT 10`,
      {
        type: QueryTypes.SELECT,
      },
    );

    return res.json(
      formatResponse({
        summary: {
          totalSessions: sessionCount.total,
          totalMessages: messageCount.total,
          avgMessagesPerSession: parseFloat(avgMessages.average) || 0,
        },
        sessionsByDay,
        messagesByDay,
        topUsers: topUsers.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          messageCount: user.message_count,
        })),
      }),
    );
  } catch (error) {
    console.error("Error getting chat analytics:", error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};
