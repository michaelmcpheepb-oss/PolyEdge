#!/usr/bin/env npx tsx
/**
 * One-shot runner for the daily intelligence engine.
 * Usage: npx tsx scripts/run-intelligence.ts
 */

import 'dotenv/config';
import { dailyPicksEngine } from '../services/intelligence/dailyPicksEngine';

(async () => {
  console.log('🚀 Running intelligence engine...');
  try {
    const result = await dailyPicksEngine.runDailyAnalysis();
    console.log('✅ Done:', JSON.stringify(result, null, 2));
  } catch (err: any) {
    console.error('❌ Engine failed:', err?.message ?? err);
    process.exit(1);
  }
})();
