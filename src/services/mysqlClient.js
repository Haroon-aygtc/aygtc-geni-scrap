/**
 * MySQL Client
 *
 * This file provides a singleton instance of the Sequelize client for MySQL.
 * It handles connection pooling and reconnection automatically.
 */

// Import Sequelize using named imports instead of default import
import { Sequelize, DataTypes, QueryTypes } from "sequelize";
import dbConfig from "../config/database.js";

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
    // Get the current environment
    const env = process.env.NODE_ENV || "development";
    const config = dbConfig[env];

    // Create a new Sequelize instance
    sequelizeInstance = new Sequelize(
      config.database,
      config.username,
      config.password,
      {
        host: config.host,
        port: config.port,
        dialect: "mysql",
        logging: config.logging,
        pool: config.pool,
        dialectOptions: config.dialectOptions,
        define: {
          timestamps: true,
          underscored: true,
          createdAt: "created_at",
          updatedAt: "updated_at",
        },
      },
    );

    // Test the connection
    await sequelizeInstance.authenticate();
    console.log("MySQL connection has been established successfully.");

    return sequelizeInstance;
  } catch (error) {
    console.error("Unable to connect to the MySQL database:", error);
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
    console.log("MySQL connection closed.");
  }
};

// Export Sequelize types for convenience
export { DataTypes, QueryTypes };

// Export default for compatibility
export default getMySQLClient;
