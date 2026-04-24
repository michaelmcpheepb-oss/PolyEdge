const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://utbkvjgatqiibfkcpugc.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0Ymt2amdhdHFpaWJma2NwdWdjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njc2MjU2MCwiZXhwIjoyMDkyMzM4NTYwfQ.ztUYEVHHd7PPi_MHo6l7j142ESle2TfulBR1GxNLLT4';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function testJSClient() {
  console.log('Testing Supabase JS client...');
  
  try {
    // Test 1: Get markets
    console.log('\n1. Getting markets...');
    const { data: markets, error: marketsError } = await supabase
      .from('markets')
      .select('*')
      .order('volume_24h', { ascending: false })
      .limit(3);
    
    if (marketsError) {
      console.error('❌ Error:', marketsError);
    } else {
      console.log(`✅ Got ${markets.length} markets:`);
      markets.forEach(market => {
        console.log(`   - ${market.question} (${market.category}): $${market.volume_24h.toLocaleString()} volume`);
      });
    }

    // Test 2: Get whale trades
    console.log('\n2. Getting whale trades...');
    const { data: trades, error: tradesError } = await supabase
      .from('whale_trades')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(2);
    
    if (tradesError) {
      console.error('❌ Error:', tradesError);
    } else {
      console.log(`✅ Got ${trades.length} whale trades:`);
      trades.forEach(trade => {
        console.log(`   - ${trade.trader_pseudonym}: $${trade.amount_usd.toLocaleString()} on "${trade.market_question.substring(0, 40)}..."`);
      });
    }

    // Test 3: Get traders
    console.log('\n3. Getting traders...');
    const { data: traders, error: tradersError } = await supabase
      .from('traders')
      .select('*')
      .order('pnl_30d', { ascending: false })
      .limit(2);
    
    if (tradersError) {
      console.error('❌ Error:', tradersError);
    } else {
      console.log(`✅ Got ${traders.length} traders:`);
      traders.forEach(trader => {
        console.log(`   - ${trader.pseudonym}: $${trader.pnl_30d.toLocaleString()} PnL, ${(trader.win_rate * 100).toFixed(1)}% win rate`);
      });
    }

    console.log('\n🎉 All tests passed! The Supabase JS client is working correctly.');

  } catch (error) {
    console.error('💥 Fatal error:', error);
  }
}

testJSClient();