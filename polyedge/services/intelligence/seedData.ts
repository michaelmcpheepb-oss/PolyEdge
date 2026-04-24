/**
 * Seed Data Generator for PolyEdge Intelligence Tables
 * Creates realistic mock data for testing UI without waiting for real analytics
 *
 * **IMPORTANT: This uses MOCK DATA** - clearly declared as requested
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);

// Real Polymarket market IDs for authenticity
const REAL_MARKET_IDS = [
  '0x69236077950F8B4C44a43Aef2F05fA97CA0d7c85',
  '0x4bB0aB67b9Dc3bcdf6b5bAe30CF53Cc11Ecf5da6',
  '0x995f3A4e64BF3A3b07e4B9C4b1a2f8b8A8F3D8C0',
  '0x1234567890abcdef1234567890abcdef12345678',
  '0x9876543210fedcba9876543210fedcba98765432'
];

const SAMPLE_QUESTIONS = [
  'Will Bitcoin hit $100,000 by end of 2026?',
  'Will the US have a recession in 2026?',
  'Will AI achieve AGI by 2027?',
  'Will Tesla stock hit $500 by July 2026?',
  'Will there be a major tech IPO in Q2 2026?'
];

const CATEGORIES = ['Crypto', 'Economics', 'Technology', 'Finance', 'Business'];

const AI_REASONINGS = [
  'Strong bullish momentum driven by institutional adoption and favorable regulatory developments. Smart money showing high conviction with 85% alignment on the YES side.',
  'Market pricing reflects growing recession fears amid aggressive monetary policy tightening. Top traders are positioning defensively with concentrated NO bets.',
  'Technical breakthrough indicators accelerating while major AI labs increase R&D spending significantly. Elite wallets showing unprecedented confidence levels.',
  'Earnings momentum and production milestones creating strong fundamental support for continued uptrend. Smart money conviction reaching extreme levels.',
  'IPO pipeline strengthening as market conditions improve and venture funding normalizes. Sophisticated investors positioning for strong Q2 activity.'
];

const TRADER_PSEUDONYMS = [
  'CryptoWhale47', 'MarketMaker2024', 'DegenKing', 'SmartMoneyFlow', 'AlphaHunter',
  'QuantGuru', 'PropTrader99', 'RiskParity', 'YieldFarmer', 'TechBull2026',
  'MacroHedge', 'VolatilityGod', 'ArbitrageBot', 'MomentumSurfer', 'ValueSeeker',
  'CatalystHunter', 'OptionsPro', 'FuturesKing', 'SwingMaster', 'ScalpGod',
  'TrendFollower', 'MeanRevert', 'BreakoutTrade', 'DividendYield', 'GrowthHack'
];

const SPECIALTY_CATEGORIES = [
  'Crypto/DeFi', 'Macro/Economics', 'Technology', 'Healthcare', 'Energy',
  'Finance/Banking', 'Politics', 'Sports', 'Entertainment', 'Climate'
];

export async function seedIntelligenceData(): Promise<{
  dailyPicks: number;
  marketIntelligence: number;
  topTraders: number;
  predictionAccuracy: number;
}> {
  console.log('🌱 **SEEDING WITH MOCK DATA** - Generating sample intelligence data...');

  try {
    // Clear existing data first
    await clearExistingData();

    // 1. Seed daily_picks (5 picks)
    const dailyPicks = await seedDailyPicks();
    console.log(`✅ Created ${dailyPicks} daily picks`);

    // 2. Seed market_intelligence (20 markets)
    const marketIntelligence = await seedMarketIntelligence();
    console.log(`✅ Created ${marketIntelligence} market intelligence records`);

    // 3. Seed top_traders (50 traders)
    const topTraders = await seedTopTraders();
    console.log(`✅ Created ${topTraders} top traders`);

    // 4. Seed prediction_accuracy (1 record)
    const predictionAccuracy = await seedPredictionAccuracy();
    console.log(`✅ Created ${predictionAccuracy} prediction accuracy record`);

    console.log('🎉 **MOCK DATA SEEDING COMPLETE** - All intelligence tables populated!');

    return {
      dailyPicks,
      marketIntelligence,
      topTraders,
      predictionAccuracy
    };

  } catch (error) {
    console.error('💥 Seeding failed:', error);
    throw error;
  }
}

async function clearExistingData(): Promise<void> {
  console.log('🧹 Clearing existing mock data...');

  const tables = ['daily_picks', 'market_intelligence', 'top_traders', 'prediction_accuracy'];

  for (const table of tables) {
    try {
      await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      console.log(`  ✅ Cleared ${table}`);
    } catch (error) {
      console.warn(`  ⚠️ Could not clear ${table}:`, error);
    }
  }
}

async function seedDailyPicks(): Promise<number> {
  const picks = [];
  const today = new Date().toISOString().split('T')[0];

  for (let i = 0; i < 5; i++) {
    const confidenceScore = 60 + Math.floor(Math.random() * 35); // 60-95 range
    const smartMoneyPct = 50 + Math.floor(Math.random() * 40); // 50-90 range
    const yesPrice = 0.3 + Math.random() * 0.4; // 0.3-0.7 range
    const recommendedOutcome = yesPrice > 0.5 ? 'YES' : 'NO';
    const smartMoneyDirection = Math.random() > 0.7 ? 'MIXED' : recommendedOutcome;

    picks.push({
      market_id: REAL_MARKET_IDS[i],
      market_question: SAMPLE_QUESTIONS[i],
      recommended_outcome: recommendedOutcome,
      confidence_score: confidenceScore,
      ai_reasoning: AI_REASONINGS[i],
      smart_money_direction: smartMoneyDirection,
      smart_money_pct: smartMoneyPct,
      current_yes_price: yesPrice,
      current_no_price: 1 - yesPrice,
      category: CATEGORIES[i],
      pick_date: today,
      resolved: false,
      was_correct: null,
      created_at: new Date().toISOString()
    });
  }

  const { data, error } = await supabase
    .from('daily_picks')
    .insert(picks)
    .select();

  if (error) throw error;
  return data?.length || 0;
}

async function seedMarketIntelligence(): Promise<number> {
  const intelligence = [];

  // Create 20 market intelligence records
  for (let i = 0; i < 20; i++) {
    const marketId = i < 5 ? REAL_MARKET_IDS[i] : `mock-market-${i}`;
    const question = i < 5 ? SAMPLE_QUESTIONS[i] : `Sample prediction market ${i}?`;
    const confidenceScore = 30 + Math.floor(Math.random() * 65); // 30-95 range
    const smartMoneyPct = 45 + Math.floor(Math.random() * 40); // 45-85 range
    const momentumPct = Math.floor(Math.random() * 20); // 0-20% momentum

    const directions = ['YES', 'NO', 'MIXED'];
    const smartMoneyDirection = directions[Math.floor(Math.random() * directions.length)];

    const sharpVsPublic = ['SHARP_YES', 'SHARP_NO', 'PUBLIC_YES', 'PUBLIC_NO', 'ALIGNED'];
    const momentum = ['STRONG_YES', 'WEAK_YES', 'NEUTRAL', 'WEAK_NO', 'STRONG_NO'];

    // Generate mock wallet positions
    const topWalletPositions = Array.from({ length: 5 }, (_, idx) => ({
      wallet: `0x${Math.random().toString(16).slice(2, 42)}`,
      outcome: Math.random() > 0.5 ? 'YES' : 'NO',
      shares: Math.floor(Math.random() * 10000) + 1000,
      avgPrice: 0.3 + Math.random() * 0.4,
      pnl: (Math.random() - 0.5) * 5000
    }));

    intelligence.push({
      market_id: marketId,
      market_question: question,
      confidence_score: confidenceScore,
      smart_money_direction: smartMoneyDirection,
      smart_money_pct: smartMoneyPct,
      sharp_vs_public: sharpVsPublic[Math.floor(Math.random() * sharpVsPublic.length)],
      momentum: momentum[Math.floor(Math.random() * momentum.length)],
      momentum_pct: momentumPct,
      ai_brief: `Mock AI analysis for ${question.slice(0, 50)}...`,
      top_wallet_positions: JSON.stringify(topWalletPositions),
      updated_at: new Date().toISOString()
    });
  }

  const { data, error } = await supabase
    .from('market_intelligence')
    .insert(intelligence)
    .select();

  if (error) throw error;
  return data?.length || 0;
}

async function seedTopTraders(): Promise<number> {
  const traders = [];

  for (let i = 0; i < 50; i++) {
    const rank = i + 1;
    const winRate = 45 + Math.random() * 40; // 45-85% win rate
    const roi30d = (Math.random() - 0.3) * 100; // -30% to 70% ROI
    const totalPnl = (Math.random() - 0.2) * 50000; // -$10k to $40k PnL
    const totalTrades = Math.floor(Math.random() * 500) + 50;

    // Generate mock active positions
    const activePositions = Array.from({ length: Math.floor(Math.random() * 8) + 2 }, () => ({
      market_id: `mock-position-${Math.random().toString(16).slice(2, 8)}`,
      outcome: Math.random() > 0.5 ? 'YES' : 'NO',
      shares: Math.floor(Math.random() * 5000) + 100,
      unrealized_pnl: (Math.random() - 0.5) * 1000
    }));

    traders.push({
      wallet_address: `0x${Math.random().toString(16).slice(2, 42)}`,
      pseudonym: TRADER_PSEUDONYMS[i % TRADER_PSEUDONYMS.length] + (i > TRADER_PSEUDONYMS.length ? i : ''),
      rank: rank,
      win_rate: Math.round(winRate * 100) / 100,
      roi_30d: Math.round(roi30d * 100) / 100,
      total_pnl: Math.round(totalPnl),
      total_trades: totalTrades,
      specialty_category: SPECIALTY_CATEGORIES[Math.floor(Math.random() * SPECIALTY_CATEGORIES.length)],
      active_positions: JSON.stringify(activePositions),
      last_trade_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  const { data, error } = await supabase
    .from('top_traders')
    .insert(traders)
    .select();

  if (error) throw error;
  return data?.length || 0;
}

async function seedPredictionAccuracy(): Promise<number> {
  // Create realistic accuracy metrics
  const totalPicks = 127;
  const correctPicks = 84;
  const accuracyPct = (correctPicks / totalPicks) * 100;

  const { data, error } = await supabase
    .from('prediction_accuracy')
    .insert({
      total_picks: totalPicks,
      correct_picks: correctPicks,
      accuracy_pct: Math.round(accuracyPct * 100) / 100,
      updated_at: new Date().toISOString()
    })
    .select();

  if (error) throw error;
  return data?.length || 0;
}

// Helper function to run seed script standalone
export async function runSeedScript(): Promise<void> {
  console.log('🌱 **RUNNING MOCK DATA SEED SCRIPT**');
  console.log('**WARNING: This will populate tables with MOCK/SAMPLE data**');
  console.log('**This is for UI testing purposes only**');

  try {
    const result = await seedIntelligenceData();
    console.log('\n📊 **MOCK DATA SEEDING SUMMARY:**');
    console.log(`  • Daily Picks: ${result.dailyPicks} records`);
    console.log(`  • Market Intelligence: ${result.marketIntelligence} records`);
    console.log(`  • Top Traders: ${result.topTraders} records`);
    console.log(`  • Prediction Accuracy: ${result.predictionAccuracy} record`);
    console.log('\n✅ **MOCK DATA READY** - UI can now be tested with sample data');
  } catch (error) {
    console.error('💥 **MOCK DATA SEEDING FAILED:**', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runSeedScript();
}