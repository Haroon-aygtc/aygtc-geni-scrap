/**
 * API Server
 *
 * This file sets up the Express server for the API.
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import apiRoutes from "./api/index.js";
import errorHandler from "./middleware/errorHandler.js";
import { env } from "@/config/env.js";

// Create Express app
const app = express();

// Apply middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(cors()); // Enable CORS
app.use(bodyParser.json({ limit: "10mb" })); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies

// Apply rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// API routes
app.use("/api", apiRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
  });
}

export default app;
