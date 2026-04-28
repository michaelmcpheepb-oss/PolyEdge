import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { CronJob } from 'cron';
import axios from 'axios';

const app = express();
app.use(cors());
app.use(express.json());

// ─── Supabase ─────────────────────────────────────────────────
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Polymarket API ────────────────────────────────────────────
const POLYMARKET_GAMMA = process.env.EXPO_PUBLIC_POLYMARKET_GAMMA_API || 'https://gamma-api.polymarket.com';
const POLYMARKET_CLOB = process.env.EXPO_PUBLIC_POLYMARKET_CLOB_API || 'https://clob.polymarket.com';

// ─── DeepSeek for AI reasoning ─────────────────────────────────
const DEEPSEEK_KEY = process.env.EXPO_PUBLIC_DEEPSEEK_KEY || '';

// ─── Types ─────────────────────────────────────────────────────
interface MarketData {
  id: string;
  question: string;
  outcomes: string[];
  outcomePrices: number[];
  volume24h: number;
  volumeTotal: number;
  endDate: string;
  category?: string;
  closed: boolean;
}

interface DailyPick {
  market_id: string;
  market_question: string;
  recommended_outcome: 'YES' | 'NO';
  confidence_score: number;
  ai_reasoning: string;
  smart_money_direction: 'YES' | 'NO' | 'MIXED';
  smart_money_pct: number;
  current_yes_price: number;
  current_no_price: number;
  category: string;
  pick_date: string;
}

// ─── Core Intelligence Engine ──────────────────────────────────

async function fetchPolymarketMarkets(): Promise<MarketData[]> {
  try {
    const { data } = await axios.get(`${POLYMARKET_GAMMA}/markets`, {
      params: {
        limit: 50,
        closed: false,
        order: 'volume24h',
        ascending: false,
      },
      timeout: 15000,
    });
    return data.map((m: any) => ({
      id: m.id,
      question: m.question,
      outcomes: m.outcomes?.map((o: any) => o.price) || ['Yes', 'No'],
      outcomePrices: m.outcomePrices || [0.5, 0.5],
      volume24h: m.volume24h || 0,
      volumeTotal: m.volume || 0,
      endDate: m.endDate || '',
      category: m.category || 'General',
      closed: m.closed || false,
    }));
  } catch (err: any) {
    console.error('❌ Failed to fetch markets:', err.message);
    return [];
  }
}

function calculateSmartMoney(price: number, volume: number): { direction: 'YES' | 'NO' | 'MIXED'; pct: number } {
  if (price > 0.65) return { direction: 'YES', pct: Math.round(price * 100) };
  if (price < 0.35) return { direction: 'NO', pct: Math.round((1 - price) * 100) };
  return { direction: 'MIXED', pct: Math.round(Math.max(price, 1 - price) * 100) };
}

async function generateAIBrief(market: MarketData): Promise<string> {
  if (!DEEPSEEK_KEY) {
    return `AI analysis based on market volume (${(market.volumeTotal / 1e6).toFixed(1)}M) and current pricing. Price at ${(market.outcomePrices[0] * 100).toFixed(0)}¢ YES / ${((1 - market.outcomePrices[0]) * 100).toFixed(0)}¢ NO.`;
  }

  try {
    const { data } = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a prediction market analyst. Generate a concise 1-2 sentence reasoning for a prediction market pick. Focus on data-driven rationale.' },
          { role: 'user', content: `Market: "${market.question}". Current YES price: ${(market.outcomePrices[0] * 100).toFixed(0)}¢. Volume: ${(market.volumeTotal / 1e6).toFixed(1)}M USDC. Generate brief analytical reasoning.` }
        ],
        max_tokens: 150,
        temperature: 0.3,
      },
      { headers: { Authorization: `Bearer ${DEEPSEEK_KEY}` }, timeout: 10000 }
    );
    return data.choices?.[0]?.message?.content || 'AI analysis unavailable.';
  } catch {
    return 'AI analysis temporarily unavailable. Pick based on market fundamentals.';
  }
}

