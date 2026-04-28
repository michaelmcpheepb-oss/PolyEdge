import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { WhaleTradeRow } from '../../components/WhaleTradeRow';
import { SkeletonWhaleRow } from '../../components/SkeletonWhaleRow';
import { ErrorState, EmptyState } from '../../components/ErrorState';
import { TraderCard } from '../../components/TraderCard';
import { useWhaleTrades } from '../../hooks/useWhaleTrades';
import { useWhaleStore } from '../../stores/useWhaleStore';
import { DEMO_WHALE_IDS } from '../../services/polymarket';

type Tab = 'live' | 'top50';

const THRESHOLD_OPTS = [1000, 5000, 10000, 25000, 50000];

function StatusBadge({ isDemo }: { isDemo: boolean }) {
  const color = isDemo ? '#FFD700' : '#00C07F';
  const bg    = isDemo ? '#FFD70020' : '#00C07F20';
  const label = isDemo ? 'DEMO' : 'LIVE';
  return (
    <View style={[dot.wrap, { backgroundColor: bg }]}>
      <View style={[dot.inner, { backgroundColor: color }]} />
      <Text style={[dot.text, { color }]}>{label}</Text>
    </View>
  );
}
const dot = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  inner: { width: 7, height: 7, borderRadius: 3.5 },
  text:  { fontSize: 11, fontWeight: '700' },
});

export default function WhalesScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('live');
  const { threshold, setThreshold } = useWhaleStore();

  const {
    data: whaleTrades,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useWhaleTrades({ minAmount: threshold, timeframe: '24h', limit: 100 });

  const isDemo = !isLoading && !isError && (whaleTrades?.length ?? 0) > 0
    && DEMO_WHALE_IDS.has(whaleTrades![0].id);

  const renderTrade = ({ item }: { item: any }) => (
    <WhaleTradeRow trade={item} onPress={() => router.push(`/market/${item.market_id}`)} />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Whale Feed</Text>
        <StatusBadge isDemo={isDemo} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'live' && styles.tabActive]}
          onPress={() => setTab('live')}
        >
          <Text style={[styles.tabText, tab === 'live' && styles.tabTextActive]}>Live Trades</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'top50' && styles.tabActive]}
          onPress={() => setTab('top50')}
        >
          <Text style={[styles.tabText, tab === 'top50' && styles.tabTextActive]}>Top 50</Text>
        </TouchableOpacity>
      </View>

      {tab === 'live' ? (
        <>
          {/* Threshold chips */}
          <View style={styles.thresholdBar}>
            <Text style={styles.filterLabel}>Min:</Text>
            {THRESHOLD_OPTS.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, threshold === t && styles.chipActive]}
                onPress={() => setThreshold(t)}
              >
                <Text style={[styles.chipText, threshold === t && styles.chipTextActive]}>
                  ${t >= 1000 ? `${t / 1000}K` : t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <FlatList
            data={whaleTrades}
            renderItem={renderTrade}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor="#00D4AA"
                colors={['#00D4AA']}
              />
            }
            ListEmptyComponent={
              isError ? (
                <ErrorState
                  type="network"
                  title="Failed to load whale trades"
                  message="Check your connection and try again"
                  onRetry={() => refetch()}
                />
              ) : isLoading ? (
                <>
                  {[1,2,3,4,5,6].map((i) => <SkeletonWhaleRow key={i} />)}
                </>
              ) : (
                <EmptyState
                  icon="fish-outline"
                  title="No whale trades found"
                  message={threshold > 1000 ? `No trades above $${threshold / 1000}K` : 'Try lowering the threshold'}
                  actionLabel={threshold > 1000 ? 'Lower threshold' : undefined}
                  onAction={threshold > 1000 ? () => setThreshold(1000) : undefined}
                />
              )
            }
          />
        </>
      ) : (
        <Top50View />
      )}
    </SafeAreaView>
  );
}

// ─── Top 50 tab ─────────────────────────────────────────────────────────────

function Top50View() {
  const router = useRouter();
  const [following, setFollowing] = useState<Set<string>>(new Set());

  // Placeholder data — in production this comes from Supabase top_traders
  const traders = Array.from({ length: 20 }, (_, i) => ({
    wallet_address: `0x${i.toString().padStart(40, '0')}`,
    pseudonym:      ['CryptoSage', 'WhaleWatcher', 'DeFi Oracle', 'AlphaSeeker', 'MarketMaker'][i % 5] + ` #${i + 1}`,
    pnl_30d:        Math.round((Math.random() - 0.3) * 50000),
    win_rate:       Math.round(50 + Math.random() * 35),
    total_trades:   Math.round(10 + Math.random() * 200),
    active_positions: Math.round(Math.random() * 10),
    updated_at:     new Date().toISOString(),
  }));

  const toggleFollow = (addr: string) => {
    setFollowing((prev) => {
      const next = new Set(prev);
      next.has(addr) ? next.delete(addr) : next.add(addr);
      return next;
    });
  };

  return (
    <FlatList
      data={traders}
      keyExtractor={(t) => t.wallet_address}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item, index }) => (
        <TraderCard
          trader={item}
          rank={index + 1}
          isFollowing={following.has(item.wallet_address)}
          onFollowToggle={() => toggleFollow(item.wallet_address)}
        />
      )}
      ListHeaderComponent={
        <View style={styles.top50Header}>
          <Text style={styles.top50Title}>Top 50 Traders</Text>
          <Text style={styles.top50Sub}>Ranked by 30-day PnL</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#08080F' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  title: { fontSize: 28, fontWeight: '700', color: '#FFFFFF' },

  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#00D4AA',
  },
  tabText: { fontSize: 14, fontWeight: '600', color: '#7A7A9A' },
  tabTextActive: { color: '#00D4AA' },

  thresholdBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  filterLabel: { fontSize: 12, color: '#7A7A9A', fontWeight: '600' },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#161625',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2A2A45',
  },
  chipActive: { backgroundColor: '#00D4AA', borderColor: '#00D4AA' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#7A7A9A' },
  chipTextActive: { color: '#08080F' },

  listContent: { padding: 16, paddingBottom: 40 },

  top50Header: { marginBottom: 12 },
  top50Title: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  top50Sub:   { fontSize: 13, color: '#7A7A9A', marginTop: 2 },
});
