/**
 * Production-ready MySQL client implementation
 * Provides a consistent interface for database operations throughout the application
 */

import logger from "@/utils/logger";
import { env } from "../server/config/env.ts";
import { v4 as uuidv4 } from "uuid";

// Define QueryTypes for use in query operations
export const QueryTypes = {
  SELECT: "SELECT",
  INSERT: "INSERT",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
};

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

// Define the interface for our Sequelize client
export interface SequelizeClient {
  query: (sql: string, options: any) => Promise<any[]>;
  authenticate: () => Promise<void>;
  close: () => void;
  Op?: any;
  transaction: (options?: any) => Promise<any>;
  models?: any;
}

// Placeholder for the Sequelize instance
let sequelizeInstance: SequelizeClient | null = null;

/**
 * Initialize the MySQL client
 * @returns Initialized Sequelize client
 */
export const initMySQL = async (): Promise<SequelizeClient> => {
  if (isBrowser) {
    throw new Error(
      "MySQL client cannot be initialized in browser environment",
    );
  }

  if (!sequelizeInstance) {
    try {
      // Dynamically import Sequelize only on the server side
      const { Sequelize, Op, DataTypes } = await import("sequelize");

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

      let sequelize;

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

      // Add Op to the sequelize instance
      sequelize.Op = Op;

      // Define models
      const ChatSession = sequelize.define(
        "ChatSession",
        {
          id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
          },
          session_id: {
            type: DataTypes.STRING(36),
            allowNull: false,
            unique: true,
            defaultValue: () => uuidv4(),
          },
          user_id: {
            type: DataTypes.STRING(36),
            allowNull: true,
          },
          widget_id: {
            type: DataTypes.STRING(36),
            allowNull: true,
          },
          status: {
            type: DataTypes.ENUM("active", "closed", "archived"),
            allowNull: false,
            defaultValue: "active",
          },
          metadata: {
            type: DataTypes.JSON,
            allowNull: true,
          },
          created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
          },
          updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
          },
        },
        {
          tableName: "chat_sessions",
          timestamps: true,
          createdAt: "created_at",
          updatedAt: "updated_at",
        },
      );

      const ChatMessage = sequelize.define(
        "ChatMessage",
        {
          id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
          },
          message_id: {
            type: DataTypes.STRING(36),
            allowNull: false,
            unique: true,
            defaultValue: () => uuidv4(),
          },
          session_id: {
            type: DataTypes.STRING(36),
            allowNull: false,
          },
          user_id: {
            type: DataTypes.STRING(36),
            allowNull: true,
          },
          content: {
            type: DataTypes.TEXT,
            allowNull: false,
          },
          type: {
            type: DataTypes.ENUM("user", "assistant", "system"),
            allowNull: false,
          },
          metadata: {
            type: DataTypes.JSON,
            allowNull: true,
          },
          created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
          },
        },
        {
          tableName: "chat_messages",
          timestamps: true,
          createdAt: "created_at",
          updatedAt: false,
        },
      );

      const WebSocketConnection = sequelize.define(
        "WebSocketConnection",
        {
          id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
          },
          connection_id: {
            type: DataTypes.STRING(36),
            allowNull: false,
            unique: true,
          },
          user_id: {
            type: DataTypes.STRING(36),
            allowNull: true,
          },
          session_id: {
            type: DataTypes.STRING(36),
            allowNull: true,
          },
          client_info: {
            type: DataTypes.JSON,
            allowNull: true,
          },
          connected_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
          },
          last_activity: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
          },
          is_authenticated: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
          },
          status: {
            type: DataTypes.ENUM("connected", "disconnected", "idle"),
            allowNull: false,
            defaultValue: "connected",
          },
        },
        {
          tableName: "websocket_connections",
          timestamps: false,
        },
      );

      // Define relationships
      ChatSession.hasMany(ChatMessage, {
        foreignKey: "session_id",
        sourceKey: "session_id",
      });
      ChatMessage.belongsTo(ChatSession, {
        foreignKey: "session_id",
        targetKey: "session_id",
      });

      // Add models to sequelize instance
      sequelize.models = {
        ChatSession,
        ChatMessage,
        WebSocketConnection,
      };

      // Test the connection
      await sequelize.authenticate();
      logger.info("MySQL client initialized and connected successfully");

      sequelizeInstance = sequelize;
    } catch (error) {
      logger.error("Failed to initialize MySQL client", error);
      throw error;
    }
  }

  return sequelizeInstance;
};

/**
 * Get the MySQL client instance
 * @returns Sequelize client instance
 */
export const getMySQLClient = async (): Promise<SequelizeClient> => {
  if (isBrowser) {
    throw new Error("MySQL client cannot be used in browser environment");
  }

  if (!sequelizeInstance) {
    return await initMySQL();
  }
  return sequelizeInstance;
};

/**
 * Reset the MySQL client instance
 * Useful for testing or when changing connection details
 */
