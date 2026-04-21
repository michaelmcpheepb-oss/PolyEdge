#!/usr/bin/env node

// Direct API test script - can run without Metro
const fetch = require('node-fetch');

const API_URLS = {
  polymarketMarkets: 'https://gamma-api.polymarket.com/markets?active=true&limit=5',
  polymarketTrades: 'https://clob.polymarket.com/trades?limit=5',
  supabaseMarkets: 'https://utbkvjgatqiibfkcpugc.supabase.co/rest/v1/markets?limit=1',
};

async function testApi(name, url, options = {}) {
  console.log(`\n🔍 Testing ${name}...`);
  console.log(`URL: ${url}`);
  
  try {
    const startTime = Date.now();
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
        ...options.headers,
      },
      ...options,
    });
    const endTime = Date.now();
    
    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    console.log(`⏱️  Response time: ${endTime - startTime}ms`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`📊 Response sample:`, JSON.stringify(data, null, 2).slice(0, 500) + '...');
      return { success: true, data };
    } else {
      console.log(`❌ Error response:`, await response.text().catch(() => ''));
      return { success: false, status: response.status };
    }
  } catch (error) {
    console.log(`💥 Fetch error:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  console.log('🚀 Starting API tests...');
  console.log('='.repeat(50));
  
  // Load environment variables
  require('dotenv').config({ path: '.env' });
  
  const results = {};
  
  // Test Polymarket Markets API
  results.polymarketMarkets = await testApi('Polymarket Markets', API_URLS.polymarketMarkets);
  
  // Test Polymarket Trades API
  results.polymarketTrades = await testApi('Polymarket Trades', API_URLS.polymarketTrades);
  
  // Test Supabase API
  results.supabaseMarkets = await testApi('Supabase Markets', API_URLS.supabaseMarkets, {
    headers: {
      'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
    },
  });
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📋 TEST SUMMARY');
  console.log('='.repeat(50));
  
  const successCount = Object.values(results).filter(r => r.success).length;
  const totalCount = Object.keys(results).length;
  
  console.log(`✅ ${successCount}/${totalCount} APIs working`);
  
  Object.entries(results).forEach(([name, result]) => {
    console.log(`${result.success ? '✅' : '❌'} ${name}: ${result.success ? 'SUCCESS' : 'FAILED'}`);
  });
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  if (successCount === totalCount) {
    console.log('✅ All APIs are working! The app should function correctly.');
  } else if (successCount === 0) {
    console.log('❌ No APIs are working. Check internet connection and API endpoints.');
  } else if (!results.polymarketMarkets.success) {
    console.log('⚠️  Polymarket API not working. App will show empty feed.');
  } else if (!results.supabaseMarkets.success) {
    console.log('⚠️  Supabase API not working. Check Supabase project and RLS policies.');
  }
  
  return results;
}

// Run tests
runAllTests().catch(console.error);