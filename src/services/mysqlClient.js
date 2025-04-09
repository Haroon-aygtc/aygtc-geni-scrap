/**
 * MySQL Client Service
 * Provides a singleton instance for database connection and operations
 */

// Import Sequelize using named imports instead of default import
import { Sequelize, DataTypes, QueryTypes } from "sequelize";
import dotenv from "dotenv";
import path from "path";

// Simple logger implementation to avoid dependency on external logger
const logger = {
  info: (message) => console.info(`[INFO] ${message}`),
  error: (message, error) => console.error(`[ERROR] ${message}`, error),
  debug: (message) => console.debug(`[DEBUG] ${message}`),
  warn: (message) => console.warn(`[WARN] ${message}`),
};

dotenv.config();

let sequelizeInstance = null;

/**
 * Get MySQL client singleton instance
 * @returns {Sequelize} Sequelize instance
 */
export const getMySQLClient = () => {
  if (sequelizeInstance) {
    return sequelizeInstance;
  }

  try {
    const host = process.env.DB_HOST || "localhost";
    const port = parseInt(process.env.DB_PORT || "3306", 10);
    const database = process.env.DB_NAME || "chat_system";
    const username = process.env.DB_USER || "root";
    const password = process.env.DB_PASSWORD || "";

    logger.info(`Connecting to MySQL database at ${host}:${port}/${database}`);

    sequelizeInstance = new Sequelize(database, username, password, {
      host,
      port,
      dialect: "mysql",
      logging: (msg) => logger.debug(msg),
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      define: {
        timestamps: true,
        underscored: true,
      },
    });

    return sequelizeInstance;
  } catch (error) {
    logger.error("Error creating MySQL connection", error);
    throw error;
  }
};

/**
 * Close the MySQL connection
 */
export const closeMySQLConnection = async () => {
  if (sequelizeInstance) {
    try {
      await sequelizeInstance.close();
      sequelizeInstance = null;
      logger.info("MySQL connection closed");
    } catch (error) {
      logger.error("Error closing MySQL connection", error);
      throw error;
    }
  }
};

/**
 * Execute a raw SQL query
 * @param {string} sql - SQL query to execute
 * @param {Object} options - Query options
 * @returns {Promise<any>} Query results
 */
export const executeRawQuery = async (sql, options = {}) => {
  const client = getMySQLClient();
  try {
    const queryType = options.type || QueryTypes.SELECT;
    const result = await client.query(sql, {
      type: queryType,
      replacements: options.replacements || {},
      plain: options.plain || false,
      raw: options.raw !== undefined ? options.raw : true,
      transaction: options.transaction,
    });
    return result;
  } catch (error) {
    logger.error(`Error executing SQL query: ${sql}`, error);
    throw error;
  }
};

// Export the getMySQLClient function as both named and default export
export { getMySQLClient as default };
