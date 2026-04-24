const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://utbkvjgatqiibfkcpugc.supabase.co';
const anonKey = 'sb_publishable_cmcEdgtywOGznXS5mQ4Bow_q_aTlZhe';

const supabase = createClient(supabaseUrl, anonKey);

async function testAnonConnection() {
  console.log('Testing Supabase anon key connection...');
  
  try {
    // Test 1: Check if we can query tables
    console.log('\n1. Testing table access...');
    
    const { data: markets, error: marketsError } = await supabase
      .from('markets')
      .select('*')
      .limit(1);
    
    if (marketsError) {
      console.log('❌ Markets table error:', marketsError.message);
      console.log('Error code:', marketsError.code);
      console.log('Error details:', marketsError.details);
    } else {
      console.log('✅ Markets table accessible');
      console.log('Data:', markets);
    }
    
    // Test 2: Check if tables exist by trying to get schema
    console.log('\n2. Checking if tables were created...');
    
    // Try a simple query that doesn't require RLS
    const { data: testQuery, error: testError } = await supabase
      .rpc('get_version');
    
    if (testError) {
      console.log('Cannot call RPC:', testError.message);
    } else {
      console.log('RPC works:', testQuery);
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
}

testAnonConnection();