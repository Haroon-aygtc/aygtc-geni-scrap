/**
 * Moderation Routes
 *
 * These routes handle content moderation functionality
 */

import express from "express";
import { getMySQLClient } from "../../utils/dbHelpers.js";
import { authenticateJWT } from "../middleware/auth.js";

const router = express.Router();

/**
 * @route GET /api/moderation/queue
 * @desc Get moderation queue items by status
 * @access Private
 */
router.get("/queue", authenticateJWT, async (req, res) => {
  try {
    const { status = "pending" } = req.query;
    const validStatuses = ["pending", "approved", "rejected"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status parameter" });
    }

    const sequelize = await getMySQLClient();

    const [flaggedContent] = await sequelize.query(
      `SELECT * FROM flagged_content WHERE status = ? ORDER BY created_at DESC`,
      {
        replacements: [status],
      },
    );

    res.json(flaggedContent);
  } catch (error) {
    console.error("Error fetching moderation queue:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/moderation/flag
 * @desc Flag content for moderation
 * @access Public
 */
router.post("/flag", async (req, res) => {
  try {
    const { contentId, contentType, reason } = req.body;

    if (!contentId || !contentType || !reason) {
      return res
        .status(400)
        .json({ error: "Content ID, type, and reason are required" });
    }

    const sequelize = await getMySQLClient();

    // Check if content is already flagged
    const [existingFlags] = await sequelize.query(
      `SELECT * FROM flagged_content WHERE content_id = ? AND content_type = ?`,
      {
        replacements: [contentId, contentType],
      },
    );

    if (existingFlags.length > 0) {
      return res.status(409).json({
        error: "This content has already been flagged for moderation",
        flaggedContent: existingFlags[0],
      });
    }

    // Insert new flagged content
    const [result] = await sequelize.query(
      `INSERT INTO flagged_content (content_id, content_type, reason, status, created_at) 
       VALUES (?, ?, ?, 'pending', NOW())`,
      {
        replacements: [contentId, contentType, reason],
      },
    );

    // Get the inserted record
    const [flaggedContent] = await sequelize.query(
      `SELECT * FROM flagged_content WHERE id = ?`,
      {
        replacements: [result.insertId],
      },
    );

    res.status(201).json(flaggedContent[0]);
  } catch (error) {
    console.error("Error flagging content:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route PUT /api/moderation/review/:id
 * @desc Review flagged content
 * @access Private
 */
router.put("/review/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewerId } = req.body;

    if (!status || !reviewerId) {
      return res
        .status(400)
        .json({ error: "Status and reviewer ID are required" });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const sequelize = await getMySQLClient();

    // Check if flagged content exists
    const [existingFlags] = await sequelize.query(
      `SELECT * FROM flagged_content WHERE id = ?`,
      {
        replacements: [id],
      },
    );

    if (existingFlags.length === 0) {
      return res.status(404).json({ error: "Flagged content not found" });
    }

    // Update flagged content
    await sequelize.query(
      `UPDATE flagged_content 
       SET status = ?, reviewer_id = ?, reviewed_at = NOW(), updated_at = NOW() 
       WHERE id = ?`,
      {
        replacements: [status, reviewerId, id],
      },
    );

    // Get the updated record
    const [flaggedContent] = await sequelize.query(
      `SELECT * FROM flagged_content WHERE id = ?`,
      {
        replacements: [id],
      },
    );

    res.json(flaggedContent[0]);
  } catch (error) {
    console.error("Error reviewing flagged content:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/moderation/stats
 * @desc Get moderation statistics
 * @access Private
 */
router.get("/stats", authenticateJWT, async (req, res) => {
  try {
    const sequelize = await getMySQLClient();

    // Get counts by status
    const [statusCounts] = await sequelize.query(
      `SELECT status, COUNT(*) as count FROM flagged_content GROUP BY status`,
    );

    // Get counts by content type
    const [typeCounts] = await sequelize.query(
      `SELECT content_type, COUNT(*) as count FROM flagged_content GROUP BY content_type`,
    );

    // Get recent activity
    const [recentActivity] = await sequelize.query(
      `SELECT * FROM flagged_content ORDER BY updated_at DESC LIMIT 10`,
    );

    res.json({
      statusCounts: statusCounts.reduce((acc, curr) => {
        acc[curr.status] = curr.count;
        return acc;
      }, {}),
      typeCounts: typeCounts.reduce((acc, curr) => {
        acc[curr.content_type] = curr.count;
        return acc;
      }, {}),
      recentActivity,
    });
  } catch (error) {
    console.error("Error fetching moderation statistics:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/moderation/rules
 * @desc Get moderation rules
 * @access Private
 */
router.get("/rules", authenticateJWT, async (req, res) => {
  try {
    const sequelize = await getMySQLClient();

    const [rules] = await sequelize.query(
      `SELECT * FROM moderation_rules ORDER BY priority DESC`,
    );

    res.json(rules);
  } catch (error) {
    console.error("Error fetching moderation rules:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route PUT /api/moderation/rules
 * @desc Update moderation rules
 * @access Private
 */
router.put("/rules", authenticateJWT, async (req, res) => {
  try {
    const { rules } = req.body;

    if (!Array.isArray(rules)) {
      return res.status(400).json({ error: "Rules must be an array" });
    }

    const sequelize = await getMySQLClient();
    const transaction = await sequelize.transaction();

    try {
      // Delete existing rules
      await sequelize.query(`DELETE FROM moderation_rules`, { transaction });

      // Insert new rules
      for (const rule of rules) {
        await sequelize.query(
          `INSERT INTO moderation_rules (name, description, pattern, action, priority, is_active, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, NOW())`,
          {
            replacements: [
              rule.name,
              rule.description || "",
              rule.pattern,
              rule.action,
              rule.priority || 0,
              rule.isActive !== undefined ? rule.isActive : true,
            ],
            transaction,
          },
        );
      }

      await transaction.commit();

      // Get the updated rules
      const [updatedRules] = await sequelize.query(
        `SELECT * FROM moderation_rules ORDER BY priority DESC`,
      );

      res.json(updatedRules);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error updating moderation rules:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
