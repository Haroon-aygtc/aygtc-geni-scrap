/**
 * Public Routes
 *
 * This module defines API routes that don't require authentication.
 */

import express from "express";
import {
  getWidgetConfig,
  processWidgetChat,
} from "../../controllers/widgetController.js";
import guestUserRoutes from "./guestUserRoutes.js";

const router = express.Router();

// Get widget configuration by ID
router.get("/widget/:widgetId/config", getWidgetConfig);

// Process chat message for widget (no auth required)
router.post("/widget/:widgetId/chat", processWidgetChat);

// Guest user routes
router.use("/guest", guestUserRoutes);

export default router;
