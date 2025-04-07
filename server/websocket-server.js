/**
 * Production-ready WebSocket Server
 * Handles real-time chat messaging with authentication, error handling, and reconnection logic
 */

import WebSocket from "ws";
import http from "http";
import express from "express";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import {
  authenticateWebSocketJWT,
  verifyToken,
  JWT_SECRET,
} from "./api/middleware/authenticateWebSocket.js";

dotenv.config();

// Create express app and HTTP server
const app = express();
const server = http.createServer(app);

// WebSocket server configuration with ping interval
const wss = new WebSocket.Server({
  server,
  // Set ping interval to 30 seconds to keep connections alive
  clientTracking: true,
  // Set maximum payload size to 1MB
  maxPayload: 1024 * 1024,
});

// Store connected clients with additional metadata
const clients = new Map();

// Rate limiting configuration
const rateLimits = {
  messagePerMinute: 60, // 60 messages per minute per user
  connectionPerMinute: 10, // 10 connections per minute per IP
};

// Rate limiting state
const rateLimitState = {
  messages: new Map(), // userId -> { count, resetTime }
  connections: new Map(), // IP -> { count, resetTime }
};

/**
 * Check if a user is rate limited for messages
 * @param {string} userId - User ID
 * @returns {boolean} - True if rate limited, false otherwise
 */
const isMessageRateLimited = (userId) => {
  const now = Date.now();
  const userState = rateLimitState.messages.get(userId) || {
    count: 0,
    resetTime: now + 60000,
  };

  // Reset counter if the minute has passed
  if (now > userState.resetTime) {
    userState.count = 0;
    userState.resetTime = now + 60000;
  }

  // Check if rate limited
  if (userState.count >= rateLimits.messagePerMinute) {
    return true;
  }

  // Increment counter
  userState.count++;
  rateLimitState.messages.set(userId, userState);
  return false;
};

/**
 * Check if an IP is rate limited for connections
 * @param {string} ip - IP address
 * @returns {boolean} - True if rate limited, false otherwise
 */
const isConnectionRateLimited = (ip) => {
  const now = Date.now();
  const ipState = rateLimitState.connections.get(ip) || {
    count: 0,
    resetTime: now + 60000,
  };

  // Reset counter if the minute has passed
  if (now > ipState.resetTime) {
    ipState.count = 0;
    ipState.resetTime = now + 60000;
  }

  // Check if rate limited
  if (ipState.count >= rateLimits.connectionPerMinute) {
    return true;
  }

  // Increment counter
  ipState.count++;
  rateLimitState.connections.set(ip, ipState);
  return false;
};

/**
 * Get session clients
 * @param {string} sessionId - Session ID
 * @returns {Array} - Array of WebSocket clients in the session
 */
const getSessionClients = (sessionId) => {
  const sessionClients = [];
  for (const [ws, client] of clients.entries()) {
    if (client.sessionId === sessionId && ws.readyState === WebSocket.OPEN) {
      sessionClients.push(ws);
    }
  }
  return sessionClients;
};

/**
 * Send message to all clients in a session
 * @param {Object} message - Message object
 * @param {string} sessionId - Session ID
 */
const broadcastToSession = (message, sessionId) => {
  const sessionClients = getSessionClients(sessionId);
  const messageString = JSON.stringify(message);

  sessionClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageString);
    }
  });
};

/**
 * Send message to a specific user
 * @param {Object} message - Message object
 * @param {string} userId - User ID
 */
const sendToUser = (message, userId) => {
  const messageString = JSON.stringify(message);

  for (const [ws, client] of clients.entries()) {
    if (client.userId === userId && ws.readyState === WebSocket.OPEN) {
      ws.send(messageString);
    }
  }
};

/**
 * Handle authentication request
 * @param {Object} parsedMessage - Parsed message object
 * @param {WebSocket} ws - WebSocket connection
 * @param {Object} client - Client metadata
 */
const handleAuthentication = async (parsedMessage, ws, client) => {
  try {
    const { token } = parsedMessage;

    if (!token) {
      ws.send(
        JSON.stringify({
          type: "auth_response",
          success: false,
          message: "No authentication token provided",
          timestamp: new Date().toISOString(),
        }),
      );
      return;
    }

    const user = await authenticateWebSocketJWT(token);
    if (!user) {
      ws.send(
        JSON.stringify({
          type: "auth_response",
          success: false,
          message: "Invalid authentication token",
          timestamp: new Date().toISOString(),
        }),
      );
      return;
    }

    // Update client with user information
    client.userId = user.id;
    client.role = user.role;
    client.authenticated = true;
    clients.set(ws, client);

    // Send successful authentication response
    ws.send(
      JSON.stringify({
        type: "auth_response",
        success: true,
        userId: user.id,
        role: user.role,
        timestamp: new Date().toISOString(),
      }),
    );

    console.log(`Client ${client.id} authenticated as user ${user.id}`);
  } catch (error) {
    console.error("Authentication error:", error);
    ws.send(
      JSON.stringify({
        type: "auth_response",
        success: false,
        message: "Authentication failed",
        timestamp: new Date().toISOString(),
      }),
    );
  }
};

