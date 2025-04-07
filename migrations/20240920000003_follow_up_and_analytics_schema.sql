-- Follow-up Questions and Analytics Schema

-- Create follow_up_configs table
CREATE TABLE IF NOT EXISTS follow_up_configs (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  is_enabled TINYINT(1) DEFAULT 1,
  max_questions INT DEFAULT 3,
  display_mode ENUM('buttons', 'chips', 'list') DEFAULT 'buttons',
  generate_dynamically TINYINT(1) DEFAULT 0,
  ai_prompt TEXT,
  is_default TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create follow_up_questions table
CREATE TABLE IF NOT EXISTS follow_up_questions (
  id VARCHAR(36) PRIMARY KEY,
  config_id VARCHAR(36) NOT NULL,
  question VARCHAR(255) NOT NULL,
  display_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  category VARCHAR(50) DEFAULT 'general',
  tags JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (config_id) REFERENCES follow_up_configs(id) ON DELETE CASCADE
);

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  event_type VARCHAR(100) NOT NULL,
  event_data JSON,
  session_id VARCHAR(36),
  ip_address VARCHAR(45),
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_analytics_user_id (user_id),
  INDEX idx_analytics_event_type (event_type),
  INDEX idx_analytics_timestamp (timestamp),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Add indexes for performance
CREATE INDEX idx_follow_up_configs_user_id ON follow_up_configs(user_id);
CREATE INDEX idx_follow_up_configs_is_default ON follow_up_configs(is_default);
CREATE INDEX idx_follow_up_questions_config_id ON follow_up_questions(config_id);
CREATE INDEX idx_follow_up_questions_category ON follow_up_questions(category);

-- Add realtime support
ALTER PUBLICATION supabase_realtime ADD TABLE follow_up_configs;
ALTER PUBLICATION supabase_realtime ADD TABLE follow_up_questions;
ALTER PUBLICATION supabase_realtime ADD TABLE analytics_events;
