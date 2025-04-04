/**
 * MySQL Client
 *
 * This file provides a singleton instance of the Sequelize client for MySQL.
 * It handles connection pooling and reconnection automatically.
 */

import { Sequelize, DataTypes, QueryTypes } from "sequelize";
import dbConfig from "@/config/database.js";

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
    sequelizeInstance = new Sequelize({
      database: dbConfig.database,
      username: dbConfig.username,
      password: dbConfig.password,
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: "mysql",
      logging: dbConfig.logging,
      pool: dbConfig.pool,
      define: {
        timestamps: true,
        underscored: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
    });

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
