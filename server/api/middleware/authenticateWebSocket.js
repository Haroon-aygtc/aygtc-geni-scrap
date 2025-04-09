/**
 * WebSocket Authentication Utilities
 *
 * This module provides functions for authenticating WebSocket connections
 */

import jwt from "jsonwebtoken";
import { User } from "../../models/index.js";

// JWT secret from environment variables
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-this-in-production";

/**
 * Authenticate a WebSocket connection using JWT
 * @param {string} token - JWT token
 * @returns {Promise<Object|null>} - User object if authenticated, null otherwise
 */
export const authenticateWebSocketJWT = async (token) => {
  try {
    if (!token) return null;

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if user exists and is active
    const user = await User.findOne({
      where: { id: decoded.userId, is_active: true },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  } catch (error) {
    console.error("WebSocket authentication error:", error);
    return null;
  }
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} - Decoded token if valid, null otherwise
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export { JWT_SECRET };
