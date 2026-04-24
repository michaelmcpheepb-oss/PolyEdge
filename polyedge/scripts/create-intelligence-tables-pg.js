#!/usr/bin/env node

const { Client } = require('pg');

// Supabase connection - we'll need to extract the connection details
const supabaseUrl = 'https://utbkvjgatqiibfkcpugc.supabase.co';
const projectRef = 'utbkvjgatqiibfkcpugc';

// Connection string for Supabase (using the pooler)
const connectionString = `postgresql://postgres.${projectRef}:${process.env.DB_PASSWORD || 'temp'}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`;

const SQL_QUERIES = [
  // Daily picks table
  `CREATE TABLE IF NOT EXISTS daily_picks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id TEXT NOT NULL,
    market_question TEXT NOT NULL,
    recommended_outcome TEXT NOT NULL,
    confidence_score NUMERIC NOT NULL,
    ai_reasoning TEXT NOT NULL,
    smart_money_direction TEXT,
    smart_money_pct NUMERIC,
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

async function createTablesViaSupa() {
  console.log('🗄️  Creating intelligence tables using Supabase REST API...');

  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    'https://utbkvjgatqiibfkcpugc.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0Ymt2amdhdHFpaWJma2NwdWdjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njc2MjU2MCwiZXhwIjoyMDkyMzM4NTYwfQ.ztUYEVHHd7PPi_MHo6l7j142ESle2TfulBR1GxNLLT4'
  );

  // Try to create each table by attempting operations that would fail if table doesn't exist
  for (let i = 0; i < SQL_QUERIES.length; i++) {
    try {
      console.log(`Creating table ${i + 1}/4...`);

      // Execute raw SQL via the REST API
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0Ymt2amdhdHFpaWJma2NwdWdjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njc2MjU2MCwiZXhwIjoyMDkyMzM4NTYwfQ.ztUYEVHHd7PPi_MHo6l7j142ESle2TfulBR1GxNLLT4`,
          'Content-Type': 'application/sql',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0Ymt2amdhdHFpaWJma2NwdWdjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njc2MjU2MCwiZXhwIjoyMDkyMzM4NTYwfQ.ztUYEVHHd7PPi_MHo6l7j142ESle2TfulBR1GxNLLT4'
        },
        body: SQL_QUERIES[i]
      });

      console.log(`Response ${i + 1}: ${response.status}`);

    } catch (error) {
      console.log(`Handled error for table ${i + 1}:`, error.message);
    }
  }

  // Verify by trying to insert a test record in each table
  const testTables = [
    { name: 'daily_picks', testData: {
        market_id: 'test',
        market_question: 'test',
        recommended_outcome: 'YES',
        confidence_score: 50,
        ai_reasoning: 'test'
      }},
    { name: 'market_intelligence', testData: {
        market_id: 'test-intel',
        market_question: 'test'
      }},
    { name: 'top_traders', testData: {
        wallet_address: 'test-wallet',
        pseudonym: 'TestTrader'
      }},
    { name: 'prediction_accuracy', testData: {
        total_picks: 0
      }}
  ];

  for (const table of testTables) {
    try {
      const { error } = await supabase
        .from(table.name)
        .insert(table.testData)
        .select();

      if (!error) {
        console.log(`✅ Table ${table.name} exists and is writable`);
        // Clean up test data
        await supabase.from(table.name).delete().eq('id', 'test');
      } else {
        console.log(`❌ Table ${table.name} error:`, error.message);
      }
    } catch (err) {
      console.log(`❌ Table ${table.name} check failed:`, err.message);
    }
  }
}

// Try alternate approach - manual table creation via simple queries
async function createTablesManually() {
  console.log('🔧 Attempting manual table creation...');

  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    'https://utbkvjgatqiibfkcpugc.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0Ymt2amdhdHFpaWJma2NwdWdjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njc2MjU2MCwiZXhwIjoyMDkyMzM4NTYwfQ.ztUYEVHHd7PPi_MHo6l7j142ESle2TfulBR1GxNLLT4'
  );

  // Let's just verify existing tables first
  console.log('📋 Checking existing tables...');

  try {
    const { data: existingTables } = await supabase.rpc('get_schema', {});
    console.log('Existing tables:', existingTables);
  } catch (err) {
    console.log('Could not get schema info');
  }

  // Check if we can query the tables that should already exist
  const existingTablesCheck = ['subscriptions', 'user_preferences', 'whale_trades', 'followed_traders', 'markets', 'traders', 'alerts'];

  for (const table of existingTablesCheck) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (!error) {
        console.log(`✅ Existing table ${table}: ${count || 0} rows`);
      } else {
        console.log(`❌ Table ${table} not accessible:`, error.message);
      }
    } catch (err) {
      console.log(`❌ Table ${table} error:`, err.message);
    }
  }

  return true;
}

// Run the functions
async function main() {
  try {
    await createTablesManually();
    await createTablesViaSupa();
  } catch (error) {
    console.error('Script failed:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { createTablesViaSupa, createTablesManually };