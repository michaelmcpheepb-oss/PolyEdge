/**
 * PolyEdge TypeScript Interfaces
 * Strict typing - no 'any' types allowed
 */

// Market
export interface Market {
  id: string;
  question: string;
  category: string;
  yes_price: number;
  no_price: number;
  volume_24h: number;
  total_volume: number;
  end_date: string; // ISO string
  description?: string;
  updated_at: string;
}

// Whale Trade
export interface WhaleTrade {
  id: string;
  market_id: string;
  market_question: string;
  trader_address: string;
  trader_pseudonym: string;
  amount_usd: number;
  outcome: 'YES' | 'NO';
  side: 'BUY' | 'SELL';
  timestamp: string;
  created_at: string;
}

// Trader
export interface Trader {
  wallet_address: string;
  pseudonym: string;
  pnl_30d: number;
  win_rate: number;
  total_trades: number;
  active_positions: number;
  updated_at: string;
}

// Alert
export interface Alert {
  id: string;
  user_id: string;
  market_id: string;
  market_question: string;
  alert_type: 'price_above' | 'price_below' | 'price_move' | 'whale_trade';
  threshold: number;
  is_active: boolean;
  last_triggered_at?: string;
  created_at: string;
}

// User (from Supabase Auth)
export interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
}

// Subscription
export interface Subscription {
  user_id: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  plan: 'free' | 'pro';
  trial_ends_at?: string;
  period_end?: string;
  updated_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// Navigation Types
export type RootStackParamList = {
  '(tabs)': undefined;
  'market/[id]': { id: string };
  'trader/[wallet]': { wallet: string };
  'alerts/create': undefined;
  'pro': undefined;
  'settings': undefined;
  'onboarding': undefined;
};

export type TabParamList = {
  feed: undefined;
  whales: undefined;
  alerts: undefined;
  leaderboard: undefined;
};

// Component Props
export interface MarketCardProps {
  market: Market;
  onPress: () => void;
}

export interface WhaleTradeRowProps {
  trade: WhaleTrade;
  isPro: boolean;
}

export interface SkeletonCardProps {
  width?: number | string;
  height?: number;
}

// Store Types
export interface WhaleStore {
  threshold: number;
  setThreshold: (threshold: number) => void;
}

export interface UserStore {
  user: User | null;
  subscription: Subscription | null;
  isPro: boolean;
  setUser: (user: User | null) => void;
  setSubscription: (subscription: Subscription | null) => void;
}

// Chart Types
export interface ChartDataPoint {
  x: string | number;
  y: number;
}

export interface MarketHistory {
  timestamp: string;
  yes_price: number;
  no_price: number;
  volume: number;
}

// Utility Types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;