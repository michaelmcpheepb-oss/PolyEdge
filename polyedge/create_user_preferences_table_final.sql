-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY,
  categories TEXT[] DEFAULT '{}',
  whale_threshold INT DEFAULT 10000,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grant permissions
GRANT ALL ON user_preferences TO anon, authenticated, service_role;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Add comment
COMMENT ON TABLE user_preferences IS 'Stores user preferences for PolyEdge app';