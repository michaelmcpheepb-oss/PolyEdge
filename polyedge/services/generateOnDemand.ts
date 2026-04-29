import type { Market } from '../types';

export interface MarketAnalysis {
  verdict:              'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'AVOID' | 'STRONG_AVOID';
  recommended_outcome?: 'YES' | 'NO';
  confidence:           number;
  ai_probability:       number;
  edge_pct:             number;
  edge_label:           'UNDERVALUED' | 'OVERVALUED' | 'FAIR VALUE';
  brief?:               string;
  bullets:              string[];
  kelly_pct:            number;
  risk_level:           'LOW' | 'MEDIUM' | 'HIGH';
  stake:                number;
}

export async function generateMarketAnalysis(
  market: Market,
  smartMoneyPct?: number,
  smartMoneyDirection?: string
): Promise<MarketAnalysis> {
  const yes_pct = (market.yes_price ?? 0.5) * 100;
  const no_pct  = (market.no_price  ?? 0.5) * 100;

  const systemPrompt = `You are an AI that analyses prediction markets and explains them in plain English for complete beginners who have never used a prediction market before. You must avoid all financial jargon. Write as if explaining to a curious friend, not a trader.`;

  const userPrompt = `Analyse this prediction market and return ONLY valid JSON with no other text.

Market question: ${market.question}
Category: ${market.category ?? 'General'}
Current YES price: ${yes_pct.toFixed(1)}% (this means the market thinks there is a ${yes_pct.toFixed(1)}% chance of YES)
Current NO price: ${no_pct.toFixed(1)}%
24h volume: $${(market.volume_24h ?? 0).toLocaleString()}
Total volume: $${(market.total_volume ?? 0).toLocaleString()}
Ends: ${market.end_date}
Top wallet activity: ${smartMoneyPct ?? 50}% of tracked top wallets are going ${smartMoneyDirection ?? 'MIXED'}

Your job:
1. Estimate the TRUE probability that YES wins (as a percentage, 0-100)
2. Compare your estimate to the current market price to find edge
3. Decide if betting YES or NO offers good value

Rules for the bullets field — CRITICAL:
- Write EXACTLY 2 plain English sentences that a beginner can understand
- NO jargon. NO terms like "liquidity", "orderbook", "conviction", "Kelly", "momentum", "fade"
- Each sentence must explain something genuinely useful about this market
- Good examples:
  "The YES and NO sides are evenly matched right now, so neither side has a clear advantage."
  "Not many people are trading this market yet, which makes the price less reliable."
  "The biggest traders on Polymarket are split — roughly half think YES, half think NO."
  "Our AI thinks YES is more likely than the market price suggests, giving a potential edge."
  "This market ends soon, so there is limited time for the price to move."
- Bad examples (NEVER write these): "Tight spread with balanced orderbook", "Low volume indicates indecision", "Smart money shows mixed signals"

Return this exact JSON:
{
  "verdict": "STRONG_BUY|BUY|NEUTRAL|AVOID|STRONG_AVOID",
  "confidence": 0-100,
  "ai_probability": 0-100,
  "edge_pct": number (your_probability minus market_yes_price, positive means YES is underpriced),
  "edge_label": "UNDERVALUED|OVERVALUED|FAIR VALUE",
  "bullets": ["plain English sentence 1", "plain English sentence 2"],
  "kelly_pct": 0-25,
  "stake": 0-10,
  "risk_level": "LOW|MEDIUM|HIGH"
}

Verdict rules (MUST follow edge direction — never contradict it):
- edge_pct > 15 AND confidence > 60: "STRONG_BUY"
- edge_pct > 5 AND confidence > 45: "BUY"
- -5 <= edge_pct <= 5: "NEUTRAL"
- edge_pct < -5 AND confidence > 45: "AVOID"
- edge_pct < -15 AND confidence > 60: "STRONG_AVOID"`;

  const apiKey = process.env.EXPO_PUBLIC_DEEPSEEK_KEY;
  if (!apiKey) {
    throw new Error('EXPO_PUBLIC_DEEPSEEK_KEY not set in .env');
  }

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      max_tokens: 700,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`DeepSeek API ${response.status}: ${errText}`);
  }

  const data   = await response.json();
  const text   = (data.choices?.[0]?.message?.content ?? '') as string;
  const clean  = text.replace(/```json\s*|```/g, '').trim();
  const parsed = JSON.parse(clean) as MarketAnalysis;

  // Validate ranges
  parsed.confidence     = Math.max(0, Math.min(100, parsed.confidence     ?? 50));
  parsed.ai_probability = Math.max(0, Math.min(100, parsed.ai_probability ?? 50));
  parsed.kelly_pct      = Math.max(0, Math.min(25,  parsed.kelly_pct      ?? 0));
  parsed.stake          = Math.max(0, Math.min(10,  parsed.stake          ?? 0));
  if (!Array.isArray(parsed.bullets) || !parsed.bullets.length) parsed.bullets = [];

  // Derive recommended_outcome from verdict — must never contradict edge
  const bullish = parsed.verdict === 'STRONG_BUY' || parsed.verdict === 'BUY';
  const bearish = parsed.verdict === 'STRONG_AVOID' || parsed.verdict === 'AVOID';
  if (bullish)      parsed.recommended_outcome = 'YES';
  else if (bearish) parsed.recommended_outcome = 'NO';

  return parsed;
}