export const resetMySQLClient = (): void => {
  if (isBrowser) {
    return;
  }

  if (sequelizeInstance) {
    sequelizeInstance.close();
  }
  sequelizeInstance = null;
};

/**
 * Check if the MySQL client is initialized
 * @returns Boolean indicating if the client is initialized
 */
export const isMySQLInitialized = (): boolean => {
  if (isBrowser) {
    return false;
  }

  return !!sequelizeInstance;
};

/**
 * Test the MySQL connection
 * @returns Promise that resolves if connection is successful
 */
export const testConnection = async (): Promise<boolean> => {
  if (isBrowser) {
    throw new Error("MySQL connection cannot be tested in browser environment");
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

/**
 * Get chat sessions from the database
 */
export const getChatSessions = async (filters: any = {}): Promise<any[]> => {
  if (isBrowser) {
    throw new Error(
      "MySQL operations cannot be performed in browser environment",
    );
  }

  try {
    const client = await getMySQLClient();
    const { ChatSession } = client.models;
    const sessions = await ChatSession.findAll({ where: filters });
    return sessions;
  } catch (error) {
    logger.error("Failed to get chat sessions", error);
    throw error;
  }
};

/**
 * Get chat messages for a session from the database
 */
export const getChatMessages = async (sessionId: string): Promise<any[]> => {
  if (isBrowser) {
    throw new Error(
      "MySQL operations cannot be performed in browser environment",
    );
  }

  try {
    const client = await getMySQLClient();
    const { ChatMessage } = client.models;
    const messages = await ChatMessage.findAll({
      where: { session_id: sessionId },
      order: [["created_at", "ASC"]],
    });
    return messages;
  } catch (error) {
    logger.error(`Failed to get chat messages for session ${sessionId}`, error);
    throw error;
  }
};

/**
 * Create a new chat session in the database
 */
export const createChatSession = async (sessionData: any): Promise<any> => {
  if (isBrowser) {
    throw new Error(
      "MySQL operations cannot be performed in browser environment",
    );
  }

  try {
    const client = await getMySQLClient();
    const { ChatSession } = client.models;
    const session = await ChatSession.create(sessionData);
    return session;
  } catch (error) {
    logger.error("Failed to create chat session", error);
    throw error;
  }
};

/**
 * Create a new chat message in the database
 */
export const createChatMessage = async (messageData: any): Promise<any> => {
  if (isBrowser) {
    throw new Error(
      "MySQL operations cannot be performed in browser environment",
    );
  }

  try {
    const client = await getMySQLClient();
    const { ChatMessage } = client.models;
    const message = await ChatMessage.create(messageData);
    return message;
  } catch (error) {
    logger.error("Failed to create chat message", error);
    throw error;
  }
};

/**
 * Update a chat session in the database
 */
export const updateChatSession = async (
  sessionId: string,
  updateData: any,
): Promise<any> => {
  if (isBrowser) {
    throw new Error(
      "MySQL operations cannot be performed in browser environment",
    );
  }

  try {
    const client = await getMySQLClient();
    const { ChatSession } = client.models;
    const [updated, sessions] = await ChatSession.update(updateData, {
      where: { session_id: sessionId },
      returning: true,
    });
    return updated > 0 ? sessions[0] : null;
  } catch (error) {
    logger.error(`Failed to update chat session ${sessionId}`, error);
    throw error;
  }
};

/**
 * Record a WebSocket connection in the database
 */
export const recordWebSocketConnection = async (
  connectionData: any,
): Promise<any> => {
  if (isBrowser) {
    throw new Error(
      "MySQL operations cannot be performed in browser environment",
    );
  }

  try {
    const client = await getMySQLClient();
    const { WebSocketConnection } = client.models;
    const connection = await WebSocketConnection.create(connectionData);
    return connection;
  } catch (error) {
    logger.error("Failed to record WebSocket connection", error);
    throw error;
  }
};

/**
 * Update a WebSocket connection in the database
 */
export const updateWebSocketConnection = async (
  connectionId: string,
  updateData: any,
): Promise<any> => {
  if (isBrowser) {
    throw new Error(
      "MySQL operations cannot be performed in browser environment",
    );
  }

  try {
    const client = await getMySQLClient();
    const { WebSocketConnection } = client.models;
    const [updated] = await WebSocketConnection.update(updateData, {
      where: { connection_id: connectionId },
    });
    return updated > 0;
  } catch (error) {
    logger.error(
      `Failed to update WebSocket connection ${connectionId}`,
      error,
    );
    throw error;
  }
};

// Export a default object with all functions
const mysql = {
  getMySQLClient,
  initMySQL,
  resetMySQLClient,
  isMySQLInitialized,
  testConnection,
  QueryTypes,
  getChatSessions,
  getChatMessages,
  createChatSession,
  createChatMessage,
  updateChatSession,
  recordWebSocketConnection,
  updateWebSocketConnection,
};

export default mysql;
