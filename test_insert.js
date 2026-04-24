const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://utbkvjgatqiibfkcpugc.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0Ymt2amdhdHFpaWJma2NwdWdjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njc2MjU2MCwiZXhwIjoyMDkyMzM4NTYwfQ.ztUYEVHHd7PPi_MHo6l7j142ESle2TfulBR1GxNLLT4';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function testInsert() {
  console.log('Testing Supabase insert...');
  
  try {
    // Test 1: Try to insert a market
    const testMarket = {
      id: 'test_market_' + Date.now(),
      question: 'Test market - Can we insert?',
      category: 'Test',
      yes_price: 0.5,
      no_price: 0.5,
      volume_24h: 1000,
      total_volume: 1000,
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Test market for connection verification',
      updated_at: new Date().toISOString(),
    };
    
    console.log('Inserting test market:', testMarket.id);
    
    const { data: insertedMarket, error: insertError } = await supabase
      .from('markets')
      .insert(testMarket)
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Insert failed:', insertError);
      console.log('Error code:', insertError.code);
      console.log('Error message:', insertError.message);
      console.log('Error details:', insertError.details);
      console.log('Error hint:', insertError.hint);
    } else {
      console.log('✅ Insert successful:', insertedMarket);
      
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
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

testInsert();