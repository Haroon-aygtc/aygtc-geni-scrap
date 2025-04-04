import { getMySQLClient, QueryTypes } from "./mysqlClient.js";
import { v4 as uuidv4 } from "uuid";
import logger from "@/utils/logger";
import { ResponseFormattingConfig, ResponseTemplate } from "@/models";

export interface ResponseFormattingConfigData {
  id?: string;
  userId: string;
  name: string;
  enableMarkdown: boolean;
  defaultHeadingLevel: number;
  enableBulletPoints: boolean;
  enableNumberedLists: boolean;
  enableEmphasis: boolean;
  responseVariability: "concise" | "balanced" | "detailed";
  defaultTemplate?: string;
  isDefault?: boolean;
  customTemplates?: ResponseTemplateData[];
}

export interface ResponseTemplateData {
  id?: string;
  name: string;
  template: string;
  description?: string;
}

const responseFormattingService = {
  /**
   * Get all response formatting configurations for a user
   */
  getResponseFormattingConfigs: async (
    userId: string,
  ): Promise<ResponseFormattingConfigData[]> => {
    try {
      const configs = await ResponseFormattingConfig.findAll({
        where: { user_id: userId },
        include: [ResponseTemplate],
      });

      return configs.map((config: any) => {
        return {
          id: config.id,
          userId: config.user_id,
          name: config.name,
          enableMarkdown: config.enable_markdown,
          defaultHeadingLevel: config.default_heading_level,
          enableBulletPoints: config.enable_bullet_points,
          enableNumberedLists: config.enable_numbered_lists,
          enableEmphasis: config.enable_emphasis,
          responseVariability: config.response_variability,
          defaultTemplate: config.default_template,
          isDefault: config.is_default,
          customTemplates: config.ResponseTemplates?.map((template: any) => ({
            id: template.id,
            name: template.name,
            template: template.template,
            description: template.description,
          })),
        };
      });
    } catch (error) {
      logger.error("Error getting response formatting configs:", error);
      throw error;
    }
  },

  /**
   * Get a specific response formatting configuration
   */
  getResponseFormattingConfig: async (
    id: string,
  ): Promise<ResponseFormattingConfigData | null> => {
    try {
      const config = await ResponseFormattingConfig.findByPk(id, {
        include: [ResponseTemplate],
      });

      if (!config) return null;

      return {
        id: config.id,
        userId: config.user_id,
        name: config.name,
        enableMarkdown: config.enable_markdown,
        defaultHeadingLevel: config.default_heading_level,
        enableBulletPoints: config.enable_bullet_points,
        enableNumberedLists: config.enable_numbered_lists,
        enableEmphasis: config.enable_emphasis,
        responseVariability: config.response_variability,
        defaultTemplate: config.default_template,
        isDefault: config.is_default,
        customTemplates: config.ResponseTemplates?.map((template: any) => ({
          id: template.id,
          name: template.name,
          template: template.template,
          description: template.description,
        })),
      };
    } catch (error) {
      logger.error(`Error getting response formatting config ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get the default response formatting configuration for a user
   */
  getDefaultResponseFormattingConfig: async (
    userId: string,
  ): Promise<ResponseFormattingConfigData | null> => {
    try {
      const config = await ResponseFormattingConfig.findOne({
        where: { user_id: userId, is_default: true },
        include: [ResponseTemplate],
      });

      if (!config) return null;

      return {
        id: config.id,
        userId: config.user_id,
        name: config.name,
        enableMarkdown: config.enable_markdown,
        defaultHeadingLevel: config.default_heading_level,
        enableBulletPoints: config.enable_bullet_points,
        enableNumberedLists: config.enable_numbered_lists,
        enableEmphasis: config.enable_emphasis,
        responseVariability: config.response_variability,
        defaultTemplate: config.default_template,
        isDefault: config.is_default,
        customTemplates: config.ResponseTemplates?.map((template: any) => ({
          id: template.id,
          name: template.name,
          template: template.template,
          description: template.description,
        })),
      };
    } catch (error) {
      logger.error(
        `Error getting default response formatting config for user ${userId}:`,
        error,
      );
      throw error;
    }
  },

  /**
   * Create a new response formatting configuration
   */
  createResponseFormattingConfig: async (
    data: ResponseFormattingConfigData,
  ): Promise<ResponseFormattingConfigData> => {
    const sequelize = await getMySQLClient();
    const transaction = await sequelize.transaction();

    try {
      // If this is set as default, unset any existing default
      if (data.isDefault) {
        await ResponseFormattingConfig.update(
          { is_default: false },
          { where: { user_id: data.userId, is_default: true }, transaction },
        );
      }

      // Create the config
      const config = await ResponseFormattingConfig.create(
        {
          id: data.id || uuidv4(),
          user_id: data.userId,
          name: data.name,
          enable_markdown: data.enableMarkdown,
          default_heading_level: data.defaultHeadingLevel,
          enable_bullet_points: data.enableBulletPoints,
          enable_numbered_lists: data.enableNumberedLists,
          enable_emphasis: data.enableEmphasis,
          response_variability: data.responseVariability,
          default_template: data.defaultTemplate,
          is_default: data.isDefault || false,
        },
        { transaction },
      );

      // Create custom templates
      if (data.customTemplates && data.customTemplates.length > 0) {
        for (const templateData of data.customTemplates) {
          await ResponseTemplate.create(
            {
              id: templateData.id || uuidv4(),
              config_id: config.id,
              name: templateData.name,
              template: templateData.template,
              description: templateData.description,
            },
            { transaction },
          );
        }
      }

      await transaction.commit();

      // Return the created config with all related data
      return responseFormattingService.getResponseFormattingConfig(
        config.id,
      ) as Promise<ResponseFormattingConfigData>;
    } catch (error) {
      await transaction.rollback();
      logger.error("Error creating response formatting config:", error);
      throw error;
    }
  },

  /**
   * Update an existing response formatting configuration
   */
  updateResponseFormattingConfig: async (
    id: string,
    data: Partial<ResponseFormattingConfigData>,
  ): Promise<ResponseFormattingConfigData> => {
    const sequelize = await getMySQLClient();
    const transaction = await sequelize.transaction();

    try {
      const config = await ResponseFormattingConfig.findByPk(id);
      if (!config) {
        throw new Error(`Response formatting config with ID ${id} not found`);
      }

      // If this is set as default, unset any existing default
      if (data.isDefault) {
        await ResponseFormattingConfig.update(
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
          enable_markdown:
            data.enableMarkdown !== undefined
              ? data.enableMarkdown
              : config.enable_markdown,
          default_heading_level:
            data.defaultHeadingLevel !== undefined
              ? data.defaultHeadingLevel
              : config.default_heading_level,
          enable_bullet_points:
            data.enableBulletPoints !== undefined
              ? data.enableBulletPoints
              : config.enable_bullet_points,
          enable_numbered_lists:
            data.enableNumberedLists !== undefined
              ? data.enableNumberedLists
              : config.enable_numbered_lists,
          enable_emphasis:
            data.enableEmphasis !== undefined
              ? data.enableEmphasis
              : config.enable_emphasis,
          response_variability:
            data.responseVariability !== undefined
              ? data.responseVariability
              : config.response_variability,
          default_template:
            data.defaultTemplate !== undefined
              ? data.defaultTemplate
              : config.default_template,
          is_default:
            data.isDefault !== undefined ? data.isDefault : config.is_default,
        },
        { transaction },
      );

      // Update custom templates if provided
      if (data.customTemplates) {
        // Delete existing templates
        await ResponseTemplate.destroy({
          where: { config_id: id },
          transaction,
        });

        // Create new templates
        for (const templateData of data.customTemplates) {
          await ResponseTemplate.create(
            {
              id: templateData.id || uuidv4(),
              config_id: id,
              name: templateData.name,
              template: templateData.template,
              description: templateData.description,
            },
            { transaction },
          );
        }
      }

      await transaction.commit();

      // Return the updated config with all related data
      return responseFormattingService.getResponseFormattingConfig(
        id,
      ) as Promise<ResponseFormattingConfigData>;
    } catch (error) {
      await transaction.rollback();
      logger.error(`Error updating response formatting config ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a response formatting configuration
   */
  deleteResponseFormattingConfig: async (id: string): Promise<boolean> => {
    try {
      const result = await ResponseFormattingConfig.destroy({ where: { id } });
      return result > 0;
    } catch (error) {
      logger.error(`Error deleting response formatting config ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get all response templates
   */
  getResponseTemplates: async (): Promise<ResponseTemplateData[]> => {
    try {
      const templates = await ResponseTemplate.findAll({
        where: { config_id: null }, // Get global templates
      });

      return templates.map((template: any) => ({
        id: template.id,
        name: template.name,
        template: template.template,
        description: template.description,
      }));
    } catch (error) {
      logger.error("Error getting response templates:", error);
      throw error;
    }
  },

  /**
   * Get a specific response template
   */
  getResponseTemplate: async (
    id: string,
  ): Promise<ResponseTemplateData | null> => {
    try {
      const template = await ResponseTemplate.findByPk(id);
      if (!template) return null;

      return {
        id: template.id,
        name: template.name,
        template: template.template,
        description: template.description,
      };
    } catch (error) {
      logger.error(`Error getting response template ${id}:`, error);
      throw error;
    }
  },
};

export default responseFormattingService;
