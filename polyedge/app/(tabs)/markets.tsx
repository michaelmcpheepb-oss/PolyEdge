import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useMarkets, useMarketCategories } from '../../hooks/useMarkets';
import { MarketCard } from '../../components/MarketCard';
import { SkeletonCard } from '../../components/SkeletonCard';
import { ErrorState } from '../../components/ErrorState';
import { Market } from '../../types';

const ALL_CATEGORIES = 'All';

export default function MarketsScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: categories = [] } = useMarketCategories();
  const { data: markets, isLoading, isError, refetch, isRefetching } = useMarkets({
    category: selectedCategory !== ALL_CATEGORIES ? selectedCategory : undefined,
    limit: 50,
    sortBy: 'volume',
  });

  const filteredMarkets = useMemo(() => {
    if (!markets) return [];
    if (!searchQuery.trim()) return markets;
    const query = searchQuery.toLowerCase();
    return markets.filter(
      (m: Market) =>
        m.question.toLowerCase().includes(query) ||
        (m.category && m.category.toLowerCase().includes(query))
    );
  }, [markets, searchQuery]);

  const allCategories = [ALL_CATEGORIES, ...categories];

  const renderMarketItem = useCallback(
    ({ item }: { item: Market }) => <MarketCard market={item} />,
    []
  );

  const renderHeader = () => (
    <View>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search markets..."
          placeholderTextColor={Colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {/* Category Filter Chips */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={allCategories}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.categoryChip,
              selectedCategory === item && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(item)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === item && styles.categoryChipTextActive,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        )}
      />

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {selectedCategory === ALL_CATEGORIES ? 'All Markets' : selectedCategory}
        </Text>
        <Text style={styles.sectionCount}>
          {filteredMarkets.length} market{filteredMarkets.length !== 1 ? 's' : ''}
        </Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <FlatList
          data={[1, 2, 3, 4, 5, 6]}
          renderItem={() => <SkeletonCard />}
          keyExtractor={(item) => String(item)}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
        />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <ErrorState
          message="Failed to load markets. Pull down to retry."
          onRetry={refetch}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredMarkets}
        renderItem={renderMarketItem}
        keyExtractor={(item) => item.id || item.question}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No markets found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'No markets available in this category'}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.accent}
            colors={[Colors.accent]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  categoryList: {
    paddingVertical: 8,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: Colors.accent + '20',
    borderColor: Colors.accent,
  },
  categoryChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: Colors.accent,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  sectionCount: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
});
