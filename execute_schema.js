const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://utbkvjgatqiibfkcpugc.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0Ymt2amdhdHFpaWJma2NwdWdjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njc2MjU2MCwiZXhwIjoyMDkyMzM4NTYwfQ.ztUYEVHHd7PPi_MHo6l7j142ESle2TfulBR1GxNLLT4';

const supabase = createClient(supabaseUrl, serviceRoleKey);

const sqlSchema = `
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
`;

async function executeSchema() {
  try {
    console.log('Executing SQL schema...');
    
    // Split the SQL into individual statements
    const statements = sqlSchema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`Executing statement ${i + 1}/${statements.length}: ${statement.substring(0, 100)}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // If exec_sql doesn't exist, we need to create it first
          if (error.message.includes('function "exec_sql" does not exist')) {
            console.log('exec_sql function not found, trying to create it...');
            
            // First, we need to create the exec_sql function
            const createFunctionSQL = `
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;
            `;
            
            // Try to create the function using a direct API call
            const { error: createError } = await supabase
              .from('_exec_sql_temp')
              .select('*')
              .limit(1);
              
            if (createError) {
              console.log('Cannot create exec_sql function via API. Need manual creation.');
              console.log('Please run this SQL in Supabase dashboard SQL editor:');
              console.log(createFunctionSQL);
              break;
            }
          } else {
            console.error('Error executing SQL:', error);
          }
        } else {
          console.log(`Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.error(`Error executing statement ${i + 1}:`, err.message);
      }
      
      // Small delay between statements
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('Schema execution completed');
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

executeSchema();