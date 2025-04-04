import { getMySQLClient, QueryTypes } from "./mysqlClient.js";
import { v4 as uuidv4 } from "uuid";
import logger from "@/utils/logger";
import {
  FollowUpConfig,
  PredefinedQuestionSet,
  PredefinedQuestion,
  TopicBasedQuestionSet,
  TopicBasedQuestion,
} from "@/models";

export interface FollowUpConfigData {
  id?: string;
  userId: string;
  name: string;
  enableFollowUpQuestions: boolean;
  maxFollowUpQuestions: number;
  showFollowUpAs: "buttons" | "chips" | "list";
  generateAutomatically: boolean;
  isDefault?: boolean;
  predefinedQuestionSets?: PredefinedQuestionSetData[];
  topicBasedQuestionSets?: TopicBasedQuestionSetData[];
}

export interface PredefinedQuestionSetData {
  id?: string;
  name: string;
  description?: string;
  triggerKeywords?: string[];
  questions: string[];
}

export interface TopicBasedQuestionSetData {
  id?: string;
  topic: string;
  questions: string[];
}

const followUpConfigService = {
  /**
   * Get all follow-up configurations for a user
   */
  getFollowUpConfigs: async (userId: string): Promise<FollowUpConfigData[]> => {
    try {
      const configs = await FollowUpConfig.findAll({
        where: { user_id: userId },
        include: [
          {
            model: PredefinedQuestionSet,
            include: [PredefinedQuestion],
          },
          {
            model: TopicBasedQuestionSet,
            include: [TopicBasedQuestion],
          },
        ],
      });

      return configs.map((config: any) => {
        return {
          id: config.id,
          userId: config.user_id,
          name: config.name,
          enableFollowUpQuestions: config.enable_follow_up_questions,
          maxFollowUpQuestions: config.max_follow_up_questions,
          showFollowUpAs: config.show_follow_up_as,
          generateAutomatically: config.generate_automatically,
          isDefault: config.is_default,
          predefinedQuestionSets: config.PredefinedQuestionSets?.map(
            (set: any) => ({
              id: set.id,
              name: set.name,
              description: set.description,
              triggerKeywords: set.trigger_keywords,
              questions: set.PredefinedQuestions?.map(
                (q: any) => q.question_text,
              ).sort((a: any, b: any) => a.display_order - b.display_order),
            }),
          ),
          topicBasedQuestionSets: config.TopicBasedQuestionSets?.map(
            (set: any) => ({
              id: set.id,
              topic: set.topic,
              questions: set.TopicBasedQuestions?.map(
                (q: any) => q.question_text,
              ).sort((a: any, b: any) => a.display_order - b.display_order),
            }),
          ),
        };
      });
    } catch (error) {
      logger.error("Error getting follow-up configs:", error);
      throw error;
    }
  },

  /**
   * Get a specific follow-up configuration
   */
  getFollowUpConfig: async (id: string): Promise<FollowUpConfigData | null> => {
    try {
      const config = await FollowUpConfig.findByPk(id, {
        include: [
          {
            model: PredefinedQuestionSet,
            include: [PredefinedQuestion],
          },
          {
            model: TopicBasedQuestionSet,
            include: [TopicBasedQuestion],
          },
        ],
      });

      if (!config) return null;

      return {
        id: config.id,
        userId: config.user_id,
        name: config.name,
        enableFollowUpQuestions: config.enable_follow_up_questions,
        maxFollowUpQuestions: config.max_follow_up_questions,
        showFollowUpAs: config.show_follow_up_as,
        generateAutomatically: config.generate_automatically,
        isDefault: config.is_default,
        predefinedQuestionSets: config.PredefinedQuestionSets?.map(
          (set: any) => ({
            id: set.id,
            name: set.name,
            description: set.description,
            triggerKeywords: set.trigger_keywords,
            questions: set.PredefinedQuestions?.map(
              (q: any) => q.question_text,
            ).sort((a: any, b: any) => a.display_order - b.display_order),
          }),
        ),
        topicBasedQuestionSets: config.TopicBasedQuestionSets?.map(
          (set: any) => ({
            id: set.id,
            topic: set.topic,
            questions: set.TopicBasedQuestions?.map(
              (q: any) => q.question_text,
            ).sort((a: any, b: any) => a.display_order - b.display_order),
          }),
        ),
      };
    } catch (error) {
      logger.error(`Error getting follow-up config ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get the default follow-up configuration for a user
   */
  getDefaultFollowUpConfig: async (
    userId: string,
  ): Promise<FollowUpConfigData | null> => {
    try {
      const config = await FollowUpConfig.findOne({
        where: { user_id: userId, is_default: true },
        include: [
          {
            model: PredefinedQuestionSet,
            include: [PredefinedQuestion],
          },
          {
            model: TopicBasedQuestionSet,
            include: [TopicBasedQuestion],
          },
        ],
      });

      if (!config) return null;

      return {
        id: config.id,
        userId: config.user_id,
        name: config.name,
        enableFollowUpQuestions: config.enable_follow_up_questions,
        maxFollowUpQuestions: config.max_follow_up_questions,
        showFollowUpAs: config.show_follow_up_as,
        generateAutomatically: config.generate_automatically,
        isDefault: config.is_default,
        predefinedQuestionSets: config.PredefinedQuestionSets?.map(
          (set: any) => ({
            id: set.id,
            name: set.name,
            description: set.description,
            triggerKeywords: set.trigger_keywords,
            questions: set.PredefinedQuestions?.map(
              (q: any) => q.question_text,
            ).sort((a: any, b: any) => a.display_order - b.display_order),
          }),
        ),
        topicBasedQuestionSets: config.TopicBasedQuestionSets?.map(
          (set: any) => ({
            id: set.id,
            topic: set.topic,
            questions: set.TopicBasedQuestions?.map(
              (q: any) => q.question_text,
            ).sort((a: any, b: any) => a.display_order - b.display_order),
          }),
        ),
      };
    } catch (error) {
      logger.error(
        `Error getting default follow-up config for user ${userId}:`,
        error,
      );
      throw error;
    }
  },

  /**
   * Create a new follow-up configuration
   */
  createFollowUpConfig: async (
    data: FollowUpConfigData,
  ): Promise<FollowUpConfigData> => {
    const sequelize = await getMySQLClient();
    const transaction = await sequelize.transaction();

    try {
      // If this is set as default, unset any existing default
      if (data.isDefault) {
        await FollowUpConfig.update(
          { is_default: false },
          { where: { user_id: data.userId, is_default: true }, transaction },
        );
      }

      // Create the config
      const config = await FollowUpConfig.create(
        {
          id: data.id || uuidv4(),
          user_id: data.userId,
          name: data.name,
          enable_follow_up_questions: data.enableFollowUpQuestions,
          max_follow_up_questions: data.maxFollowUpQuestions,
          show_follow_up_as: data.showFollowUpAs,
          generate_automatically: data.generateAutomatically,
          is_default: data.isDefault || false,
        },
        { transaction },
      );

      // Create predefined question sets
      if (
        data.predefinedQuestionSets &&
        data.predefinedQuestionSets.length > 0
      ) {
        for (const setData of data.predefinedQuestionSets) {
          const set = await PredefinedQuestionSet.create(
            {
              id: setData.id || uuidv4(),
              config_id: config.id,
              name: setData.name,
              description: setData.description,
              trigger_keywords: setData.triggerKeywords,
            },
            { transaction },
          );

          // Create questions for this set
          if (setData.questions && setData.questions.length > 0) {
            const questions = setData.questions.map((question, index) => ({
              id: uuidv4(),
              set_id: set.id,
              question_text: question,
              display_order: index,
            }));

            await PredefinedQuestion.bulkCreate(questions, { transaction });
          }
        }
      }

      // Create topic-based question sets
      if (
        data.topicBasedQuestionSets &&
        data.topicBasedQuestionSets.length > 0
      ) {
        for (const setData of data.topicBasedQuestionSets) {
          const set = await TopicBasedQuestionSet.create(
            {
              id: setData.id || uuidv4(),
              config_id: config.id,
              topic: setData.topic,
            },
            { transaction },
          );

          // Create questions for this set
          if (setData.questions && setData.questions.length > 0) {
            const questions = setData.questions.map((question, index) => ({
              id: uuidv4(),
              set_id: set.id,
              question_text: question,
              display_order: index,
            }));

            await TopicBasedQuestion.bulkCreate(questions, { transaction });
          }
        }
      }

      await transaction.commit();

      // Return the created config with all related data
      return followUpConfigService.getFollowUpConfig(
        config.id,
      ) as Promise<FollowUpConfigData>;
    } catch (error) {
      await transaction.rollback();
      logger.error("Error creating follow-up config:", error);
      throw error;
    }
  },

  /**
   * Update an existing follow-up configuration
   */
  updateFollowUpConfig: async (
    id: string,
    data: Partial<FollowUpConfigData>,
  ): Promise<FollowUpConfigData> => {
    const sequelize = await getMySQLClient();
    const transaction = await sequelize.transaction();

    try {
      const config = await FollowUpConfig.findByPk(id);
      if (!config) {
        throw new Error(`Follow-up config with ID ${id} not found`);
      }

      // If this is set as default, unset any existing default
      if (data.isDefault) {
        await FollowUpConfig.update(
          { is_default: false },
          {
            where: {
              user_id: config.user_id,
              is_default: true,
              id: { [sequelize.Op.ne]: id },
            },
            transaction,
          },
        );
      }

      // Update the config
      await config.update(
        {
          name: data.name !== undefined ? data.name : config.name,
          enable_follow_up_questions:
            data.enableFollowUpQuestions !== undefined
              ? data.enableFollowUpQuestions
              : config.enable_follow_up_questions,
          max_follow_up_questions:
            data.maxFollowUpQuestions !== undefined
              ? data.maxFollowUpQuestions
              : config.max_follow_up_questions,
          show_follow_up_as:
            data.showFollowUpAs !== undefined
              ? data.showFollowUpAs
              : config.show_follow_up_as,
          generate_automatically:
            data.generateAutomatically !== undefined
              ? data.generateAutomatically
              : config.generate_automatically,
          is_default:
            data.isDefault !== undefined ? data.isDefault : config.is_default,
        },
        { transaction },
      );

      // Update predefined question sets if provided
      if (data.predefinedQuestionSets) {
        // Delete existing sets and questions
        await PredefinedQuestionSet.destroy({
          where: { config_id: id },
          transaction,
        });

        // Create new sets and questions
        for (const setData of data.predefinedQuestionSets) {
          const set = await PredefinedQuestionSet.create(
            {
              id: setData.id || uuidv4(),
              config_id: id,
              name: setData.name,
              description: setData.description,
              trigger_keywords: setData.triggerKeywords,
            },
            { transaction },
          );

          // Create questions for this set
          if (setData.questions && setData.questions.length > 0) {
            const questions = setData.questions.map((question, index) => ({
              id: uuidv4(),
              set_id: set.id,
              question_text: question,
              display_order: index,
            }));

            await PredefinedQuestion.bulkCreate(questions, { transaction });
          }
        }
      }

      // Update topic-based question sets if provided
      if (data.topicBasedQuestionSets) {
        // Delete existing sets and questions
        await TopicBasedQuestionSet.destroy({
          where: { config_id: id },
          transaction,
        });

        // Create new sets and questions
        for (const setData of data.topicBasedQuestionSets) {
          const set = await TopicBasedQuestionSet.create(
            {
              id: setData.id || uuidv4(),
              config_id: id,
              topic: setData.topic,
            },
            { transaction },
          );

          // Create questions for this set
          if (setData.questions && setData.questions.length > 0) {
            const questions = setData.questions.map((question, index) => ({
              id: uuidv4(),
              set_id: set.id,
              question_text: question,
              display_order: index,
            }));

            await TopicBasedQuestion.bulkCreate(questions, { transaction });
          }
        }
      }

      await transaction.commit();

      // Return the updated config with all related data
      return followUpConfigService.getFollowUpConfig(
        id,
      ) as Promise<FollowUpConfigData>;
    } catch (error) {
      await transaction.rollback();
      logger.error(`Error updating follow-up config ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a follow-up configuration
   */
  deleteFollowUpConfig: async (id: string): Promise<boolean> => {
    try {
      const result = await FollowUpConfig.destroy({ where: { id } });
      return result > 0;
    } catch (error) {
      logger.error(`Error deleting follow-up config ${id}:`, error);
      throw error;
    }
  },
};

export default followUpConfigService;
