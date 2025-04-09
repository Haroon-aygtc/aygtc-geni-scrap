/**
 * Guest User Controller
 *
 * This module provides controller functions for guest user management.
 */

import { getMySQLClient, QueryTypes } from "../utils/dbHelpers.js";
import { v4 as uuidv4 } from "uuid";
import { formatResponse } from "../utils/responseFormatter.js";
import jwt from "jsonwebtoken";

/**
 * Register a new guest user and create a session
 */
export const registerGuestUser = async (req, res) => {
  try {
    const { fullName, phoneNumber, email } = req.body;
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || null;
    const userAgent = req.headers["user-agent"] || null;

    if (!fullName || !phoneNumber) {
      return res.status(400).json(
        formatResponse(null, {
          message: "Full name and phone number are required",
          code: "ERR_400",
        }),
      );
    }

    const db = await getMySQLClient();
    const guestId = uuidv4();
    const now = new Date().toISOString();

    // Create guest user
    await db.query(
      `INSERT INTO guest_users 
       (id, full_name, phone_number, email, ip_address, user_agent, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
      {
        replacements: [
          guestId,
          fullName,
          phoneNumber,
          email || null,
          ipAddress,
          userAgent,
          now,
          now,
        ],
        type: QueryTypes.INSERT,
      },
    );

    // Create session token
    const sessionId = uuidv4();
    const sessionToken = jwt.sign(
      { guestId, sessionId },
      process.env.JWT_SECRET || "guest-user-secret",
      { expiresIn: "7d" },
    );

    // Calculate expiry date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create guest session
    await db.query(
      `INSERT INTO guest_sessions 
       (id, guest_id, session_token, expires_at, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          sessionId,
          guestId,
          sessionToken,
          expiresAt.toISOString(),
          now,
          now,
        ],
        type: QueryTypes.INSERT,
      },
    );

    // Log activity
    await logActivity(guestId, "registered", { ipAddress }, db);

    // Get created user
    const [user] = await db.query("SELECT * FROM guest_users WHERE id = ?", {
      replacements: [guestId],
      type: QueryTypes.SELECT,
    });

    // Get created session
    const [session] = await db.query(
      "SELECT * FROM guest_sessions WHERE id = ?",
      {
        replacements: [sessionId],
        type: QueryTypes.SELECT,
      },
    );

    // Format response
    const formattedUser = formatGuestUser(user);
    const formattedSession = formatGuestSession(session);

    return res.json(
      formatResponse({
        user: formattedUser,
        session: formattedSession,
      }),
    );
  } catch (error) {
    console.error("Error registering guest user:", error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};

/**
 * Get guest user by session token
 */
export const getGuestUserBySession = async (req, res) => {
  try {
    const { sessionToken } = req.query;

    if (!sessionToken) {
      return res.status(400).json(
        formatResponse(null, {
          message: "Session token is required",
          code: "ERR_400",
        }),
      );
    }

    const db = await getMySQLClient();

    // Get session
    const [session] = await db.query(
      `SELECT * FROM guest_sessions WHERE session_token = ? AND expires_at > NOW()`,
      {
        replacements: [sessionToken],
        type: QueryTypes.SELECT,
      },
    );

    if (!session) {
      return res.status(404).json(
        formatResponse(null, {
          message: "Session not found or expired",
          code: "ERR_404",
        }),
      );
    }

    // Get user
    const [user] = await db.query("SELECT * FROM guest_users WHERE id = ?", {
      replacements: [session.guest_id],
      type: QueryTypes.SELECT,
    });

    if (!user) {
      return res.status(404).json(
        formatResponse(null, {
          message: "Guest user not found",
          code: "ERR_404",
        }),
      );
    }

    // Log activity
    await logActivity(user.id, "session_validated", null, db);

    // Format and return user
    const formattedUser = formatGuestUser(user);
    return res.json(formatResponse(formattedUser));
  } catch (error) {
    console.error("Error getting guest user by session:", error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};

/**
 * Log guest activity
 */
export const logGuestActivity = async (req, res) => {
  try {
    const { guestId, action, metadata } = req.body;
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || null;

    if (!guestId || !action) {
      return res.status(400).json(
        formatResponse(null, {
          message: "Guest ID and action are required",
          code: "ERR_400",
        }),
      );
    }

    const db = await getMySQLClient();

    // Verify guest exists
    const [user] = await db.query("SELECT * FROM guest_users WHERE id = ?", {
      replacements: [guestId],
      type: QueryTypes.SELECT,
    });

    if (!user) {
      return res.status(404).json(
        formatResponse(null, {
          message: "Guest user not found",
          code: "ERR_404",
        }),
      );
    }

    // Log activity
    const activity = await logActivity(
      guestId,
      action,
      metadata,
      db,
      ipAddress,
    );

    return res.json(formatResponse(activity));
  } catch (error) {
    console.error("Error logging guest activity:", error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};

/**
 * Get all guest users with pagination
 */
export const getAllGuestUsers = async (req, res) => {
  try {
    const { limit = 50, offset = 0, status, search } = req.query;

    const db = await getMySQLClient();

    // Build query conditions
    let conditions = [];
    const replacements = [];

    if (status) {
      conditions.push("status = ?");
      replacements.push(status);
    }

    if (search) {
      conditions.push(
        "(full_name LIKE ? OR phone_number LIKE ? OR email LIKE ?)",
      );
      const searchTerm = `%${search}%`;
      replacements.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Get total count
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM guest_users ${whereClause}`,
      {
        replacements,
        type: QueryTypes.SELECT,
      },
    );

    // Get users with pagination
    const users = await db.query(
      `SELECT * FROM guest_users ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      {
        replacements: [...replacements, parseInt(limit), parseInt(offset)],
        type: QueryTypes.SELECT,
      },
    );

    // Format users
    const formattedUsers = users.map(formatGuestUser);

    return res.json(
      formatResponse({
        users: formattedUsers,
        totalCount: countResult.total,
      }),
    );
  } catch (error) {
    console.error("Error getting all guest users:", error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};

/**
 * Get guest user by ID
 */
export const getGuestUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json(
        formatResponse(null, {
          message: "Guest ID is required",
          code: "ERR_400",
        }),
      );
    }

    const db = await getMySQLClient();

    // Get user
    const [user] = await db.query("SELECT * FROM guest_users WHERE id = ?", {
      replacements: [id],
      type: QueryTypes.SELECT,
    });

    if (!user) {
      return res.status(404).json(
        formatResponse(null, {
          message: "Guest user not found",
          code: "ERR_404",
        }),
      );
    }

    // Format and return user
    const formattedUser = formatGuestUser(user);
    return res.json(formatResponse(formattedUser));
  } catch (error) {
    console.error("Error getting guest user by ID:", error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};

/**
 * Update guest user status
 */
export const updateGuestUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json(
        formatResponse(null, {
          message: "Guest ID and status are required",
          code: "ERR_400",
        }),
      );
    }

    if (!["active", "inactive", "blocked"].includes(status)) {
      return res.status(400).json(
        formatResponse(null, {
          message: "Invalid status value",
          code: "ERR_400",
        }),
      );
    }

    const db = await getMySQLClient();

    // Update user status
    await db.query(
      "UPDATE guest_users SET status = ?, updated_at = NOW() WHERE id = ?",
      {
        replacements: [status, id],
        type: QueryTypes.UPDATE,
      },
    );

    // Get updated user
    const [user] = await db.query("SELECT * FROM guest_users WHERE id = ?", {
      replacements: [id],
      type: QueryTypes.SELECT,
    });

    if (!user) {
      return res.status(404).json(
        formatResponse(null, {
          message: "Guest user not found",
          code: "ERR_404",
        }),
      );
    }

    // Log activity
    await logActivity(id, "status_updated", { status }, db);

    // Format and return user
    const formattedUser = formatGuestUser(user);
    return res.json(formatResponse(formattedUser));
  } catch (error) {
    console.error("Error updating guest user status:", error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};

/**
 * Get guest activities
 */
export const getGuestActivities = async (req, res) => {
  try {
    const { guestId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    if (!guestId) {
      return res.status(400).json(
        formatResponse(null, {
          message: "Guest ID is required",
          code: "ERR_400",
        }),
      );
    }

    const db = await getMySQLClient();

    // Verify guest exists
    const [user] = await db.query("SELECT * FROM guest_users WHERE id = ?", {
      replacements: [guestId],
      type: QueryTypes.SELECT,
    });

    if (!user) {
      return res.status(404).json(
        formatResponse(null, {
          message: "Guest user not found",
          code: "ERR_404",
        }),
      );
    }

    // Get total count
    const [countResult] = await db.query(
      "SELECT COUNT(*) as total FROM guest_activities WHERE guest_id = ?",
      {
        replacements: [guestId],
        type: QueryTypes.SELECT,
      },
    );

    // Get activities with pagination
    const activities = await db.query(
      "SELECT * FROM guest_activities WHERE guest_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
      {
        replacements: [guestId, parseInt(limit), parseInt(offset)],
        type: QueryTypes.SELECT,
      },
    );

    // Format activities
    const formattedActivities = activities.map(formatGuestActivity);

    return res.json(
      formatResponse({
        activities: formattedActivities,
        totalCount: countResult.total,
      }),
    );
  } catch (error) {
    console.error("Error getting guest activities:", error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};

// Helper functions

/**
 * Log guest activity
 */
async function logActivity(
  guestId,
  action,
  metadata = null,
  db,
  ipAddress = null,
) {
  try {
    const activityId = uuidv4();
    const now = new Date().toISOString();

    await db.query(
      `INSERT INTO guest_activities 
       (id, guest_id, action, metadata, ip_address, created_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          activityId,
          guestId,
          action,
          metadata ? JSON.stringify(metadata) : null,
          ipAddress,
          now,
        ],
        type: QueryTypes.INSERT,
      },
    );

    // Get created activity
    const [activity] = await db.query(
      "SELECT * FROM guest_activities WHERE id = ?",
      {
        replacements: [activityId],
        type: QueryTypes.SELECT,
      },
    );

    return formatGuestActivity(activity);
  } catch (error) {
    console.error("Error logging activity:", error);
    throw error;
  }
}

/**
 * Format guest user object
 */
function formatGuestUser(user) {
  return {
    id: user.id,
    fullName: user.full_name,
    phoneNumber: user.phone_number,
    email: user.email,
    ipAddress: user.ip_address,
    userAgent: user.user_agent,
    status: user.status,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

/**
 * Format guest session object
 */
function formatGuestSession(session) {
  return {
    id: session.id,
    guestId: session.guest_id,
    sessionToken: session.session_token,
    expiresAt: session.expires_at,
    createdAt: session.created_at,
    updatedAt: session.updated_at,
  };
}

/**
 * Format guest activity object
 */
function formatGuestActivity(activity) {
  return {
    id: activity.id,
    guestId: activity.guest_id,
    action: activity.action,
    metadata: activity.metadata ? JSON.parse(activity.metadata) : null,
    ipAddress: activity.ip_address,
    createdAt: activity.created_at,
  };
}
