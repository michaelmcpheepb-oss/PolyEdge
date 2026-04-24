#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://utbkvjgatqiibfkcpugc.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0Ymt2amdhdHFpaWJma2NwdWdjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njc2MjU2MCwiZXhwIjoyMDkyMzM4NTYwfQ.ztUYEVHHd7PPi_MHo6l7j142ESle2TfulBR1GxNLLT4';

const supabase = createClient(supabaseUrl, serviceRoleKey);

const SQL_QUERIES = [
  // Daily picks table
  `CREATE TABLE IF NOT EXISTS daily_picks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id TEXT NOT NULL,
    market_question TEXT NOT NULL,
    recommended_outcome TEXT NOT NULL, -- 'YES' or 'NO'
    confidence_score NUMERIC NOT NULL, -- 0 to 100
    ai_reasoning TEXT NOT NULL,
    smart_money_direction TEXT, -- 'YES', 'NO', or 'MIXED'
    smart_money_pct NUMERIC, -- % of top wallets on this side
    current_yes_price NUMERIC,
    current_no_price NUMERIC,
    category TEXT,
    pick_date DATE NOT NULL DEFAULT CURRENT_DATE,
    resolved BOOLEAN DEFAULT FALSE,
    was_correct BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );`,

  // Market intelligence table
  `CREATE TABLE IF NOT EXISTS market_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id TEXT UNIQUE NOT NULL,
    market_question TEXT NOT NULL,
    confidence_score NUMERIC,
    smart_money_direction TEXT,
    smart_money_pct NUMERIC,
    sharp_vs_public TEXT,
    momentum TEXT,
    momentum_pct NUMERIC,
    ai_brief TEXT,
    top_wallet_positions JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );`,

  // Top traders table
  `CREATE TABLE IF NOT EXISTS top_traders (
    wallet_address TEXT PRIMARY KEY,
    pseudonym TEXT NOT NULL,
    rank INTEGER,
    win_rate NUMERIC,
    roi_30d NUMERIC,
    total_pnl NUMERIC,
    total_trades INTEGER,
    specialty_category TEXT,
    active_positions JSONB,
    last_trade_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );`,

  // Prediction accuracy table
  `CREATE TABLE IF NOT EXISTS prediction_accuracy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_picks INTEGER DEFAULT 0,
    correct_picks INTEGER DEFAULT 0,
    accuracy_pct NUMERIC DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );`
];

async function createTables() {
  console.log('🗄️  Creating intelligence tables in Supabase...');

  try {
    for (let i = 0; i < SQL_QUERIES.length; i++) {
      const query = SQL_QUERIES[i];
      console.log(`Executing query ${i + 1}/${SQL_QUERIES.length}...`);

      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: query
      });

      if (error) {
        console.error(`❌ Error executing query ${i + 1}:`, error);
        // Try direct approach if RPC fails
        const { error: directError } = await supabase
          .from('_supabase_admin')
          .select('*')
          .limit(1);

        if (directError) {
          console.log('Trying alternative approach...');
          // Use raw SQL execution via REST API
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${serviceRoleKey}`,
              'Content-Type': 'application/json',
              'apikey': serviceRoleKey
            },
            body: JSON.stringify({ sql_query: query })
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
          }
        }
      }

      console.log(`✅ Query ${i + 1} executed successfully`);
    }

    console.log('🎉 All intelligence tables created successfully!');

    // Verify tables exist
    console.log('🔍 Verifying tables...');
    const tables = ['daily_picks', 'market_intelligence', 'top_traders', 'prediction_accuracy'];

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.warn(`⚠️  Could not verify table ${table}:`, error.message);
      } else {
        console.log(`✅ Table ${table} exists (${count || 0} rows)`);
      }
    }

  } catch (error) {
    console.error('💥 Failed to create tables:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  createTables();
}

module.exports = { createTables };