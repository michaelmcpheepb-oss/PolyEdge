const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://utbkvjgatqiibfkcpugc.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0Ymt2amdhdHFpaWJma2NwdWdjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njc2MjU2MCwiZXhwIjoyMDkyMzM4NTYwfQ.ztUYEVHHd7PPi_MHo6l7j142ESle2TfulBR1GxNLLT4';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function insertSampleData() {
  console.log('Inserting sample data...');
  
  try {
    // Sample markets data
    const sampleMarkets = [
      {
        id: 'market_btc_100k',
        question: 'Will Bitcoin reach $100,000 by end of 2025?',
        category: 'Crypto',
        yes_price: 0.65,
        no_price: 0.35,
        volume_24h: 1250000,
        total_volume: 8500000,
        end_date: new Date('2025-12-31T23:59:59Z').toISOString(),
        description: 'Prediction market on Bitcoin price milestone',
        updated_at: new Date().toISOString(),
      },
      {
        id: 'market_trump_2024',
        question: 'Will Trump win the 2024 US presidential election?',
        category: 'Politics',
        yes_price: 0.48,
        no_price: 0.52,
        volume_24h: 3200000,
        total_volume: 21000000,
        end_date: new Date('2024-11-05T23:59:59Z').toISOString(),
        description: 'US presidential election prediction',
        updated_at: new Date().toISOString(),
      },
      {
        id: 'market_eth_pos',
        question: 'Will Ethereum transition to proof-of-stake by Q3 2023?',
        category: 'Crypto',
        yes_price: 0.92,
        no_price: 0.08,
        volume_24h: 850000,
        total_volume: 5200000,
        end_date: new Date('2023-09-30T23:59:59Z').toISOString(),
        description: 'Ethereum consensus mechanism upgrade',
        updated_at: new Date().toISOString(),
      },
      {
        id: 'market_taylor_album',
        question: 'Will Taylor Swift release a new album in 2024?',
        category: 'Entertainment',
        yes_price: 0.78,
        no_price: 0.22,
        volume_24h: 450000,
        total_volume: 2800000,
        end_date: new Date('2024-12-31T23:59:59Z').toISOString(),
        description: 'Music industry prediction',
        updated_at: new Date().toISOString(),
      },
      {
        id: 'market_ai_turing',
        question: 'Will AI pass the Turing Test by 2030?',
        category: 'Technology',
        yes_price: 0.55,
        no_price: 0.45,
        volume_24h: 620000,
        total_volume: 4100000,
        end_date: new Date('2030-12-31T23:59:59Z').toISOString(),
        description: 'Artificial intelligence milestone',
        updated_at: new Date().toISOString(),
      },
    ];

    // Sample whale trades
    const sampleWhaleTrades = [
      {
        id: 'trade_1_' + Date.now(),
        market_id: 'market_btc_100k',
        market_question: 'Will Bitcoin reach $100,000 by end of 2025?',
        trader_address: '0x742d35Cc6634C0532925a3b844Bc9e',
        trader_pseudonym: 'CryptoWhale',
        amount_usd: 125000,
        outcome: 'YES',
        side: 'BUY',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        created_at: new Date().toISOString(),
      },
      {
        id: 'trade_2_' + Date.now(),
        market_id: 'market_trump_2024',
        market_question: 'Will Trump win the 2024 US presidential election?',
        trader_address: '0x89205A3a3b2C69c8e',
        trader_pseudonym: 'PoliticalOracle',
        amount_usd: 75000,
        outcome: 'NO',
        side: 'SELL',
        timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        created_at: new Date().toISOString(),
      },
      {
        id: 'trade_3_' + Date.now(),
        market_id: 'market_eth_pos',
        market_question: 'Will Ethereum transition to proof-of-stake by Q3 2023?',
        trader_address: '0x3f5CE5FBFe3E9af',
        trader_pseudonym: 'ETHMaxi',
        amount_usd: 210000,
        outcome: 'YES',
        side: 'BUY',
        timestamp: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
        created_at: new Date().toISOString(),
      },
    ];

    // Sample traders
    const sampleTraders = [
      {
        wallet_address: '0x742d35Cc6634C0532925a3b844Bc9e',
        pseudonym: 'CryptoWhale',
        pnl_30d: 425000,
        win_rate: 0.68,
        total_trades: 142,
        active_positions: 8,
        updated_at: new Date().toISOString(),
      },
      {
        wallet_address: '0x89205A3a3b2C69c8e',
        pseudonym: 'PoliticalOracle',
        pnl_30d: 210000,
        win_rate: 0.72,
        total_trades: 89,
        active_positions: 5,
        updated_at: new Date().toISOString(),
      },
      {
        wallet_address: '0x3f5CE5FBFe3E9af',
        pseudonym: 'ETHMaxi',
        pnl_30d: 185000,
        win_rate: 0.61,
        total_trades: 67,
        active_positions: 3,
        updated_at: new Date().toISOString(),
      },
    ];

    console.log('Inserting markets...');
    const { data: marketsData, error: marketsError } = await supabase
      .from('markets')
      .upsert(sampleMarkets, { onConflict: 'id' })
      .select();
    
    if (marketsError) {
      console.error('❌ Error inserting markets:', marketsError);
    } else {
      console.log(`✅ Inserted/updated ${marketsData?.length || 0} markets`);
    }

    console.log('Inserting whale trades...');
    const { data: tradesData, error: tradesError } = await supabase
      .from('whale_trades')
      .upsert(sampleWhaleTrades, { onConflict: 'id' })
      .select();
    
    if (tradesError) {
      console.error('❌ Error inserting whale trades:', tradesError);
    } else {
      console.log(`✅ Inserted/updated ${tradesData?.length || 0} whale trades`);
    }

    console.log('Inserting traders...');
    const { data: tradersData, error: tradersError } = await supabase
      .from('traders')
      .upsert(sampleTraders, { onConflict: 'wallet_address' })
      .select();
    
    if (tradersError) {
      console.error('❌ Error inserting traders:', tradersError);
    } else {
      console.log(`✅ Inserted/updated ${tradersData?.length || 0} traders`);
    }

    console.log('\n🎉 Sample data insertion complete!');
    console.log('The app should now display real data from Supabase.');

  } catch (error) {
    console.error('💥 Fatal error:', error);
  }
}

insertSampleData();