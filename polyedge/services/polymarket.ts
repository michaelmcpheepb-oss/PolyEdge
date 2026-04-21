import { Market, WhaleTrade, Trader } from '../types';

// Mock data for development (remove when real API is connected)
const MOCK_MARKETS: Market[] = [
  {
    id: 'market_1',
    question: 'Will Bitcoin reach $100,000 by end of 2025?',
    category: 'Crypto',
    yes_price: 0.65,
    no_price: 0.35,
    volume_24h: 1250000,
    total_volume: 8500000,
    end_date: new Date('2025-12-31T23:59:59Z').toISOString(),
    description: 'Prediction market on Bitcoin price milestone',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'market_2',
    question: 'Will Trump win the 2024 US presidential election?',
    category: 'Politics',
    yes_price: 0.48,
    no_price: 0.52,
    volume_24h: 3200000,
    total_volume: 21000000,
    end_date: new Date('2024-11-05T23:59:59Z').toISOString(),
    description: 'US presidential election prediction',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'market_3',
    question: 'Will Ethereum transition to proof-of-stake by Q3 2023?',
    category: 'Crypto',
    yes_price: 0.92,
    no_price: 0.08,
    volume_24h: 850000,
    total_volume: 5200000,
    end_date: new Date('2023-09-30T23:59:59Z').toISOString(),
    description: 'Ethereum consensus mechanism upgrade',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'market_4',
    question: 'Will Taylor Swift release a new album in 2024?',
    category: 'Entertainment',
    yes_price: 0.78,
    no_price: 0.22,
    volume_24h: 450000,
    total_volume: 2800000,
    end_date: new Date('2024-12-31T23:59:59Z').toISOString(),
    description: 'Music industry prediction',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'market_5',
    question: 'Will AI pass the Turing Test by 2030?',
    category: 'Technology',
    yes_price: 0.55,
    no_price: 0.45,
    volume_24h: 620000,
    total_volume: 4100000,
    end_date: new Date('2030-12-31T23:59:59Z').toISOString(),
    description: 'Artificial intelligence milestone',
    updated_at: new Date().toISOString(),
  },
];

const MOCK_WHALE_TRADES: WhaleTrade[] = [
  {
    id: 'trade_1',
    market_id: 'market_1',
    market_question: 'Will Bitcoin reach $100,000 by end of 2025?',
    trader_address: '0x742d35Cc6634C0532925a3b844Bc9e',
    trader_pseudonym: 'CryptoWhale',
    amount_usd: 125000,
    outcome: 'YES',
    side: 'BUY',
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    created_at: new Date().toISOString(),
  },
  {
    id: 'trade_2',
    market_id: 'market_2',
    market_question: 'Will Trump win the 2024 US presidential election?',
    trader_address: '0x89205A3a3b2C69c8e',
    trader_pseudonym: 'PoliticalOracle',
    amount_usd: 75000,
    outcome: 'NO',
    side: 'SELL',
    timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    created_at: new Date().toISOString(),
  },
  {
    id: 'trade_3',
    market_id: 'market_3',
    market_question: 'Will Ethereum transition to proof-of-stake by Q3 2023?',
    trader_address: '0x3f5CE5FBFe3E9af',
    trader_pseudonym: 'ETHMaxi',
    amount_usd: 210000,
    outcome: 'YES',
    side: 'BUY',
    timestamp: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
    created_at: new Date().toISOString(),
  },
];

const MOCK_TRADERS: Trader[] = [
  {
    wallet_address: '0x742d35Cc6634C0532925a3b844Bc9e',
    pseudonym: 'CryptoWhale',
    pnl_30d: 425000,
    win_rate: 0.68,
    total_trades: 142,
    active_positions: 8,
    updated_at: new Date().toISOString(),
  },
  {
    wallet_address: '0x89205A3a3b2C69c8e',
    pseudonym: 'PoliticalOracle',
    pnl_30d: 210000,
    win_rate: 0.72,
    total_trades: 89,
    active_positions: 5,
    updated_at: new Date().toISOString(),
  },
  {
    wallet_address: '0x3f5CE5FBFe3E9af',
    pseudonym: 'ETHMaxi',
    pnl_30d: 185000,
    win_rate: 0.61,
    total_trades: 67,
    active_positions: 3,
    updated_at: new Date().toISOString(),
  },
];

