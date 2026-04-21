import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MarketCard } from '../../components/MarketCard';
import { SkeletonCard } from '../../components/SkeletonCard';
import { useMarkets, useMarketCategories } from '../../hooks/useMarkets';
import { useState } from 'react';

export default function FeedScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<'volume' | 'newest' | 'ending_soon'>('volume');
  
  const {
    data: markets,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useMarkets({
    category: selectedCategory,
    sortBy,
    limit: 20,
  });
  
  const {
    data: categories,
    isLoading: isLoadingCategories,
  } = useMarketCategories();

  const handleCategoryPress = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(undefined);
    } else {
      setSelectedCategory(category);
    }
  };

  const handleSortPress = (sort: 'volume' | 'newest' | 'ending_soon') => {
    setSortBy(sort);
  };

  const handleMarketPress = (marketId: string) => {
    // TODO: Navigate to market detail screen
    console.log('Market pressed:', marketId);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>PolyEdge</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.accent}
            colors={[Colors.accent]}
          />
        }
      >
        <View style={styles.sortContainer}>
          <TouchableOpacity 
            style={[styles.sortChip, sortBy === 'volume' && styles.activeSortChip]}
            onPress={() => handleSortPress('volume')}
          >
            <Text style={[styles.sortText, sortBy === 'volume' && styles.activeSortText]}>
              Volume
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.sortChip, sortBy === 'newest' && styles.activeSortChip]}
            onPress={() => handleSortPress('newest')}
          >
            <Text style={[styles.sortText, sortBy === 'newest' && styles.activeSortText]}>
              Newest
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.sortChip, sortBy === 'ending_soon' && styles.activeSortChip]}
            onPress={() => handleSortPress('ending_soon')}
          >
            <Text style={[styles.sortText, sortBy === 'ending_soon' && styles.activeSortText]}>
              Ending Soon
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.categoryContainer}>
          <TouchableOpacity 
            style={[styles.categoryChip, !selectedCategory && styles.activeCategoryChip]}
            onPress={() => setSelectedCategory(undefined)}
          >
            <Text style={[styles.categoryText, !selectedCategory && styles.activeCategoryText]}>
              All
            </Text>
          </TouchableOpacity>
          
          {isLoadingCategories ? (
            <>
              <View style={styles.categorySkeleton} />
              <View style={styles.categorySkeleton} />
              <View style={styles.categorySkeleton} />
            </>
          ) : (
            categories?.map((category) => (
              <TouchableOpacity 
                key={category}
                style={[
                  styles.categoryChip, 
                  selectedCategory === category && styles.activeCategoryChip
                ]}
                onPress={() => handleCategoryPress(category)}
              >
                <Text style={[
                  styles.categoryText, 
                  selectedCategory === category && styles.activeCategoryText
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
        
        <View style={styles.content}>
          {isError ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={64} color={Colors.error} />
              <Text style={styles.errorTitle}>Failed to load markets</Text>
              <Text style={styles.errorSubtitle}>
                Please check your connection and try again
              </Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : markets && markets.length > 0 ? (
            markets.map((market) => (
              <MarketCard
                key={market.id}
                market={market}
                onPress={() => handleMarketPress(market.id)}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="flame-outline" size={64} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>No markets found</Text>
              <Text style={styles.emptySubtitle}>
                {selectedCategory 
                  ? `No ${selectedCategory} markets available`
                  : 'Try changing your filters'
                }
              </Text>
            </View>
          )}
          
          {markets && markets.length > 0 && (
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Showing {markets.length} market{markets.length !== 1 ? 's' : ''}
              </Text>
              {selectedCategory && (
                <TouchableOpacity 
                  style={styles.clearFilterButton}
                  onPress={() => setSelectedCategory(undefined)}
                >
                  <Text style={styles.clearFilterText}>Clear filter</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
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
    color: Colors.accent,
  },
  settingsButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 8,
  },
  sortChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.elevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeSortChip: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  sortText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  activeSortText: {
    color: Colors.background,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: Colors.surface,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.elevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeCategoryChip: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  categoryText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  activeCategoryText: {
    color: Colors.background,
  },
  categorySkeleton: {
    width: 80,
    height: 32,
    backgroundColor: Colors.elevated,
    borderRadius: 20,
  },
  content: {
    padding: 16,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.error,
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.background,
  },
  emptyContainer: {
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
  clearFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.elevated,
    borderRadius: 16,
  },
  clearFilterText: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
});