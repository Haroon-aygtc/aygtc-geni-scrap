-- Create knowledge_base_configs table
CREATE TABLE IF NOT EXISTS knowledge_base_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL,
  endpoint VARCHAR(255),
  api_key VARCHAR(255),
  connection_string TEXT,
  refresh_interval INTEGER,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  parameters JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create context_rules table
CREATE TABLE IF NOT EXISTS context_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  priority INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create context_rule_knowledge_bases junction table
CREATE TABLE IF NOT EXISTS context_rule_knowledge_bases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  context_rule_id UUID NOT NULL REFERENCES context_rules(id) ON DELETE CASCADE,
  knowledge_base_id UUID NOT NULL REFERENCES knowledge_base_configs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(context_rule_id, knowledge_base_id)
);

-- Create knowledge_base_query_logs table
CREATE TABLE IF NOT EXISTS knowledge_base_query_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  query TEXT NOT NULL,
  context_rule_id UUID REFERENCES context_rules(id) ON DELETE SET NULL,
  knowledge_base_ids TEXT NOT NULL,
  results_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_knowledge_base_configs_is_active ON knowledge_base_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_context_rules_is_active ON context_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_context_rules_priority ON context_rules(priority);
CREATE INDEX IF NOT EXISTS idx_context_rule_knowledge_bases_context_rule_id ON context_rule_knowledge_bases(context_rule_id);
CREATE INDEX IF NOT EXISTS idx_context_rule_knowledge_bases_knowledge_base_id ON context_rule_knowledge_bases(knowledge_base_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_query_logs_user_id ON knowledge_base_query_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_query_logs_context_rule_id ON knowledge_base_query_logs(context_rule_id);

-- Enable realtime for all tables
alter publication supabase_realtime add table knowledge_base_configs;
alter publication supabase_realtime add table context_rules;
alter publication supabase_realtime add table context_rule_knowledge_bases;
alter publication supabase_realtime add table knowledge_base_query_logs;
