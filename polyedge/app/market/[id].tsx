import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMarket } from '../../hooks/useMarkets';
import { useState } from 'react';
import { WhaleTradeRow } from '../../components/WhaleTradeRow';
import { SkeletonCard } from '../../components/SkeletonCard';

export default function MarketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [chartRange, setChartRange] = useState<'7d' | '30d' | 'all'>('7d');
  
  const {
    data: market,
    isLoading,
    isError,
  } = useMarket(id);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (error) {
      return 'Unknown date';
    }
  };

  const handleSetAlert = () => {
    router.push(`/alerts/create?marketId=${id}`);
  };

  const handleViewOnPolymarket = () => {
    if (market?.id) {
      Linking.openURL(`https://polymarket.com/market/${market.id}`);
    }
  };

  if (isLoading) {
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
            <View style={skeletonStyles.titleSkeleton} />
          </View>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Chart area skeleton */}
            <View style={skeletonStyles.chartSkeleton} />
            
            {/* Stats row skeleton */}
            <View style={skeletonStyles.statsRow}>
              <View style={skeletonStyles.statBox} />
              <View style={skeletonStyles.statBox} />
              <View style={skeletonStyles.statBox} />
              <View style={skeletonStyles.statBox} />
            </View>
            
            {/* Smart money section skeleton */}
            <View style={skeletonStyles.sectionSkeleton}>
              <View style={skeletonStyles.sectionTitleSkeleton} />
              <View style={skeletonStyles.sectionContentSkeleton} />
            </View>
            
            {/* Trades list skeleton */}
            <View style={skeletonStyles.sectionSkeleton}>
              <View style={skeletonStyles.sectionTitleSkeleton} />
              {[1, 2, 3, 4, 5].map((i) => (
                <View key={i} style={skeletonStyles.tradeRowSkeleton}>
                  <View style={skeletonStyles.tradeAvatarSkeleton} />
                  <View style={skeletonStyles.tradeInfoSkeleton}>
                    <View style={skeletonStyles.tradeTitleSkeleton} />
                    <View style={skeletonStyles.tradeSubtitleSkeleton} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (isError || !market) {
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
            <Text style={styles.headerTitleText}>Market Not Found</Text>
          </View>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={Colors.error} />
          <Text style={styles.errorTitle}>Market not found</Text>
          <Text style={styles.errorSubtitle}>
            The market you're looking for doesn't exist or has been removed.
          </Text>
          <TouchableOpacity 
            style={styles.backButtonFull}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const yesPrice = market.yes_price * 100;
  const noPrice = market.no_price * 100;

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
          <Text style={styles.headerTitleText} numberOfLines={1}>
            {market.category || 'Market'}
          </Text>
        </View>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Section 1: Current Prices */}
        <View style={styles.priceSection}>
          <View style={styles.priceMain}>
            <Text style={styles.priceMainLabel}>YES</Text>
            <Text style={styles.priceMainValue}>{yesPrice.toFixed(1)}%</Text>
          </View>
          <View style={styles.priceSecondary}>
            <Text style={styles.priceSecondaryLabel}>NO</Text>
            <Text style={styles.priceSecondaryValue}>{noPrice.toFixed(1)}%</Text>
          </View>
        </View>
        
        {/* Section 2: Market Question */}
        <View style={styles.questionSection}>
          <Text style={styles.question}>{market.question}</Text>
          {market.description && (
            <Text style={styles.description}>{market.description}</Text>
          )}
        </View>
        
        {/* Section 3: Chart Placeholder */}
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Probability History</Text>
            <View style={styles.chartRangeSelector}>
              <TouchableOpacity 
                style={[styles.rangeChip, chartRange === '7d' && styles.activeRangeChip]}
                onPress={() => setChartRange('7d')}
              >
                <Text style={[styles.rangeText, chartRange === '7d' && styles.activeRangeText]}>
                  7D
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.rangeChip, chartRange === '30d' && styles.activeRangeChip]}
                onPress={() => setChartRange('30d')}
              >
                <Text style={[styles.rangeText, chartRange === '30d' && styles.activeRangeText]}>
                  30D
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.rangeChip, chartRange === 'all' && styles.activeRangeChip]}
                onPress={() => setChartRange('all')}
              >
                <Text style={[styles.rangeText, chartRange === 'all' && styles.activeRangeText]}>
                  ALL
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.chartPlaceholder}>
            <Ionicons name="analytics-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.chartPlaceholderText}>Chart coming soon</Text>
            <Text style={styles.chartPlaceholderSubtext}>
              Real-time probability chart with Victory Native
            </Text>
          </View>
        </View>
        
        {/* Section 4: Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Market Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatCurrency(market.volume_24h)}</Text>
              <Text style={styles.statLabel}>24h Volume</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatCurrency(market.total_volume)}</Text>
              <Text style={styles.statLabel}>Total Volume</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>1.2K</Text>
              <Text style={styles.statLabel}>Traders</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatDate(market.end_date)}</Text>
              <Text style={styles.statLabel}>End Date</Text>
            </View>
          </View>
        </View>
        
        {/* Section 5: Smart Money Placeholder */}
        <View style={styles.smartMoneySection}>
          <Text style={styles.sectionTitle}>Smart Money</Text>
          <View style={styles.smartMoneyPlaceholder}>
            <Ionicons name="trending-up-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.placeholderText}>Top holders coming soon</Text>
          </View>
        </View>
        
        {/* Section 6: Recent Trades Placeholder */}
        <View style={styles.tradesSection}>
          <Text style={styles.sectionTitle}>Recent Trades</Text>
          <View style={styles.tradesPlaceholder}>
            <Ionicons name="swap-vertical-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.placeholderText}>Recent trades coming soon</Text>
          </View>
        </View>
      </ScrollView>
      
      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.alertButton}
          onPress={handleSetAlert}
        >
          <Ionicons name="notifications-outline" size={20} color={Colors.background} />
          <Text style={styles.alertButtonText}>Set Alert</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.polymarketButton}
          onPress={handleViewOnPolymarket}
        >
          <Ionicons name="open-outline" size={20} color={Colors.accent} />
          <Text style={styles.polymarketButtonText}>View on Polymarket</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  headerRight: {
    width: 32,
  },
  loadingContent: {
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 24,
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
  backButtonFull: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 100, // Space for bottom bar
  },
  priceSection: {
    padding: 24,
    backgroundColor: Colors.surface,
    alignItems: 'center',
  },
  priceMain: {
    alignItems: 'center',
    marginBottom: 8,
  },
  priceMainLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  priceMainValue: {
    fontSize: 64,
    fontWeight: '700',
    color: Colors.accent,
  },
  priceSecondary: {
    alignItems: 'center',
  },
  priceSecondaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  priceSecondaryValue: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  questionSection: {
    padding: 24,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  question: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 28,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  chartSection: {
    padding: 24,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  chartRangeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  rangeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.elevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeRangeChip: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  rangeText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  activeRangeText: {
    color: Colors.background,
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: Colors.elevated,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  chartPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 12,
    marginBottom: 4,
  },
  chartPlaceholderSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  statsSection: {
    padding: 24,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
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
  smartMoneySection: {
    padding: 24,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  smartMoneyPlaceholder: {
    height: 120,
    backgroundColor: Colors.elevated,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  tradesSection: {
    padding: 24,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  tradesPlaceholder: {
    height: 120,
    backgroundColor: Colors.elevated,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  alertButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  alertButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.background,
  },
  polymarketButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  polymarketButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.accent,
  },
});

const skeletonStyles = StyleSheet.create({
  titleSkeleton: {
    width: 120,
    height: 24,
    backgroundColor: '#2A2A45',
    borderRadius: 4,
  },
  chartSkeleton: {
    height: 200,
    backgroundColor: '#2A2A45',
    borderRadius: 12,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statBox: {
    flex: 1,
    height: 80,
    backgroundColor: '#2A2A45',
    borderRadius: 12,
  },
  sectionSkeleton: {
    marginBottom: 32,
  },
  sectionTitleSkeleton: {
    width: 100,
    height: 20,
    backgroundColor: '#2A2A45',
    borderRadius: 4,
    marginBottom: 16,
  },
  sectionContentSkeleton: {
    height: 100,
    backgroundColor: '#2A2A45',
    borderRadius: 12,
  },
  tradeRowSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tradeAvatarSkeleton: {
    width: 40,
    height: 40,
    backgroundColor: '#2A2A45',
    borderRadius: 20,
    marginRight: 12,
  },
  tradeInfoSkeleton: {
    flex: 1,
  },
  tradeTitleSkeleton: {
    width: '70%',
    height: 16,
    backgroundColor: '#2A2A45',
    borderRadius: 4,
    marginBottom: 8,
  },
  tradeSubtitleSkeleton: {
    width: '40%',
    height: 12,
    backgroundColor: '#2A2A45',
    borderRadius: 4,
  },
});