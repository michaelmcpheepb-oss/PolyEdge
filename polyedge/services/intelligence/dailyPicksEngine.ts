/**
 * Daily Picks Engine for PolyEdge
 * Core orchestrator that generates daily market recommendations
 * Integrates confidence scoring, smart money analysis, and AI briefs
 */

import { createClient } from '@supabase/supabase-js';
import { calculateConfidenceScore, type ConfidenceParams } from './confidenceScore';
import { analyzeSmartMoney, type SmartMoneyAnalysis } from './smartMoney';
import { generateAIBrief, generateMultipleBriefs } from './aiAnalysis';

interface Market {
  id: string;
  question: string;
  description?: string;
  outcomes: string[];
  outcomePrices: number[];
  volume24h: number;
  volumeTotal: number;
  endDate: string;
  category?: string;
  tags?: string[];
  active: boolean;
  closed: boolean;
}

interface DailyPick {
  marketId: string;
  marketQuestion: string;
  recommendedOutcome: 'YES' | 'NO';
  confidenceScore: number;
  aiReasoning: string;
  smartMoneyDirection?: 'YES' | 'NO' | 'MIXED';
  smartMoneyPct?: number;
  currentYesPrice: number;
  currentNoPrice: number;
  category?: string;
  // enriched by enrichPick()
  verdict?: string;
  kelly_pct?: number;
  edge_pct?: number;
  edge_label?: string;
  risk_level?: string;
  reasoning_bullets?: string[];
  ai_probability?: number;
}

interface TopTrader {
  walletAddress: string;
  pseudonym: string;
  rank: number;
  winRate?: number;
  roi30d?: number;
  totalPnl?: number;
  totalTrades?: number;
  specialtyCategory?: string;
  activePositions?: any;
  lastTradeAt?: string;
}

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);

function enrichPick(pick: any, smartMoneyPct: number): any {
  const yesPricePct = (pick.currentYesPrice ?? 0.5) * 100;
  const confidence  = pick.confidenceScore ?? 50;
  const smart       = smartMoneyPct ?? 50;

  // Edge — positive = undervalued (BUY), negative = overvalued (AVOID)
  const edge_pct   = confidence - yesPricePct;
  const edge_label = edge_pct > 5  ? 'UNDERVALUED' :
                     edge_pct < -5 ? 'OVERVALUED'  : 'FAIR VALUE';

  // Verdict is driven by edge + confidence together — never contradicts edge sign.
  // Thresholds use relative confidence (edge magnitude matters more than raw score).
  let verdict: string;
  if      (edge_pct > 20 && confidence > 55) verdict = 'STRONG_BUY';
  else if (edge_pct > 10 && confidence > 35) verdict = 'BUY';
  else if (edge_pct > 0)                     verdict = 'NEUTRAL';
  else if (edge_pct < -20)                   verdict = 'STRONG_AVOID';
  else if (edge_pct < -10)                   verdict = 'AVOID';
  else                                       verdict = 'NEUTRAL';

  // Kelly criterion (only meaningful for BUY verdicts)
  const p         = confidence / 100;
  const yes_price = pick.currentYesPrice ?? 0.5;
  const b         = (1 / yes_price) - 1;
  const kelly     = (p * (b + 1) - 1) / b;
  const kelly_pct = Math.max(0, Math.min(25, kelly * 100));

  // Risk
  const risk_level = kelly_pct > 10 ? 'LOW' :
                     kelly_pct > 3  ? 'MEDIUM' : 'HIGH';

  // Single best insight bullet
  const bullets = [
    edge_pct > 5
      ? `Market pricing YES ${edge_pct.toFixed(0)}% below our estimate`
      : edge_pct < -5
        ? `Market pricing YES ${Math.abs(edge_pct).toFixed(0)}% above our estimate`
        : 'Odds near fair value — no clear edge',
    smart > 65
      ? `${Math.round(smart)}% of tracked wallets backing this side`
      : 'Insufficient smart money signal',
    confidence > 70 ? 'High model confidence' : 'Moderate model confidence',
  ];

  return {
    ...pick,
    verdict,
    kelly_pct:         Math.round(kelly_pct * 10) / 10,
    edge_pct:          Math.round(edge_pct  * 10) / 10,
    edge_label,
    risk_level,
    reasoning_bullets: bullets,
    ai_probability:    confidence,
  };
}

export class DailyPicksEngine {
  private readonly GAMMA_API_URL = process.env.EXPO_PUBLIC_POLYMARKET_GAMMA_API || 'https://gamma-api.polymarket.com';

