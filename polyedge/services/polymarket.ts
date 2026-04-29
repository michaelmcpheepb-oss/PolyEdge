import { Market, WhaleTrade, Trader } from '../types';
import { supabase } from '../lib/supabase';
import { POLYMARKET_GAMMA_API, POLYMARKET_CLOB_API, POLYMARKET_DATA_API } from '../constants/Config';

// Real API functions using Polymarket APIs and Supabase
export async function getMarkets(options?: {
  category?: string;
  limit?: number;
  sortBy?: 'volume' | 'newest' | 'ending_soon';
}): Promise<Market[]> {
  console.log('🔍 getMarkets called with options:', options);
  
  try {
    // First, try to fetch from Polymarket API
    console.log('📡 Fetching from Polymarket API...');
    const apiUrl = `${POLYMARKET_GAMMA_API}/markets?active=true&limit=${options?.limit || 50}`;
    console.log('API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('❌ Polymarket API error:', response.status, response.statusText);
      throw new Error(`Polymarket API failed: ${response.statusText}`);
    }
    
    const polymarketData = await response.json();
    console.log(`📊 Got ${polymarketData.length} markets from Polymarket API`);
    
    // Transform Polymarket data to our schema
    const markets: Market[] = polymarketData.map((item: any) => {
      // Extract category from tags or question
      let category = 'General';
      if (item.tags && item.tags.length > 0) {
        category = item.tags[0].charAt(0).toUpperCase() + item.tags[0].slice(1);
      } else if (item.question) {
        // Simple category extraction from question
        const lowerQuestion = item.question.toLowerCase();
        if (lowerQuestion.includes('bitcoin') || lowerQuestion.includes('ethereum') || lowerQuestion.includes('crypto')) {
          category = 'Crypto';
        } else if (lowerQuestion.includes('trump') || lowerQuestion.includes('election') || lowerQuestion.includes('politics')) {
          category = 'Politics';
        } else if (lowerQuestion.includes('sports') || lowerQuestion.includes('game') || lowerQuestion.includes('team')) {
          category = 'Sports';
        } else if (lowerQuestion.includes('science') || lowerQuestion.includes('tech') || lowerQuestion.includes('ai')) {
          category = 'Technology';
        } else if (lowerQuestion.includes('business') || lowerQuestion.includes('economy') || lowerQuestion.includes('stock')) {
          category = 'Business';
        }
      }
      
      // outcomePrices is ["0.52", "0.48"] — index 0 = YES, index 1 = NO
      const prices = item.outcomePrices ?? [];
      const yesPrice = parseFloat(prices[0] ?? item.yesPrice ?? '0.5') || 0.5;
      const noPrice  = parseFloat(prices[1] ?? item.noPrice  ?? '0.5') || 0.5;

      return {
        id: item.id || `market_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        question: item.question || 'Unknown market',
        category,
        yes_price: yesPrice,
        no_price: noPrice,
        volume_24h: parseFloat(item.volume24hr ?? item.volume24h ?? item.volume ?? '0') || 0,
        total_volume: parseFloat(item.volumeTotal ?? item.totalVolume ?? item.volume ?? '0') || 0,
        end_date: item.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        description: item.description || '',
        updated_at: new Date().toISOString(),
        image: item.image ?? item.icon ?? item.imageUrl ?? null,
        condition_id: item.conditionId ?? null,
      };
    });
    
    // Upsert to Supabase
    console.log('💾 Upserting to Supabase...');
    if (markets.length > 0) {
      const { error: upsertError } = await supabase
        .from('markets')
        .upsert(markets, { onConflict: 'id' });
      
      if (upsertError) {
        console.error('❌ Supabase upsert error:', upsertError);
        // Continue with the data we have even if upsert fails
      } else {
        console.log(`✅ Upserted ${markets.length} markets to Supabase`);
      }
    }
    
    // Now query from Supabase with filters
    let query = supabase
      .from('markets')
      .select('*');
    
    // Apply category filter
    if (options?.category) {
      query = query.eq('category', options.category);
    }
    
    // Apply sorting
    if (options?.sortBy) {
      switch (options.sortBy) {
        case 'volume':
          query = query.order('volume_24h', { ascending: false });
          break;
        case 'newest':
          query = query.order('updated_at', { ascending: false });
          break;
        case 'ending_soon':
          query = query.order('end_date', { ascending: true });
          break;
        default:
          query = query.order('volume_24h', { ascending: false });
      }
    } else {
      // Default sort by volume
      query = query.order('volume_24h', { ascending: false });
    }
    
    // Apply limit
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    console.log('📡 Querying Supabase...');
    const { data: supabaseData, error: supabaseError } = await query;
    
    if (supabaseError) {
      console.error('❌ Supabase query error:', supabaseError);
      // Return the data we got from Polymarket API directly
      console.log('⚠️ Falling back to Polymarket API data');
      
      // Apply sorting to Polymarket data
      let sortedMarkets = [...markets];
      if (options?.sortBy) {
        switch (options.sortBy) {
          case 'volume':
            sortedMarkets.sort((a, b) => b.volume_24h - a.volume_24h);
            break;
          case 'newest':
            sortedMarkets.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
            break;
          case 'ending_soon':
            sortedMarkets.sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime());
            break;
        }
      }
      
      // Apply limit
      if (options?.limit) {
        sortedMarkets = sortedMarkets.slice(0, options.limit);
      }
      
      return sortedMarkets;
    }
    
    console.log(`✅ Successfully fetched ${supabaseData?.length || 0} markets`);
    return supabaseData || [];
  } catch (error) {
    console.error('💥 Fatal error in getMarkets:', error);
    
    // Last resort: fallback to Supabase-only query
    console.log('🔄 Falling back to Supabase-only query...');
    try {
      const { data, error: fallbackError } = await supabase
        .from('markets')
        .select('*')
        .order('volume_24h', { ascending: false })
        .limit(options?.limit || 50);
      
      if (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        // Return empty array instead of throwing - app will show empty state
        return [];
      }
      
      return data || [];
    } catch (fallbackError) {
      console.error('💥 Complete failure:', fallbackError);
      // Return empty array - app will show empty/error state
      return [];
    }
  }
}

export async function getWhaleTrades(options?: {
  minAmount?: number;
  limit?: number;
  timeframe?: '24h' | '7d' | '30d';
}): Promise<WhaleTrade[]> {
  console.log('🔍 getWhaleTrades called with options:', options);
  
  try {
    // First, try to fetch from Polymarket CLOB API
    console.log('📡 Fetching from Polymarket CLOB API...');
    const apiUrl = `${POLYMARKET_CLOB_API}/trades?limit=500`;
    console.log('API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('❌ Polymarket CLOB API error:', response.status, response.statusText);
      throw new Error(`Polymarket CLOB API failed: ${response.statusText}`);
    }
    
    const tradesData = await response.json();
    console.log(`📊 Got ${tradesData.length} trades from Polymarket API`);
    
    // Filter for whale trades (minAmount default 1000)
    const minAmount = options?.minAmount || 1000;
    const whaleTrades: WhaleTrade[] = [];
    
    for (const trade of tradesData) {
      // Calculate trade value
      const shares = trade.shares || 0;
      const price = trade.price || 0;
      const amountUsd = shares * price;
      
      if (amountUsd >= minAmount) {
        // Get trader pseudonym
        const traderAddress = trade.user || trade.trader || 'unknown';
        const last4 = traderAddress.slice(-4);
        const traderPseudonym = `Whale #${last4}`;
        
        // Get market question (we'd need to fetch market details)
        const marketQuestion = trade.marketQuestion || `Market ${trade.marketId || 'unknown'}`;
        
        whaleTrades.push({
          id: trade.id || `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          market_id: trade.marketId || 'unknown',
          market_question: marketQuestion,
          trader_address: traderAddress,
          trader_pseudonym: traderPseudonym,
          amount_usd: amountUsd,
          outcome: trade.outcome === 'YES' ? 'YES' : 'NO',
          side: trade.side === 'BUY' ? 'BUY' : 'SELL',
          timestamp: trade.timestamp || new Date().toISOString(),
          created_at: new Date().toISOString(),
        });
      }
    }
    
    console.log(`🐋 Found ${whaleTrades.length} whale trades (>= $${minAmount})`);
    
    // Apply timeframe filter
    let filteredTrades = whaleTrades;
    if (options?.timeframe) {
      const now = new Date();
      let cutoffDate: Date;
      
      switch (options.timeframe) {
        case '24h':
          cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }
      
      filteredTrades = whaleTrades.filter(trade => 
        new Date(trade.timestamp) >= cutoffDate
      );
      console.log(`⏰ Filtered to ${filteredTrades.length} trades in ${options.timeframe}`);
    }
    
    // Sort by most recent
    filteredTrades.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Apply limit
    if (options?.limit) {
      filteredTrades = filteredTrades.slice(0, options.limit);
    }
    
    // Upsert to Supabase
    if (filteredTrades.length > 0) {
      console.log('💾 Upserting whale trades to Supabase...');
      const { error: upsertError } = await supabase
        .from('whale_trades')
        .upsert(filteredTrades, { onConflict: 'id' });
      
      if (upsertError) {
        console.error('❌ Supabase upsert error:', upsertError);
      } else {
        console.log(`✅ Upserted ${filteredTrades.length} whale trades to Supabase`);
      }
    }
    
    // If API succeeded but returned nothing, use demo data
    if (filteredTrades.length === 0) {
      return getDemoWhaleTrades(options?.minAmount ?? 1000, options?.limit ?? 100);
    }
    return filteredTrades;
  } catch (error) {
    console.error('💥 Error in getWhaleTrades:', error);
    
    // Fallback to Supabase query
    console.log('🔄 Falling back to Supabase query...');
    try {
      let query = supabase
        .from('whale_trades')
        .select('*')
        .order('timestamp', { ascending: false });
      
      // Apply minimum amount filter
      if (options?.minAmount) {
        query = query.gte('amount_usd', options.minAmount);
      }
      
      // Apply timeframe filter
      if (options?.timeframe) {
        const now = new Date();
        let cutoffDate: Date;
        
        switch (options.timeframe) {
          case '24h':
            cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case '7d':
            cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30d':
            cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        }
        
        query = query.gte('timestamp', cutoffDate.toISOString());
      }
      
      // Apply limit
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      
      const { data, error: supabaseError } = await query;
      
      if (supabaseError) {
        console.error('❌ Supabase fallback also failed:', supabaseError);
        throw new Error('All data sources failed');
      }
      
      if (data && data.length > 0) return data;
      // Both failed or empty — return demo trades
      return getDemoWhaleTrades(options?.minAmount ?? 1000, options?.limit ?? 100);
    } catch (fallbackError) {
      console.error('💥 Complete failure:', fallbackError);
      return getDemoWhaleTrades(options?.minAmount ?? 1000, options?.limit ?? 100);
    }
  }
}

/** Static demo whale trades shown when API and Supabase both return empty. */
export const DEMO_WHALE_IDS = new Set([
  'demo-1','demo-2','demo-3','demo-4','demo-5',
  'demo-6','demo-7','demo-8','demo-9','demo-10',
  'demo-11','demo-12',
]);

function getDemoWhaleTrades(minAmount: number, limit: number): WhaleTrade[] {
  const now = Date.now();
  const raw: WhaleTrade[] = [
    { id:'demo-1',  market_id:'btc-150k-2026',   market_question:'Will Bitcoin reach $150K in 2026?',             trader_address:'0x1a2b3c4d', trader_pseudonym:'Whale #4d',  amount_usd:45000, outcome:'YES', side:'BUY',  timestamp:new Date(now-1*3600000).toISOString(), created_at:new Date().toISOString() },
    { id:'demo-2',  market_id:'fed-cut-2026',     market_question:'Will the Fed cut rates before Q3 2026?',        trader_address:'0x2b3c4d5e', trader_pseudonym:'Whale #5e',  amount_usd:22000, outcome:'YES', side:'BUY',  timestamp:new Date(now-2*3600000).toISOString(), created_at:new Date().toISOString() },
    { id:'demo-3',  market_id:'eth-etf-2026',     market_question:'Will Ethereum ETF see net inflows in Q2 2026?', trader_address:'0x3c4d5e6f', trader_pseudonym:'Whale #6f',  amount_usd:78000, outcome:'YES', side:'BUY',  timestamp:new Date(now-3*3600000).toISOString(), created_at:new Date().toISOString() },
    { id:'demo-4',  market_id:'sol-etf-2026',     market_question:'Will SEC approve spot Solana ETF by Q3 2026?',  trader_address:'0x4d5e6f7a', trader_pseudonym:'Whale #7a',  amount_usd:31000, outcome:'NO',  side:'BUY',  timestamp:new Date(now-4*3600000).toISOString(), created_at:new Date().toISOString() },
    { id:'demo-5',  market_id:'gpt5-2026',        market_question:'Will OpenAI release GPT-5 by July 2026?',       trader_address:'0x5e6f7a8b', trader_pseudonym:'Whale #8b',  amount_usd:12500, outcome:'YES', side:'BUY',  timestamp:new Date(now-5*3600000).toISOString(), created_at:new Date().toISOString() },
    { id:'demo-6',  market_id:'btc-150k-2026',    market_question:'Will Bitcoin reach $150K in 2026?',             trader_address:'0x6f7a8b9c', trader_pseudonym:'Whale #9c',  amount_usd:95000, outcome:'NO',  side:'BUY',  timestamp:new Date(now-6*3600000).toISOString(), created_at:new Date().toISOString() },
    { id:'demo-7',  market_id:'trump-crypto-2026',market_question:'Will Trump sign a crypto order before end of 2026?', trader_address:'0x7a8b9c0d', trader_pseudonym:'Whale #0d',  amount_usd:18000, outcome:'YES', side:'BUY',  timestamp:new Date(now-8*3600000).toISOString(), created_at:new Date().toISOString() },
    { id:'demo-8',  market_id:'sp500-6000',       market_question:'Will S&P 500 hit 6,000 before July 2026?',      trader_address:'0x8b9c0d1e', trader_pseudonym:'Whale #1e',  amount_usd:55000, outcome:'YES', side:'BUY',  timestamp:new Date(now-9*3600000).toISOString(), created_at:new Date().toISOString() },
    { id:'demo-9',  market_id:'ecb-cut-2026',     market_question:'Will the ECB cut rates in June 2026?',          trader_address:'0x9c0d1e2f', trader_pseudonym:'Whale #2f',  amount_usd:27000, outcome:'YES', side:'BUY',  timestamp:new Date(now-11*3600000).toISOString(),created_at:new Date().toISOString() },
    { id:'demo-10', market_id:'link-40-2026',     market_question:'Will Chainlink hit $40 by June 2026?',          trader_address:'0x0d1e2f3a', trader_pseudonym:'Whale #3a',  amount_usd:8500,  outcome:'YES', side:'BUY',  timestamp:new Date(now-14*3600000).toISOString(),created_at:new Date().toISOString() },
    { id:'demo-11', market_id:'avax-50-2026',     market_question:'Will Avalanche hit $50 before Q3 2026?',        trader_address:'0x1e2f3a4b', trader_pseudonym:'Whale #4b',  amount_usd:14000, outcome:'NO',  side:'BUY',  timestamp:new Date(now-16*3600000).toISOString(),created_at:new Date().toISOString() },
    { id:'demo-12', market_id:'oil-sub70-2026',   market_question:'Will oil drop below $70 by Q2 2026?',           trader_address:'0x2f3a4b5c', trader_pseudonym:'Whale #5c',  amount_usd:33000, outcome:'NO',  side:'BUY',  timestamp:new Date(now-20*3600000).toISOString(),created_at:new Date().toISOString() },
  ];
  return raw.filter(t => t.amount_usd >= minAmount).slice(0, limit);
}

export async function getTraders(options?: {
  sortBy?: 'pnl' | 'win_rate' | 'total_trades';
  limit?: number;
}): Promise<Trader[]> {
  console.log('🔍 getTraders called with options:', options);
  
  try {
    // For now, query from Supabase
    // TODO: Integrate with Polymarket leaderboard API when available
    let query = supabase
      .from('traders')
      .select('*');
    
    // Apply sorting
    if (options?.sortBy) {
      switch (options.sortBy) {
        case 'pnl':
          query = query.order('pnl_30d', { ascending: false });
          break;
        case 'win_rate':
          query = query.order('win_rate', { ascending: false });
          break;
        case 'total_trades':
          query = query.order('total_trades', { ascending: false });
          break;
        default:
          query = query.order('pnl_30d', { ascending: false });
      }
    } else {
      // Default sort by PnL
      query = query.order('pnl_30d', { ascending: false });
    }
    
    // Apply limit
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    console.log('📡 Querying Supabase...');
    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Error fetching traders:', error);
      throw new Error(`Failed to fetch traders: ${error.message}`);
    }
    
    console.log('✅ Successfully fetched', data?.length || 0, 'traders');
    return data || [];
  } catch (error) {
    console.error('💥 Fatal error in getTraders:', error);
    throw error;
  }
}

export async function getMarketById(marketId: string, question?: string): Promise<Market | null> {
  // 1. Try Supabase markets table by exact ID
  try {
    const { data } = await supabase.from('markets').select('*').eq('id', marketId).single();
    if (data) return data;
  } catch {}

  // 2. Try Polymarket Gamma API by exact ID
  try {
    const res = await fetch(`${POLYMARKET_GAMMA_API}/markets/${marketId}`);
    if (res.ok) {
      const item = await res.json();
      const prices = item.outcomePrices ?? [];
      return {
        id: item.id,
        question: item.question ?? 'Unknown market',
        category: item.category ?? (item.tags?.[0] ?? 'General'),
        yes_price: parseFloat(prices[0] ?? '0.5') || 0.5,
        no_price:  parseFloat(prices[1] ?? '0.5') || 0.5,
        volume_24h:   parseFloat(item.volume24hr ?? item.volume ?? '0') || 0,
        total_volume: parseFloat(item.volumeTotal ?? item.volume ?? '0') || 0,
        end_date:   item.endDate ?? new Date(Date.now() + 30 * 86400000).toISOString(),
        description: item.description ?? '',
        updated_at: new Date().toISOString(),
        image: item.image ?? item.icon ?? null,
        condition_id: item.conditionId ?? null,
      };
    }
  } catch {}

  // 3. Search Gamma API by question text (when ID is internal/seeded)
  if (question) {
    try {
      const q = encodeURIComponent(question.slice(0, 120));
      const res = await fetch(`${POLYMARKET_GAMMA_API}/markets?question=${q}&limit=5&active=true`);
      if (res.ok) {
        const items: any[] = await res.json();
        // Pick best match: exact question or highest volume
        const match = items.find(
          (m) => m.question?.toLowerCase() === question.toLowerCase()
        ) ?? items[0];
        if (match) {
          const prices = match.outcomePrices ?? [];
          return {
            id: match.id,
            question: match.question ?? question,
            category: match.category ?? (match.tags?.[0] ?? 'General'),
            yes_price: parseFloat(prices[0] ?? '0.5') || 0.5,
            no_price:  parseFloat(prices[1] ?? '0.5') || 0.5,
            volume_24h:   parseFloat(match.volume24hr ?? match.volume ?? '0') || 0,
            total_volume: parseFloat(match.volumeTotal ?? match.volume ?? '0') || 0,
            end_date:   match.endDate ?? new Date(Date.now() + 30 * 86400000).toISOString(),
            description: match.description ?? '',
            updated_at: new Date().toISOString(),
            image: match.image ?? match.icon ?? null,
            condition_id: match.conditionId ?? null,
          };
        }
      }
    } catch {}

    // 4. Synthesize from daily_picks using question text (last resort)
    try {
      const { data: pick } = await supabase
        .from('daily_picks')
        .select('*')
        .ilike('market_question', question.slice(0, 80))
        .order('pick_date', { ascending: false })
        .limit(1)
        .single();
      if (pick) {
        return {
          id: pick.market_id,
          question:     pick.market_question,
          category:     pick.category ?? 'General',
          yes_price:    pick.current_yes_price ?? 0.5,
          no_price:     pick.current_no_price  ?? 0.5,
          volume_24h:   0,
          total_volume: 0,
          end_date:     new Date(Date.now() + 30 * 86400000).toISOString(),
          description:  pick.ai_reasoning ?? '',
          updated_at:   pick.created_at ?? new Date().toISOString(),
          image:        undefined,
          condition_id: undefined,
        };
      }
    } catch {}
  }

  // 5. Synthesize from daily_picks by market_id
  try {
    const { data: pick } = await supabase
      .from('daily_picks')
      .select('*')
      .eq('market_id', marketId)
      .order('pick_date', { ascending: false })
      .limit(1)
      .single();
    if (pick) {
      return {
        id: pick.market_id,
        question:     pick.market_question,
        category:     pick.category ?? 'General',
        yes_price:    pick.current_yes_price ?? 0.5,
        no_price:     pick.current_no_price  ?? 0.5,
        volume_24h:   0,
        total_volume: 0,
        end_date:     new Date(Date.now() + 30 * 86400000).toISOString(),
        description:  pick.ai_reasoning ?? '',
        updated_at:   pick.created_at ?? new Date().toISOString(),
        image:        undefined,
        condition_id: undefined,
      };
    }
  } catch {}

  throw new Error(`Market not found: ${marketId}`);
}

export async function getTraderByAddress(walletAddress: string): Promise<Trader | null> {
  console.log('🔍 getTraderByAddress called for:', walletAddress);
  
  try {
    const { data, error } = await supabase
      .from('traders')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();
    
    if (error) {
      console.error('❌ Error fetching trader:', error);
      throw new Error(`Failed to fetch trader: ${error.message}`);
    }
    
    console.log('✅ Successfully fetched trader:', data?.wallet_address);
    return data;
  } catch (error) {
    console.error('💥 Fatal error in getTraderByAddress:', error);
    throw error;
  }
}

export async function getLeaderboard(options?: {
  period?: '7d' | '30d' | 'all';
  limit?: number;
}): Promise<Trader[]> {
  console.log('🔍 getLeaderboard called with options:', options);
  
  try {
    // For now, query from Supabase
    // TODO: Integrate with Polymarket leaderboard API when available
    let query = supabase
      .from('traders')
      .select('*');
    
    // Apply sorting by PnL (descending)
    query = query.order('pnl_30d', { ascending: false });
    
    // Apply limit
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    console.log('📡 Querying Supabase for leaderboard...');
    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Error fetching leaderboard:', error);
      throw new Error(`Failed to fetch leaderboard: ${error.message}`);
    }
    
    console.log(`✅ Successfully fetched ${data?.length || 0} traders for leaderboard`);
    return data || [];
  } catch (error) {
    console.error('💥 Fatal error in getLeaderboard:', error);
    throw error;
  }
}

export async function getTraderPositions(walletAddress: string): Promise<any[]> {
  console.log('🔍 getTraderPositions called for:', walletAddress);
  
  try {
    // TODO: Integrate with Polymarket positions API
    // For now, return empty array
    console.log('⚠️ Positions API not yet implemented');
    return [];
  } catch (error) {
    console.error('💥 Error fetching trader positions:', error);
    throw error;
  }
}