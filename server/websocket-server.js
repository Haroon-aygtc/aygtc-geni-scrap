const WebSocket = require("ws");
const http = require("http");
const express = require("express");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

// Create express app and HTTP server
const app = express();
const server = http.createServer(app);

// WebSocket server configuration
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Map();

// Handle WebSocket connections
wss.on("connection", (ws) => {
  const clientId = uuidv4();
  const connectionTime = new Date();

  // Store client information
  clients.set(ws, {
    id: clientId,
    connectedAt: connectionTime,
  });

  console.log(
    `Client connected: ${clientId} at ${connectionTime.toISOString()}`,
  );
  console.log(`Total connected clients: ${clients.size}`);

  // Send welcome message
  ws.send(
    JSON.stringify({
      type: "connection",
      clientId: clientId,
      message: "Connected to WebSocket server",
      timestamp: new Date().toISOString(),
    }),
  );

  // Handle incoming messages
  ws.on("message", (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      console.log(`Received message from ${clientId}:`, parsedMessage);

      // Process message based on type
      switch (parsedMessage.type) {
        case "chat":
          // Broadcast chat message to all clients
          broadcastMessage({
            type: "chat",
            clientId: clientId,
            message: parsedMessage.message,
            timestamp: new Date().toISOString(),
          });
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
          message: "Invalid message format",
          timestamp: new Date().toISOString(),
        }),
      );
    }
  });

  // Handle client disconnection
  ws.on("close", () => {
    const client = clients.get(ws);
    console.log(`Client disconnected: ${client.id}`);
    clients.delete(ws);
    console.log(`Total connected clients: ${clients.size}`);
  });

  // Handle errors
  ws.on("error", (error) => {
    console.error(`WebSocket error for client ${clientId}:`, error);
  });
});

// Broadcast message to all connected clients
function broadcastMessage(message) {
  const messageString = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageString);
    }
  });
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    connections: clients.size,
    uptime: process.uptime(),
  });
});

// Start the server
const PORT = process.env.WS_PORT || 8080;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});

// Handle process termination
process.on("SIGINT", () => {
  console.log("SIGINT received. Closing WebSocket server...");
  wss.close(() => {
    console.log("WebSocket server closed");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Closing WebSocket server...");
  wss.close(() => {
    console.log("WebSocket server closed");
    process.exit(0);
  });
});
