-- Chat Sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
  id CHAR(36) PRIMARY KEY DEFAULT UUID(),
  session_id VARCHAR(255) NOT NULL,
  user_id CHAR(36) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSON DEFAULT (JSON_OBJECT()),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_session_id (session_id)
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id CHAR(36) PRIMARY KEY DEFAULT UUID(),
  session_id VARCHAR(255) NOT NULL,
  user_id CHAR(36) NOT NULL,
  message TEXT NOT NULL,
  message_type VARCHAR(50) NOT NULL,
  metadata JSON DEFAULT (JSON_OBJECT()),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES chat_sessions(session_id) ON DELETE CASCADE
);

-- Indexes and Trigger
CREATE INDEX idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_active ON chat_sessions(is_active);
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_user ON chat_messages(user_id);

DELIMITER //
CREATE TRIGGER update_session_last_message
AFTER INSERT ON chat_messages
FOR EACH ROW
BEGIN
  UPDATE chat_sessions 
  SET last_message_at = NEW.created_at,
      updated_at = NEW.created_at
  WHERE session_id = NEW.session_id;
END //
DELIMITER ;
