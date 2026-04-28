-- PolyEdge Intelligence Tables
-- Paste this entire file into: https://supabase.com/dashboard/project/utbkvjgatqiibfkcpugc/sql/new
-- Then click "Run"

-- ────────────────────────────────────────────────────────────────────
-- 1. daily_picks
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_picks (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id             TEXT        NOT NULL,
  market_question       TEXT        NOT NULL,
  recommended_outcome   TEXT        NOT NULL CHECK (recommended_outcome IN ('YES', 'NO')),
  confidence_score      NUMERIC     NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  ai_reasoning          TEXT        NOT NULL,
  smart_money_direction TEXT        CHECK (smart_money_direction IN ('YES', 'NO', 'MIXED')),
  smart_money_pct       NUMERIC     CHECK (smart_money_pct >= 0 AND smart_money_pct <= 100),
  current_yes_price     NUMERIC     CHECK (current_yes_price >= 0 AND current_yes_price <= 1),
  current_no_price      NUMERIC     CHECK (current_no_price >= 0 AND current_no_price <= 1),
  category              TEXT,
  pick_date             DATE        NOT NULL DEFAULT CURRENT_DATE,
  resolved              BOOLEAN     DEFAULT FALSE,
  was_correct           BOOLEAN,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint required for upsert onConflict: 'market_id,pick_date'
ALTER TABLE daily_picks
  DROP CONSTRAINT IF EXISTS daily_picks_market_id_pick_date_key;
ALTER TABLE daily_picks
  ADD CONSTRAINT daily_picks_market_id_pick_date_key UNIQUE (market_id, pick_date);

CREATE INDEX IF NOT EXISTS idx_daily_picks_date       ON daily_picks(pick_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_picks_market     ON daily_picks(market_id);
CREATE INDEX IF NOT EXISTS idx_daily_picks_confidence ON daily_picks(confidence_score DESC);

-- ────────────────────────────────────────────────────────────────────
-- 2. market_intelligence
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS market_intelligence (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id             TEXT        UNIQUE NOT NULL,
  market_question       TEXT        NOT NULL,
  confidence_score      NUMERIC     CHECK (confidence_score >= 0 AND confidence_score <= 100),
  smart_money_direction TEXT        CHECK (smart_money_direction IN ('YES', 'NO', 'MIXED')),
  smart_money_pct       NUMERIC     CHECK (smart_money_pct >= 0 AND smart_money_pct <= 100),
  -- Values written by dailyPicksEngine: WITH_CROWD | AGAINST_CROWD | NEUTRAL
  sharp_vs_public       TEXT        CHECK (sharp_vs_public IN ('WITH_CROWD', 'AGAINST_CROWD', 'NEUTRAL')),
  -- Values written by getMomentum(): RISING | FALLING | STABLE
  momentum              TEXT        CHECK (momentum IN ('RISING', 'FALLING', 'STABLE')),
  momentum_pct          NUMERIC,
  ai_brief              TEXT,
  top_wallet_positions  JSONB,
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_market_intelligence_market     ON market_intelligence(market_id);
CREATE INDEX IF NOT EXISTS idx_market_intelligence_confidence ON market_intelligence(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_market_intelligence_updated    ON market_intelligence(updated_at DESC);

-- ────────────────────────────────────────────────────────────────────
-- 3. top_traders
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS top_traders (
  wallet_address      TEXT        PRIMARY KEY,
  pseudonym           TEXT        NOT NULL,
  rank                INTEGER     CHECK (rank > 0),
  win_rate            NUMERIC     CHECK (win_rate >= 0 AND win_rate <= 100),
  roi_30d             NUMERIC,
  total_pnl           NUMERIC,
  total_trades        INTEGER     DEFAULT 0 CHECK (total_trades >= 0),
  specialty_category  TEXT,
  active_positions    JSONB,
  last_trade_at       TIMESTAMPTZ,
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_top_traders_rank    ON top_traders(rank ASC)     WHERE rank IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_top_traders_roi     ON top_traders(roi_30d DESC) WHERE roi_30d IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_top_traders_winrate ON top_traders(win_rate DESC) WHERE win_rate IS NOT NULL;

-- ────────────────────────────────────────────────────────────────────
-- 4. prediction_accuracy
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prediction_accuracy (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  total_picks   INTEGER     DEFAULT 0 CHECK (total_picks >= 0),
  correct_picks INTEGER     DEFAULT 0,
  accuracy_pct  NUMERIC     DEFAULT 0 CHECK (accuracy_pct >= 0 AND accuracy_pct <= 100),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prediction_accuracy_updated ON prediction_accuracy(updated_at DESC);

-- ────────────────────────────────────────────────────────────────────
-- Permissions — allow anon + authenticated reads, service_role writes
-- ────────────────────────────────────────────────────────────────────
GRANT SELECT ON daily_picks         TO anon, authenticated;
GRANT SELECT ON market_intelligence TO anon, authenticated;
GRANT SELECT ON top_traders         TO anon, authenticated;
GRANT SELECT ON prediction_accuracy TO anon, authenticated;

GRANT ALL ON daily_picks         TO service_role;
GRANT ALL ON market_intelligence TO service_role;
GRANT ALL ON top_traders         TO service_role;
GRANT ALL ON prediction_accuracy TO service_role;
