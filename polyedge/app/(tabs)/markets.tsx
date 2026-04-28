import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, ScrollView,
  TouchableOpacity, RefreshControl, TextInput, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useMarkets } from '../../hooks/useMarkets';
import { MarketImage } from '../../components/ui/MarketImage';
import { Images } from '../../constants/Images';
import type { Market } from '../../types';

const SORT_OPTS: { id: 'volume' | 'newest' | 'ending_soon'; label: string }[] = [
  { id: 'volume',      label: 'Volume'   },
  { id: 'newest',      label: 'Trending' },
  { id: 'ending_soon', label: 'Ending'   },
];

const CATEGORIES = [
  'Trending', 'Politics', 'Crypto', 'Sports',
  'Economics', 'World', 'Tech', 'Science',
];

const fmt = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000   ? `$${(n / 1_000).toFixed(1)}K`
  : `$${n.toFixed(0)}`;

export default function MarketsScreen() {
  const router = useRouter();
  const [cat,    setCat]    = useState('Trending');
  const [sortIdx, setSortIdx] = useState(0);
  const [search, setSearch]  = useState('');

  const sort = SORT_OPTS[sortIdx % SORT_OPTS.length];

  const { data: raw, isLoading, isError, refetch, isRefetching } = useMarkets({
    category: cat !== 'Trending' ? cat : undefined,
    sortBy:   sort.id,
    limit:    50,
  });

  const markets = useMemo(() => {
    let list = raw ?? [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((m) => m.question.toLowerCase().includes(q));
    }
    return list;
  }, [raw, search]);

  const renderItem = ({ item }: { item: Market }) => {
    const yesPct = item.yes_price * 100;
    const probColor =
      yesPct > 60 ? '#00C07F' :
      yesPct < 40 ? '#FF4757' : '#7A7A9A';
    const probBg    = probColor + '20';
    const probBorder = probColor + '99';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/market/${item.id}`)}
        activeOpacity={0.75}
      >
        {/* Left: image */}
        <MarketImage image={item.image} category={item.category} size={56} />

        {/* Right: info */}
        <View style={styles.cardRight}>
          <Text style={styles.cardQuestion} numberOfLines={2}>{item.question}</Text>

          <View style={styles.cardStats}>
            {/* Probability badge */}
            <View style={[styles.probBadge, { backgroundColor: probBg, borderColor: probBorder }]}>
              <Text style={[styles.probText, { color: probColor }]}>
                {yesPct.toFixed(0)}%
              </Text>
            </View>

            {/* Volume */}
            <Text style={styles.statText}>{fmt(item.volume_24h)}</Text>

            {/* Category */}
            <Text style={styles.statText}>{item.category}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Markets</Text>
        <TouchableOpacity
          style={styles.sortPill}
          onPress={() => setSortIdx((i) => (i + 1) % SORT_OPTS.length)}
        >
          <Text style={styles.sortPillText}>{sort.label} ▾</Text>
        </TouchableOpacity>
      </View>

      {/* Category chips */}
      <View style={styles.catWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.catChip, cat === c && styles.catChipActive]}
              onPress={() => setCat(c)}
            >
              <Text style={[styles.catChipText, cat === c && styles.catChipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color="#7A7A9A" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search markets…"
          placeholderTextColor="#7A7A9A"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color="#7A7A9A" />
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <FlatList
        data={markets}
        renderItem={renderItem}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={12}
        initialNumToRender={8}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.accent}
            colors={[Colors.accent]}
          />
        }
        ListEmptyComponent={
          isLoading ? null : (
            <View style={styles.empty}>
              {Images.emptyState && (
                <Image source={Images.emptyState} style={styles.emptyImage} resizeMode="contain" />
              )}
              <Text style={styles.emptyTitle}>
                {isError ? 'Failed to load markets' : 'No markets found'}
              </Text>
              <Text style={styles.emptySub}>
                {isError ? 'Pull to retry' : 'Try a different filter or category'}
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#08080F' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sortPill: {
    backgroundColor: '#161625',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2A2A45',
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  sortPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00D4AA',
  },

  catWrap: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  catRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  catChip: {
    backgroundColor: '#161625',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  catChipActive:     { backgroundColor: '#00D4AA' },
  catChipText:       { fontSize: 14, fontWeight: '600', color: '#7A7A9A' },
  catChipTextActive: { color: '#08080F' },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161625',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 14,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
  },

  listContent: { paddingHorizontal: 16, paddingBottom: 32 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161625',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: 12,
  },
  cardRight: { flex: 1 },
  cardQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 20,
  },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  probBadge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  probText: {
    fontSize: 13,
    fontWeight: '700',
  },
  statText: {
    fontSize: 12,
    color: '#7A7A9A',
  },

  empty:      { alignItems: 'center', paddingVertical: 80, gap: 12 },
  emptyImage: { width: 120, height: 120, opacity: 0.7 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  emptySub:   { fontSize: 14, color: '#7A7A9A' },
});
