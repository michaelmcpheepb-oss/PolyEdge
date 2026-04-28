#!/usr/bin/env npx tsx
/**
 * Seeds today's daily_picks with enriched test data to verify the UI.
 * Usage: npx tsx scripts/seed-picks.ts
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);

const today = new Date().toISOString().split('T')[0];

const picks = [
  {
    market_id:            'test-market-btc-100k',
    market_question:      'Will Bitcoin reach $150,000 before end of 2026?',
    recommended_outcome:  'YES',
    confidence_score:     82,
    ai_reasoning:         'On-chain metrics show strong accumulation by long-term holders. Institutional ETF inflows remain elevated and historical cycle analysis supports a continued bull run through Q3.',
    smart_money_direction:'YES',
    smart_money_pct:      74,
    current_yes_price:    0.62,
    current_no_price:     0.38,
    category:             'Crypto',
    pick_date:            today,
    verdict:              'STRONG_BUY',
    kelly_pct:            14.2,
    edge_pct:             20.0,
    edge_label:           'UNDERVALUED',
    risk_level:           'LOW',
    reasoning_bullets:    ['Strong model confidence', '74% smart money aligned', 'Market undervaluing by 20.0%'],
    ai_probability:       82,
  },
  {
    market_id:            'test-market-fed-cut',
    market_question:      'Will the Fed cut rates before Q3 2026?',
    recommended_outcome:  'YES',
    confidence_score:     71,
    ai_reasoning:         'Inflation trajectory supports easing. Fed futures pricing a 68% chance of a September cut. Labour market showing early signs of softening which gives the FOMC political cover.',
    smart_money_direction:'YES',
    smart_money_pct:      67,
    current_yes_price:    0.58,
    current_no_price:     0.42,
    category:             'Economics',
    pick_date:            today,
    verdict:              'BUY',
    kelly_pct:            8.3,
    edge_pct:             13.0,
    edge_label:           'UNDERVALUED',
    risk_level:           'MEDIUM',
    reasoning_bullets:    ['Strong model confidence', '67% smart money aligned', 'Market undervaluing by 13.0%'],
    ai_probability:       71,
  },
  {
    market_id:            'test-market-trump-exec',
    market_question:      'Will Trump sign a crypto regulation order before end of 2026?',
    recommended_outcome:  'NO',
    confidence_score:     58,
    ai_reasoning:         'Legislative agenda is crowded with budget negotiations. Crypto regulation is a lower priority. Congressional pushback on executive crypto orders remains strong.',
    smart_money_direction:'NO',
    smart_money_pct:      55,
    current_yes_price:    0.45,
    current_no_price:     0.55,
    category:             'Politics',
    pick_date:            today,
    verdict:              'NEUTRAL',
    kelly_pct:            3.8,
    edge_pct:             13.0,
    edge_label:           'UNDERVALUED',
    risk_level:           'MEDIUM',
    reasoning_bullets:    ['Moderate confidence signal', 'Mixed smart money signal', 'Market undervaluing by 13.0%'],
    ai_probability:       58,
  },
];

(async () => {
  // Remove any existing test picks for today
  await supabase
    .from('daily_picks')
    .delete()
    .eq('pick_date', today)
    .like('market_id', 'test-%');

  const { data, error } = await supabase
    .from('daily_picks')
    .insert(picks)
    .select('id, market_question, verdict');

  if (error) {
    console.error('❌ Insert failed:', error.message);
    process.exit(1);
  }

  console.log('✅ Seeded picks:');
  data?.forEach((p) => console.log(`  ${p.verdict?.padEnd(12)} ${p.market_question.slice(0, 60)}`));
})();
