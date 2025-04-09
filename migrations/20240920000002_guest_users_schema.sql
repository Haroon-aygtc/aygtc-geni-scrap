-- Guest Users Schema

-- Create guest_users table
CREATE TABLE IF NOT EXISTS guest_users (
  id VARCHAR(36) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  status ENUM('active', 'inactive', 'blocked') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create guest_sessions table
CREATE TABLE IF NOT EXISTS guest_sessions (
  id VARCHAR(36) PRIMARY KEY,
  guest_id VARCHAR(36) NOT NULL,
  session_token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (guest_id) REFERENCES guest_users(id) ON DELETE CASCADE
);

-- Create guest_activities table
CREATE TABLE IF NOT EXISTS guest_activities (
  id VARCHAR(36) PRIMARY KEY,
  guest_id VARCHAR(36) NOT NULL,
  action VARCHAR(255) NOT NULL,
  metadata JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (guest_id) REFERENCES guest_users(id) ON DELETE CASCADE
);

-- Add index for performance
CREATE INDEX idx_guest_sessions_guest_id ON guest_sessions(guest_id);
CREATE INDEX idx_guest_activities_guest_id ON guest_activities(guest_id);
CREATE INDEX idx_guest_users_phone ON guest_users(phone_number);
CREATE INDEX idx_guest_users_email ON guest_users(email);

-- Add realtime support
ALTER PUBLICATION supabase_realtime ADD TABLE guest_users;
ALTER PUBLICATION supabase_realtime ADD TABLE guest_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE guest_activities;
