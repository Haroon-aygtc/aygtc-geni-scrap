-- Insert default widget configuration
INSERT INTO widget_configs (
  id, 
  initially_open, 
  context_mode, 
  context_name, 
  title, 
  primary_color, 
  position, 
  show_on_mobile, 
  is_active, 
  is_default
) VALUES (
  uuid_generate_v4(),
  false,
  'restricted',
  'Website Assistance',
  'Chat Widget',
  '#4f46e5',
  'bottom-right',
  true,
  true,
  true
) ON CONFLICT DO NOTHING;

-- Insert default moderation rules
INSERT INTO moderation_rules (
  id,
  name,
  description,
  pattern,
  action,
  replacement,
  is_active
) VALUES (
  uuid_generate_v4(),
  'Profanity Filter',
  'Filters out common profanity',
  '\b(badword1|badword2|badword3)\b',
  'replace',
  '****',
  true
) ON CONFLICT DO NOTHING;

-- Insert default context rule
INSERT INTO context_rules (
  id,
  name,
  description,
  priority,
  is_active
) VALUES (
  uuid_generate_v4(),
  'General Website Assistance',
  'Default context rule for general website assistance',
  100,
  true
) ON CONFLICT DO NOTHING;
