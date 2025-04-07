/**
 * Admin Guest User Routes
 *
 * This module defines the API routes for admin management of guest users.
 */

import express from "express";
import { checkAuth } from "../middleware/auth.js";
import {
  getAllGuestUsers,
  getGuestUserById,
  updateGuestUserStatus,
  getGuestActivities,
} from "../../controllers/guestUserController.js";

const router = express.Router();

// Admin routes (auth required)
router.get("/", checkAuth(["admin"]), getAllGuestUsers);
router.get("/:id", checkAuth(["admin"]), getGuestUserById);
router.put("/:id/status", checkAuth(["admin"]), updateGuestUserStatus);
router.get("/:guestId/activities", checkAuth(["admin"]), getGuestActivities);

export default router;
