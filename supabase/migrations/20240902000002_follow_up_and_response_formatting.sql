-- Create follow-up questions configuration tables
CREATE TABLE IF NOT EXISTS follow_up_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  enable_follow_up_questions BOOLEAN NOT NULL DEFAULT TRUE,
  max_follow_up_questions INTEGER NOT NULL DEFAULT 3,
  show_follow_up_as VARCHAR(20) NOT NULL DEFAULT 'buttons',
  generate_automatically BOOLEAN NOT NULL DEFAULT TRUE,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS predefined_question_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_id UUID NOT NULL REFERENCES follow_up_configs(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  trigger_keywords JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS predefined_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  set_id UUID NOT NULL REFERENCES predefined_question_sets(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS topic_based_question_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_id UUID NOT NULL REFERENCES follow_up_configs(id) ON DELETE CASCADE,
  topic VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS topic_based_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  set_id UUID NOT NULL REFERENCES topic_based_question_sets(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create response formatting configuration tables
CREATE TABLE IF NOT EXISTS response_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  template TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS response_formatting_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  enable_markdown BOOLEAN NOT NULL DEFAULT TRUE,
  default_heading_level INTEGER NOT NULL DEFAULT 2,
  enable_bullet_points BOOLEAN NOT NULL DEFAULT TRUE,
  enable_numbered_lists BOOLEAN NOT NULL DEFAULT TRUE,
  enable_emphasis BOOLEAN NOT NULL DEFAULT TRUE,
  response_variability VARCHAR(20) NOT NULL DEFAULT 'balanced',
  default_template UUID REFERENCES response_templates(id),
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add config_id to response_templates after response_formatting_configs is created
ALTER TABLE response_templates ADD COLUMN config_id UUID REFERENCES response_formatting_configs(id) ON DELETE CASCADE;

-- Add indexes for better performance
CREATE INDEX idx_follow_up_configs_user_id ON follow_up_configs(user_id);
CREATE INDEX idx_predefined_question_sets_config_id ON predefined_question_sets(config_id);
CREATE INDEX idx_predefined_questions_set_id ON predefined_questions(set_id);
CREATE INDEX idx_topic_based_question_sets_config_id ON topic_based_question_sets(config_id);
CREATE INDEX idx_topic_based_questions_set_id ON topic_based_questions(set_id);
CREATE INDEX idx_response_formatting_configs_user_id ON response_formatting_configs(user_id);
CREATE INDEX idx_response_templates_config_id ON response_templates(config_id);

-- Add default data
INSERT INTO response_templates (id, name, template, description) VALUES 
('00000000-0000-0000-0000-000000000001', 'Default Template', '# {title}\n\n{content}\n\n## Summary\n{summary}', 'Standard response format with title, content and summary'),
('00000000-0000-0000-0000-000000000002', 'Concise Template', '**{title}**\n{content}', 'Brief format with just the essential information');
