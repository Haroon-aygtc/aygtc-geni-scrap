/**
 * Follow-Up Types
 *
 * This module defines TypeScript-like types for follow-up questions and configurations.
 */

/**
 * @typedef {Object} FollowUpConfig
 * @property {string} id - Unique identifier
 * @property {string} userId - User ID who owns this config
 * @property {string} name - Configuration name
 * @property {boolean} isEnabled - Whether follow-up questions are enabled
 * @property {number} maxQuestions - Maximum number of questions to show
 * @property {string} displayMode - How to display questions (buttons, chips, list)
 * @property {boolean} generateDynamically - Whether to generate questions dynamically
 * @property {string} aiPrompt - Prompt to use for AI generation
 * @property {boolean} isDefault - Whether this is the default configuration
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} FollowUpQuestion
 * @property {string} id - Unique identifier
 * @property {string} configId - Configuration ID this question belongs to
 * @property {string} question - The question text
 * @property {number} displayOrder - Order to display questions
 * @property {boolean} isActive - Whether the question is active
 * @property {string} category - Question category
 * @property {string[]} tags - Tags for categorization
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} GenerateQuestionsRequest
 * @property {string} configId - Configuration ID
 * @property {Object[]} chatHistory - Chat history for context
 * @property {number} count - Number of questions to generate
 */

/**
 * @typedef {Object} GenerateQuestionsResponse
 * @property {string[]} questions - Generated questions
 * @property {string} configId - Configuration ID
 */

module.exports = {};
