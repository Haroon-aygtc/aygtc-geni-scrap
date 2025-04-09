-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY DEFAULT UUID(),
  auth_id CHAR(36),
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSON DEFAULT (JSON_OBJECT()),
  last_login_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_auth_id (auth_id),
  UNIQUE KEY unique_email (email)
);

-- System Settings
CREATE TABLE IF NOT EXISTS system_settings (
  id CHAR(36) PRIMARY KEY DEFAULT UUID(),
  category VARCHAR(100) NOT NULL,
  settings JSON NOT NULL,
  environment VARCHAR(50) DEFAULT 'production',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_category_env (category, environment)
);
