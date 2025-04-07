/**
 * Guest User Routes
 *
 * This module defines the API routes for guest user management.
 */

import express from "express";
import { checkAuth } from "../middleware/auth.js";
import {
  registerGuestUser,
  getGuestUserBySession,
  logGuestActivity,
  getAllGuestUsers,
  getGuestUserById,
  updateGuestUserStatus,
  getGuestActivities,
} from "../../controllers/guestUserController.js";

const router = express.Router();

// Public routes (no auth required)
router.post("/register", registerGuestUser);
router.get("/session", getGuestUserBySession);
router.post("/activity", logGuestActivity);

export default router;
