/**
 * AI Cache Routes
 *
 * These routes handle AI response caching
 */

import express from "express";
import { getMySQLClient } from "../../utils/dbHelpers.js";
import { authenticateJWT } from "../middleware/auth.js";

const router = express.Router();

/**
 * @route POST /api/ai-cache/get
 * @desc Get cached response if available
 * @access Private
 */
router.post("/get", authenticateJWT, async (req, res) => {
  try {
    const { prompt, model, parameters } = req.body;

    if (!prompt || !model) {
      return res.status(400).json({ error: "Prompt and model are required" });
    }

    const sequelize = await getMySQLClient();

    // Create a hash of the prompt and parameters for cache lookup
    const promptHash = Buffer.from(
      JSON.stringify({ prompt, model, parameters }),
    ).toString("base64");

    // Get cached response if not expired
    const [cachedResponses] = await sequelize.query(
      `SELECT * FROM ai_response_cache 
       WHERE prompt_hash = ? 
       AND (expires_at IS NULL OR expires_at > NOW())`,
      {
        replacements: [promptHash],
      },
    );

    if (cachedResponses.length === 0) {
      return res.status(404).json({ error: "Cache miss" });
    }

    res.json(cachedResponses[0]);
  } catch (error) {
    console.error("Error fetching cached AI response:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/ai-cache/store
 * @desc Cache an AI response
 * @access Private
 */
router.post("/store", authenticateJWT, async (req, res) => {
  try {
    const { prompt, response, model, parameters, ttl } = req.body;

    if (!prompt || !response || !model) {
      return res
        .status(400)
        .json({ error: "Prompt, response, and model are required" });
    }

    const sequelize = await getMySQLClient();

    // Create a hash of the prompt and parameters for cache lookup
    const promptHash = Buffer.from(
      JSON.stringify({ prompt, model, parameters }),
    ).toString("base64");

    // Calculate expiration time if TTL is provided
    let expiresAt = null;
    if (ttl) {
      expiresAt = new Date(Date.now() + ttl * 1000).toISOString().slice(0, 19).replace('T', ' ');
    }

    // Check if entry already exists
    const [existingEntries] = await sequelize.query(
      `SELECT * FROM ai_response_cache WHERE prompt_hash = ?`,
      {
        replacements: [promptHash],
      },
    );

    if (existingEntries.length > 0) {
      // Update existing entry
      await sequelize.query(
        `UPDATE ai_response_cache 
         SET response = ?, updated_at = NOW(), expires_at = ? 
         WHERE prompt_hash = ?`,
        {
          replacements: [response, expiresAt, promptHash],
        },
      );

      const [updatedEntries] = await sequelize.query(
        `SELECT * FROM ai_response_cache WHERE prompt_hash = ?`,
        {
          replacements: [promptHash],
        },
      );

      res.json(updatedEntries[0]);
    } else {
      // Insert new entry
      const [result] = await sequelize.query(
        `INSERT INTO ai_response_cache (
          prompt_hash, 
          prompt, 
          response, 
          model, 
          parameters, 
          created_at, 
          expires_at
        ) VALUES (?, ?, ?, ?, ?, NOW(), ?)`,
        {
          replacements: [
            promptHash,
            prompt,
            response,
            model,
            parameters ? JSON.stringify(parameters) : null,
            expiresAt,
          ],
        },
      );

      const [cachedResponses] = await sequelize.query(
        `SELECT * FROM ai_response_cache WHERE id = ?`,
        {
          replacements: [result.insertId],
        },