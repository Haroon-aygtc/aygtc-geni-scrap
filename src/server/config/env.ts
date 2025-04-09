/**
 * Environment configuration
 * Centralizes all environment variable access
 */

// Default values for development
const defaults = {
  API_BASE_URL: "/api",
  DEV: process.env.NODE_ENV !== "production",
};

// Environment variables with type safety
export const env = {
  // API Configuration
  API_BASE_URL: process.env.VITE_API_BASE_URL || defaults.API_BASE_URL,

  // Environment
  DEV: process.env.NODE_ENV !== "production",

  // MySQL Configuration
  MYSQL_URL: process.env.MYSQL_URL || "",
  MYSQL_HOST: process.env.MYSQL_HOST || "localhost",
  MYSQL_PORT: process.env.MYSQL_PORT || "3306",
  MYSQL_USER: process.env.MYSQL_USER || "root",
  MYSQL_PASSWORD: process.env.MYSQL_PASSWORD || "",
  MYSQL_DATABASE: process.env.MYSQL_DATABASE || "chat_system",
  MYSQL_LOGGING: process.env.MYSQL_LOGGING === "true",
  MYSQL_SSL: process.env.MYSQL_SSL === "true",
  MYSQL_CERT: process.env.MYSQL_CERT || "",

  // Connection Pool Configuration
  MYSQL_POOL_MAX: parseInt(process.env.MYSQL_POOL_MAX || "10", 10),
  MYSQL_POOL_MIN: parseInt(process.env.MYSQL_POOL_MIN || "0", 10),
  MYSQL_POOL_ACQUIRE: parseInt(process.env.MYSQL_POOL_ACQUIRE || "30000", 10),
  MYSQL_POOL_IDLE: parseInt(process.env.MYSQL_POOL_IDLE || "10000", 10),
};

// Export a function to get all environment variables (useful for debugging)
export const getAllEnv = () => {
  return { ...env };
};

export default env;
