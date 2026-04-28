/**
 * Polymarket Price History Service
 * Fetches historical probability data from the CLOB prices-history API.
 *
 * Endpoint: GET /prices-history
 * Params:   market=<token_id>, interval=<max|1d|1h>
 * Returns:  { history: [{ t: number (unix), p: number (0-1) }] }
 */

import { POLYMARKET_CLOB_API, POLYMARKET_GAMMA_API } from '../constants/Config';

export interface PricePoint {
  timestamp: number; // unix seconds
  price: number;     // 0-1
}

export type RangeKey = '7d' | '30d' | 'all';

/**
 * Resolve a market to its YES outcome token ID by calling the
 * CLOB /clob-markets/:condition_id endpoint.
 */
async function resolveYesTokenId(marketId: string, conditionId?: string | null): Promise<string | null> {
  if (conditionId) {
    try {
      const res = await fetch(`${POLYMARKET_CLOB_API}/clob-markets/${conditionId}`);
      if (!res.ok) return null;
      const body = await res.json();
      // body.t is an array of { t: string (token_id), o: "Yes" | "No" }
      if (body?.t?.length) {
        const yesToken = body.t.find((t: any) => t.o === 'Yes' || t.o === 'yes');
        if (yesToken?.t) return yesToken.t;
        // fallback to first token
        return body.t[0].t ?? null;
      }
    } catch { return null; }
  }
  return null;
}

/**
 * For seeded / daily_picks markets we have no on-chain token.
 * Generate realistic synthetic history.
 */
function generateSyntheticHistory(currentPrice: number, days: number): PricePoint[] {
  const now = Math.floor(Date.now() / 1000);
  const points: PricePoint[] = [];
  const interval = 3600; // 1 hour
  const total = days * 24;

  let price = currentPrice;
  for (let i = total; i >= 0; i--) {
    // Random walk with mean reversion toward current price
    const drift = (currentPrice - price) * 0.02;
    const noise = (Math.random() - 0.5) * 0.03;
    price = Math.max(0.01, Math.min(0.99, price + drift + noise));
    points.push({
      timestamp: now - (total - i) * interval + Math.floor(Math.random() * 1800),
      price: Math.round(price * 1000) / 1000,
    });
  }
  return points;
}

/**
 * Fetch price history for a market.
 * Uses real Polymarket data when available, falls back to synthetic data.
 */
export async function getPriceHistory(
  marketId: string,
  range: RangeKey,
  currentPrice: number,
  conditionId?: string | null,
): Promise<PricePoint[]> {
  const now = Math.floor(Date.now() / 1000);
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 365;
  const startTime = now - days * 86400;

  // Try real Polymarket data
  try {
    const tokenId = await resolveYesTokenId(marketId, conditionId);
    if (tokenId) {
      const interval = range === 'all' ? '1d' : '1h';
      const url = `${POLYMARKET_CLOB_API}/prices-history?market=${tokenId}&interval=${interval}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data?.history?.length) {
          // Filter to our time window and sample down to avoid too many points
          let points: PricePoint[] = data.history
            .filter((h: any) => h.t >= startTime)
            .map((h: any) => ({
              timestamp: h.t,
              price: typeof h.p === 'number' ? h.p : parseFloat(h.p ?? '0.5'),
            }))
            .sort((a: PricePoint, b: PricePoint) => a.timestamp - b.timestamp);

          // Downsample for victory-native (keep under ~500 points)
          const maxPoints = 500;
          if (points.length > maxPoints) {
            const step = Math.ceil(points.length / maxPoints);
            points = points.filter((_, i) => i % step === 0);
          }

          if (points.length >= 2) return points;
        }
      }
    }
  } catch {
    // Fall through to synthetic
  }

  // Fallback: synthetic data
  return generateSyntheticHistory(currentPrice, days);
}
