import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { TraderCard } from '../../components/TraderCard';

export default function LeaderboardScreen() {
  const [activeTab, setActiveTab] = useState<'top' | 'following'>('top');
  const [period, setPeriod] = useState<'7d' | '30d' | 'all'>('30d');
  const [showProGate, setShowProGate] = useState(false);
  
  // Mock traders data
  const traders = [
    {
      wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
      pseudonym: 'CryptoWhale',
      pnl_30d: 425000,
      win_rate: 68,
      total_trades: 1247,
      active_positions: 12,
      updated_at: '2026-04-21T12:00:00Z',
    },
    {
      wallet_address: '0x234567890abcdef1234567890abcdef123456789',
      pseudonym: 'PoliticalOracle',
      pnl_30d: 210000,
      win_rate: 72,
      total_trades: 892,
      active_positions: 8,
      updated_at: '2026-04-21T12:00:00Z',
    },
    {
      wallet_address: '0x34567890abcdef1234567890abcdef1234567890',
      pseudonym: 'ETHMaxi',
      pnl_30d: 185000,
      win_rate: 61,
      total_trades: 567,
      active_positions: 5,
      updated_at: '2026-04-21T12:00:00Z',
    },
    {
      wallet_address: '0x4567890abcdef1234567890abcdef12345678901',
      pseudonym: 'SportsBetPro',
      pnl_30d: 142000,
      win_rate: 65,
      total_trades: 423,
      active_positions: 6,
      updated_at: '2026-04-21T12:00:00Z',
    },
    {
      wallet_address: '0x567890abcdef1234567890abcdef123456789012',
      pseudonym: 'TechTrader',
      pnl_30d: 98000,
      win_rate: 58,
      total_trades: 312,
      active_positions: 4,
      updated_at: '2026-04-21T12:00:00Z',
    },
  ];
  
  const followingTraders = traders.slice(0, 2); // First 2 traders are being followed
  
  const handleFollowToggle = (walletAddress: string) => {
    console.log('Follow toggle for:', walletAddress);
    // TODO: Update followed_traders table in Supabase
  };
  
  const renderTraderItem = ({ item, index }: { item: any; index: number }) => (
    <TraderCard
      trader={item}
      rank={index + 1}
      isFollowing={activeTab === 'following'}
      onFollowToggle={() => handleFollowToggle(item.wallet_address)}
    />
  );
  
  const renderProGate = () => {
    if (!showProGate) return null;
    
    return (
      <View style={styles.proGateOverlay}>
        <View style={styles.proGateContent}>
          <Ionicons name="lock-closed" size={48} color={Colors.accent} />
          <Text style={styles.proGateTitle}>Full Leaderboard</Text>
          <Text style={styles.proGateSubtitle}>
            See ranks 11+ and complete trader profiles with PolyEdge Pro
          </Text>
          <TouchableOpacity 
            style={styles.goProButton}
            onPress={() => {
              // Navigate to pro screen
              setShowProGate(false);
            }}
          >
            <Text style={styles.goProButtonText}>Go Pro</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.closeProGateButton}
            onPress={() => setShowProGate(false)}
          >
            <Text style={styles.closeProGateText}>Continue with top 10 only</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <TouchableOpacity style={styles.infoButton}>
          <Ionicons name="information-circle-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>
      
      {/* Period Filter */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Period:</Text>
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.periodScrollView}
          contentContainerStyle={styles.periodScrollContent}
        >
          <TouchableOpacity 
            style={[styles.periodChip, period === '7d' && styles.activePeriodChip]}
            onPress={() => setPeriod('7d')}
          >
            <Text style={[styles.periodText, period === '7d' && styles.activePeriodText]}>
              7D
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.periodChip, period === '30d' && styles.activePeriodChip]}
            onPress={() => setPeriod('30d')}
          >
            <Text style={[styles.periodText, period === '30d' && styles.activePeriodText]}>
              30D
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.periodChip, period === 'all' && styles.activePeriodChip]}
            onPress={() => setPeriod('all')}
          >
            <Text style={[styles.periodText, period === 'all' && styles.activePeriodText]}>
              ALL TIME
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'top' && styles.activeTab]}
          onPress={() => setActiveTab('top')}
        >
          <Text style={[styles.tabText, activeTab === 'top' && styles.activeTabText]}>
            Top Traders
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'following' && styles.activeTab]}
          onPress={() => setActiveTab('following')}
        >
          <Text style={[styles.tabText, activeTab === 'following' && styles.activeTabText]}>
            Following
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Leaderboard List */}
      <FlatList
        data={activeTab === 'top' ? traders : followingTraders}
        renderItem={renderTraderItem}
        keyExtractor={(item) => item.wallet_address}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          activeTab === 'following' ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>Not Following Anyone</Text>
              <Text style={styles.emptySubtitle}>
                Follow traders to see them here
              </Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="trophy-outline" size={64} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>No Traders Found</Text>
              <Text style={styles.emptySubtitle}>
                Try changing the period filter
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          activeTab === 'top' && traders.length > 0 ? (
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Showing top {traders.length} traders
              </Text>
              <TouchableOpacity 
                style={styles.proUpsellButton}
                onPress={() => setShowProGate(true)}
              >
                <Ionicons name="star" size={16} color={Colors.accent} />
                <Text style={styles.proUpsellText}>See ranks 11+ with Pro</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
      
      {renderProGate()}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  infoButton: {
    padding: 4,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  periodScrollView: {
    flexGrow: 0,
  },
  periodScrollContent: {
    gap: 8,
  },
  periodChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.elevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activePeriodChip: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  periodText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  activePeriodText: {
    color: Colors.background,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: Colors.elevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  activeTabText: {
    color: Colors.background,
  },
  listContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
    backgroundColor: Colors.surface,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  proUpsellButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.accent + '20',
    borderRadius: 16,
  },
  proUpsellText: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '600',
  },
  proGateOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(13, 13, 26, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  proGateContent: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
  },
  proGateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  proGateSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  goProButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  goProButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.background,
  },
  closeProGateButton: {
    padding: 12,
  },
  closeProGateText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});