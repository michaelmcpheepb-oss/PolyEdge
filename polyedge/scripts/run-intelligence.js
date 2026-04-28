#!/usr/bin/env node
/**
 * One-shot runner for the daily intelligence engine.
 * Usage: node scripts/run-intelligence.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

// Register ts-node so we can require TypeScript files directly
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'commonjs' },
});

const { dailyPicksEngine } = require('../services/intelligence/dailyPicksEngine');

(async () => {
  console.log('🚀 Running intelligence engine...');
  try {
    const result = await dailyPicksEngine.runDailyAnalysis();
    console.log('✅ Done:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('❌ Engine failed:', err.message ?? err);
    process.exit(1);
  }
})();
