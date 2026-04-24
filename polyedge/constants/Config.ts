/**
 * PolyEdge Configuration
 * All API URLs and configuration constants
 */

import Constants from 'expo-constants';

// Supabase
export const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
export const SUPABASE_SERVICE_ROLE_KEY = Constants.expoConfig?.extra?.supabaseServiceRoleKey || process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

// Polymarket APIs
export const POLYMARKET_GAMMA_API = Constants.expoConfig?.extra?.polymarketGammaApi || process.env.EXPO_PUBLIC_POLYMARKET_GAMMA_API;
export const POLYMARKET_CLOB_API = Constants.expoConfig?.extra?.polymarketClobApi || process.env.EXPO_PUBLIC_POLYMARKET_CLOB_API;
export const POLYMARKET_DATA_API = Constants.expoConfig?.extra?.polymarketDataApi || process.env.EXPO_PUBLIC_POLYMARKET_DATA_API;

// Stripe
export const STRIPE_PUBLISHABLE_KEY = Constants.expoConfig?.extra?.stripePublishableKey || process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
export const STRIPE_SECRET_KEY = Constants.expoConfig?.extra?.stripeSecretKey || process.env.EXPO_PUBLIC_STRIPE_SECRET_KEY;

// Expo
export const EXPO_PROJECT_ID = Constants.expoConfig?.extra?.expoProjectId || process.env.EXPO_PUBLIC_EXPO_PROJECT_ID;

// App Configuration
export const APP_NAME = 'PolyEdge';
export const APP_VERSION = '1.0.0';
export const APP_SCHEME = 'polyedge';

// API Endpoints
export const API_ENDPOINTS = {
  // Polymarket Gamma API (markets)
  markets: `${POLYMARKET_GAMMA_API}/markets`,
  marketDetail: (id: string) => `${POLYMARKET_GAMMA_API}/markets/${id}`,
  marketHistory: (id: string) => `${POLYMARKET_GAMMA_API}/markets/${id}/history`,
  
  // Polymarket CLOB API (trades)
  trades: `${POLYMARKET_CLOB_API}/trades`,
  marketTrades: (id: string) => `${POLYMARKET_CLOB_API}/trades?market=${id}`,
  
  // Polymarket Data API (misc)
  traders: `${POLYMARKET_DATA_API}/traders`,
  traderDetail: (address: string) => `${POLYMARKET_DATA_API}/traders/${address}`,
  
  // Supabase
  supabase: SUPABASE_URL,
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_WHALE_FEED: true,
  ENABLE_ALERTS: true,
  ENABLE_LEADERBOARD: true,
  ENABLE_PRO_SUBSCRIPTION: true,
  ENABLE_PUSH_NOTIFICATIONS: true,
} as const;

// Default Values
export const DEFAULTS = {
  WHALE_THRESHOLD: 10000, // $10,000 minimum for whale trades
  MARKET_LIMIT: 50,
  TRADE_LIMIT: 100,
  REFETCH_INTERVAL: 60000, // 60 seconds
  CHART_RANGE: '7d' as '7d' | '30d' | 'all',
} as const;

// Validation
if (!SUPABASE_URL) throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL');
if (!SUPABASE_ANON_KEY) throw new Error('Missing EXPO_PUBLIC_SUPABASE_ANON_KEY');
if (!POLYMARKET_GAMMA_API) throw new Error('Missing EXPO_PUBLIC_POLYMARKET_GAMMA_API');