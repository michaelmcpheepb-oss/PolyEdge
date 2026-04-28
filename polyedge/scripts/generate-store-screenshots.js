#!/usr/bin/env node
/**
 * Generate Play Store screenshots matching PolyEdge's actual dark theme design.
 * Run: node scripts/generate-store-screenshots.js
 * Uses Playwright to take screenshots of self-contained HTML mockups.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const COLORS = {
  bg: '#0D0D1A',
  surface: '#1A1A2E',
  accent: '#00D4AA',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0B8',
  textTertiary: '#6A6A8A',
  border: '#2A2A45',
  success: '#27AE60',
  error: '#E74C3C',
  warning: '#F39C12',
};

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');

const screens = [
  {
    name: 'app-today',
    title: 'Today Screen — Daily Picks',
    html: generateTodayScreen(),
  },
  {
    name: 'app-markets',
    title: 'Markets Screen',
    html: generateMarketsScreen(),
  },
  {
    name: 'app-whales',
    title: 'Whales Screen',
    html: generateWhalesScreen(),
  },
  {
    name: 'app-profile',
    title: 'Profile Screen',
    html: generateProfileScreen(),
  },
];

// Write each HTML to a temp file and screenshot
screens.forEach((screen, i) => {
  const htmlPath = `/tmp/polyedge-${screen.name}.html`;
  fs.writeFileSync(htmlPath, screen.html);
  console.log(`📄 Written ${htmlPath} (${screen.html.length} bytes)`);
});

// Start a simple HTTP server to serve the HTML files
const SERVER_PORT = 3106;
const http = require('http');
const server = http.createServer((req, res) => {
  const file = req.url === '/' ? '/tmp/polyedge-app-today.html' : `/tmp/polyedge-${req.url.substring(1)}.html`;
  try {
    const content = fs.readFileSync(file);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(SERVER_PORT, async () => {
  console.log(`\n🚀 Server on http://localhost:${SERVER_PORT}`);
  console.log(`\n📸 Taking screenshots with Playwright...\n`);

  for (const screen of screens) {
    const url = `http://localhost:${SERVER_PORT}/${screen.name}`;
    const outputPath = path.join(SCREENSHOTS_DIR, `${screen.name}.png`);
    
    try {
      const result = execSync(
        `npx playwright screenshot --viewport-size=390,844 --timeout=30000 "${url}" "${outputPath}"`,
        { timeout: 45000, encoding: 'utf8' }
      );
      const stats = fs.statSync(outputPath);
      console.log(`✅ ${screen.name}.png — ${(stats.size / 1024).toFixed(1)} KB`);
    } catch (err) {
      console.log(`❌ ${screen.name}.png — Error: ${err.message.substring(0, 100)}`);
    }
  }

  console.log('\n✨ Done! Check screenshots/ directory.');
  server.close();
  process.exit(0);
});

function generateTodayScreen() {
  return renderPage(`
    <div class="header">
      <div class="header-left">
        <span class="logo">P</span>
        <h1 style="font-size:20px;font-weight:700;color:${COLORS.textPrimary}">PolyEdge</h1>
      </div>
      <div class="accuracy-badge">68% accuracy</div>
    </div>
    <div style="padding:0 16px">
      <div class="track-record">
        <div class="record-number">17/25</div>
        <div class="record-label">Correct picks</div>
        <div class="record-dots">
          ${Array.from({length: 25}, (_, i) => 
            `<div class="dot ${i < 17 ? 'dot-green' : 'dot-red'}"></div>`
          ).join('')}
        </div>
        <div class="record-footnote">Updated daily by AI</div>
      </div>
    </div>

    <div style="padding:0 16px;margin-top:16px">
      <div class="section-title">Today's Picks</div>
      
      ${[{
        question: 'Will Bitcoin reach $150,000 before end of 2026?',
        confidence: 82,
        verdict: 'STRONG_BUY',
        reason: 'On-chain metrics show strong accumulation by long-term holders. Institutional ETF inflows remain elevated.',
        smartMoney: 'YES',
        smartMoneyPct: 74,
        yesPrice: 0.62,
        noPrice: 0.38,
        category: 'Crypto'
      }, {
        question: 'Will the Fed cut rates before Q3 2026?',
        confidence: 67,
        verdict: 'BUY',
        reason: 'Inflation trending toward target. Labor market showing signs of cooling. Market pricing 62% chance of cut.',
        smartMoney: 'MIXED',
        smartMoneyPct: 52,
        yesPrice: 0.58,
        noPrice: 0.42,
        category: 'Economics'
      }, {
        question: 'Will Trump sign a crypto regulation order in 2026?',
        confidence: 51,
        verdict: 'NEUTRAL',
        reason: 'Political will exists but legislative timeline uncertain. Smart money split with no clear direction.',
        smartMoney: 'NO',
        smartMoneyPct: 48,
        yesPrice: 0.45,
        noPrice: 0.55,
        category: 'Politics'
      }].map(pick => `
        <div class="pick-card">
          <div class="pick-category" style="color:${COLORS.accent}">${pick.category}</div>
          <div class="pick-question">${pick.question}</div>
          <div class="pick-confidence">${pick.confidence}<span style="font-size:12px;color:${COLORS.textSecondary}">%</span></div>
          <div class="pick-reason">${pick.reason}</div>
          <div class="pick-odds">
            <div class="odds-bar" style="display:flex;height:6px;border-radius:3px;overflow:hidden;margin:10px 0">
              <div style="background:${COLORS.success};width:${pick.yesPrice * 100}%"></div>
              <div style="background:${COLORS.error};width:${pick.noPrice * 100}%"></div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:12px">
              <span style="color:${COLORS.success}">YES ${(pick.yesPrice * 100).toFixed(0)}¢</span>
              <span style="color:${COLORS.error}">NO ${(pick.noPrice * 100).toFixed(0)}¢</span>
            </div>
          </div>
          <div class="smart-money-row">
            <span class="smart-label">Smart Money</span>
            <span class="smart-value" style="color:${pick.smartMoney === 'YES' ? COLORS.success : pick.smartMoney === 'NO' ? COLORS.error : COLORS.warning}">${pick.smartMoney} ${pick.smartMoneyPct}%</span>
          </div>
          <div class="pick-verdict verdict-${pick.verdict === 'STRONG_BUY' ? 'strong' : pick.verdict === 'BUY' ? 'buy' : 'neutral'}">
            ${pick.verdict === 'STRONG_BUY' ? '▲' : pick.verdict === 'BUY' ? '↑' : '◆'} ${pick.verdict.replace('_', ' ')}
          </div>
        </div>
      `).join('')}
    </div>

    <div class="tab-bar">
      ${[
        { icon: '🔥', label: 'Today', active: true },
        { icon: '📊', label: 'Markets', active: false },
        { icon: '🐋', label: 'Whales', active: false },
        { icon: '👤', label: 'Profile', active: false },
        { icon: '🔔', label: 'Alerts', active: false },
        { icon: '🏆', label: 'Leaderboard', active: false },
      ].map(tab => `
        <div class="tab-item ${tab.active ? 'tab-active' : ''}">
          <div class="tab-icon">${tab.icon}</div>
          <div class="tab-label">${tab.label}</div>
        </div>
      `).join('')}
    </div>
  `);
}

function generateMarketsScreen() {
  const categories = ['🔥 All', '₿ Crypto', '📈 Economics', '🔬 Tech', '🏛️ Politics', '⚽ Sports', '🌍 World'];
  const markets = [
    { q: 'Will Bitcoin reach $150K by end of 2026?', y: 0.62, n: 0.38, cat: 'Crypto', vol: '$12.4M' },
    { q: 'Will the Fed cut rates before Q3 2026?', y: 0.58, n: 0.42, cat: 'Economics', vol: '$8.7M' },
    { q: 'Will AI achieve AGI by 2027?', y: 0.35, n: 0.65, cat: 'Technology', vol: '$5.2M' },
    { q: 'Will Tesla stock hit $500 by July 2026?', y: 0.48, n: 0.52, cat: 'Finance', vol: '$3.1M' },
    { q: 'Will Barcelona win La Liga 2025-26?', y: 0.72, n: 0.28, cat: 'Sports', vol: '$2.8M' },
  ];

  return renderPage(`
    <div class="header">
      <div class="header-left">
        <span class="logo">P</span>
        <h1 style="font-size:20px;font-weight:700;color:${COLORS.textPrimary}">Markets</h1>
      </div>
      <div class="search-icon">🔍</div>
    </div>
    <div class="category-scroll" style="display:flex;gap:8px;padding:12px 16px;overflow-x:auto">
      ${categories.map((c, i) => `
        <div class="category-chip ${i === 0 ? 'chip-active' : ''}">${c}</div>
      `).join('')}
    </div>
    <div style="padding:0 16px">
      ${markets.map(m => `
        <div class="market-card">
          <div class="market-category" style="color:${COLORS.accent}">${m.cat}</div>
          <div class="market-question">${m.q}</div>
          <div class="market-volume">Vol: ${m.vol}</div>
          <div style="display:flex;gap:8px;margin-top:10px">
            <div class="outcome-button" style="background:rgba(39,174,96,0.15);color:${COLORS.success}">YES ${(m.y * 100).toFixed(0)}¢</div>
            <div class="outcome-button" style="background:rgba(231,76,60,0.15);color:${COLORS.error}">NO ${(m.n * 100).toFixed(0)}¢</div>
          </div>
        </div>
      `).join('')}
    </div>
    <div class="tab-bar">
      ${[
        { icon: '🔥', label: 'Today', active: false },
        { icon: '📊', label: 'Markets', active: true },
        { icon: '🐋', label: 'Whales', active: false },
        { icon: '👤', label: 'Profile', active: false },
        { icon: '🔔', label: 'Alerts', active: false },
        { icon: '🏆', label: 'Leaderboard', active: false },
      ].map(tab => `
        <div class="tab-item ${tab.active ? 'tab-active' : ''}">
          <div class="tab-icon">${tab.icon}</div>
          <div class="tab-label">${tab.label}</div>
        </div>
      `).join('')}
    </div>
  `);
}

function generateWhalesScreen() {
  const whales = [
    { rank: 1, name: 'CryptoWhale47', winRate: 82, roi: '+47.2%', trades: 1243, specialty: 'Crypto/DeFi', active: true },
    { rank: 2, name: 'QuantGuru', winRate: 79, roi: '+38.5%', trades: 892, specialty: 'Macro/Economics', active: true },
    { rank: 3, name: 'SmartMoneyFlow', winRate: 76, roi: '+31.8%', trades: 2156, specialty: 'Technology', active: true },
    { rank: 4, name: 'AlphaHunter', winRate: 74, roi: '+28.2%', trades: 1567, specialty: 'Finance/Banking', active: false },
    { rank: 5, name: 'MarketMaker2024', winRate: 71, roi: '+24.6%', trades: 3421, specialty: 'Crypto/DeFi', active: false },
  ];

  return renderPage(`
    <div class="header">
      <div class="header-left">
        <span class="logo">P</span>
        <h1 style="font-size:20px;font-weight:700;color:${COLORS.textPrimary}">Whales</h1>
      </div>
      <div class="update-dot"></div>
    </div>
    <div style="padding:0 16px;margin-top:8px">
      <div class="section-title">Top Traders</div>
      ${whales.map(w => `
        <div class="whale-row" style="display:flex;align-items:center;padding:12px 0;border-bottom:1px solid ${COLORS.border}">
          <div style="width:32px;font-size:16px;font-weight:700;color:${w.rank === 1 ? COLORS.accent : COLORS.textSecondary}">${w.rank === 1 ? '🥇' : w.rank === 2 ? '🥈' : w.rank === 3 ? '🥉' : `#${w.rank}`}</div>
          <div style="flex:1;margin-left:8px">
            <div style="color:${COLORS.textPrimary};font-weight:600;font-size:14px">${w.name}</div>
            <div style="color:${COLORS.textTertiary};font-size:11px">${w.specialty} · ${w.trades.toLocaleString()} trades</div>
          </div>
          <div style="text-align:right">
            <div style="color:${COLORS.success};font-weight:600;font-size:14px">${w.roi}</div>
            <div style="color:${COLORS.textSecondary};font-size:11px">${w.winRate}% WR</div>
          </div>
          ${w.active ? '<div style="width:8px;height:8px;border-radius:4px;background:' + COLORS.accent + ';margin-left:8px;box-shadow:0 0 6px ' + COLORS.accent + '"></div>' : ''}
        </div>
      `).join('')}
    </div>
    <div class="tab-bar">
      ${[
        { icon: '🔥', label: 'Today', active: false },
        { icon: '📊', label: 'Markets', active: false },
        { icon: '🐋', label: 'Whales', active: true },
        { icon: '👤', label: 'Profile', active: false },
        { icon: '🔔', label: 'Alerts', active: false },
        { icon: '🏆', label: 'Leaderboard', active: false },
      ].map(tab => `
        <div class="tab-item ${tab.active ? 'tab-active' : ''}">
          <div class="tab-icon">${tab.icon}</div>
          <div class="tab-label">${tab.label}</div>
        </div>
      `).join('')}
    </div>
  `);
}

function generateProfileScreen() {
  return renderPage(`
    <div class="header">
      <div class="header-left">
        <span class="logo">P</span>
        <h1 style="font-size:20px;font-weight:700;color:${COLORS.textPrimary}">Profile</h1>
      </div>
      <div style="color:${COLORS.textSecondary};font-size:14px">⚙️</div>
    </div>
    <div style="padding:24px 16px;display:flex;flex-direction:column;align-items:center">
      <div style="width:72px;height:72px;border-radius:36px;background:linear-gradient(135deg,${COLORS.accent},#009B7D);display:flex;align-items:center;justify-content:center;font-size:32px;margin-bottom:12px">👤</div>
      <div style="color:${COLORS.textPrimary};font-size:18px;font-weight:600">Your Account</div>
      <div style="color:${COLORS.textTertiary};font-size:13px;margin-top:4px">Sign in to access all features</div>
    </div>
    <div style="padding:0 16px">
      <div class="menu-item">
        <span style="color:${COLORS.accent}">📊</span>
        <span style="flex:1;margin-left:12px">My Track Record</span>
        <span style="color:${COLORS.textTertiary}">›</span>
      </div>
      <div class="menu-item">
        <span style="color:${COLORS.accent}">🔔</span>
        <span style="flex:1;margin-left:12px">Notifications</span>
        <span style="color:${COLORS.textTertiary}">›</span>
      </div>
      <div class="menu-item">
        <span style="color:${COLORS.accent}">⭐</span>
        <span style="flex:1;margin-left:12px">PolyEdge Pro</span>
        <span style="color:${COLORS.textTertiary}">›</span>
      </div>
      <div class="menu-item">
        <span style="color:${COLORS.accent}">ℹ️</span>
        <span style="flex:1;margin-left:12px">About</span>
        <span style="color:${COLORS.textTertiary}">›</span>
      </div>
    </div>
    <div class="pro-banner" style="margin:24px 16px;padding:16px;background:linear-gradient(135deg,${COLORS.surface},${COLORS.elevated});border-radius:12px;border:1px solid ${COLORS.border}">
      <div style="color:${COLORS.accent};font-size:16px;font-weight:600">✨ PolyEdge Pro</div>
      <div style="color:${COLORS.textSecondary};font-size:13px;margin-top:4px">Unlock AI briefs, whale alerts, and advanced analytics</div>
      <div style="margin-top:12px;padding:10px 20px;background:${COLORS.accent};border-radius:8px;color:${COLORS.bg};font-weight:600;font-size:14px;text-align:center">Upgrade — €9.99/mo</div>
    </div>
    <div class="tab-bar" style="position:fixed;bottom:0">
      ${[
        { icon: '🔥', label: 'Today', active: false },
        { icon: '📊', label: 'Markets', active: false },
        { icon: '🐋', label: 'Whales', active: false },
        { icon: '👤', label: 'Profile', active: true },
        { icon: '🔔', label: 'Alerts', active: false },
        { icon: '🏆', label: 'Leaderboard', active: false },
      ].map(tab => `
        <div class="tab-item ${tab.active ? 'tab-active' : ''}">
          <div class="tab-icon">${tab.icon}</div>
          <div class="tab-label">${tab.label}</div>
        </div>
      `).join('')}
    </div>
  `);
}

function renderPage(content) {
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: ${COLORS.bg}; color: ${COLORS.textPrimary};
  width: 390px; min-height: 844px; overflow-x: hidden;
  position: relative; padding-bottom: 70px;
}
.header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; background: ${COLORS.surface};
  border-bottom: 1px solid ${COLORS.border};
}
.header-left { display: flex; align-items: center; gap: 10px; }
.logo {
  width: 32px; height: 32px; border-radius: 8px;
  background: ${COLORS.accent}; display: flex; align-items: center;
  justify-content: center; font-weight: 800; font-size: 18px; color: ${COLORS.bg};
}
.accuracy-badge {
  padding: 4px 12px; background: rgba(0,212,170,0.15); color: ${COLORS.accent};
  border-radius: 12px; font-size: 12px; font-weight: 600;
}
.track-record {
  background: ${COLORS.surface}; border-radius: 12px; padding: 16px;
  margin-top: 16px; border: 1px solid ${COLORS.border};
}
.record-number { font-size: 42px; font-weight: 800; color: ${COLORS.accent}; }
.record-label { font-size: 12px; color: ${COLORS.textSecondary}; margin-top: -4px; }
.record-dots { display: flex; gap: 3px; flex-wrap: wrap; margin-top: 8px; }
.dot { width: 8px; height: 8px; border-radius: 4px; }
.dot-green { background: ${COLORS.success}; }
.dot-red { background: ${COLORS.error}; }
.record-footnote { font-size: 10px; color: ${COLORS.textTertiary}; margin-top: 8px; font-style: italic; }
.section-title { color: ${COLORS.textSecondary}; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
.pick-card {
  background: ${COLORS.surface}; border-radius: 12px; padding: 16px;
  margin-bottom: 12px; border: 1px solid ${COLORS.border}; position: relative;
}
.pick-category { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
.pick-question { color: ${COLORS.textPrimary}; font-size: 14px; font-weight: 600; margin-top: 4px; line-height: 1.3; }
.pick-confidence { position: absolute; top: 16px; right: 16px; font-size: 28px; font-weight: 800; color: ${COLORS.accent}; }
.pick-reason { font-size: 12px; color: ${COLORS.textSecondary}; margin-top: 8px; line-height: 1.4; }
.pick-odds { margin-top: 4px; }
.smart-money-row { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 8px; border-top: 1px solid ${COLORS.border}; }
.smart-label { font-size: 11px; color: ${COLORS.textTertiary}; }
.smart-value { font-size: 13px; font-weight: 700; }
.pick-verdict { margin-top: 8px; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; text-align: center; letter-spacing: 0.5px; }
.verdict-strong { background: rgba(0,212,170,0.15); color: ${COLORS.accent}; }
.verdict-buy { background: rgba(39,174,96,0.12); color: ${COLORS.success}; }
.verdict-neutral { background: rgba(243,156,18,0.12); color: ${COLORS.warning}; }
.category-chip { padding: 6px 14px; border-radius: 16px; font-size: 12px; background: ${COLORS.surface}; color: ${COLORS.textSecondary}; white-space: nowrap; border: 1px solid ${COLORS.border}; }
.chip-active { background: rgba(0,212,170,0.15); color: ${COLORS.accent}; border-color: ${COLORS.accent}; }
.market-card { background: ${COLORS.surface}; border-radius: 12px; padding: 14px; margin-bottom: 10px; border-left: 3px solid ${COLORS.accent}; }
.market-category { font-size: 10px; font-weight: 600; text-transform: uppercase; }
.market-question { font-size: 14px; font-weight: 600; margin-top: 2px; line-height: 1.3; }
.market-volume { font-size: 11px; color: ${COLORS.textTertiary}; margin-top: 2px; }
.outcome-button { flex: 1; padding: 8px; border-radius: 8px; text-align: center; font-size: 13px; font-weight: 700; }
.menu-item { display: flex; align-items: center; padding: 14px 16px; background: ${COLORS.surface}; border-radius: 10px; margin-bottom: 8px; cursor: pointer; }
.update-dot { width: 8px; height: 8px; border-radius: 4px; background: ${COLORS.accent}; box-shadow: 0 0 8px ${COLORS.accent}; }
.tab-bar {
  position: fixed; bottom: 0; left: 0; right: 0;
  display: flex; background: ${COLORS.bg}; border-top: 1px solid ${COLORS.border};
  padding: 6px 0; padding-bottom: 12px;
}
.tab-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; }
.tab-icon { font-size: 18px; }
.tab-label { font-size: 10px; color: ${COLORS.textTertiary}; }
.tab-active .tab-label { color: ${COLORS.accent}; }
</style>
</head><body>${content}</body></html>`;
}
