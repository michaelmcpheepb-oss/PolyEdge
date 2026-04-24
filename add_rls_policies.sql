-- Enable RLS on public tables
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE whale_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE traders ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public can read markets" ON markets
  FOR SELECT USING (true);

CREATE POLICY "Public can read whale trades" ON whale_trades
  FOR SELECT USING (true);

CREATE POLICY "Public can read traders" ON traders
  FOR SELECT USING (true);

-- Service role can do everything (already has bypassrls)
-- Note: Service role key automatically bypasses RLS, so no policy needed

-- For authenticated users (future use)
CREATE POLICY "Authenticated users can insert markets" ON markets
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update markets" ON markets
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert whale trades" ON whale_trades
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update whale trades" ON whale_trades
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert traders" ON traders
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update traders" ON traders
  FOR UPDATE USING (auth.role() = 'authenticated');