// Moved from src/config/env.ts

export const env = {
  // Server configuration
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",

  // Database configuration
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: process.env.DB_PORT || 3306,
  DB_USER: process.env.DB_USER || "root",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_NAME: process.env.DB_NAME || "chat_admin",

  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  // AI service configuration
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY || "",

  // Supabase configuration
  SUPABASE_URL: process.env.VITE_SUPABASE_URL || "",
  SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || "",
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || "",

  // CORS configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || "100"),
};
