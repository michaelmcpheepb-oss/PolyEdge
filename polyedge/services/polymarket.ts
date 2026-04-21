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
      
      // Calculate prices from market data
      const yesPrice = item.yesPrice || 0.5;
      const noPrice = item.noPrice || 0.5;
      
      return {
        id: item.id || `market_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        question: item.question || 'Unknown market',
        category,
        yes_price: yesPrice,
        no_price: noPrice,
        volume_24h: item.volume24h || item.volume || 0,
        total_volume: item.totalVolume || item.volume || 0,
        end_date: item.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Default 30 days from now
        description: item.description || '',
        updated_at: new Date().toISOString(),
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
    
    // Filter for whale trades (minAmount default 10000)
    const minAmount = options?.minAmount || 10000;
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
      
      return data || [];
    } catch (fallbackError) {
      console.error('💥 Complete failure:', fallbackError);
      throw new Error('Failed to fetch whale trades from any source');
    }
  }
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

export async function getMarketById(marketId: string): Promise<Market | null> {
  console.log('🔍 getMarketById called for:', marketId);
  
  try {
    const { data, error } = await supabase
      .from('markets')
      .select('*')
      .eq('id', marketId)
      .single();
    
    if (error) {
      console.error('❌ Error fetching market:', error);
      throw new Error(`Failed to fetch market: ${error.message}`);
    }
    
    console.log('✅ Successfully fetched market:', data?.id);
    return data;
  } catch (error) {
    console.error('💥 Fatal error in getMarketById:', error);
    throw error;
  }
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