-- Create response_formatting_configs table
CREATE TABLE IF NOT EXISTS response_formatting_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  enable_markdown BOOLEAN NOT NULL DEFAULT true,
  default_heading_level INTEGER NOT NULL DEFAULT 2,
  enable_bullet_points BOOLEAN NOT NULL DEFAULT true,
  enable_numbered_lists BOOLEAN NOT NULL DEFAULT true,
  enable_emphasis BOOLEAN NOT NULL DEFAULT true,
  response_variability VARCHAR(20) NOT NULL DEFAULT 'balanced',
  default_template TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create response_templates table
CREATE TABLE IF NOT EXISTS response_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_id UUID REFERENCES response_formatting_configs(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  template TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_response_formatting_configs_user_id ON response_formatting_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_response_formatting_configs_is_default ON response_formatting_configs(is_default);
CREATE INDEX IF NOT EXISTS idx_response_templates_config_id ON response_templates(config_id);

-- Enable realtime for all tables
alter publication supabase_realtime add table response_formatting_configs;
alter publication supabase_realtime add table response_templates;