  async runDailyAnalysis(): Promise<{
    picks: DailyPick[];
    marketsAnalyzed: number;
    intelligenceUpdated: number;
    tradersUpdated: number;
  }> {
    console.log('🚀 Starting daily PolyEdge analysis...');

    try {
      // 1. Fetch active markets from Polymarket
      const markets = await this.fetchActiveMarkets();
      console.log(`📊 Found ${markets.length} active markets`);

      // 2. Filter markets by volume and time criteria
      const eligibleMarkets = this.filterEligibleMarkets(markets);
      console.log(`✅ ${eligibleMarkets.length} markets meet criteria`);

      // 3. Calculate confidence scores for all markets
      const marketAnalyses = await this.analyzeMarkets(eligibleMarkets);

      // 4. Get smart money signals for top markets by confidence
      const topMarketsByConfidence = marketAnalyses
        .sort((a, b) => b.confidenceScore - a.confidenceScore)
        .slice(0, 100); // Top 100 by confidence

      const smartMoneyAnalyses = await this.getSmartMoneyAnalyses(topMarketsByConfidence);

      // 5. Generate AI briefs for top 20 markets
      const topMarketsForAI = topMarketsByConfidence.slice(0, 20);
      const aiBriefs = await this.generateAIBriefs(topMarketsForAI, smartMoneyAnalyses);

      // 6. Select final daily picks (top 5)
      const dailyPicks = this.selectDailyPicks(topMarketsForAI, smartMoneyAnalyses, aiBriefs);

      // 7. Update database tables
      await this.updateIntelligenceTables(marketAnalyses, smartMoneyAnalyses, aiBriefs);
      await this.saveDailyPicks(dailyPicks);

      // 8. Update trader rankings
      const tradersUpdated = await this.updateTop50Traders();

      // 9. Check and update resolved predictions
      await this.checkResolutions();

      console.log('✨ Daily analysis complete!');

      return {
        picks: dailyPicks,
        marketsAnalyzed: marketAnalyses.length,
        intelligenceUpdated: topMarketsByConfidence.length,
        tradersUpdated
      };

    } catch (error) {
      console.error('💥 Daily analysis failed:', error);
      throw error;
    }
  }

