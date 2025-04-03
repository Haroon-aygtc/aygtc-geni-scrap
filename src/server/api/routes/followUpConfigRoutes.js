/**
 * Follow-up Questions Configuration Routes
 *
 * These routes handle follow-up questions configuration
 */

import express from "express";
import { getMySQLClient } from "../../utils/dbHelpers.js";
import { authenticateJWT } from "../middleware/auth.js";

const router = express.Router();

/**
 * @route GET /api/follow-up-configs
 * @desc Get all follow-up configurations
 * @access Private
 */
router.get("/", authenticateJWT, async (req, res) => {
  try {
    const sequelize = await getMySQLClient();

    const [configs] = await sequelize.query(
      `SELECT * FROM follow_up_configs ORDER BY created_at DESC`,
    );

    res.json(configs);
  } catch (error) {
    console.error("Error fetching follow-up configurations:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/follow-up-configs/:id
 * @desc Get follow-up configuration by ID
 * @access Private
 */
router.get("/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const sequelize = await getMySQLClient();

    const [configs] = await sequelize.query(
      `SELECT * FROM follow_up_configs WHERE id = ?`,
      {
        replacements: [id],
      },
    );

    if (configs.length === 0) {
      return res
        .status(404)
        .json({ error: "Follow-up configuration not found" });
    }

    res.json(configs[0]);
  } catch (error) {
    console.error("Error fetching follow-up configuration:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/follow-up-configs
 * @desc Create a new follow-up configuration
 * @access Private
 */
router.post("/", authenticateJWT, async (req, res) => {
  try {
    const { name, description, isActive, displayStyle, maxQuestions } =
      req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const sequelize = await getMySQLClient();

    const [result] = await sequelize.query(
      `INSERT INTO follow_up_configs (name, description, is_active, display_style, max_questions, created_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      {
        replacements: [
          name,
          description || "",
          isActive !== undefined ? isActive : true,
          displayStyle || "buttons",
          maxQuestions || 3,
        ],
      },
    );

    const [configs] = await sequelize.query(
      `SELECT * FROM follow_up_configs WHERE id = ?`,
      {
        replacements: [result.insertId],
      },
    );

    res.status(201).json(configs[0]);
  } catch (error) {
    console.error("Error creating follow-up configuration:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route PUT /api/follow-up-configs/:id
 * @desc Update a follow-up configuration
 * @access Private
 */
router.put("/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive, displayStyle, maxQuestions } =
      req.body;
    const sequelize = await getMySQLClient();

    // Check if configuration exists
    const [configs] = await sequelize.query(
      `SELECT * FROM follow_up_configs WHERE id = ?`,
      {
        replacements: [id],
      },
    );

    if (configs.length === 0) {
      return res
        .status(404)
        .json({ error: "Follow-up configuration not found" });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push("name = ?");
      values.push(name);
    }

    if (description !== undefined) {
      updates.push("description = ?");
      values.push(description);
    }

    if (isActive !== undefined) {
      updates.push("is_active = ?");
      values.push(isActive);
    }

    if (displayStyle !== undefined) {
      updates.push("display_style = ?");
      values.push(displayStyle);
    }

    if (maxQuestions !== undefined) {
      updates.push("max_questions = ?");
      values.push(maxQuestions);
    }

    updates.push("updated_at = NOW()");

    // Add id as the last parameter
    values.push(id);

    await sequelize.query(
      `UPDATE follow_up_configs SET ${updates.join(", ")} WHERE id = ?`,
      {
        replacements: values,
      },
    );

    const [updatedConfigs] = await sequelize.query(
      `SELECT * FROM follow_up_configs WHERE id = ?`,
      {
        replacements: [id],
      },
    );

    res.json(updatedConfigs[0]);
  } catch (error) {
    console.error("Error updating follow-up configuration:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route DELETE /api/follow-up-configs/:id
 * @desc Delete a follow-up configuration
 * @access Private
 */
router.delete("/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const sequelize = await getMySQLClient();

    // Check if configuration exists
    const [configs] = await sequelize.query(
      `SELECT * FROM follow_up_configs WHERE id = ?`,
      {
        replacements: [id],
      },
    );

    if (configs.length === 0) {
      return res
        .status(404)
        .json({ error: "Follow-up configuration not found" });
    }

    // Delete configuration
    await sequelize.query(`DELETE FROM follow_up_configs WHERE id = ?`, {
      replacements: [id],
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting follow-up configuration:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/follow-up-configs/:configId/predefined-questions
 * @desc Get predefined questions for a configuration
 * @access Private
 */
router.get(
  "/:configId/predefined-questions",
  authenticateJWT,
  async (req, res) => {
    try {
      const { configId } = req.params;
      const sequelize = await getMySQLClient();

      const [questions] = await sequelize.query(
        `SELECT * FROM predefined_questions WHERE config_id = ? ORDER BY \`order\``,
        {
          replacements: [configId],
        },
      );

      res.json(questions);
    } catch (error) {
      console.error("Error fetching predefined questions:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * @route POST /api/follow-up-configs/:configId/predefined-questions
 * @desc Add predefined question to a configuration
 * @access Private
 */
router.post(
  "/:configId/predefined-questions",
  authenticateJWT,
  async (req, res) => {
    try {
      const { configId } = req.params;
      const { question, order } = req.body;
      const sequelize = await getMySQLClient();

      // Check if configuration exists
      const [configs] = await sequelize.query(
        `SELECT * FROM follow_up_configs WHERE id = ?`,
        {
          replacements: [configId],
        },
      );

      if (configs.length === 0) {
        return res
          .status(404)
          .json({ error: "Follow-up configuration not found" });
      }

      // Get max order if not provided
      let questionOrder = order;
      if (questionOrder === undefined) {
        const [maxOrderResult] = await sequelize.query(
          `SELECT MAX(\`order\`) as max_order FROM predefined_questions WHERE config_id = ?`,
          {
            replacements: [configId],
          },
        );
        questionOrder = (maxOrderResult[0].max_order || 0) + 1;
      }

      const [result] = await sequelize.query(
        `INSERT INTO predefined_questions (config_id, question, \`order\`, created_at) 
       VALUES (?, ?, ?, NOW())`,
        {
          replacements: [configId, question, questionOrder],
        },
      );

      const [questions] = await sequelize.query(
        `SELECT * FROM predefined_questions WHERE id = ?`,
        {
          replacements: [result.insertId],
        },
      );

      res.status(201).json(questions[0]);
    } catch (error) {
      console.error("Error adding predefined question:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * @route DELETE /api/follow-up-configs/predefined-questions/:id
 * @desc Delete predefined question
 * @access Private
 */
router.delete(
  "/predefined-questions/:id",
  authenticateJWT,
  async (req, res) => {
    try {
      const { id } = req.params;
      const sequelize = await getMySQLClient();

      // Check if question exists
      const [questions] = await sequelize.query(
        `SELECT * FROM predefined_questions WHERE id = ?`,
        {
          replacements: [id],
        },
      );

      if (questions.length === 0) {
        return res.status(404).json({ error: "Predefined question not found" });
      }

      // Delete question
      await sequelize.query(`DELETE FROM predefined_questions WHERE id = ?`, {
        replacements: [id],
      });

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting predefined question:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * @route GET /api/follow-up-configs/:configId/topic-questions
 * @desc Get topic-based questions for a configuration
 * @access Private
 */
router.get("/:configId/topic-questions", authenticateJWT, async (req, res) => {
  try {
    const { configId } = req.params;
    const sequelize = await getMySQLClient();

    const [questions] = await sequelize.query(
      `SELECT * FROM topic_based_questions WHERE config_id = ?`,
      {
        replacements: [configId],
      },
    );

    res.json(questions);
  } catch (error) {
    console.error("Error fetching topic-based questions:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/follow-up-configs/:configId/topic-questions
 * @desc Add topic-based question to a configuration
 * @access Private
 */
router.post("/:configId/topic-questions", authenticateJWT, async (req, res) => {
  try {
    const { configId } = req.params;
    const { topic, questions } = req.body;
    const sequelize = await getMySQLClient();

    // Check if configuration exists
    const [configs] = await sequelize.query(
      `SELECT * FROM follow_up_configs WHERE id = ?`,
      {
        replacements: [configId],
      },
    );

    if (configs.length === 0) {
      return res
        .status(404)
        .json({ error: "Follow-up configuration not found" });
    }

    const [result] = await sequelize.query(
      `INSERT INTO topic_based_questions (config_id, topic, questions, created_at) 
       VALUES (?, ?, ?, NOW())`,
      {
        replacements: [configId, topic, JSON.stringify(questions)],
      },
    );

    const [topicQuestions] = await sequelize.query(
      `SELECT * FROM topic_based_questions WHERE id = ?`,
      {
        replacements: [result.insertId],
      },
    );

    res.status(201).json(topicQuestions[0]);
  } catch (error) {
    console.error("Error adding topic-based question:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route DELETE /api/follow-up-configs/topic-questions/:id
 * @desc Delete topic-based question
 * @access Private
 */
router.delete("/topic-questions/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const sequelize = await getMySQLClient();

    // Check if question exists
    const [questions] = await sequelize.query(
      `SELECT * FROM topic_based_questions WHERE id = ?`,
      {
        replacements: [id],
      },
    );

    if (questions.length === 0) {
      return res.status(404).json({ error: "Topic-based question not found" });
    }

    // Delete question
    await sequelize.query(`DELETE FROM topic_based_questions WHERE id = ?`, {
      replacements: [id],
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting topic-based question:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