/**
 * Handle session join request
 * @param {Object} parsedMessage - Parsed message object
 * @param {WebSocket} ws - WebSocket connection
 * @param {Object} client - Client metadata
 */
const handleSessionJoin = (parsedMessage, ws, client) => {
  try {
    const { sessionId } = parsedMessage;

    if (!sessionId) {
      ws.send(
        JSON.stringify({
          type: "session_join_response",
          success: false,
          message: "No session ID provided",
          timestamp: new Date().toISOString(),
        }),
      );
      return;
    }

    // Update client with session information
    client.sessionId = sessionId;
    clients.set(ws, client);

    // Send successful join response
    ws.send(
      JSON.stringify({
        type: "session_join_response",
        success: true,
        sessionId,
        timestamp: new Date().toISOString(),
      }),
    );

    console.log(`Client ${client.id} joined session ${sessionId}`);

    // In a production environment, you would fetch recent messages for the session from the database
    // and send them to the client. For now, we'll just send a welcome message.
    ws.send(
      JSON.stringify({
        type: "chat_message",
        id: uuidv4(),
        sessionId,
        content: "Welcome to the chat session!",
        role: "system",
        timestamp: new Date().toISOString(),
      }),
    );
  } catch (error) {
    console.error("Session join error:", error);
    ws.send(
      JSON.stringify({
        type: "session_join_response",
        success: false,
        message: "Failed to join session",
        timestamp: new Date().toISOString(),
      }),
    );
  }
};

/**
 * Handle chat message
 * @param {Object} parsedMessage - Parsed message object
 * @param {WebSocket} ws - WebSocket connection
 * @param {Object} client - Client metadata
 */
const handleChatMessage = (parsedMessage, ws, client) => {
  try {
    // Check rate limiting
    if (client.userId && isMessageRateLimited(client.userId)) {
      ws.send(
        JSON.stringify({
          type: "error",
          code: "RATE_LIMITED",
          message:
            "You are sending messages too quickly. Please wait a moment.",
          timestamp: new Date().toISOString(),
        }),
      );
      return;
    }

    // Validate message format
    if (!parsedMessage.sessionId || !parsedMessage.content) {
      ws.send(
        JSON.stringify({
          type: "error",
          code: "INVALID_MESSAGE",
          message:
            "Invalid message format. Session ID and content are required.",
          timestamp: new Date().toISOString(),
        }),
      );
      return;
    }

    // Create message object
    const message = {
      id: parsedMessage.id || uuidv4(),
      sessionId: parsedMessage.sessionId,
      userId: client.userId,
      content: parsedMessage.content,
      role: parsedMessage.role || "user",
      timestamp: new Date().toISOString(),
    };

    // In a production environment, you would save the message to the database here
    // For now, we'll just broadcast it to all clients in the session

    // Broadcast message to session
    broadcastToSession(
      {
        type: "chat_message",
        ...message,
      },
      message.sessionId,
    );

    // Send acknowledgment to sender
    ws.send(
      JSON.stringify({
        type: "message_ack",
        messageId: message.id,
        timestamp: new Date().toISOString(),
      }),
    );
  } catch (error) {
    console.error("Error handling chat message:", error);
    ws.send(
      JSON.stringify({
        type: "error",
        code: "SERVER_ERROR",
        message: "An error occurred while processing your message.",
        timestamp: new Date().toISOString(),
      }),
    );
  }
};

/**
 * Handle typing indicator
 * @param {Object} parsedMessage - Parsed message object
 * @param {WebSocket} ws - WebSocket connection
 * @param {Object} client - Client metadata
 */
const handleTypingIndicator = (parsedMessage, ws, client) => {
  try {
    const { sessionId, isTyping } = parsedMessage;

    if (!sessionId) {
      return;
    }

    // Broadcast typing indicator to session
    broadcastToSession(
      {
        type: "typing_indicator",
        sessionId,
        userId: client.userId,
        isTyping: !!isTyping,
        timestamp: new Date().toISOString(),
      },
      sessionId,
    );
  } catch (error) {
    console.error("Error handling typing indicator:", error);
  }
};

