-- Disable RLS on public tables (markets, whale_trades, traders are public data)
ALTER TABLE markets DISABLE ROW LEVEL SECURITY;
ALTER TABLE whale_trades DISABLE ROW LEVEL SECURITY;
ALTER TABLE traders DISABLE ROW LEVEL SECURITY;

-- Keep RLS on user data tables
-- alerts, subscriptions, followed_traders keep RLS enabled