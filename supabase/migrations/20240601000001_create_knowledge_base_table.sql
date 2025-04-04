-- Create knowledge_base table
CREATE TABLE IF NOT EXISTS knowledge_base (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  tags JSONB DEFAULT '[]',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_knowledge_base_title ON knowledge_base(title);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_created_at ON knowledge_base(created_at);

-- Enable row level security
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view all knowledge base entries";
CREATE POLICY "Users can view all knowledge base entries"
ON knowledge_base FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Authenticated users can create knowledge base entries";
CREATE POLICY "Authenticated users can create knowledge base entries"
ON knowledge_base FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own knowledge base entries";
CREATE POLICY "Users can update their own knowledge base entries"
ON knowledge_base FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can delete their own knowledge base entries";
CREATE POLICY "Users can delete their own knowledge base entries"
ON knowledge_base FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

-- Enable realtime
alter publication supabase_realtime add table knowledge_base;