// Real API functions (commented out until database is ready)
export async function getMarkets(options?: {
  category?: string;
  limit?: number;
  sortBy?: 'volume' | 'newest' | 'ending_soon';
}): Promise<Market[]> {
  // TODO: Replace with real API call when database is ready
  // const response = await fetch(`${Config.POLYMARKET_GAMMA_API}/markets`, {
  //   method: 'GET',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  // });
  // if (!response.ok) {
  //   throw new Error(`Failed to fetch markets: ${response.statusText}`);
  // }
  // return response.json();

  // Mock implementation for now
  let markets = [...MOCK_MARKETS];
  
  if (options?.category) {
    markets = markets.filter(market => market.category === options.category);
  }
  
  if (options?.sortBy) {
    switch (options.sortBy) {
      case 'volume':
        markets.sort((a, b) => b.volume_24h - a.volume_24h);
        break;
      case 'newest':
        markets.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        break;
      case 'ending_soon':
        markets.sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime());
        break;
    }
  }
  
  if (options?.limit) {
    markets = markets.slice(0, options.limit);
  }
  
  return markets;
}

export async function getWhaleTrades(options?: {
  minAmount?: number;
  limit?: number;
  timeframe?: '24h' | '7d' | '30d';
}): Promise<WhaleTrade[]> {
  // TODO: Replace with real API call when database is ready
  // const response = await fetch(`${Config.POLYMARKET_CLOB_API}/trades/large`, {
  //   method: 'GET',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  // });
  // if (!response.ok) {
  //   throw new Error(`Failed to fetch whale trades: ${response.statusText}`);
  // }
  // return response.json();

  // Mock implementation for now
  let trades = [...MOCK_WHALE_TRADES];
  
  if (options?.minAmount) {
    trades = trades.filter(trade => trade.amount_usd >= options.minAmount!);
  }
  
  if (options?.timeframe) {
    const now = new Date();
    let cutoffTime: Date;
    
    switch (options.timeframe) {
      case '24h':
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoffTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
    
    trades = trades.filter(trade => new Date(trade.timestamp) >= cutoffTime);
  }
  
  if (options?.limit) {
    trades = trades.slice(0, options.limit);
  }
  
  // Sort by most recent
  trades.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  return trades;
}

export async function getTraders(options?: {
  sortBy?: 'pnl' | 'win_rate' | 'total_trades';
  limit?: number;
}): Promise<Trader[]> {
  // TODO: Replace with real API call when database is ready
  // const response = await fetch(`${Config.POLYMARKET_DATA_API}/traders`, {
  //   method: 'GET',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  // });
  // if (!response.ok) {
  //   throw new Error(`Failed to fetch traders: ${response.statusText}`);
  // }
  // return response.json();

  // Mock implementation for now
  let traders = [...MOCK_TRADERS];
  
  if (options?.sortBy) {
    switch (options.sortBy) {
      case 'pnl':
        traders.sort((a, b) => b.pnl_30d - a.pnl_30d);
        break;
      case 'win_rate':
        traders.sort((a, b) => b.win_rate - a.win_rate);
        break;
      case 'total_trades':
        traders.sort((a, b) => b.total_trades - a.total_trades);
        break;
    }
  }
  
  if (options?.limit) {
    traders = traders.slice(0, options.limit);
  }
  
  return traders;
}

export async function getMarketById(marketId: string): Promise<Market | null> {
  // TODO: Replace with real API call when database is ready
  // const response = await fetch(`${Config.POLYMARKET_GAMMA_API}/markets/${marketId}`, {
  //   method: 'GET',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  // });
  // if (!response.ok) {
  //   throw new Error(`Failed to fetch market: ${response.statusText}`);
  // }
  // return response.json();

  // Mock implementation for now
  const market = MOCK_MARKETS.find(m => m.id === marketId);
  return market || null;
}

export async function getTraderByAddress(walletAddress: string): Promise<Trader | null> {
  // TODO: Replace with real API call when database is ready
  // const response = await fetch(`${Config.POLYMARKET_DATA_API}/traders/${walletAddress}`, {
  //   method: 'GET',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  // });
  // if (!response.ok) {
  //   throw new Error(`Failed to fetch trader: ${response.statusText}`);
  // }
  // return response.json();

  // Mock implementation for now
  const trader = MOCK_TRADERS.find(t => t.wallet_address === walletAddress);
  return trader || null;
}