  private async fetchActiveMarkets(): Promise<Market[]> {
    try {
      const response = await fetch(`${this.GAMMA_API_URL}/markets`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Gamma API error: ${response.status}`);
      }

      const data = await response.json();

      // Transform Gamma API format to our Market interface
      const parseJsonField = (v: any, fallback: any) => {
        if (Array.isArray(v)) return v;
        if (typeof v === 'string') { try { return JSON.parse(v); } catch {} }
        return fallback;
      };

      return data.map((market: any) => ({
        id: market.id,
        question: market.question,
        description: market.description,
        outcomes: parseJsonField(market.outcomes, ['Yes', 'No']),
        outcomePrices: parseJsonField(market.outcomePrices, [0.5, 0.5]),
        volume24h: parseFloat(market.volume24hr || '0'),
        volumeTotal: parseFloat(market.volumeTotal || '0'),
        endDate: market.endDate,
        category: market.category,
        tags: parseJsonField(market.tags, []),
        active: market.active !== false,
        closed: market.closed === true
      }));

    } catch (error) {
      console.error('❌ Failed to fetch markets from Gamma API:', error);
      return [];
    }
  }

  private filterEligibleMarkets(markets: Market[]): Market[] {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));

    return markets.filter(market => {
      // Must be active and not closed
      if (!market.active || market.closed) return false;

      // Must have > $500 24h volume
      if (market.volume24h < 500) return false;

      // Exclude low-credibility entertainment/gaming markets unless very high volume
      const cat = (market.category ?? '').toLowerCase();
      const isEntertainment = ['gaming', 'entertainment', 'music', 'celebrity', 'tv', 'film', 'movies'].includes(cat);
      if (isEntertainment && market.volume24h < 1_000_000) return false;

      // Also exclude by question keywords that indicate entertainment with low analytical edge
      const q = (market.question ?? '').toLowerCase();
      const entertainmentKeywords = ['gta vi', 'gta6', 'album', 'taylor swift', 'beyoncé', 'kanye', 'drake', 'rihanna', 'carti', 'playboi'];
      if (entertainmentKeywords.some(kw => q.includes(kw)) && market.volume24h < 1_000_000) return false;

      // Must end in more than 3 days
      const endDate = new Date(market.endDate);
      if (endDate <= threeDaysFromNow) return false;

      // Must be binary market
      if (market.outcomes.length !== 2) return false;

      return true;
    });
  }

  private async analyzeMarkets(markets: Market[]): Promise<Array<Market & { confidenceScore: number }>> {
    const analyses = [];

    for (const market of markets) {
      try {
        // Calculate market age
        const endDate = new Date(market.endDate);
        const now = new Date();
        const marketAgeHours = Math.max(1, (now.getTime() - (endDate.getTime() - (30 * 24 * 60 * 60 * 1000))) / (1000 * 60 * 60));

        // Estimate momentum (simplified - would use price history in real implementation)
        const yesPrice = market.outcomePrices[0] || 0.5;
        const momentum = (yesPrice - 0.5) * 20; // Simple momentum estimation

        const confidenceParams: ConfidenceParams = {
          smartMoneyDirection: 'MIXED', // Will be updated later with smart money analysis
          smartMoneyPct: 50,
          currentYesPrice: yesPrice,
          currentNoPrice: market.outcomePrices[1] || (1 - yesPrice),
          volume24h: market.volume24h,
          volumeTrend: 'FLAT', // Simplified
          momentum,
          marketAgeHours
        };

        const confidenceScore = calculateConfidenceScore(confidenceParams);

        analyses.push({
          ...market,
          confidenceScore
        });

      } catch (error) {
        console.warn(`Failed to analyze market ${market.id}:`, error);
      }
    }

    return analyses;
  }

  private async getSmartMoneyAnalyses(markets: Array<Market & { confidenceScore: number }>): Promise<Map<string, SmartMoneyAnalysis>> {
    const analyses = new Map<string, SmartMoneyAnalysis>();

    // Process in batches to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < markets.length; i += batchSize) {
      const batch = markets.slice(i, i + batchSize);

      const promises = batch.map(async (market) => {
        try {
          const analysis = await analyzeSmartMoney(market.id);
          return [market.id, analysis] as [string, SmartMoneyAnalysis];
        } catch (error) {
          console.warn(`Smart money analysis failed for ${market.id}:`, error);
          return null;
        }
      });

      const results = await Promise.all(promises);

      results.forEach(result => {
        if (result) {
          analyses.set(result[0], result[1]);
        }
      });

      // Small delay between batches
      if (i + batchSize < markets.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return analyses;
  }

  private async generateAIBriefs(
    markets: Array<Market & { confidenceScore: number }>,
    smartMoneyAnalyses: Map<string, SmartMoneyAnalysis>
  ): Promise<Map<string, string>> {
    const marketData = markets.map(market => ({
      id: market.id,
      question: market.question,
      description: market.description,
      outcomes: market.outcomes,
      volume24h: market.volume24h,
      yesPrice: market.outcomePrices[0] || 0.5,
      noPrice: market.outcomePrices[1] || 0.5,
      category: market.category,
      endDate: market.endDate
    }));

    const smartMoneyDataMap = new Map();
    smartMoneyAnalyses.forEach((analysis, marketId) => {
      smartMoneyDataMap.set(marketId, analysis);
    });

    const briefs = await generateMultipleBriefs(marketData, smartMoneyDataMap);

    const briefTexts = new Map<string, string>();
    briefs.forEach((brief, marketId) => {
      briefTexts.set(marketId, brief.brief);
    });

    return briefTexts;
  }

  private selectDailyPicks(
    markets: Array<Market & { confidenceScore: number }>,
    smartMoneyAnalyses: Map<string, SmartMoneyAnalysis>,
    aiBriefs: Map<string, string>
  ): DailyPick[] {
    const picks: DailyPick[] = [];

    // Sort by confidence score and select top 5
    const topMarkets = markets
      .sort((a, b) => b.confidenceScore - a.confidenceScore)
      .slice(0, 5);

    for (const market of topMarkets) {
      const smartMoney = smartMoneyAnalyses.get(market.id);
      const aiBrief = aiBriefs.get(market.id) || 'Market analysis pending.';
      const yesPrice = market.outcomePrices[0] || 0.5;
      const yesPricePct = yesPrice * 100;

      // Edge: positive = market underpricing YES → BET YES
      //       negative = market overpricing YES → BET NO
      const edgePct = market.confidenceScore - yesPricePct;

      // recommendedOutcome MUST align with edge direction — no contradictions
      let recommendedOutcome: 'YES' | 'NO';
      if (edgePct > 5) {
        recommendedOutcome = 'YES'; // market underpricing YES
      } else if (edgePct < -5) {
        recommendedOutcome = 'NO';  // market overpricing YES → NO is value
      } else if (smartMoney && smartMoney.direction !== 'MIXED') {
        recommendedOutcome = smartMoney.direction;
      } else {
        recommendedOutcome = yesPrice > 0.5 ? 'YES' : 'NO';
      }

      const basePick = {
        marketId: market.id,
        marketQuestion: market.question,
        recommendedOutcome,
        confidenceScore: market.confidenceScore,
        aiReasoning: aiBrief,
        smartMoneyDirection: smartMoney?.direction,
        smartMoneyPct: smartMoney?.convictionPct,
        currentYesPrice: yesPrice,
        currentNoPrice: market.outcomePrices[1] || (1 - yesPrice),
        category: market.category,
      };

      picks.push(enrichPick(basePick, smartMoney?.convictionPct ?? 50));
    }

    return picks;
  }

  private async updateIntelligenceTables(
    marketAnalyses: Array<Market & { confidenceScore: number }>,
    smartMoneyAnalyses: Map<string, SmartMoneyAnalysis>,
    aiBriefs: Map<string, string>
  ): Promise<void> {
    console.log('📝 Updating market intelligence table...');

    for (const market of marketAnalyses) {
      const smartMoney = smartMoneyAnalyses.get(market.id);
      const aiBrief = aiBriefs.get(market.id);

      try {
        await supabase
          .from('market_intelligence')
          .upsert({
            market_id: market.id,
            market_question: market.question,
            confidence_score: market.confidenceScore,
            smart_money_direction: smartMoney?.direction,
            smart_money_pct: smartMoney?.convictionPct,
            sharp_vs_public: 'ALIGNED', // Simplified - would need more analysis
            momentum: market.outcomePrices[0] > 0.5 ? 'WEAK_YES' : 'WEAK_NO',
            momentum_pct: Math.abs((market.outcomePrices[0] - 0.5) * 100),
            ai_brief: aiBrief,
            top_wallet_positions: smartMoney?.topPositions ? JSON.stringify(smartMoney.topPositions) : null,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'market_id'
          });
      } catch (error) {
        console.warn(`Failed to update intelligence for market ${market.id}:`, error);
      }
    }
  }

  private async saveDailyPicks(picks: DailyPick[]): Promise<void> {
    console.log('💾 Saving daily picks...');

    for (const pick of picks) {
      try {
        await supabase
          .from('daily_picks')
          .insert({
            market_id:            pick.marketId,
            market_question:      pick.marketQuestion,
            recommended_outcome:  pick.recommendedOutcome,
            confidence_score:     pick.confidenceScore,
            ai_reasoning:         pick.aiReasoning,
            smart_money_direction: pick.smartMoneyDirection,
            smart_money_pct:      pick.smartMoneyPct,
            current_yes_price:    pick.currentYesPrice,
            current_no_price:     pick.currentNoPrice,
            category:             pick.category,
            pick_date:            new Date().toISOString().split('T')[0],
            created_at:           new Date().toISOString(),
            // enriched fields
            verdict:              pick.verdict,
            kelly_pct:            pick.kelly_pct,
            edge_pct:             pick.edge_pct,
            edge_label:           pick.edge_label,
            risk_level:           pick.risk_level,
            reasoning_bullets:    pick.reasoning_bullets,
            ai_probability:       pick.ai_probability,
          });
      } catch (error) {
        console.warn(`Failed to save pick for market ${pick.marketId}:`, error);
      }
    }
  }

  async updateTop50Traders(): Promise<number> {
    console.log('🐋 Updating top 50 traders...');

    // In a real implementation, this would analyze trader performance
    // For now, return a placeholder count
    return 50;
  }

  async checkResolutions(): Promise<void> {
    console.log('✅ Checking resolved predictions...');

    // Get unresolved picks older than their market end dates
    const { data: unresolvedPicks } = await supabase
      .from('daily_picks')
      .select('*')
      .eq('resolved', false);

    if (!unresolvedPicks) return;

    for (const pick of unresolvedPicks) {
      try {
        // Fetch market resolution from Gamma API
        const response = await fetch(`${this.GAMMA_API_URL}/markets/${pick.market_id}`);
        if (!response.ok) continue;

        const market = await response.json();

        if (market.closed && market.winner !== undefined) {
          const wasCorrect = (market.winner === 0 && pick.recommended_outcome === 'YES') ||
                           (market.winner === 1 && pick.recommended_outcome === 'NO');

          await supabase
            .from('daily_picks')
            .update({
              resolved: true,
              was_correct: wasCorrect
            })
            .eq('id', pick.id);
        }
      } catch (error) {
        console.warn(`Failed to check resolution for pick ${pick.id}:`, error);
      }
    }

    // Update accuracy metrics
    await this.updateAccuracyMetrics();
  }

  private async updateAccuracyMetrics(): Promise<void> {
    const { data: resolvedPicks } = await supabase
      .from('daily_picks')
      .select('was_correct')
      .eq('resolved', true);

    if (!resolvedPicks) return;

    const totalPicks = resolvedPicks.length;
    const correctPicks = resolvedPicks.filter(p => p.was_correct).length;
    const accuracyPct = totalPicks > 0 ? (correctPicks / totalPicks) * 100 : 0;

    await supabase
      .from('prediction_accuracy')
      .upsert({
        total_picks: totalPicks,
        correct_picks: correctPicks,
        accuracy_pct: accuracyPct,
        updated_at: new Date().toISOString()
      });
  }
}

// Export singleton instance
export const dailyPicksEngine = new DailyPicksEngine();