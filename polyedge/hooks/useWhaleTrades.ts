import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getWhaleTrades } from '../services/polymarket';
import { WhaleTrade } from '../types';

export function useWhaleTrades(options?: {
  minAmount?: number;
  limit?: number;
  timeframe?: '24h' | '7d' | '30d';
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ['whaleTrades', options],
    queryFn: () => getWhaleTrades(options),
    staleTime: 60 * 1000, // 1 minute (whale trades update frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    enabled: options?.enabled ?? true,
  });
}

export function useInfiniteWhaleTrades(options?: {
  minAmount?: number;
  timeframe?: '24h' | '7d' | '30d';
  pageSize?: number;
}) {
  const pageSize = options?.pageSize || 20;
  
  return useInfiniteQuery({
    queryKey: ['whaleTrades', 'infinite', options],
    queryFn: ({ pageParam = 0 }) => 
      getWhaleTrades({
        ...options,
        limit: pageSize,
      }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < pageSize) {
        return undefined;
      }
      return allPages.length;
    },
    initialPageParam: 0,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000,
  });
}

export function useWhaleTradeThresholds() {
  return useQuery({
    queryKey: ['whaleTradeThresholds'],
    queryFn: async () => {
      const trades = await getWhaleTrades({ timeframe: '7d' });
      const amounts = trades.map(trade => trade.amount_usd);
      
      if (amounts.length === 0) {
        return [1000, 5000, 10000, 25000, 50000]; // Default thresholds
      }
      
      const maxAmount = Math.max(...amounts);
      const minAmount = Math.min(...amounts);
      
      // Generate thresholds based on data distribution
      const thresholds: number[] = [];
      const step = Math.max(1000, Math.floor((maxAmount - minAmount) / 5));
      
      for (let i = 1; i <= 5; i++) {
        thresholds.push(Math.floor(i * step / 1000) * 1000);
      }
      
      // Ensure unique thresholds and sort
      return [...new Set(thresholds)].sort((a, b) => a - b);
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
  });
}