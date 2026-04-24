-- Create intelligence tables for PolyEdge redesign
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/utbkvjgatqiibfkcpugc/sql

-- Daily picks table - store the AI's daily market recommendations
CREATE TABLE IF NOT EXISTS daily_picks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id TEXT NOT NULL,
  market_question TEXT NOT NULL,
  recommended_outcome TEXT NOT NULL, -- 'YES' or 'NO'
  confidence_score NUMERIC NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  ai_reasoning TEXT NOT NULL,
  smart_money_direction TEXT CHECK (smart_money_direction IN ('YES', 'NO', 'MIXED')),
  smart_money_pct NUMERIC CHECK (smart_money_pct >= 0 AND smart_money_pct <= 100),
  current_yes_price NUMERIC CHECK (current_yes_price >= 0 AND current_yes_price <= 1),
  current_no_price NUMERIC CHECK (current_no_price >= 0 AND current_no_price <= 1),
  category TEXT,
  pick_date DATE NOT NULL DEFAULT CURRENT_DATE,
  resolved BOOLEAN DEFAULT FALSE,
  was_correct BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market intelligence table - enhanced market analysis data
CREATE TABLE IF NOT EXISTS market_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id TEXT UNIQUE NOT NULL,
  market_question TEXT NOT NULL,
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 100),
  smart_money_direction TEXT CHECK (smart_money_direction IN ('YES', 'NO', 'MIXED')),
  smart_money_pct NUMERIC CHECK (smart_money_pct >= 0 AND smart_money_pct <= 100),
  sharp_vs_public TEXT CHECK (sharp_vs_public IN ('SHARP_YES', 'SHARP_NO', 'PUBLIC_YES', 'PUBLIC_NO', 'ALIGNED')),
  momentum TEXT CHECK (momentum IN ('STRONG_YES', 'WEAK_YES', 'NEUTRAL', 'WEAK_NO', 'STRONG_NO')),
  momentum_pct NUMERIC,
  ai_brief TEXT,
  top_wallet_positions JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Top traders table - ranked list of smart wallets with performance metrics
CREATE TABLE IF NOT EXISTS top_traders (
  wallet_address TEXT PRIMARY KEY,
  pseudonym TEXT NOT NULL,
  rank INTEGER CHECK (rank > 0),
  win_rate NUMERIC CHECK (win_rate >= 0 AND win_rate <= 100),
  roi_30d NUMERIC,
  total_pnl NUMERIC,
  total_trades INTEGER DEFAULT 0 CHECK (total_trades >= 0),
  specialty_category TEXT,
  active_positions JSONB,
  last_trade_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prediction accuracy table - track AI performance metrics
CREATE TABLE IF NOT EXISTS prediction_accuracy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_picks INTEGER DEFAULT 0 CHECK (total_picks >= 0),
  correct_picks INTEGER DEFAULT 0 CHECK (correct_picks >= 0 AND correct_picks <= total_picks),
  accuracy_pct NUMERIC DEFAULT 0 CHECK (accuracy_pct >= 0 AND accuracy_pct <= 100),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE daily_picks IS 'Daily AI-selected market picks with confidence scores and smart money analysis';
COMMENT ON TABLE market_intelligence IS 'Enhanced market analysis with AI briefs and smart money signals';
COMMENT ON TABLE top_traders IS 'Ranked list of top performing wallets with metrics and specialty categories';
COMMENT ON TABLE prediction_accuracy IS 'Track record of AI prediction performance over time';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_picks_date ON daily_picks(pick_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_picks_market ON daily_picks(market_id);
CREATE INDEX IF NOT EXISTS idx_daily_picks_confidence ON daily_picks(confidence_score DESC);

CREATE INDEX IF NOT EXISTS idx_market_intelligence_market ON market_intelligence(market_id);
CREATE INDEX IF NOT EXISTS idx_market_intelligence_confidence ON market_intelligence(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_market_intelligence_updated ON market_intelligence(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_top_traders_rank ON top_traders(rank ASC) WHERE rank IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_top_traders_roi ON top_traders(roi_30d DESC) WHERE roi_30d IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_top_traders_winrate ON top_traders(win_rate DESC) WHERE win_rate IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_prediction_accuracy_updated ON prediction_accuracy(updated_at DESC);

-- Enable Row Level Security (RLS) for future auth integration
-- ALTER TABLE daily_picks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE market_intelligence ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE top_traders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE prediction_accuracy ENABLE ROW LEVEL SECURITY;

-- Grant permissions for service role (already has access, but explicit is better)
-- GRANT ALL ON TABLE daily_picks TO service_role;
-- GRANT ALL ON TABLE market_intelligence TO service_role;
-- GRANT ALL ON TABLE top_traders TO service_role;
-- GRANT ALL ON TABLE prediction_accuracy TO service_role;