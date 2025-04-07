/**
 * MySQL Client
 *
 * This file provides a singleton instance of the Sequelize client for MySQL.
 * It handles connection pooling and reconnection automatically.
 */

// Import Sequelize using named imports instead of default import
import { Sequelize, DataTypes, QueryTypes } from "sequelize";
import logger from "./utils/logger.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file in the root directory
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Default database configuration based on environment variables
const dbConfig = {
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "chat_admin",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  dialect: "mysql",
  logging:
    process.env.DB_LOGGING === "true" ? (msg) => logger.debug(msg) : false,
  pool: {
    max: parseInt(process.env.DB_POOL_MAX || "5", 10),
    min: parseInt(process.env.DB_POOL_MIN || "0", 10),
    acquire: parseInt(process.env.DB_POOL_ACQUIRE || "30000", 10),
    idle: parseInt(process.env.DB_POOL_IDLE || "10000", 10),
  },
  dialectOptions: {
    dateStrings: true,
    typeCast: true,
  },
};

let sequelizeInstance = null;

/**
 * Get a MySQL client instance
 * @returns {Promise<Sequelize>} A Sequelize instance
 */
export const getMySQLClient = async () => {
  if (sequelizeInstance) {
    return sequelizeInstance;
  }

  try {
    // Use the direct configuration instead of environment-specific config
    const config = {
      database: dbConfig.database,
      username: dbConfig.username,
      password: dbConfig.password,
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: "mysql",
      logging: dbConfig.logging,
      pool: dbConfig.pool,
      dialectOptions: dbConfig.dialectOptions,
    };

    // Create a new Sequelize instance
    sequelizeInstance = new Sequelize(
      config.database,
      config.username,
      config.password,
      {
        host: config.host,
        port: config.port,
        dialect: "mysql",
        logging: config.logging ? (msg) => logger.debug(msg) : false,
        pool: config.pool,
        dialectOptions: config.dialectOptions,
        define: {
          timestamps: true,
          underscored: true,
          createdAt: "created_at",
          updatedAt: "updated_at",
        },
        retry: {
          max: 5,
          match: [
            /SequelizeConnectionError/,
            /SequelizeConnectionRefusedError/,
            /SequelizeHostNotFoundError/,
            /SequelizeHostNotReachableError/,
            /SequelizeInvalidConnectionError/,
            /SequelizeConnectionTimedOutError/,
          ],
        },
      },
    );

    // Test the connection
    await sequelizeInstance.authenticate();
    logger.info("MySQL connection has been established successfully.");

    return sequelizeInstance;
  } catch (error) {
    logger.error("Unable to connect to the MySQL database:", error);
    throw error;
  }
};

/**
 * Close the MySQL connection
 */
export const closeMySQLConnection = async () => {
  if (sequelizeInstance) {
    await sequelizeInstance.close();
    sequelizeInstance = null;
    logger.info("MySQL connection closed.");
  }
};

/**
 * Execute a raw SQL query
 * @param {string} sql - The SQL query to execute
 * @param {Object} options - Query options
 * @returns {Promise<any>} Query results
 */
export const executeRawQuery = async (sql, options = {}) => {
  const sequelize = await getMySQLClient();
  try {
    return await sequelize.query(sql, {
      type: options.type || QueryTypes.SELECT,
      replacements: options.replacements || {},
      ...options,
    });
  } catch (error) {
    logger.error(`Error executing raw query: ${sql}`, error);
    throw error;
  }
};

// Export Sequelize types for convenience
export { DataTypes, QueryTypes };

// Export default for compatibility
export default getMySQLClient;
