-- Create follow_up_configs table
CREATE TABLE IF NOT EXISTS follow_up_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  enable_follow_up_questions BOOLEAN NOT NULL DEFAULT true,
  max_follow_up_questions INTEGER NOT NULL DEFAULT 3,
  show_follow_up_as VARCHAR(20) NOT NULL DEFAULT 'chips',
  generate_automatically BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create predefined_question_sets table
CREATE TABLE IF NOT EXISTS predefined_question_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_id UUID NOT NULL REFERENCES follow_up_configs(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  trigger_keywords TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create predefined_questions table
CREATE TABLE IF NOT EXISTS predefined_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  set_id UUID NOT NULL REFERENCES predefined_question_sets(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create topic_based_question_sets table
CREATE TABLE IF NOT EXISTS topic_based_question_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_id UUID NOT NULL REFERENCES follow_up_configs(id) ON DELETE CASCADE,
  topic VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create topic_based_questions table
CREATE TABLE IF NOT EXISTS topic_based_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  set_id UUID NOT NULL REFERENCES topic_based_question_sets(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_follow_up_configs_user_id ON follow_up_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_configs_is_default ON follow_up_configs(is_default);
CREATE INDEX IF NOT EXISTS idx_predefined_question_sets_config_id ON predefined_question_sets(config_id);
CREATE INDEX IF NOT EXISTS idx_predefined_questions_set_id ON predefined_questions(set_id);
CREATE INDEX IF NOT EXISTS idx_predefined_questions_display_order ON predefined_questions(display_order);
CREATE INDEX IF NOT EXISTS idx_topic_based_question_sets_config_id ON topic_based_question_sets(config_id);
CREATE INDEX IF NOT EXISTS idx_topic_based_questions_set_id ON topic_based_questions(set_id);
CREATE INDEX IF NOT EXISTS idx_topic_based_questions_display_order ON topic_based_questions(display_order);

-- Enable realtime for all tables
alter publication supabase_realtime add table follow_up_configs;
alter publication supabase_realtime add table predefined_question_sets;
alter publication supabase_realtime add table predefined_questions;
alter publication supabase_realtime add table topic_based_question_sets;
alter publication supabase_realtime add table topic_based_questions;
