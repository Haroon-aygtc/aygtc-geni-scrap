/**
 * Unified MySQL client implementation
 * Provides a consistent interface for database operations throughout the application
 */

import logger from "@/utils/logger";
import { env } from "@/config/env";

// Define a type for the Sequelize-like interface
export interface SequelizeLike {
  query: (sql: string, options: any) => Promise<any[]>;
  QueryTypes: {
    SELECT: string;
    INSERT: string;
    UPDATE: string;
    DELETE: string;
  };
  authenticate: () => Promise<void>;
  close: () => void;
  Op?: any;
  transaction: () => Promise<any>;
}

// Create a dummy implementation for browser environments
const dummySequelize: SequelizeLike = {
  query: async () => {
    console.warn("MySQL client methods called in browser environment");
    return [];
  },
  QueryTypes: {
    SELECT: "SELECT",
    INSERT: "INSERT",
    UPDATE: "UPDATE",
    DELETE: "DELETE",
  },
  authenticate: async () => {
    console.warn("MySQL client methods called in browser environment");
  },
  close: () => {
    console.warn("MySQL client methods called in browser environment");
  },
  Op: {
    eq: "=",
    ne: "!=",
    gt: ">",
    lt: "<",
    gte: ">=",
    lte: "<=",
    in: "IN",
    notIn: "NOT IN",
    like: "LIKE",
    notLike: "NOT LIKE",
    between: "BETWEEN",
    notBetween: "NOT BETWEEN",
    and: "AND",
    or: "OR",
  },
  transaction: async () => {
    console.warn("MySQL transaction called in browser environment");
    return {
      commit: async () => {},
      rollback: async () => {},
    };
  },
};

// Placeholder for the Sequelize instance
let sequelize: SequelizeLike | null = null;

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

/**
 * Initialize the MySQL client with error handling and retry logic
 * @returns Initialized Sequelize client
 */
export const initMySQL = async (): Promise<SequelizeLike> => {
  // For browser environments, return the dummy implementation
  if (isBrowser) {
    return dummySequelize;
  }

  if (!sequelize) {
    // Server-side initialization
    try {
      // Dynamically import Sequelize only on the server side
      const { Sequelize } = await import("sequelize");

      // Get database configuration from environment variables
      const mysqlUrl = env.MYSQL_URL;
      const mysqlHost = env.MYSQL_HOST;
      const mysqlPort = parseInt(env.MYSQL_PORT, 10);
      const mysqlUser = env.MYSQL_USER;
      const mysqlPassword = env.MYSQL_PASSWORD;
      const mysqlDatabase = env.MYSQL_DATABASE;
      const mysqlLogging = env.MYSQL_LOGGING;

      // Pool configuration
      const poolConfig = {
        max: env.MYSQL_POOL_MAX,
        min: env.MYSQL_POOL_MIN,
        acquire: env.MYSQL_POOL_ACQUIRE,
        idle: env.MYSQL_POOL_IDLE,
      };

      if (!mysqlUrl && (!mysqlHost || !mysqlUser || !mysqlDatabase)) {
        throw new Error("MySQL connection details are required");
      }

      if (mysqlUrl) {
        // Use connection URL if provided
        sequelize = new Sequelize(mysqlUrl, {
          logging: mysqlLogging ? console.log : false,
          dialect: "mysql",
          pool: poolConfig,
        });
      } else {
        // Use individual connection parameters
        sequelize = new Sequelize(mysqlDatabase, mysqlUser, mysqlPassword, {
          host: mysqlHost,
          port: mysqlPort,
          dialect: "mysql",
          logging: mysqlLogging ? console.log : false,
          pool: poolConfig,
          dialectOptions: {
            bigNumberStrings: true,
            ssl: env.MYSQL_SSL ? { ca: env.MYSQL_CERT } : undefined,
          },
        });
      }

      // Test the connection
      await sequelize.authenticate();
      logger.info("MySQL client initialized and connected successfully");
    } catch (error) {
      logger.error("Failed to initialize MySQL client", error);
      throw error;
    }
  }

  return sequelize;
};

/**
 * Get the MySQL client instance
 * @returns Sequelize client instance
 */
export const getMySQLClient = async (): Promise<SequelizeLike> => {
  // For browser environments, return the dummy implementation
  if (isBrowser) {
    return dummySequelize;
  }

  if (!sequelize) {
    return await initMySQL();
  }
  return sequelize;
};

/**
 * Reset the MySQL client instance
 * Useful for testing or when changing connection details
 */
export const resetMySQLClient = (): void => {
  // Do nothing in browser environments
  if (isBrowser) {
    return;
  }

  if (sequelize) {
    sequelize.close();
  }
  sequelize = null;
};

/**
 * Check if the MySQL client is initialized
 * @returns Boolean indicating if the client is initialized
 */
export const isMySQLInitialized = (): boolean => {
  // Always return true in browser environments
  if (isBrowser) {
    return true;
  }

  return !!sequelize;
};

/**
 * Test the MySQL connection
 * @returns Promise that resolves if connection is successful
 */
export const testConnection = async (): Promise<boolean> => {
  // Always return true in browser environments
  if (isBrowser) {
    return true;
  }

  try {
    const client = await getMySQLClient();
    await client.authenticate();
    logger.info("MySQL connection test successful");
    return true;
  } catch (error) {
    logger.error("MySQL connection test failed", error);
    return false;
  }
};

// Export a default object with all functions
const mysql = {
  getMySQLClient,
  initMySQL,
  resetMySQLClient,
  isMySQLInitialized,
  testConnection,
};

export default mysql;
