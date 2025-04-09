/**
 * Analytics Routes
 * Handles API endpoints for analytics data
 */

const express = require("express");
const router = express.Router();
const { executeQuery } = require("../core/mysql");
const { v4: uuidv4 } = require("uuid");
const { authenticateJWT, isAdmin } = require("../middleware/auth");

/**
 * Log an analytics event (no auth required for public events)
 */
router.post("/events/public", async (req, res) => {
  try {
    const { eventType, eventData, sessionId, userId } = req.body;
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || null;
    const userAgent = req.headers["user-agent"] || null;

    if (!eventType) {
      return res.status(400).json({
        success: false,
        error: "Event type is required",
      });
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    await executeQuery(
      `INSERT INTO analytics_events 
       (id, user_id, event_type, event_data, session_id, ip_address, user_agent, timestamp) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        userId || null,
        eventType,
        eventData ? JSON.stringify(eventData) : null,
        sessionId || null,
        ipAddress,
        userAgent,
        now,
      ],
    );

    return res.status(201).json({
      success: true,
      data: { id },
    });
  } catch (error) {
    console.error("Error logging public analytics event:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to log analytics event",
    });
  }
});

/**
 * Log an analytics event (auth required)
 */
router.post("/events", authenticateJWT, async (req, res) => {
  try {
    const { eventType, eventData, sessionId } = req.body;
    const userId = req.user.id;
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || null;
    const userAgent = req.headers["user-agent"] || null;

    if (!eventType) {
      return res.status(400).json({
        success: false,
        error: "Event type is required",
      });
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    await executeQuery(
      `INSERT INTO analytics_events 
       (id, user_id, event_type, event_data, session_id, ip_address, user_agent, timestamp) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        userId,
        eventType,
        eventData ? JSON.stringify(eventData) : null,
        sessionId || null,
        ipAddress,
        userAgent,
        now,
      ],
    );

    return res.status(201).json({
      success: true,
      data: { id },
    });
  } catch (error) {
    console.error("Error logging analytics event:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to log analytics event",
    });
  }
});

/**
 * Get analytics events with filtering and pagination (admin only)
 */
router.get("/events", authenticateJWT, isAdmin, async (req, res) => {
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

    // Build query conditions
    let conditions = [];
    const values = [];

    if (eventType) {
      conditions.push("event_type = ?");
      values.push(eventType);
    }

    if (userId) {
      conditions.push("user_id = ?");
      values.push(userId);
    }

    if (sessionId) {
      conditions.push("session_id = ?");
      values.push(sessionId);
    }

    if (startDate) {
      conditions.push("timestamp >= ?");
      values.push(startDate);
    }

    if (endDate) {
      conditions.push("timestamp <= ?");
      values.push(endDate);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Get total count
    const [countResult] = await executeQuery(
      `SELECT COUNT(*) as total FROM analytics_events ${whereClause}`,
      values,
    );

    // Get events with pagination
    const events = await executeQuery(
      `SELECT * FROM analytics_events ${whereClause} 
       ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
      [...values, parseInt(limit), parseInt(offset)],
    );

    // Format events
    const formattedEvents = events.map((event) => ({
      id: event.id,
      userId: event.user_id,
      eventType: event.event_type,
      eventData: event.event_data ? JSON.parse(event.event_data) : null,
      sessionId: event.session_id,
      ipAddress: event.ip_address,
      userAgent: event.user_agent,
      timestamp: event.timestamp,
    }));

    return res.json({
      success: true,
      data: {
        events: formattedEvents,
        totalCount: countResult.total,
        page: Math.floor(offset / limit) + 1,
        pageSize: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error getting analytics events:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to get analytics events",
    });
  }
});

module.exports = router;
