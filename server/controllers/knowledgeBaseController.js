/**
 * Knowledge Base Controller
 *
 * This module provides controller functions for knowledge base management.
 */

import { getMySQLClient } from "../utils/dbHelpers.js";
import { v4 as uuidv4 } from "uuid";
import { formatResponse } from "../utils/responseFormatter.js";

/**
 * Create a new knowledge base entry
 */
export const createKnowledgeBase = async (req, res) => {
  try {
    const { name, description, sourceType, sourceUrl, content } = req.body;
    const userId = req.user.id;

    if (!name || !sourceType) {
      return res.status(400).json(
        formatResponse(null, {
          message: "Name and source type are required",
          code: "ERR_400",
        }),
      );
    }

    const db = await getMySQLClient();
    const knowledgeBaseId = uuidv4();
    const now = new Date().toISOString();

    // Create knowledge base entry
    await db.query(
      `INSERT INTO knowledge_bases 
       (id, name, description, source_type, source_url, content, user_id, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        knowledgeBaseId,
        name,
        description,
        sourceType,
        sourceUrl,
        content,
        userId,
        now,
        now,
      ],
    );

    // Get created knowledge base
    const [knowledgeBase] = await db.query(
      "SELECT * FROM knowledge_bases WHERE id = ?",
      [knowledgeBaseId],
    );

    // Format response
    const formattedKnowledgeBase = formatKnowledgeBase(knowledgeBase);

    return res.json(formatResponse(formattedKnowledgeBase));
  } catch (error) {
    console.error("Error creating knowledge base:", error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};

/**
 * Get all knowledge bases with pagination
 */
export const getAllKnowledgeBases = async (req, res) => {
  try {
    const { limit = 50, offset = 0, search } = req.query;
    const userId = req.user.id;

    const db = await getMySQLClient();

    // Build query conditions
    let conditions = ["user_id = ?"];
    const params = [userId];

    if (search) {
      conditions.push("(name LIKE ? OR description LIKE ?)");
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Get total count
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM knowledge_bases ${whereClause}`,
      params,
    );

    // Get knowledge bases with pagination
    const knowledgeBases = await db.query(
      `SELECT * FROM knowledge_bases ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)],
    );

    // Format knowledge bases
    const formattedKnowledgeBases = knowledgeBases.map(formatKnowledgeBase);

    return res.json(
      formatResponse({
        knowledgeBases: formattedKnowledgeBases,
        totalCount: countResult.total,
      }),
    );
  } catch (error) {
    console.error("Error getting all knowledge bases:", error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};

/**
 * Get knowledge base by ID
 */
export const getKnowledgeBaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!id) {
      return res.status(400).json(
        formatResponse(null, {
          message: "Knowledge base ID is required",
          code: "ERR_400",
        }),
      );
    }

    const db = await getMySQLClient();

    // Get knowledge base
    const [knowledgeBase] = await db.query(
      "SELECT * FROM knowledge_bases WHERE id = ? AND user_id = ?",
      [id, userId],
    );

    if (!knowledgeBase) {
      return res.status(404).json(
        formatResponse(null, {
          message: "Knowledge base not found",
          code: "ERR_404",
        }),
      );
    }

    // Format and return knowledge base
    const formattedKnowledgeBase = formatKnowledgeBase(knowledgeBase);
    return res.json(formatResponse(formattedKnowledgeBase));
  } catch (error) {
    console.error("Error getting knowledge base by ID:", error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};

/**
 * Update knowledge base
 */
export const updateKnowledgeBase = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, sourceType, sourceUrl, content } = req.body;
    const userId = req.user.id;

    if (!id) {
      return res.status(400).json(
        formatResponse(null, {
          message: "Knowledge base ID is required",
          code: "ERR_400",
        }),
      );
    }

    const db = await getMySQLClient();

    // Check if knowledge base exists and belongs to user
    const [existingKnowledgeBase] = await db.query(
      "SELECT * FROM knowledge_bases WHERE id = ? AND user_id = ?",
      [id, userId],
    );

    if (!existingKnowledgeBase) {
      return res.status(404).json(
        formatResponse(null, {
          message: "Knowledge base not found",
          code: "ERR_404",
        }),
      );
    }

    // Build update fields
    const updateFields = [];
    const updateParams = [];

    if (name !== undefined) {
      updateFields.push("name = ?");
      updateParams.push(name);
    }

    if (description !== undefined) {
      updateFields.push("description = ?");
      updateParams.push(description);
    }

    if (sourceType !== undefined) {
      updateFields.push("source_type = ?");
      updateParams.push(sourceType);
    }

    if (sourceUrl !== undefined) {
      updateFields.push("source_url = ?");
      updateParams.push(sourceUrl);
    }

    if (content !== undefined) {
      updateFields.push("content = ?");
      updateParams.push(content);
    }

    // Add updated_at
    updateFields.push("updated_at = ?");
    updateParams.push(new Date().toISOString());

    // Add id and user_id to params
    updateParams.push(id, userId);

    // Update knowledge base
    await db.query(
      `UPDATE knowledge_bases SET ${updateFields.join(", ")} WHERE id = ? AND user_id = ?`,
      updateParams,
    );

    // Get updated knowledge base
    const [updatedKnowledgeBase] = await db.query(
      "SELECT * FROM knowledge_bases WHERE id = ?",
      [id],
    );

    // Format and return knowledge base
    const formattedKnowledgeBase = formatKnowledgeBase(updatedKnowledgeBase);
    return res.json(formatResponse(formattedKnowledgeBase));
  } catch (error) {
    console.error("Error updating knowledge base:", error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};

/**
 * Delete knowledge base
 */
export const deleteKnowledgeBase = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!id) {
      return res.status(400).json(
        formatResponse(null, {
          message: "Knowledge base ID is required",
          code: "ERR_400",
        }),
      );
    }

    const db = await getMySQLClient();

    // Check if knowledge base exists and belongs to user
    const [existingKnowledgeBase] = await db.query(
      "SELECT * FROM knowledge_bases WHERE id = ? AND user_id = ?",
      [id, userId],
    );

    if (!existingKnowledgeBase) {
      return res.status(404).json(
        formatResponse(null, {
          message: "Knowledge base not found",
          code: "ERR_404",
        }),
      );
    }

    // Delete knowledge base
    await db.query("DELETE FROM knowledge_bases WHERE id = ? AND user_id = ?", [
      id,
      userId,
    ]);

    return res.json(
      formatResponse({
        success: true,
        message: "Knowledge base deleted successfully",
      }),
    );
  } catch (error) {
    console.error("Error deleting knowledge base:", error);
    return res.status(500).json(
      formatResponse(null, {
        message: "Internal server error",
        code: "ERR_500",
      }),
    );
  }
};

// Helper functions

/**
 * Format knowledge base object
 */
function formatKnowledgeBase(knowledgeBase) {
  return {
    id: knowledgeBase.id,
    name: knowledgeBase.name,
    description: knowledgeBase.description,
    sourceType: knowledgeBase.source_type,
    sourceUrl: knowledgeBase.source_url,
    content: knowledgeBase.content,
    userId: knowledgeBase.user_id,
    createdAt: knowledgeBase.created_at,
    updatedAt: knowledgeBase.updated_at,
  };
}
