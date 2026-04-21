-- Create user_preferences table for PolyEdge
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/utbkvjgatqiibfkcpugc/sql

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY,
  categories TEXT[] DEFAULT '{}',
  whale_threshold INT DEFAULT 10000,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE user_preferences IS 'User preferences for PolyEdge app (categories, whale threshold, etc.)';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Grant permissions (if RLS is enabled later)
-- ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can manage their own preferences" ON user_preferences
--   FOR ALL USING (auth.uid() = user_id);