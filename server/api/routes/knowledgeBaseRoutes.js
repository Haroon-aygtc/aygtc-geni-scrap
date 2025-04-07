/**
 * Knowledge Base Routes
 *
 * This module defines the API routes for knowledge base management.
 */

import express from "express";
import { checkAuth } from "../middleware/auth.js";
import {
  createKnowledgeBase,
  getAllKnowledgeBases,
  getKnowledgeBaseById,
  updateKnowledgeBase,
  deleteKnowledgeBase,
} from "../../controllers/knowledgeBaseController.js";

const router = express.Router();

// Create knowledge base
router.post("/", checkAuth(["admin", "user"]), createKnowledgeBase);

// Get all knowledge bases
router.get("/", checkAuth(["admin", "user"]), getAllKnowledgeBases);

// Get knowledge base by ID
router.get("/:id", checkAuth(["admin", "user"]), getKnowledgeBaseById);

// Update knowledge base
router.put("/:id", checkAuth(["admin", "user"]), updateKnowledgeBase);

// Delete knowledge base
router.delete("/:id", checkAuth(["admin", "user"]), deleteKnowledgeBase);

export default router;
