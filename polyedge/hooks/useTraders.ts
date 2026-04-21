import { useQuery } from '@tanstack/react-query';
import { getTraders, getTraderByAddress } from '../services/polymarket';
import { Trader } from '../types';

export function useTraders(options?: {
  sortBy?: 'pnl' | 'win_rate' | 'total_trades';
  limit?: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ['traders', options],
    queryFn: () => getTraders(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: options?.enabled ?? true,
  });
}

export function useTrader(walletAddress: string | undefined) {
  return useQuery({
    queryKey: ['trader', walletAddress],
    queryFn: () => {
      if (!walletAddress) {
        throw new Error('Wallet address is required');
      }
      return getTraderByAddress(walletAddress);
    },
    enabled: !!walletAddress,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTraderLeaderboard(options?: {
  period?: '7d' | '30d' | 'all_time';
  limit?: number;
}) {
  const period = options?.period || '30d';
  const limit = options?.limit || 100;
  
  return useQuery({
    queryKey: ['traderLeaderboard', period, limit],
    queryFn: () => getTraders({
      sortBy: 'pnl',
      limit,
    }),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}