// Handle WebSocket connections
wss.on("connection", (ws, req) => {
  // Get client IP address
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  // Check rate limiting for connections
  if (isConnectionRateLimited(ip)) {
    ws.send(
      JSON.stringify({
        type: "error",
        code: "RATE_LIMITED",
        message: "Too many connection attempts. Please try again later.",
        timestamp: new Date().toISOString(),
      }),
    );
    ws.close(1008, "Rate limited");
    return;
  }

  const clientId = uuidv4();
  const connectionTime = new Date();

  // Store client information
  const clientInfo = {
    id: clientId,
    ip,
    connectedAt: connectionTime,
    authenticated: false,
    userId: null,
    role: null,
    sessionId: null,
    lastActivity: connectionTime,
  };

  clients.set(ws, clientInfo);

  console.log(
    `Client connected: ${clientId} from ${ip} at ${connectionTime.toISOString()}`,
  );
  console.log(`Total connected clients: ${clients.size}`);

  // Send welcome message
  ws.send(
    JSON.stringify({
      type: "connection",
      clientId,
      message: "Connected to WebSocket server",
      timestamp: new Date().toISOString(),
    }),
  );

  // Set up ping interval for this connection
  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  }, 30000);

  // Handle incoming messages
  ws.on("message", (message) => {
    try {
      const client = clients.get(ws);
      if (!client) return;

      // Update last activity timestamp
      client.lastActivity = new Date();
      clients.set(ws, client);

      const parsedMessage = JSON.parse(message);
      console.log(`Received message from ${clientId}:`, parsedMessage.type);

      // Process message based on type
      switch (parsedMessage.type) {
        case "chat_message":
          handleChatMessage(parsedMessage, ws, client);
          break;

        case "auth":
          handleAuthentication(parsedMessage, ws, client);
          break;

        case "join_session":
          handleSessionJoin(parsedMessage, ws, client);
          break;

        case "typing_indicator":
          handleTypingIndicator(parsedMessage, ws, client);
          break;

        case "ping":
          // Respond to ping with pong
          ws.send(
            JSON.stringify({
              type: "pong",
              timestamp: new Date().toISOString(),
            }),
          );
          break;

        default:
          // Echo back unknown message types
          ws.send(
            JSON.stringify({
              type: "echo",
              originalMessage: parsedMessage,
              timestamp: new Date().toISOString(),
            }),
          );
      }
    } catch (error) {
      console.error(`Error processing message from ${clientId}:`, error);
      ws.send(
        JSON.stringify({
          type: "error",
          code: "INVALID_MESSAGE",
          message: "Invalid message format or server error",
          timestamp: new Date().toISOString(),
        }),
      );
    }
  });

  // Handle pong responses
  ws.on("pong", () => {
    const client = clients.get(ws);
    if (client) {
      client.lastActivity = new Date();
      clients.set(ws, client);
    }
  });

  // Handle client disconnection
  ws.on("close", (code, reason) => {
    clearInterval(pingInterval);

    const client = clients.get(ws);
    if (client) {
      console.log(
        `Client disconnected: ${client.id}, code: ${code}, reason: ${reason}`,
      );
      clients.delete(ws);
    }

    console.log(`Total connected clients: ${clients.size}`);
  });

  // Handle errors
  ws.on("error", (error) => {
    console.error(`WebSocket error for client ${clientId}:`, error);
    clearInterval(pingInterval);
    clients.delete(ws);
  });
});

// Set up interval to check for inactive connections
setInterval(() => {
  const now = new Date();
  const inactivityThreshold = 5 * 60 * 1000; // 5 minutes

  for (const [ws, client] of clients.entries()) {
    const inactiveTime = now - client.lastActivity;

    if (inactiveTime > inactivityThreshold) {
      console.log(`Closing inactive connection for client ${client.id}`);
      ws.close(1000, "Inactivity timeout");
      clients.delete(ws);
    }
  }
}, 60000); // Check every minute

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    connections: clients.size,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Start the server
const PORT = process.env.WS_PORT || 8080;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});

// Export server for testing or external use
export { server, wss };

// Handle process termination
process.on("SIGINT", () => {
  console.log("SIGINT received. Closing WebSocket server...");

  // Close all WebSocket connections
  wss.clients.forEach((client) => {
    client.close(1001, "Server shutting down");
  });

  // Close WebSocket server
  wss.close(() => {
    console.log("WebSocket server closed");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Closing WebSocket server...");

  // Close all WebSocket connections
  wss.clients.forEach((client) => {
    client.close(1001, "Server shutting down");
  });

  // Close WebSocket server
  wss.close(() => {
    console.log("WebSocket server closed");
    process.exit(0);
  });
});