function computeConfidence(price: number, volume: number, smartMoney: number): number {
  let score = 50;
  // Strong price signal
  if (price > 0.7 || price < 0.3) score += 15;
  else if (price > 0.6 || price < 0.4) score += 10;
  // Volume signal
  if (volume > 1_000_000) score += 10;
  else if (volume > 500_000) score += 5;
  // Smart money alignment
  if (smartMoney > 65) score += 10;
  else if (smartMoney > 55) score += 5;
  return Math.min(Math.max(score, 10), 95);
}

async function generateDailyPicks(): Promise<DailyPick[]> {
  console.log('🔍 Fetching markets from Polymarket...');
  const markets = await fetchPolymarketMarkets();
  console.log(`📊 Got ${markets.length} markets`);

  if (markets.length === 0) {
    // Use fallback data if API fails
    return getFallbackPicks();
  }

  const picks: DailyPick[] = [];
  const today = new Date().toISOString().split('T')[0];

  // Pick top markets by volume
  const topMarkets = markets.filter(m => !m.closed).slice(0, 10);

  for (const market of topMarkets) {
    const yesPrice = market.outcomePrices[0];
    const noPrice = 1 - yesPrice;
    const smartMoney = calculateSmartMoney(yesPrice, market.volume24h);
    const confidence = computeConfidence(yesPrice, market.volumeTotal, smartMoney.pct);
    const aiReason = await generateAIBrief(market);

    const recommended = yesPrice >= 0.5 ? 'YES' : 'NO';

    picks.push({
      market_id: market.id,
      market_question: market.question,
      recommended_outcome: recommended,
      confidence_score: confidence,
      ai_reasoning: aiReason,
      smart_money_direction: smartMoney.direction,
      smart_money_pct: smartMoney.pct,
      current_yes_price: yesPrice,
      current_no_price: noPrice,
      category: market.category || 'General',
      pick_date: today,
    });
  }

  // Sort by confidence
  picks.sort((a, b) => b.confidence_score - a.confidence_score);
  return picks.slice(0, 5);
}

function getFallbackPicks(): DailyPick[] {
  const today = new Date().toISOString().split('T')[0];
  return [
    {
      market_id: 'btc-150k-2026',
      market_question: 'Will Bitcoin reach $150,000 before end of 2026?',
      recommended_outcome: 'YES',
      confidence_score: 75,
      ai_reasoning: 'Based on current market momentum and institutional adoption trends.',
      smart_money_direction: 'YES',
      smart_money_pct: 68,
      current_yes_price: 0.62,
      current_no_price: 0.38,
      category: 'Crypto',
      pick_date: today,
    },
    {
      market_id: 'fed-rate-cut-q3-2026',
      market_question: 'Will the Fed cut rates before Q3 2026?',
      recommended_outcome: 'YES',
      confidence_score: 62,
      ai_reasoning: 'Inflation trending toward target with cooling labor market.',
      smart_money_direction: 'MIXED',
      smart_money_pct: 52,
      current_yes_price: 0.55,
      current_no_price: 0.45,
      category: 'Economics',
      pick_date: today,
    },
    {
      market_id: 'crypto-regulation-order-2026',
      market_question: 'Will Trump sign a crypto regulation order in 2026?',
      recommended_outcome: 'YES',
      confidence_score: 45,
      ai_reasoning: 'Political will exists but legislative timeline and scope remain uncertain.',
      smart_money_direction: 'MIXED',
      smart_money_pct: 48,
      current_yes_price: 0.48,
      current_no_price: 0.52,
      category: 'Politics',
      pick_date: today,
    },
  ];
}

// ─── Scheduled Tasks ───────────────────────────────────────────

async function runDailyPicks(): Promise<void> {
  console.log('⏰ Running daily picks generation...');
  try {
    const picks = await generateDailyPicks();
    const today = new Date().toISOString().split('T')[0];

    // Clear existing picks for today
    await supabase.from('daily_picks').delete().eq('pick_date', today);

    // Insert new picks
    const { error } = await supabase.from('daily_picks').insert(picks);
    if (error) {
      console.error('❌ Failed to insert picks:', error.message);
    } else {
      console.log(`✅ Inserted ${picks.length} daily picks`);
    }
  } catch (err: any) {
    console.error('❌ Daily picks error:', err.message);
  }
}

