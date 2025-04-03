import { getMySQLClient, QueryTypes } from "@/services/mysqlClient";
import logger from "@/utils/logger";
import { v4 as uuidv4 } from "uuid";

export interface ContextRule {
  id: string;
  name: string;
  description: string;
  priority: number;
  isActive: boolean;
  conditions: {
    type: string;
    value: string;
    operator: string;
  }[];
  actions: {
    type: string;
    value: string;
    parameters?: Record<string, any>;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface ContextRulesResponse {
  rules: ContextRule[];
  totalCount: number;
}

/**
 * Service for managing context rules using MySQL
 */
const contextRulesService = {
  /**
   * Get all context rules
   * @param limit - Maximum number of rules to return
   * @param offset - Offset for pagination
   * @param includeInactive - Whether to include inactive rules
   * @returns Promise<ContextRulesResponse>
   */
  getContextRules: async (
    limit: number = 50,
    offset: number = 0,
    includeInactive: boolean = false,
  ): Promise<ContextRulesResponse> => {
    try {
      const sequelize = await getMySQLClient();

      // Build the query
      let whereClause = "";
      if (!includeInactive) {
        whereClause = "WHERE is_active = true";
      }

      // Get total count
      const [countResult] = await sequelize.query(
        `SELECT COUNT(*) as total FROM context_rules ${whereClause}`,
        { type: QueryTypes.SELECT },
      );

      // Get rules with pagination
      const rules = await sequelize.query(
        `SELECT * FROM context_rules ${whereClause} ORDER BY priority DESC LIMIT :limit OFFSET :offset`,
        {
          replacements: { limit, offset },
          type: QueryTypes.SELECT,
        },
      );

      // Parse JSON fields
      const parsedRules = rules.map((rule: any) => ({
        ...rule,
        conditions: JSON.parse(rule.conditions || "[]"),
        actions: JSON.parse(rule.actions || "[]"),
      }));

      return {
        rules: parsedRules,
        totalCount: countResult.total || 0,
      };
    } catch (error) {
      logger.error("Error in getContextRules:", error);
      throw error;
    }
  },

  /**
   * Get a context rule by ID
   * @param ruleId - The ID of the rule
   * @returns Promise<ContextRule | null>
   */
  getContextRuleById: async (ruleId: string): Promise<ContextRule | null> => {
    try {
      const sequelize = await getMySQLClient();

      const [rule] = await sequelize.query(
        "SELECT * FROM context_rules WHERE id = :ruleId",
        {
          replacements: { ruleId },
          type: QueryTypes.SELECT,
        },
      );

      if (!rule) {
        return null;
      }

      // Parse JSON fields
      return {
        ...rule,
        conditions: JSON.parse(rule.conditions || "[]"),
        actions: JSON.parse(rule.actions || "[]"),
      };
    } catch (error) {
      logger.error(`Error in getContextRuleById for ${ruleId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new context rule
   * @param rule - The rule to create
   * @returns Promise<ContextRule>
   */
  createContextRule: async (
    rule: Omit<ContextRule, "id" | "createdAt" | "updatedAt">,
  ): Promise<ContextRule> => {
    try {
      const sequelize = await getMySQLClient();
      const now = new Date().toISOString();
      const id = uuidv4();

      // Stringify JSON fields
      const conditions = JSON.stringify(rule.conditions || []);
      const actions = JSON.stringify(rule.actions || []);

      await sequelize.query(
        `INSERT INTO context_rules 
        (id, name, description, priority, is_active, conditions, actions, created_at, updated_at) 
        VALUES (:id, :name, :description, :priority, :isActive, :conditions, :actions, :createdAt, :updatedAt)`,
        {
          replacements: {
            id,
            name: rule.name,
            description: rule.description,
            priority: rule.priority,
            isActive: rule.isActive,
            conditions,
            actions,
            createdAt: now,
            updatedAt: now,
          },
          type: QueryTypes.INSERT,
        },
      );

      // Return the created rule
      return {
        id,
        ...rule,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      logger.error("Error in createContextRule:", error);
      throw error;
    }
  },

  /**
   * Update an existing context rule
   * @param ruleId - The ID of the rule to update
   * @param updates - The updates to apply
   * @returns Promise<ContextRule>
   */
  updateContextRule: async (
    ruleId: string,
    updates: Partial<Omit<ContextRule, "id" | "createdAt" | "updatedAt">>,
  ): Promise<ContextRule> => {
    try {
      const sequelize = await getMySQLClient();
      const now = new Date().toISOString();

      // Build SET clause and replacements
      const setClause = [];
      const replacements: any = { ruleId, updatedAt: now };

      if (updates.name !== undefined) {
        setClause.push("name = :name");
        replacements.name = updates.name;
      }

      if (updates.description !== undefined) {
        setClause.push("description = :description");
        replacements.description = updates.description;
      }

      if (updates.priority !== undefined) {
        setClause.push("priority = :priority");
        replacements.priority = updates.priority;
      }

      if (updates.isActive !== undefined) {
        setClause.push("is_active = :isActive");
        replacements.isActive = updates.isActive;
      }

      if (updates.conditions !== undefined) {
        setClause.push("conditions = :conditions");
        replacements.conditions = JSON.stringify(updates.conditions);
      }

      if (updates.actions !== undefined) {
        setClause.push("actions = :actions");
        replacements.actions = JSON.stringify(updates.actions);
      }

      // Always update the updated_at timestamp
      setClause.push("updated_at = :updatedAt");

      // Execute the update
      await sequelize.query(
        `UPDATE context_rules SET ${setClause.join(", ")} WHERE id = :ruleId`,
        {
          replacements,
          type: QueryTypes.UPDATE,
        },
      );

      // Get the updated rule
      return this.getContextRuleById(ruleId);
    } catch (error) {
      logger.error(`Error in updateContextRule for ${ruleId}:`, error);
      throw error;
    }
  },

  /**
   * Delete a context rule
   * @param ruleId - The ID of the rule to delete
   * @returns Promise<void>
   */
  deleteContextRule: async (ruleId: string): Promise<void> => {
    try {
      const sequelize = await getMySQLClient();

      await sequelize.query("DELETE FROM context_rules WHERE id = :ruleId", {
        replacements: { ruleId },
        type: QueryTypes.DELETE,
      });
    } catch (error) {
      logger.error(`Error in deleteContextRule for ${ruleId}:`, error);
      throw error;
    }
  },

  /**
   * Update rule priorities
   * @param rulePriorities - Object mapping rule IDs to their new priorities
   * @returns Promise<void>
   */
  updateRulePriorities: async (
    rulePriorities: Record<string, number>,
  ): Promise<void> => {
    try {
      const sequelize = await getMySQLClient();
      const now = new Date().toISOString();

      // Use a transaction to ensure all updates succeed or fail together
      const transaction = await sequelize.transaction();

      try {
        // Update each rule's priority
        for (const [ruleId, priority] of Object.entries(rulePriorities)) {
          await sequelize.query(
            "UPDATE context_rules SET priority = :priority, updated_at = :updatedAt WHERE id = :ruleId",
            {
              replacements: { ruleId, priority, updatedAt: now },
              type: QueryTypes.UPDATE,
              transaction,
            },
          );
        }

        // Commit the transaction
        await transaction.commit();
      } catch (error) {
        // Rollback the transaction on error
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      logger.error("Error in updateRulePriorities:", error);
      throw error;
    }
  },

  /**
   * Toggle rule active status
   * @param ruleId - The ID of the rule
   * @param isActive - The new active status
   * @returns Promise<ContextRule>
   */
  toggleRuleStatus: async (
    ruleId: string,
    isActive: boolean,
  ): Promise<ContextRule> => {
    try {
      const sequelize = await getMySQLClient();
      const now = new Date().toISOString();

      await sequelize.query(
        "UPDATE context_rules SET is_active = :isActive, updated_at = :updatedAt WHERE id = :ruleId",
        {
          replacements: { ruleId, isActive, updatedAt: now },
          type: QueryTypes.UPDATE,
        },
      );

      // Get the updated rule
      return this.getContextRuleById(ruleId);
    } catch (error) {
      logger.error(`Error in toggleRuleStatus for ${ruleId}:`, error);
      throw error;
    }
  },
};

export default contextRulesService;
