-- Add WebSocket support to the database schema

-- Add session_id column to chat_messages table if it doesn't exist
ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS session_id VARCHAR(36) NOT NULL,
ADD INDEX idx_chat_messages_session_id (session_id);

-- Add session_id column to chat_sessions table if it doesn't exist
ALTER TABLE chat_sessions
ADD COLUMN IF NOT EXISTS session_id VARCHAR(36) NOT NULL,
ADD UNIQUE INDEX idx_chat_sessions_session_id (session_id);

-- Create websocket_connections table
CREATE TABLE IF NOT EXISTS websocket_connections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  connection_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36),
  session_id VARCHAR(36),
  client_info JSON,
  connected_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_activity DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_authenticated BOOLEAN NOT NULL DEFAULT FALSE,
  status ENUM('connected', 'disconnected', 'idle') NOT NULL DEFAULT 'connected',
  UNIQUE INDEX idx_websocket_connections_connection_id (connection_id),
  INDEX idx_websocket_connections_user_id (user_id),
  INDEX idx_websocket_connections_session_id (session_id)
);
