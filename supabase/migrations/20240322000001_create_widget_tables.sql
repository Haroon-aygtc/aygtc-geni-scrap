-- Create widget_configs table
CREATE TABLE IF NOT EXISTS widget_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  initially_open BOOLEAN NOT NULL DEFAULT false,
  context_mode VARCHAR(20) NOT NULL DEFAULT 'restricted',
  context_name VARCHAR(100) NOT NULL DEFAULT 'Website Assistance',
  title VARCHAR(100) NOT NULL DEFAULT 'Chat Widget',
  primary_color VARCHAR(20) NOT NULL DEFAULT '#4f46e5',
  position VARCHAR(20) NOT NULL DEFAULT 'bottom-right',
  show_on_mobile BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create user_activity table
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  action VARCHAR(100) NOT NULL,
  ip_address VARCHAR(50),
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  device_info JSONB NOT NULL,
  ip_address VARCHAR(50),
  location VARCHAR(255),
  last_active_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create ai_response_cache table
CREATE TABLE IF NOT EXISTS ai_response_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt TEXT NOT NULL,
  prompt_hash VARCHAR(100) NOT NULL,
  response TEXT NOT NULL,
  model_used VARCHAR(100) NOT NULL DEFAULT 'default',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_response_cache_prompt_hash ON ai_response_cache(prompt_hash);
CREATE INDEX IF NOT EXISTS idx_ai_response_cache_expires_at ON ai_response_cache(expires_at);

-- Enable realtime for all tables
alter publication supabase_realtime add table widget_configs;
alter publication supabase_realtime add table user_activity;
alter publication supabase_realtime add table user_sessions;
alter publication supabase_realtime add table ai_response_cache;
