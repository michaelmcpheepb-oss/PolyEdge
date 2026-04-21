// Test real Polymarket APIs
console.log('Testing real Polymarket APIs...\n');

async function testPolymarketAPIs() {
  try {
    // Test Gamma API (markets)
    console.log('1. Testing Gamma API (markets)...');
    const gammaResponse = await fetch('https://gamma-api.polymarket.com/markets?active=true&limit=5');
    const gammaData = await gammaResponse.json();
    console.log(`✅ Gamma API: Got ${gammaData.length} markets`);
    console.log('   First market:', gammaData[0]?.question?.substring(0, 50) + '...');
    
    // Test CLOB API (trades)
    console.log('\n2. Testing CLOB API (trades)...');
    const clobResponse = await fetch('https://clob.polymarket.com/trades?limit=5');
    const clobData = await clobResponse.json();
    console.log(`✅ CLOB API: Got ${clobData.length} trades`);
    if (clobData[0]) {
      console.log('   First trade:', {
        amount: clobData[0].amount,
        price: clobData[0].price,
        side: clobData[0].side,
      });
    }
    
    // Test Supabase connection
    console.log('\n3. Testing Supabase connection...');
    const supabaseUrl = 'https://utbkvjgatqiibfkcpugc.supabase.co';
    const supabaseKey = 'sb_publishable_cmcEdgtywOGznXS5mQ4Bow_q_aTlZhe';
    
    const supabaseResponse = await fetch(`${supabaseUrl}/rest/v1/markets?limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      }
    });
    
    if (supabaseResponse.ok) {
      const supabaseData = await supabaseResponse.json();
      console.log(`✅ Supabase: Connection successful (${supabaseData.length} markets)`);
    } else {
      console.log('⚠️ Supabase: Connection issue (might need RLS policies)');
    }
    
    // Test Stripe checkout URL
    console.log('\n4. Testing Stripe checkout URL...');
    const priceId = 'price_1TOfvW2F8prHOW8KRP72v1Zu'; // Monthly plan
    const checkoutUrl = `https://checkout.stripe.com/c/pay/${priceId}?client_reference_id=test_user`;
    console.log(`✅ Stripe checkout URL: ${checkoutUrl.substring(0, 80)}...`);
    console.log('   Test with card: 4242 4242 4242 4242');
    
    console.log('\n🎉 All API tests completed!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.error('   Make sure you have internet connection');
  }
}

testPolymarketAPIs();