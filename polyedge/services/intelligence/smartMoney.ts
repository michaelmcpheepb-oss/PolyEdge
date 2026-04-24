/**
 * Smart Money Analysis for PolyEdge
 * Analyzes top 50 wallet positions on markets to determine "smart money" direction
 * Uses Polymarket Gamma API to fetch position data
 */

interface WalletPosition {
  wallet: string;
  outcome: 'YES' | 'NO';
  shares: number;
  avgPrice: number;
  pnl: number;
  lastTradeTime: number;
}

export interface SmartMoneyAnalysis {
  direction: 'YES' | 'NO' | 'MIXED';
  convictionPct: number; // 0-100, percentage of top wallets on majority side
  totalTopWallets: number;
  yesWallets: number;
  noWallets: number;
  avgYesPosition: number; // Average position size for YES voters
  avgNoPosition: number; // Average position size for NO voters
  topPositions: WalletPosition[];
}

// Top 50 wallet addresses (these would be loaded from database in real implementation)
const TOP_WALLETS = [
  // Placeholder addresses - in real app, these come from top_traders table
  '0x1234567890123456789012345678901234567890',
  '0x2345678901234567890123456789012345678901',
  '0x3456789012345678901234567890123456789012',
  // ... more addresses
];

export async function analyzeSmartMoney(marketId: string): Promise<SmartMoneyAnalysis> {
  try {
    console.log(`🧠 Analyzing smart money for market ${marketId}`);

    // Fetch positions from Gamma API
    const positions = await fetchTopWalletPositions(marketId);

    if (positions.length === 0) {
      return {
        direction: 'MIXED',
        convictionPct: 0,
        totalTopWallets: 0,
        yesWallets: 0,
        noWallets: 0,
        avgYesPosition: 0,
        avgNoPosition: 0,
        topPositions: []
      };
    }

    // Analyze positions
    const yesPositions = positions.filter(p => p.outcome === 'YES');
    const noPositions = positions.filter(p => p.outcome === 'NO');

    const yesCount = yesPositions.length;
    const noCount = noPositions.length;
    const totalCount = yesCount + noCount;

    // Calculate average position sizes (weighted by conviction)
    const avgYesPosition = yesPositions.length > 0
      ? yesPositions.reduce((sum, p) => sum + p.shares * p.avgPrice, 0) / yesPositions.length
      : 0;

    const avgNoPosition = noPositions.length > 0
      ? noPositions.reduce((sum, p) => sum + p.shares * p.avgPrice, 0) / noPositions.length
      : 0;

    // Determine direction and conviction
    let direction: 'YES' | 'NO' | 'MIXED';
    let convictionPct: number;

    const yesPercentage = (yesCount / totalCount) * 100;
    const noPercentage = (noCount / totalCount) * 100;

    if (yesPercentage >= 70) {
      direction = 'YES';
      convictionPct = yesPercentage;
    } else if (noPercentage >= 70) {
      direction = 'NO';
      convictionPct = noPercentage;
    } else {
      direction = 'MIXED';
      convictionPct = Math.max(yesPercentage, noPercentage);
    }

    // Sort positions by size for top positions display
    const topPositions = positions
      .sort((a, b) => (b.shares * b.avgPrice) - (a.shares * a.avgPrice))
      .slice(0, 10); // Top 10 positions

    return {
      direction,
      convictionPct: Math.round(convictionPct),
      totalTopWallets: totalCount,
      yesWallets: yesCount,
      noWallets: noCount,
      avgYesPosition: Math.round(avgYesPosition),
      avgNoPosition: Math.round(avgNoPosition),
      topPositions
    };

  } catch (error) {
    console.error('❌ Error analyzing smart money:', error);
    // Return neutral analysis on error
    return {
      direction: 'MIXED',
      convictionPct: 50,
      totalTopWallets: 0,
      yesWallets: 0,
      noWallets: 0,
      avgYesPosition: 0,
      avgNoPosition: 0,
      topPositions: []
    };
  }
}

async function fetchTopWalletPositions(marketId: string): Promise<WalletPosition[]> {
  const positions: WalletPosition[] = [];

  try {
    const gammaApiUrl = process.env.EXPO_PUBLIC_POLYMARKET_GAMMA_API || 'https://gamma-api.polymarket.com';

    // Fetch positions for each top wallet
    // Note: This is a simplified approach - real implementation would batch requests
    const promises = TOP_WALLETS.slice(0, 20).map(async (wallet) => { // Limit to 20 for demo
      try {
        const response = await fetch(
          `${gammaApiUrl}/positions?user=${wallet}&market=${marketId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          return null;
        }

        const data = await response.json();

        // Parse Gamma API response format
        if (data && data.positions && data.positions.length > 0) {
          return data.positions.map((pos: any) => ({
            wallet: wallet,
            outcome: pos.outcome as 'YES' | 'NO',
            shares: parseFloat(pos.size || '0'),
            avgPrice: parseFloat(pos.avgPrice || '0'),
            pnl: parseFloat(pos.pnl || '0'),
            lastTradeTime: pos.lastTradeTime || Date.now()
          }));
        }

        return null;
      } catch (error) {
        console.warn(`Failed to fetch position for wallet ${wallet}:`, error);
        return null;
      }
    });

    const results = await Promise.all(promises);

    // Flatten and filter results
    results.forEach(result => {
      if (result && Array.isArray(result)) {
        positions.push(...result);
      }
    });

  } catch (error) {
    console.error('❌ Error fetching wallet positions:', error);
  }

  return positions;
}

export function getSmartMoneySignal(analysis: SmartMoneyAnalysis): {
  color: string;
  label: string;
  strength: 'STRONG' | 'WEAK' | 'NEUTRAL';
} {
  const { direction, convictionPct } = analysis;

  if (direction === 'MIXED' || convictionPct < 60) {
    return {
      color: '#6b7280', // gray-500
      label: 'Mixed Signal',
      strength: 'NEUTRAL'
    };
  }

  const isStrong = convictionPct >= 80;
  const strengthLabel = isStrong ? 'STRONG' : 'WEAK';

  if (direction === 'YES') {
    return {
      color: isStrong ? '#059669' : '#10b981', // emerald-600 or emerald-500
      label: `Smart Money: ${direction} (${convictionPct}%)`,
      strength: strengthLabel
    };
  } else {
    return {
      color: isStrong ? '#dc2626' : '#ef4444', // red-600 or red-500
      label: `Smart Money: ${direction} (${convictionPct}%)`,
      strength: strengthLabel
    };
  }
}

// Helper to get top trader wallets from database
export async function getTopTraderWallets(): Promise<string[]> {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.EXPO_PUBLIC_SUPABASE_URL!,
      process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('top_traders')
      .select('wallet_address')
      .order('rank', { ascending: true })
      .limit(50);

    if (error) {
      console.warn('Could not fetch top trader wallets:', error);
      return TOP_WALLETS; // Fall back to hardcoded list
    }

    return data?.map((row: { wallet_address: string }) => row.wallet_address) || TOP_WALLETS;
  } catch (error) {
    console.warn('Error fetching top trader wallets:', error);
    return TOP_WALLETS;
  }
}