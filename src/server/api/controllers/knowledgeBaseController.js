import knowledgeBaseService from "@/services/knowledgeBaseService.js";

/**
 * Get all knowledge base entries
 */
export const getAllEntries = async (req, res) => {
  try {
    const entries = await knowledgeBaseService.getAllEntries();
    res.json(entries);
  } catch (error) {
    console.error("Error fetching knowledge base entries:", error);
    res.status(500).json({ error: "Failed to fetch knowledge base entries" });
  }
};

/**
 * Get a single knowledge base entry by ID
 */
export const getEntryById = async (req, res) => {
  try {
    const { id } = req.params;
    const entry = await knowledgeBaseService.getEntryById(id);

    if (!entry) {
      return res.status(404).json({ error: "Knowledge base entry not found" });
    }

    res.json(entry);
  } catch (error) {
    console.error("Error fetching knowledge base entry:", error);
    res.status(500).json({ error: "Failed to fetch knowledge base entry" });
  }
};

/**
 * Create a new knowledge base entry
 */
export const createEntry = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const newEntry = await knowledgeBaseService.createEntry({
      title,
      content,
      category: category || null,
      tags: tags || [],
      created_by: req.user.id,
    });

    res.status(201).json(newEntry);
  } catch (error) {
    console.error("Error creating knowledge base entry:", error);
    res.status(500).json({ error: "Failed to create knowledge base entry" });
  }
};

/**
 * Update a knowledge base entry
 */
export const updateEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags } = req.body;

    if (!title && !content && !category && !tags) {
      return res
        .status(400)
        .json({ error: "At least one field to update is required" });
    }

    // Check if entry exists
    const existingEntry = await knowledgeBaseService.getEntryById(id);

    if (!existingEntry) {
      return res.status(404).json({ error: "Knowledge base entry not found" });
    }

    const updatedEntry = await knowledgeBaseService.updateEntry(id, {
      title,
      content,
      category,
      tags,
    });

    res.json(updatedEntry);
  } catch (error) {
    console.error("Error updating knowledge base entry:", error);
    res.status(500).json({ error: "Failed to update knowledge base entry" });
  }
};

/**
 * Delete a knowledge base entry
 */
export const deleteEntry = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if entry exists
    const existingEntry = await knowledgeBaseService.getEntryById(id);

    if (!existingEntry) {
      return res.status(404).json({ error: "Knowledge base entry not found" });
    }

    await knowledgeBaseService.deleteEntry(id);

    res.json({ message: "Knowledge base entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting knowledge base entry:", error);
    res.status(500).json({ error: "Failed to delete knowledge base entry" });
  }
};

/**
 * Search knowledge base entries
 */
export const searchEntries = async (req, res) => {
  try {
    const { query } = req.params;
    const entries = await knowledgeBaseService.searchEntries(query);

    res.json(entries);
  } catch (error) {
    console.error("Error searching knowledge base entries:", error);
    res.status(500).json({ error: "Failed to search knowledge base entries" });
  }
};

/**
 * Get knowledge base entries by category
 */
export const getEntriesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const entries = await knowledgeBaseService.getEntriesByCategory(category);

    res.json(entries);
  } catch (error) {
    console.error("Error fetching knowledge base entries by category:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch knowledge base entries by category" });
  }
};
