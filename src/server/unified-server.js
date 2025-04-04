/**
 * Unified Server
 *
 * This file sets up a unified server that serves both the API and the frontend.
 * It's used for development purposes only.
 */

import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import apiServer from "./api-server.js";
import { env } from "@/config/env.js";
import { initModels } from "@/models/index.js";

// Create Express app
const app = express();

// Mount API server
app.use(apiServer);

// Serve static files from the public directory
app.use(express.static("public"));

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

// WebSocket connection handler
wss.on("connection", (ws) => {
  console.log("WebSocket client connected");

  ws.on("message", (message) => {
    console.log("Received message:", message);

    // Echo the message back to the client
    ws.send(
      JSON.stringify({
        type: "echo",
        data: JSON.parse(message),
      }),
    );
  });

  ws.on("close", () => {
    console.log("WebSocket client disconnected");
  });

  // Send welcome message
  ws.send(
    JSON.stringify({
      type: "welcome",
      message: "Connected to WebSocket server",
    }),
  );
});

// Initialize database models
initModels()
  .then(() => {
    console.log("Database models initialized");
  })
  .catch((error) => {
    console.error("Error initializing database models:", error);
  });

// Start server
const PORT = env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Unified server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`WebSocket server available at ws://localhost:${PORT}`);
});
