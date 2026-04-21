import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getMarkets, getMarketById } from '../services/polymarket';
import { Market } from '../types';

export function useMarkets(options?: {
  category?: string;
  limit?: number;
  sortBy?: 'volume' | 'newest' | 'ending_soon';
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ['markets', options],
    queryFn: () => getMarkets(options),
    staleTime: 60000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60000, // Refetch every 60 seconds
    enabled: options?.enabled ?? true,
  });
}

export function useInfiniteMarkets(options?: {
  category?: string;
  sortBy?: 'volume' | 'newest' | 'ending_soon';
  pageSize?: number;
}) {
  const pageSize = options?.pageSize || 10;
  
  return useInfiniteQuery({
    queryKey: ['markets', 'infinite', options],
    queryFn: ({ pageParam = 0 }) => 
      getMarkets({
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
    staleTime: 60000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useMarket(marketId: string | undefined) {
  return useQuery({
    queryKey: ['market', marketId],
    queryFn: () => {
      if (!marketId) {
        throw new Error('Market ID is required');
      }
      return getMarketById(marketId);
    },
    enabled: !!marketId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useMarketCategories() {
  return useQuery({
    queryKey: ['marketCategories'],
    queryFn: async () => {
      const markets = await getMarkets({ limit: 100 });
      const categories = new Set<string>();
      markets.forEach(market => {
        if (market.category) {
          categories.add(market.category);
        }
      });
      return Array.from(categories).sort();
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
  });
}