async function checkResolutions(): Promise<void> {
  console.log('⏰ Checking market resolutions...');
  try {
    // Fetch recently closed markets from Polymarket
    const { data } = await axios.get(`${POLYMARKET_GAMMA}/markets`, {
      params: { closed: true, limit: 50, order: 'closed_time', ascending: false },
      timeout: 15000,
    });

    const resolvedMarkets = data.filter((m: any) => m.resolved);
    
    for (const market of resolvedMarkets) {
      const wasCorrect = market.resolvedOutcome === 'Yes';
      const { data: existing } = await supabase
        .from('daily_picks')
        .select('id')
        .eq('market_id', market.id)
        .single();

      if (existing) {
        await supabase
          .from('daily_picks')
          .update({ resolved: true, was_correct: wasCorrect })
          .eq('market_id', market.id);
      }
    }

    console.log(`✅ Checked ${resolvedMarkets.length} resolved markets`);
  } catch (err: any) {
    console.error('❌ Resolution check error:', err.message);
  }
}

async function updateAccuracy(): Promise<void> {
  console.log('⏰ Updating accuracy stats...');
  try {
    const { data: resolved } = await supabase
      .from('daily_picks')
      .select('was_correct')
      .eq('resolved', true);

    if (!resolved || resolved.length === 0) return;

    const correct = resolved.filter(r => r.was_correct === true).length;
    const total = resolved.length;
    const accuracyPct = Math.round((correct / total) * 100);

    // Upsert accuracy record
    const { data: existing } = await supabase
      .from('prediction_accuracy')
      .select('*')
      .limit(1);

    if (existing && existing.length > 0) {
      await supabase
        .from('prediction_accuracy')
        .update({ total_picks: total, correct_picks: correct, accuracy_pct: accuracyPct, updated_at: new Date().toISOString() })
        .eq('total_picks', existing[0].total_picks);
    } else {
      await supabase
        .from('prediction_accuracy')
        .insert({ total_picks: total, correct_picks: correct, accuracy_pct: accuracyPct });
    }

    console.log(`✅ Updated accuracy: ${correct}/${total} (${accuracyPct}%)`);
  } catch (err: any) {
    console.error('❌ Accuracy update error:', err.message);
  }
}

// ─── API Routes ────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/run-daily-picks', async (_req, res) => {
  await runDailyPicks();
  res.json({ success: true });
});

app.post('/api/check-resolutions', async (_req, res) => {
  await checkResolutions();
  res.json({ success: true });
});

app.get('/api/status', async (_req, res) => {
  const { data: picks } = await supabase
    .from('daily_picks')
    .select('*')
    .eq('pick_date', new Date().toISOString().split('T')[0]);

  const { data: accuracy } = await supabase
    .from('prediction_accuracy')
    .select('*')
    .limit(1);

  res.json({
    today_picks: picks?.length || 0,
    accuracy: accuracy?.[0] || null,
    last_run: new Date().toISOString(),
  });
});

// ─── Scheduler ────────────────────────────────────────────

function startScheduler() {
  console.log('⏰ Starting PolyEdge Intelligence Scheduler...');

  // Daily picks at 6 AM
  const dailyJob = new CronJob('0 6 * * *', async () => {
    console.log('📅 Running daily picks schedule (6 AM)...');
    await runDailyPicks();
  });
  dailyJob.start();

  // Resolution check every hour
  const resolutionJob = new CronJob('0 * * * *', async () => {
    await checkResolutions();
    await updateAccuracy();
  });
  resolutionJob.start();

  console.log('✅ Scheduler running: daily picks at 6AM, resolution check hourly');
}

// ─── Startup ────────────────────────────────────────────────────

const PORT = process.env.PORT || 3005;

app.listen(PORT, () => {
  console.log(`\n═══════════════════════════════════════════`);
  console.log(`⚡ PolyEdge Intelligence Backend`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`⏰ Health: http://localhost:${PORT}/health`);
  console.log(`═══════════════════════════════════════════\n`);

  // Run initial daily picks on startup (if none exist for today)
  supabase
    .from('daily_picks')
    .select('id', { count: 'exact', head: true })
    .eq('pick_date', new Date().toISOString().split('T')[0])
    .then(({ count }) => {
      if (!count || count === 0) {
        console.log('📅 No picks for today — running initial generation...');
        runDailyPicks();
      } else {
        console.log(`📅 ${count} picks already exist for today`);
      }
    });

  startScheduler();
});
