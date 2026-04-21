import { Market, WhaleTrade, Trader } from '../types';
import { supabase } from '../lib/supabase';

// Real API functions using Supabase - NO MOCK FALLBACK
export async function getMarkets(options?: {
  category?: string;
  limit?: number;
  sortBy?: 'volume' | 'newest' | 'ending_soon';
}): Promise<Market[]> {
  console.log('🔍 getMarkets called with options:', options);
  
  try {
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
    
    console.log('📡 Executing Supabase query...');
    const { data, error, count, status, statusText } = await query;
    
    console.log('📊 Query result:', {
      hasData: !!data,
      dataLength: data?.length || 0,
      error: error ? error.message : null,
      count,
      status,
      statusText
    });
    
    if (error) {
      console.error('❌ Error fetching markets:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw new Error(`Failed to fetch markets: ${error.message}`);
    }
    
    console.log('✅ Successfully fetched', data?.length || 0, 'markets');
    return data || [];
  } catch (error) {
    console.error('💥 Fatal error in getMarkets:', error);
    throw error; // Re-throw instead of falling back to mock
  }
}

export async function getWhaleTrades(options?: {
  minAmount?: number;
  limit?: number;
  timeframe?: '24h' | '7d' | '30d';
}): Promise<WhaleTrade[]> {
  console.log('🔍 getWhaleTrades called with options:', options);
  
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
    
    console.log('📡 Executing Supabase query...');
    const { data, error } = await query;
    
    console.log('📊 Query result:', {
      hasData: !!data,
      dataLength: data?.length || 0,
      error: error ? error.message : null
    });
    
    if (error) {
      console.error('❌ Error fetching whale trades:', error);
      throw new Error(`Failed to fetch whale trades: ${error.message}`);
    }
    
    console.log('✅ Successfully fetched', data?.length || 0, 'whale trades');
    return data || [];
  } catch (error) {
    console.error('💥 Fatal error in getWhaleTrades:', error);
    throw error;
  }
}

export async function getTraders(options?: {
  sortBy?: 'pnl' | 'win_rate' | 'total_trades';
  limit?: number;
}): Promise<Trader[]> {
  console.log('🔍 getTraders called with options:', options);
  
  try {
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
    
    console.log('📡 Executing Supabase query...');
    const { data, error } = await query;
    
    console.log('📊 Query result:', {
      hasData: !!data,
      dataLength: data?.length || 0,
      error: error ? error.message : null
    });
    
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