/**
 * Widget Configuration Service
 *
 * This service handles interactions with widget configurations using the API layer
 * instead of direct database access.
 */

import logger from "@/utils/logger";
import { api } from "./api/middleware/apiMiddleware";

export interface WidgetConfig {
  id?: string;
  initiallyOpen: boolean;
  contextMode: "restricted" | "open" | "custom";
  contextName: string;
  title: string;
  primaryColor: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  showOnMobile?: boolean;
  isActive?: boolean;
  isDefault?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Service for managing widget configurations using the API layer
 */
export const widgetConfigService = {
  /**
   * Get the default active widget configuration
   * If no default configuration exists, create one
   */
  getDefaultWidgetConfig: async (): Promise<WidgetConfig> => {
    try {
      const response = await api.get<WidgetConfig>("/widgets/default");

      if (response.success && response.data) {
        return response.data;
      }

      // No default configuration found, create one
      logger.info("No default widget configuration found, creating one");

      const defaultConfig: Omit<
        WidgetConfig,
        "id" | "createdAt" | "updatedAt"
      > = {
        initiallyOpen: false,
        contextMode: "open",
        contextName: "General",
        title: "Chat Assistant",
        primaryColor: "#6366f1",
        position: "bottom-right",
        showOnMobile: true,
        isActive: true,
        isDefault: true,
      };

      // Create a new default configuration
      return await widgetConfigService.createWidgetConfig(defaultConfig);
    } catch (error) {
      logger.error("Error fetching or creating widget configuration", error);

      // Return a fallback configuration if API calls fail completely
      return {
        initiallyOpen: false,
        contextMode: "open",
        contextName: "General",
        title: "Chat Assistant",
        primaryColor: "#6366f1",
        position: "bottom-right",
        showOnMobile: true,
        isActive: true,
        isDefault: true,
      };
    }
  },

  /**
   * Create a new widget configuration
   */
  createWidgetConfig: async (
    config: Omit<WidgetConfig, "id" | "createdAt" | "updatedAt">,
  ): Promise<WidgetConfig> => {
    try {
      const response = await api.post<WidgetConfig>("/widgets", config);

      if (!response.success || !response.data) {
        throw new Error(
          response.error?.message || "Failed to create widget configuration",
        );
      }

      return response.data;
    } catch (error) {
      logger.error("Error creating widget configuration", error);
      throw error;
    }
  },

  /**
   * Update an existing widget configuration
   */
  updateWidgetConfig: async (
    id: string,
    config: Partial<WidgetConfig>,
  ): Promise<WidgetConfig> => {
    try {
      const response = await api.put<WidgetConfig>(`/widgets/${id}`, config);

      if (!response.success || !response.data) {
        throw new Error(
          response.error?.message || "Failed to update widget configuration",
        );
      }

      return response.data;
    } catch (error) {
      logger.error(`Error updating widget configuration with ID ${id}`, error);
      throw error;
    }
  },

  /**
   * Get all widget configurations
   */
  getAllWidgetConfigs: async (): Promise<WidgetConfig[]> => {
    try {
      const response = await api.get<WidgetConfig[]>("/widgets");

      if (!response.success) {
        throw new Error(
          response.error?.message || "Failed to fetch widget configurations",
        );
      }

      return response.data || [];
    } catch (error) {
      logger.error("Error fetching all widget configurations", error);
      throw error;
    }
  },

  /**
   * Delete a widget configuration
   */
  deleteWidgetConfig: async (id: string): Promise<boolean> => {
    try {
      const response = await api.delete<{ success: boolean }>(`/widgets/${id}`);

      if (!response.success) {
        throw new Error(
          response.error?.message || "Failed to delete widget configuration",
        );
      }

      return true;
    } catch (error) {
      logger.error(`Error deleting widget configuration with ID ${id}`, error);
      throw error;
    }
  },
};

export default widgetConfigService;
