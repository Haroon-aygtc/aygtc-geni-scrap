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
 * @route GET /api/ai-cache/:hash
 * @desc Get a cached AI response by hash
 * @access Private
 */
router.get("/:hash", authenticateJWT, async (req, res) => {
  try {
    const { hash } = req.params;
    const { model } = req.query;

    const sequelize = await getMySQLClient();
    const now = new Date();

    const [cacheEntry] = await sequelize.query(
      `SELECT * FROM ai_response_cache 
       WHERE prompt_hash = ? AND model_used = ? AND expires_at > ?`,
      {
        replacements: [hash, model || "default", now],
      },
    );

    if (!cacheEntry || cacheEntry.length === 0) {
      return res.status(404).json({ error: "Cache entry not found" });
    }

    res.json({
      prompt: cacheEntry[0].prompt,
      response: cacheEntry[0].response,
      modelUsed: cacheEntry[0].model_used,
      metadata: cacheEntry[0].metadata
        ? JSON.parse(cacheEntry[0].metadata)
        : {},
      createdAt: cacheEntry[0].created_at,
      expiresAt: cacheEntry[0].expires_at,
    });
  } catch (error) {
    console.error("Error getting cached response:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/ai-cache
 * @desc Cache an AI response
 * @access Private
 */
router.post("/", authenticateJWT, async (req, res) => {
  try {
    const { prompt, response, model, metadata, ttlSeconds = 3600 } = req.body;

    if (!prompt || !response || !model) {
      return res.status(400).json({
        error: "Prompt, response, and model are required",
      });
    }

    // Create a hash of the prompt for efficient lookup
    let hash = 0;
    for (let i = 0; i < prompt.length; i++) {
      const char = prompt.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    const promptHash = hash.toString(16);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);
    const sequelize = await getMySQLClient();

    // Check if entry already exists
    const [existingEntries] = await sequelize.query(
      `SELECT id FROM ai_response_cache 
       WHERE prompt_hash = ? AND model_used = ?`,
      {
        replacements: [promptHash, model],
      },
    );

    if (existingEntries.length > 0) {
      // Update existing cache entry
      await sequelize.query(
        `UPDATE ai_response_cache 
         SET response = ?, metadata = ?, updated_at = ?, expires_at = ? 
         WHERE id = ?`,
        {
          replacements: [
            response,
            JSON.stringify(metadata || {}),
            now,
            expiresAt,
            existingEntries[0].id,
          ],
        },
      );

      res.json({
        success: true,
        message: "Cache entry updated",
        id: existingEntries[0].id,
      });
    } else {
      // Create new cache entry
      const [result] = await sequelize.query(
        `INSERT INTO ai_response_cache 
         (id, prompt, prompt_hash, response, model_used, metadata, created_at, updated_at, expires_at) 
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            prompt,
            promptHash,
            response,
            model,
            JSON.stringify(metadata || {}),
            now,
            now,
            expiresAt,
          ],
        },
      );

      res.status(201).json({
        success: true,
        message: "Cache entry created",
        id: result.insertId,
      });
    }
  } catch (error) {
    console.error("Error caching response:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route DELETE /api/ai-cache/expired
 * @desc Clear expired cache entries
 * @access Private
 */
router.delete("/expired", authenticateJWT, async (req, res) => {
  try {
    const now = new Date();
    const sequelize = await getMySQLClient();

    const [result] = await sequelize.query(
      `DELETE FROM ai_response_cache WHERE expires_at < ?`,
      {
        replacements: [now],
      },
    );

    res.json({
      success: true,
      message: "Expired cache entries cleared",
      count: result.affectedRows || 0,
    });
  } catch (error) {
    console.error("Error clearing expired cache:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route DELETE /api/ai-cache
 * @desc Invalidate cache entries for a specific prompt pattern
 * @access Private
 */
router.delete("/", authenticateJWT, async (req, res) => {
  try {
    const { promptPattern, model } = req.body;

    if (!promptPattern) {
      return res.status(400).json({ error: "Prompt pattern is required" });
    }

    const sequelize = await getMySQLClient();
    let query = `DELETE FROM ai_response_cache WHERE prompt LIKE ?`;
    const replacements = [`%${promptPattern}%`];

    if (model) {
      query += ` AND model_used = ?`;
      replacements.push(model);
    }

    const [result] = await sequelize.query(query, {
      replacements,
    });

    res.json({
      success: true,
      message: "Cache entries invalidated",
      count: result.affectedRows || 0,
    });
  } catch (error) {
    console.error("Error invalidating cache:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
