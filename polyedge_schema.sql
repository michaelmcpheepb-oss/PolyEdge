CREATE TABLE markets (
 id TEXT PRIMARY KEY,
 question TEXT NOT NULL,
 category TEXT,
 yes_price NUMERIC,
 no_price NUMERIC,
 volume_24h NUMERIC,
 total_volume NUMERIC,
 end_date TIMESTAMPTZ,
 description TEXT,
 updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE whale_trades (
 id TEXT PRIMARY KEY,
 market_id TEXT REFERENCES markets(id),
 market_question TEXT,
 trader_address TEXT,
 trader_pseudonym TEXT,
 amount_usd NUMERIC,
 outcome TEXT,
 side TEXT,
 timestamp TIMESTAMPTZ,
 created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE traders (
 wallet_address TEXT PRIMARY KEY,
 pseudonym TEXT,
 pnl_30d NUMERIC,
 win_rate NUMERIC,
 total_trades INT,
 active_positions INT,
 updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE alerts (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 market_id TEXT,
 market_question TEXT,
 alert_type TEXT,
 threshold NUMERIC,
 is_active BOOLEAN DEFAULT TRUE,
 last_triggered_at TIMESTAMPTZ,
 created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscriptions (
 user_id UUID PRIMARY KEY REFERENCES auth.users(id),
 stripe_customer_id TEXT,
 stripe_subscription_id TEXT,
 plan TEXT DEFAULT 'free',
 trial_ends_at TIMESTAMPTZ,
 period_end TIMESTAMPTZ,
 updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE followed_traders (
 user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 wallet_address TEXT,
 PRIMARY KEY (user_id, wallet_address)
);

CREATE INDEX idx_whale_trades_timestamp ON whale_trades(timestamp DESC);
CREATE INDEX idx_whale_trades_amount ON whale_trades(amount_usd DESC);
CREATE INDEX idx_markets_volume ON markets(volume_24h DESC);
CREATE INDEX idx_alerts_user ON alerts(user_id) WHERE is_active = TRUE;

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE followed_traders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own alerts" ON alerts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own subscription" ON subscriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own follows" ON followed_traders FOR ALL USING (auth.uid() = user_id);