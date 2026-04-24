/**
 * Confidence Score Calculator for PolyEdge
 * Algorithm weights:
 * - Smart money factor (40%): % of top wallets on majority side
 * - Odds clarity factor (30%): Clear signal at 75%+ or 25%- prices
 * - Volume factor (20%): Higher volume = more reliable
 * - Momentum factor (10%): Strong direction = higher confidence
 */

export interface ConfidenceParams {
  smartMoneyDirection: 'YES' | 'NO' | 'MIXED';
  smartMoneyPct: number; // 0-100, percentage of top wallets on majority side
  currentYesPrice: number; // 0-1
  currentNoPrice: number; // 0-1
  volume24h: number; // Total 24h volume in USD
  volumeTrend: 'UP' | 'DOWN' | 'FLAT'; // Recent volume direction
  momentum: number; // -100 to 100, price momentum %
  marketAgeHours: number; // How long market has been active
}

export function calculateConfidenceScore(params: ConfidenceParams): number {
  const {
    smartMoneyDirection,
    smartMoneyPct,
    currentYesPrice,
    currentNoPrice,
    volume24h,
    volumeTrend,
    momentum,
    marketAgeHours
  } = params;

  // 1. Smart Money Factor (40% weight)
  let smartMoneyScore = 0;
  if (smartMoneyDirection === 'MIXED') {
    smartMoneyScore = 20; // Low confidence when smart money is split
  } else {
    // Higher percentage alignment = higher confidence
    smartMoneyScore = Math.min(smartMoneyPct, 100);
  }

  // 2. Odds Clarity Factor (30% weight)
  let clarityScore = 0;
  const yesPrice = currentYesPrice;
  const noPrice = currentNoPrice;

  if (yesPrice >= 0.75) {
    // Strong YES signal
    clarityScore = 80 + (yesPrice - 0.75) * 80; // 80-100 range
  } else if (yesPrice <= 0.25) {
    // Strong NO signal
    clarityScore = 80 + (0.25 - yesPrice) * 80; // 80-100 range
  } else if (yesPrice >= 0.60 || yesPrice <= 0.40) {
    // Moderate signal
    clarityScore = 50 + Math.abs(yesPrice - 0.5) * 60; // 50-80 range
  } else {
    // Unclear/coin flip territory
    clarityScore = 20 + (0.1 - Math.abs(yesPrice - 0.5)) * 200; // 0-40 range
  }

  // 3. Volume Factor (20% weight)
  let volumeScore = 0;
  if (volume24h >= 100000) {
    volumeScore = 90; // Very high volume
  } else if (volume24h >= 50000) {
    volumeScore = 75; // High volume
  } else if (volume24h >= 25000) {
    volumeScore = 60; // Medium volume
  } else if (volume24h >= 10000) {
    volumeScore = 40; // Low volume
  } else {
    volumeScore = 20; // Very low volume
  }

  // Bonus for trending volume
  if (volumeTrend === 'UP') {
    volumeScore = Math.min(volumeScore + 10, 100);
  }

  // 4. Momentum Factor (10% weight)
  let momentumScore = 50 + Math.abs(momentum) / 2; // Base 50, up to 100 for strong momentum
  momentumScore = Math.min(momentumScore, 100);

  // Age penalty - very new markets get reduced confidence
  let agePenalty = 0;
  if (marketAgeHours < 1) {
    agePenalty = 20; // Brand new market
  } else if (marketAgeHours < 6) {
    agePenalty = 10; // Very young market
  } else if (marketAgeHours < 24) {
    agePenalty = 5; // Young market
  }

  // Calculate weighted average
  const weightedScore = (
    smartMoneyScore * 0.40 +
    clarityScore * 0.30 +
    volumeScore * 0.20 +
    momentumScore * 0.10
  );

  // Apply age penalty and clamp to 0-100
  const finalScore = Math.max(0, Math.min(100, weightedScore - agePenalty));

  return Math.round(finalScore);
}

export function getConfidenceLevel(score: number): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (score >= 75) return 'HIGH';
  if (score >= 50) return 'MEDIUM';
  return 'LOW';
}

export function getConfidenceColor(score: number): string {
  if (score >= 75) return '#22c55e'; // green-500
  if (score >= 50) return '#f59e0b'; // amber-500
  return '#6b7280'; // gray-500
}