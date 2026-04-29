import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { WhaleTradeRow } from '../../components/WhaleTradeRow';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TraderProfileScreen() {
  const { wallet } = useLocalSearchParams<{ wallet: string }>();
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'positions' | 'history'>('positions');
  const [trader, setTrader] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wallet) return;
    supabase
      .from('top_traders')
      .select('*')
      .eq('wallet_address', wallet)
      .limit(1)
      .then(({ data }) => {
        setTrader(data?.[0] ?? {
          wallet_address: wallet,
          pseudonym: `Trader ${wallet.slice(0, 6)}…${wallet.slice(-4)}`,
          pnl_30d: 0,
          win_rate: 0,
          total_trades: 0,
          active_positions: 0,
        });
        setLoading(false);
      });
  }, [wallet]);

  // No hardcoded positions/history — real data would come from Polymarket CLOB
  const positions: any[] = [];
  const tradeHistory: any[] = [];
  
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };
  
  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    // TODO: Update followed_traders table in Supabase
  };
  
  const renderPositionItem = ({ item }: { item: any }) => (
    <View style={styles.positionCard}>
      <Text style={styles.positionMarket} numberOfLines={1}>
        {item.market_question}
      </Text>
      <View style={styles.positionDetails}>
        <View style={styles.positionOutcome}>
          <Text style={[
            styles.outcomeText,
            { color: item.outcome === 'YES' ? Colors.success : Colors.error }
          ]}>
            {item.outcome}
          </Text>
          <Text style={styles.sharesText}>
            {item.shares} shares
          </Text>
        </View>
        <View style={styles.positionPrices}>
          <Text style={styles.priceText}>
            Avg: {(item.avg_price * 100).toFixed(1)}%
          </Text>
          <Text style={styles.priceText}>
            Now: {(item.current_price * 100).toFixed(1)}%
          </Text>
        </View>
        <View style={styles.positionPnl}>
          <Text style={[
            styles.pnlText,
            { color: item.pnl >= 0 ? Colors.success : Colors.error }
          ]}>
            {item.pnl >= 0 ? '+' : ''}{formatCurrency(item.pnl)}
          </Text>
          <Text style={styles.pnlLabel}>PnL</Text>
        </View>
      </View>
    </View>
  );
  
  const renderTradeItem = ({ item }: { item: any }) => (
    <WhaleTradeRow 
      trade={{
        id: item.id,
        market_id: item.market_id,
        market_question: item.market_question,
        trader_address: trader.wallet_address,
        trader_pseudonym: trader.pseudonym,
        amount_usd: item.amount_usd,
        outcome: item.outcome,
        side: item.side,
        timestamp: item.timestamp,
        created_at: item.timestamp,
      }}
      onPress={() => router.push(`/market/${item.market_id}`)}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.headerTitleText}>Trader Profile</Text>
          </View>
          <View style={styles.headerRight} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!trader) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.headerTitleText}>Trader Profile</Text>
          </View>
          <View style={styles.headerRight} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <Ionicons name="person-outline" size={64} color={Colors.textSecondary} />
          <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginTop: 16 }}>
            Trader Not Found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerTitleText}>Trader Profile</Text>
        </View>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Trader Header */}
        <View style={styles.traderHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {trader.pseudonym.substring(0, 2).toUpperCase()}
              </Text>
            </View>
          </View>
          
          <Text style={styles.pseudonym}>{trader.pseudonym}</Text>
          <Text style={styles.walletAddress}>
            {trader.wallet_address.slice(0, 10)}...{trader.wallet_address.slice(-8)}
          </Text>
          
          <TouchableOpacity 
            style={[styles.followButton, isFollowing && styles.followingButton]}
            onPress={handleFollowToggle}
          >
            <Ionicons 
              name={isFollowing ? "checkmark" : "add"} 
              size={20} 
              color={isFollowing ? Colors.background : Colors.accent} 
            />
            <Text style={[styles.followText, isFollowing && styles.followingText]}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{trader.win_rate}%</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[
              styles.statValue,
              { color: trader.pnl_30d >= 0 ? Colors.success : Colors.error }
            ]}>
              {trader.pnl_30d >= 0 ? '+' : ''}{formatCurrency(trader.pnl_30d)}
            </Text>
            <Text style={styles.statLabel}>30d PnL</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{trader.active_positions}</Text>
            <Text style={styles.statLabel}>Positions</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{trader.total_trades}</Text>
            <Text style={styles.statLabel}>Total Trades</Text>
          </View>
        </View>
        
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'positions' && styles.activeTab]}
            onPress={() => setActiveTab('positions')}
          >
            <Text style={[styles.tabText, activeTab === 'positions' && styles.activeTabText]}>
              Active Positions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'history' && styles.activeTab]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
              Trade History
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Content */}
        {activeTab === 'positions' ? (
          <View style={styles.tabContent}>
            {positions.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="pie-chart-outline" size={64} color={Colors.textSecondary} />
                <Text style={styles.emptyTitle}>No Active Positions</Text>
                <Text style={styles.emptySubtitle}>
                  This trader doesn't have any open positions right now
                </Text>
              </View>
            ) : (
              <FlatList
                data={positions}
                renderItem={renderPositionItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.listContent}
              />
            )}
          </View>
        ) : (
          <View style={styles.tabContent}>
            {tradeHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="swap-vertical-outline" size={64} color={Colors.textSecondary} />
                <Text style={styles.emptyTitle}>No Trade History</Text>
                <Text style={styles.emptySubtitle}>
                  No recent trades found for this trader
                </Text>
              </View>
            ) : (
              <FlatList
                data={tradeHistory}
                renderItem={renderTradeItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.listContent}
              />
            )}
          </View>
        )}
        
        {/* Pro Gate */}
        <View style={styles.proGate}>
          <Ionicons name="lock-closed" size={24} color={Colors.accent} />
          <View style={styles.proGateTextContainer}>
            <Text style={styles.proGateTitle}>Full Trade History</Text>
            <Text style={styles.proGateSubtitle}>
              See complete trade history with PolyEdge Pro
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.proGateButton}
            onPress={() => router.push('/pro')}
          >
            <Text style={styles.proGateButtonText}>Go Pro</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  headerRight: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  traderHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.background,
  },
  pseudonym: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  walletAddress: {
    fontSize: 14,
    color: Colors.textTertiary,
    marginBottom: 16,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'transparent',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  followingButton: {
    backgroundColor: Colors.accent,
  },
  followText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.accent,
  },
  followingText: {
    color: Colors.background,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.elevated,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  tabsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: Colors.elevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeTab: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  activeTabText: {
    color: Colors.background,
  },
  tabContent: {
    padding: 16,
  },
  listContent: {
    gap: 8,
  },
  positionCard: {
    backgroundColor: Colors.elevated,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  positionMarket: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  positionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  positionOutcome: {
    alignItems: 'flex-start',
  },
  outcomeText: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  sharesText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  positionPrices: {
    alignItems: 'center',
  },
  priceText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  positionPnl: {
    alignItems: 'flex-end',
  },
  pnlText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  pnlLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
    backgroundColor: Colors.elevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  proGate: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: Colors.accent + '10',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.accent + '30',
    gap: 12,
  },
  proGateTextContainer: {
    flex: 1,
  },
  proGateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  proGateSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  proGateButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  proGateButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.background,
  },
});