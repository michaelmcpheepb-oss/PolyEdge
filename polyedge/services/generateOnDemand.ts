import type { Market } from '../types';

export interface MarketAnalysis {
  verdict:        'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'AVOID' | 'STRONG_AVOID';
  confidence:     number;
  ai_probability: number;
  edge_pct:       number;
  edge_label:     'UNDERVALUED' | 'OVERVALUED' | 'FAIR VALUE';
  brief?:         string;
  bullets:        string[];
  kelly_pct:      number;
  risk_level:     'LOW' | 'MEDIUM' | 'HIGH';
  stake:          number;
}

export async function generateMarketAnalysis(
  market: Market,
  smartMoneyPct?: number,
  smartMoneyDirection?: string
): Promise<MarketAnalysis> {
  const yes_pct = (market.yes_price ?? 0.5) * 100;
  const no_pct  = (market.no_price  ?? 0.5) * 100;

  const systemPrompt = 'You are a quantitative prediction market analyst. Be extremely concise. Return exactly 3 bullet points. Each bullet MAX 8 words. No full sentences. Data-driven only.';

  const userPrompt = `Analyse this market and return ONLY valid JSON with no other text.

Market: ${market.question}
Category: ${market.category ?? 'General'}
Current YES price: ${yes_pct.toFixed(1)}%
Current NO price: ${no_pct.toFixed(1)}%
24h volume: $${(market.volume_24h ?? 0).toLocaleString()}
Total volume: $${(market.total_volume ?? 0).toLocaleString()}
Ends: ${market.end_date}
Smart money: ${smartMoneyPct ?? 50}% of top wallets going ${smartMoneyDirection ?? 'MIXED'}

Calculate:
1. Your estimated true probability for YES
2. Edge = your_probability - market_yes_price (as a percentage point)
3. Kelly fraction = (p*(b+1)-1)/b where p=your_probability/100, b=(1/yes_price)-1
4. Verdict based on edge magnitude and confidence
5. Risk level: LOW if kelly>10, MEDIUM if kelly>3, HIGH if kelly<=3

Return this exact JSON structure:
{
  "verdict": "STRONG_BUY|BUY|NEUTRAL|AVOID|STRONG_AVOID",
  "confidence": 0-100,
  "ai_probability": 0-100,
  "edge_pct": number,
  "edge_label": "UNDERVALUED|OVERVALUED|FAIR VALUE",
  "bullets": ["8 word max bullet", "second bullet max 8 words", "third max 8 words"],
  "kelly_pct": 0-25,
  "stake": 0-10,
  "risk_level": "LOW|MEDIUM|HIGH"
}`;

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
      max_tokens: 600,
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
  if (!parsed.bullets?.length) parsed.bullets = [];

  return parsed;
}
