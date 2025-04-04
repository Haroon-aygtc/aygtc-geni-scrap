/**
 * Routes Index
 *
 * This file exports all routes and sets up the API router.
 */

import express from "express";
import userRoutes from "./userRoutes.js";
import authRoutes from "./authRoutes.js";
import scrapingRoutes from "./scrapingRoutes.js";
import knowledgeBaseRoutes from "./knowledgeBaseRoutes.js";
import followUpConfigRoutes from "./followUpConfigRoutes.js";
import followUpQuestionRoutes from "./followUpQuestionRoutes.js";
import responseFormattingRoutes from "./responseFormattingRoutes.js";
import aiCacheRoutes from "./aiCacheRoutes.js";
import widgetRoutes from "./widgetRoutes.js";

const router = express.Router();

// Register all routes
router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/scraping", scrapingRoutes);
router.use("/knowledge-base", knowledgeBaseRoutes);
router.use("/follow-up-config", followUpConfigRoutes);
router.use("/follow-up-questions", followUpQuestionRoutes);
router.use("/response-formatting", responseFormattingRoutes);
router.use("/ai-cache", aiCacheRoutes);
router.use("/widget", widgetRoutes);

// API documentation route
router.get("/", (req, res) => {
  res.json({
    message: "API Documentation",
    version: "1.0.0",
    endpoints: [
      { path: "/users", description: "User management" },
      { path: "/auth", description: "Authentication" },
      { path: "/scraping", description: "Web scraping" },
      { path: "/knowledge-base", description: "Knowledge base management" },
      { path: "/follow-up-config", description: "Follow-up configuration" },
      { path: "/follow-up-questions", description: "Follow-up questions" },
      { path: "/response-formatting", description: "Response formatting" },
      { path: "/ai-cache", description: "AI response caching" },
      { path: "/widget", description: "Chat widget configuration" },
    ],
  });
});

export default router;
