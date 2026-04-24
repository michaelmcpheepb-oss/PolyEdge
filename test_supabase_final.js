const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://utbkvjgatqiibfkcpugc.supabase.co';
const anonKey = 'sb_publishable_cmcEdgtywOGznXS5mQ4Bow_q_aTlZhe';

const supabase = createClient(supabaseUrl, anonKey);

async function testConnection() {
  console.log('Testing Supabase connection with RLS disabled...');
  
  try {
    // Test 1: Query markets table
    console.log('\n1. Querying markets table...');
    
    const { data: markets, error: marketsError, count: marketsCount } = await supabase
      .from('markets')
      .select('*', { count: 'exact', head: true });
    
    if (marketsError) {
      console.log('❌ Markets query error:', marketsError);
      console.log('Full error object:', JSON.stringify(marketsError, null, 2));
    } else {
      console.log('✅ Markets query successful');
      console.log('Count:', marketsCount);
    }
    
    // Test 2: Try to insert test data
    console.log('\n2. Testing insert...');
    
    const testMarket = {
      id: 'test_market_' + Date.now(),
      question: 'Test market - RLS disabled test',
      category: 'Test',
      yes_price: 0.5,
      no_price: 0.5,
      volume_24h: 1000,
      total_volume: 1000,
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Test market for RLS verification',
      updated_at: new Date().toISOString(),
    };
    
    const { data: insertedMarket, error: insertError } = await supabase
      .from('markets')
      .insert(testMarket)
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Insert error:', insertError);
    } else {
      console.log('✅ Insert successful:', insertedMarket.id);
      
      // Clean up
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
    
    // Test 3: Check table schema
    console.log('\n3. Checking table schema...');
    
    const { data: sampleData, error: sampleError } = await supabase
      .from('markets')
      .select('*')
      .limit(5);
    
    if (sampleError) {
      console.log('❌ Sample query error:', sampleError.message);
    } else if (sampleData && sampleData.length > 0) {
      console.log('✅ Table has data');
      console.log('Sample row:', JSON.stringify(sampleData[0], null, 2));
    } else {
      console.log('ℹ️  Table is empty (expected)');
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

testConnection();