/**
 * Follow-up Question Service
 * Handles CRUD operations for follow-up questions
 */

import { v4 as uuidv4 } from "uuid";
import logger from "@/utils/logger";
import { getMySQLClient, QueryTypes } from "./mysqlClient.js";
import FollowUpQuestion from "@/models/FollowUpQuestion";

export interface FollowUpQuestionData {
  id?: string;
  configId: string;
  question: string;
  displayOrder?: number;
  isActive?: boolean;
}

const followUpQuestionService = {
  /**
   * Get all follow-up questions for a specific configuration
   */
  getQuestionsByConfigId: async (
    configId: string,
  ): Promise<FollowUpQuestionData[]> => {
    try {
      const sequelize = await getMySQLClient();

      const questions = await sequelize.query(
        `SELECT * FROM follow_up_questions 
         WHERE config_id = ? 
         ORDER BY display_order ASC`,
        {
          replacements: [configId],
          type: QueryTypes.SELECT,
        },
      );

      return questions.map((q: any) => ({
        id: q.id,
        configId: q.config_id,
        question: q.question,
        displayOrder: q.display_order,
        isActive: q.is_active,
      }));
    } catch (error) {
      logger.error(
        `Error fetching follow-up questions for config ${configId}`,
        error,
      );
      return [];
    }
  },

  /**
   * Create a new follow-up question
   */
  createQuestion: async (
    data: FollowUpQuestionData,
  ): Promise<FollowUpQuestionData | null> => {
    try {
      const sequelize = await getMySQLClient();
      const id = data.id || uuidv4();
      const now = new Date().toISOString();

      await sequelize.query(
        `INSERT INTO follow_up_questions 
         (id, config_id, question, display_order, is_active, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            id,
            data.configId,
            data.question,
            data.displayOrder || 0,
            data.isActive !== undefined ? data.isActive : true,
            now,
            now,
          ],
          type: QueryTypes.INSERT,
        },
      );

      // Fetch the created question
      const [question] = await sequelize.query(
        `SELECT * FROM follow_up_questions WHERE id = ?`,
        {
          replacements: [id],
          type: QueryTypes.SELECT,
        },
      );

      if (!question) return null;

      return {
        id: question.id,
        configId: question.config_id,
        question: question.question,
        displayOrder: question.display_order,
        isActive: question.is_active,
      };
    } catch (error) {
      logger.error("Error creating follow-up question", error);
      return null;
    }
  },

  /**
   * Update a follow-up question
   */
  updateQuestion: async (
    id: string,
    data: Partial<FollowUpQuestionData>,
  ): Promise<FollowUpQuestionData | null> => {
    try {
      const sequelize = await getMySQLClient();
      const updateFields = [];
      const replacements = [];

      if (data.question !== undefined) {
        updateFields.push("question = ?");
        replacements.push(data.question);
      }

      if (data.displayOrder !== undefined) {
        updateFields.push("display_order = ?");
        replacements.push(data.displayOrder);
      }

      if (data.isActive !== undefined) {
        updateFields.push("is_active = ?");
        replacements.push(data.isActive);
      }

      // Always update the updated_at timestamp
      updateFields.push("updated_at = ?");
      replacements.push(new Date().toISOString());

      // Add the ID to the replacements
      replacements.push(id);

      if (updateFields.length > 0) {
        await sequelize.query(
          `UPDATE follow_up_questions SET ${updateFields.join(", ")} WHERE id = ?`,
          {
            replacements,
            type: QueryTypes.UPDATE,
          },
        );
      }

      // Fetch the updated question
      const [question] = await sequelize.query(
        `SELECT * FROM follow_up_questions WHERE id = ?`,
        {
          replacements: [id],
          type: QueryTypes.SELECT,
        },
      );

      if (!question) return null;

      return {
        id: question.id,
        configId: question.config_id,
        question: question.question,
        displayOrder: question.display_order,
        isActive: question.is_active,
      };
    } catch (error) {
      logger.error(`Error updating follow-up question ${id}`, error);
      return null;
    }
  },

  /**
   * Delete a follow-up question
   */
  deleteQuestion: async (id: string): Promise<boolean> => {
    try {
      const sequelize = await getMySQLClient();

      await sequelize.query(`DELETE FROM follow_up_questions WHERE id = ?`, {
        replacements: [id],
        type: QueryTypes.DELETE,
      });

      return true;
    } catch (error) {
      logger.error(`Error deleting follow-up question ${id}`, error);
      return false;
    }
  },

  /**
   * Reorder follow-up questions
   */
  reorderQuestions: async (
    configId: string,
    questionIds: string[],
  ): Promise<boolean> => {
    try {
      const sequelize = await getMySQLClient();
      const transaction = await sequelize.transaction();

      try {
        // Update each question's display order
        for (let i = 0; i < questionIds.length; i++) {
          await sequelize.query(
            `UPDATE follow_up_questions 
             SET display_order = ?, updated_at = ? 
             WHERE id = ? AND config_id = ?`,
            {
              replacements: [
                i,
                new Date().toISOString(),
                questionIds[i],
                configId,
              ],
              type: QueryTypes.UPDATE,
              transaction,
            },
          );
        }

        await transaction.commit();
        return true;
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      logger.error(
        `Error reordering follow-up questions for config ${configId}`,
        error,
      );
      return false;
    }
  },

  /**
   * Get follow-up questions for a chat session
   */
  getQuestionsForChat: async (
    configId: string,
    limit: number = 3,
  ): Promise<string[]> => {
    try {
      const sequelize = await getMySQLClient();

      const questions = await sequelize.query(
        `SELECT question FROM follow_up_questions 
         WHERE config_id = ? AND is_active = true 
         ORDER BY display_order ASC 
         LIMIT ?`,
        {
          replacements: [configId, limit],
          type: QueryTypes.SELECT,
        },
      );

      return questions.map((q: any) => q.question);
    } catch (error) {
      logger.error(
        `Error fetching follow-up questions for chat with config ${configId}`,
        error,
      );
      return [];
    }
  },
};

export default followUpQuestionService;
