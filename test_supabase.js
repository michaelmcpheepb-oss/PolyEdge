const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://utbkvjgatqiibfkcpugc.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0Ymt2amdhdHFpaWJma2NwdWdjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njc2MjU2MCwiZXhwIjoyMDkyMzM4NTYwfQ.ztUYEVHHd7PPi_MHo6l7j142ESle2TfulBR1GxNLLT4';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test 1: Check if tables exist
    console.log('\n1. Checking tables...');
    
    const { data: markets, error: marketsError } = await supabase
      .from('markets')
      .select('count')
      .limit(1);
    
    if (marketsError) {
      console.log('❌ Markets table error:', marketsError.message);
    } else {
      console.log('✅ Markets table accessible');
    }
    
    const { data: whaleTrades, error: whaleTradesError } = await supabase
      .from('whale_trades')
      .select('count')
      .limit(1);
    
    if (whaleTradesError) {
      console.log('❌ Whale trades table error:', whaleTradesError.message);
    } else {
      console.log('✅ Whale trades table accessible');
    }
    
    const { data: traders, error: tradersError } = await supabase
      .from('traders')
      .select('count')
      .limit(1);
    
    if (tradersError) {
      console.log('❌ Traders table error:', tradersError.message);
    } else {
      console.log('✅ Traders table accessible');
    }
    
    // Test 2: Try to insert test data
    console.log('\n2. Testing data insertion...');
    
    const testMarket = {
      id: 'test_market_' + Date.now(),
      question: 'Test market - Will this work?',
      category: 'Test',
      yes_price: 0.5,
      no_price: 0.5,
      volume_24h: 1000,
      total_volume: 1000,
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Test market for connection verification',
      updated_at: new Date().toISOString(),
    };
    
    const { data: insertedMarket, error: insertError } = await supabase
      .from('markets')
      .insert(testMarket)
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Insert test failed:', insertError.message);
    } else {
      console.log('✅ Insert test successful:', insertedMarket.id);
      
      // Clean up: delete test data
      const { error: deleteError } = await supabase
        .from('markets')
        .delete()
        .eq('id', testMarket.id);
      
      if (deleteError) {
        console.log('⚠️  Cleanup failed:', deleteError.message);
      } else {
        console.log('✅ Test data cleaned up');
      }
    }
    
    // Test 3: Check table structure
    console.log('\n3. Checking table structure...');
    
    const { data: sampleMarkets, error: sampleError } = await supabase
      .from('markets')
      .select('*')
      .limit(3);
    
    if (sampleError) {
      console.log('❌ Cannot fetch sample data:', sampleError.message);
    } else if (sampleMarkets && sampleMarkets.length > 0) {
      console.log('✅ Table has data, columns:', Object.keys(sampleMarkets[0]));
    } else {
      console.log('ℹ️  Table is empty (expected for new database)');
    }
    
    console.log('\n✅ Supabase connection test completed');
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
}

testConnection();