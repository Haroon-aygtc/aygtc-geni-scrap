/**
 * Response Formatting Routes
 *
 * These routes handle response formatting configuration
 */

import express from "express";
import { getMySQLClient } from "../../utils/dbHelpers.js";
import { authenticateJWT } from "../middleware/auth.js";

const router = express.Router();

/**
 * @route GET /api/response-formatting
 * @desc Get all response formatting configurations
 * @access Private
 */
router.get("/", authenticateJWT, async (req, res) => {
  try {
    const sequelize = await getMySQLClient();

    const [configs] = await sequelize.query(
      `SELECT * FROM response_formatting_configs ORDER BY created_at DESC`,
    );

    res.json(configs);
  } catch (error) {
    console.error("Error fetching response formatting configurations:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/response-formatting/:id
 * @desc Get response formatting configuration by ID
 * @access Private
 */
router.get("/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const sequelize = await getMySQLClient();

    const [configs] = await sequelize.query(
      `SELECT * FROM response_formatting_configs WHERE id = ?`,
      {
        replacements: [id],
      },
    );

    if (configs.length === 0) {
      return res
        .status(404)
        .json({ error: "Response formatting configuration not found" });
    }

    res.json(configs[0]);
  } catch (error) {
    console.error("Error fetching response formatting configuration:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/response-formatting
 * @desc Create a new response formatting configuration
 * @access Private
 */
router.post("/", authenticateJWT, async (req, res) => {
  try {
    const {
      name,
      description,
      isActive,
      enableMarkdown,
      enableCodeHighlighting,
      enableLinkPreviews,
      enableMathRendering,
      enableTableFormatting,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const sequelize = await getMySQLClient();

    const [result] = await sequelize.query(
      `INSERT INTO response_formatting_configs (
        name, 
        description, 
        is_active, 
        enable_markdown, 
        enable_code_highlighting, 
        enable_link_previews, 
        enable_math_rendering, 
        enable_table_formatting, 
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      {
        replacements: [
          name,
          description || "",
          isActive !== undefined ? isActive : true,
          enableMarkdown !== undefined ? enableMarkdown : true,
          enableCodeHighlighting !== undefined ? enableCodeHighlighting : true,
          enableLinkPreviews !== undefined ? enableLinkPreviews : false,
          enableMathRendering !== undefined ? enableMathRendering : false,
          enableTableFormatting !== undefined ? enableTableFormatting : true,
        ],
      },
    );

    const [configs] = await sequelize.query(
      `SELECT * FROM response_formatting_configs WHERE id = ?`,
      {
        replacements: [result.insertId],
      },
    );

    res.status(201).json(configs[0]);
  } catch (error) {
    console.error("Error creating response formatting configuration:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route PUT /api/response-formatting/:id
 * @desc Update a response formatting configuration
 * @access Private
 */
router.put("/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      isActive,
      enableMarkdown,
      enableCodeHighlighting,
      enableLinkPreviews,
      enableMathRendering,
      enableTableFormatting,
    } = req.body;
    const sequelize = await getMySQLClient();

    // Check if configuration exists
    const [configs] = await sequelize.query(
      `SELECT * FROM response_formatting_configs WHERE id = ?`,
      {
        replacements: [id],
      },
    );

    if (configs.length === 0) {
      return res
        .status(404)
        .json({ error: "Response formatting configuration not found" });
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

    if (enableMarkdown !== undefined) {
      updates.push("enable_markdown = ?");
      values.push(enableMarkdown);
    }

    if (enableCodeHighlighting !== undefined) {
      updates.push("enable_code_highlighting = ?");
      values.push(enableCodeHighlighting);
    }

    if (enableLinkPreviews !== undefined) {
      updates.push("enable_link_previews = ?");
      values.push(enableLinkPreviews);
    }

    if (enableMathRendering !== undefined) {
      updates.push("enable_math_rendering = ?");
      values.push(enableMathRendering);
    }

    if (enableTableFormatting !== undefined) {
      updates.push("enable_table_formatting = ?");
      values.push(enableTableFormatting);
    }

    updates.push("updated_at = NOW()");

    // Add id as the last parameter
    values.push(id);

    await sequelize.query(
      `UPDATE response_formatting_configs SET ${updates.join(", ")} WHERE id = ?`,
      {
        replacements: values,
      },
    );

    const [updatedConfigs] = await sequelize.query(
      `SELECT * FROM response_formatting_configs WHERE id = ?`,
      {
        replacements: [id],
      },
    );

    res.json(updatedConfigs[0]);
  } catch (error) {
    console.error("Error updating response formatting configuration:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route DELETE /api/response-formatting/:id
 * @desc Delete a response formatting configuration
 * @access Private
 */
router.delete("/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const sequelize = await getMySQLClient();

    // Check if configuration exists
    const [configs] = await sequelize.query(
      `SELECT * FROM response_formatting_configs WHERE id = ?`,
      {
        replacements: [id],
      },
    );

    if (configs.length === 0) {
      return res
        .status(404)
        .json({ error: "Response formatting configuration not found" });
    }

    // Delete configuration
    await sequelize.query(
      `DELETE FROM response_formatting_configs WHERE id = ?`,
      {
        replacements: [id],
      },
    );

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting response formatting configuration:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/response-formatting/:configId/templates
 * @desc Get response templates for a configuration
 * @access Private
 */
router.get("/:configId/templates", authenticateJWT, async (req, res) => {
  try {
    const { configId } = req.params;
    const sequelize = await getMySQLClient();

    const [templates] = await sequelize.query(
      `SELECT * FROM response_templates WHERE config_id = ?`,
      {
        replacements: [configId],
      },
    );

    res.json(templates);
  } catch (error) {
    console.error("Error fetching response templates:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/response-formatting/:configId/templates
 * @desc Add response template to a configuration
 * @access Private
 */
router.post("/:configId/templates", authenticateJWT, async (req, res) => {
  try {
    const { configId } = req.params;
    const { name, template, description } = req.body;
    const sequelize = await getMySQLClient();

    // Check if configuration exists
    const [configs] = await sequelize.query(
      `SELECT * FROM response_formatting_configs WHERE id = ?`,
      {
        replacements: [configId],
      },
    );

    if (configs.length === 0) {
      return res
        .status(404)
        .json({ error: "Response formatting configuration not found" });
    }

    const [result] = await sequelize.query(
      `INSERT INTO response_templates (config_id, name, template, description, created_at) 
       VALUES (?, ?, ?, ?, NOW())`,
      {
        replacements: [configId, name, template, description || ""],
      },
    );

    const [templates] = await sequelize.query(
      `SELECT * FROM response_templates WHERE id = ?`,
      {
        replacements: [result.insertId],
      },
    );

    res.status(201).json(templates[0]);
  } catch (error) {
    console.error("Error adding response template:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route PUT /api/response-formatting/templates/:id
 * @desc Update response template
 * @access Private
 */
router.put("/templates/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, template, description } = req.body;
    const sequelize = await getMySQLClient();

    // Check if template exists
    const [templates] = await sequelize.query(
      `SELECT * FROM response_templates WHERE id = ?`,
      {
        replacements: [id],
      },
    );

    if (templates.length === 0) {
      return res.status(404).json({ error: "Response template not found" });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push("name = ?");
      values.push(name);
    }

    if (template !== undefined) {
      updates.push("template = ?");
      values.push(template);
    }

    if (description !== undefined) {
      updates.push("description = ?");
      values.push(description);
    }

    updates.push("updated_at = NOW()");

    // Add id as the last parameter
    values.push(id);

    await sequelize.query(
      `UPDATE response_templates SET ${updates.join(", ")} WHERE id = ?`,
      {
        replacements: values,
      },
    );

    const [updatedTemplates] = await sequelize.query(
      `SELECT * FROM response_templates WHERE id = ?`,
      {
        replacements: [id],
      },
    );

    res.json(updatedTemplates[0]);
  } catch (error) {
    console.error("Error updating response template:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route DELETE /api/response-formatting/templates/:id
 * @desc Delete response template
 * @access Private
 */
router.delete("/templates/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const sequelize = await getMySQLClient();

    // Check if template exists
    const [templates] = await sequelize.query(
      `SELECT * FROM response_templates WHERE id = ?`,
      {
        replacements: [id],
      },
    );

    if (templates.length === 0) {
      return res.status(404).json({ error: "Response template not found" });
    }

    // Delete template
    await sequelize.query(`DELETE FROM response_templates WHERE id = ?`, {
      replacements: [id],
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting response template:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/response-formatting/format
 * @desc Format a response using a template
 * @access Private
 */
router.post("/format", authenticateJWT, async (req, res) => {
  try {
    const { templateId, variables } = req.body;
    const sequelize = await getMySQLClient();

    // Get template
    const [templates] = await sequelize.query(
      `SELECT * FROM response_templates WHERE id = ?`,
      {
        replacements: [templateId],
      },
    );

    if (templates.length === 0) {
      return res.status(404).json({ error: "Response template not found" });
    }

    const template = templates[0].template;

    // Simple template variable replacement
    let formattedResponse = template;
    for (const [key, value] of Object.entries(variables)) {
      formattedResponse = formattedResponse.replace(
        new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g"),
        String(value),
      );
    }

    res.json({ formattedResponse });
  } catch (error) {
    console.error("Error formatting response:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
