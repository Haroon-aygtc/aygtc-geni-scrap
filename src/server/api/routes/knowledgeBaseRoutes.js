import express from "express";
import { authenticateToken } from "../middleware/auth";
import {
  getAllEntries,
  getEntryById,
  createEntry,
  updateEntry,
  deleteEntry,
  searchEntries,
  getEntriesByCategory,
} from "../controllers/knowledgeBaseController.js";

const router = express.Router();

// Get all knowledge base entries
router.get("/", authenticateToken, getAllEntries);

// Get a single knowledge base entry by ID
router.get("/:id", authenticateToken, getEntryById);

// Create a new knowledge base entry
router.post("/", authenticateToken, createEntry);

// Update a knowledge base entry
router.put("/:id", authenticateToken, updateEntry);

// Delete a knowledge base entry
router.delete("/:id", authenticateToken, deleteEntry);

// Search knowledge base entries
router.get("/search/:query", authenticateToken, searchEntries);

// Get knowledge base entries by category
router.get("/category/:category", authenticateToken, getEntriesByCategory);

export default router;
