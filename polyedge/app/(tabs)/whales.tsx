import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Colors } from '../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WhaleTradeRow } from '../../components/WhaleTradeRow';
import { SkeletonWhaleRow } from '../../components/SkeletonWhaleRow';
import { useWhaleTrades, useWhaleTradeThresholds } from '../../hooks/useWhaleTrades';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function WhalesScreen() {
  const [selectedThreshold, setSelectedThreshold] = useState<number>(10000);
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [isPro, setIsPro] = useState(false); // TODO: Connect to user subscription
  
  const {
    data: whaleTrades,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useWhaleTrades({
    minAmount: selectedThreshold,
    timeframe,
    limit: 50,
  });
  
  const {
    data: thresholds,
    isLoading: isLoadingThresholds,
  } = useWhaleTradeThresholds();

  const handleThresholdPress = (threshold: number) => {
    setSelectedThreshold(threshold);
  };

  const handleTimeframePress = (tf: '24h' | '7d' | '30d') => {
    setTimeframe(tf);
  };

  const handleTradePress = (tradeId: string) => {
    // TODO: Navigate to trade detail or market detail
    console.log('Trade pressed:', tradeId);
  };

  const handleTraderPress = (walletAddress: string) => {
    // TODO: Navigate to trader profile
    console.log('Trader pressed:', walletAddress);
  };

  const handleGoPro = () => {
    // TODO: Navigate to pro subscription screen
    console.log('Go Pro pressed');
  };

  const formatThreshold = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount}`;
  };

  const getTimeframeLabel = (tf: '24h' | '7d' | '30d') => {
    switch (tf) {
      case '24h': return '24H';
      case '7d': return '7D';
      case '30d': return '30D';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>Whale Feed</Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>
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
        <View style={styles.timeframeContainer}>
          <TouchableOpacity 
            style={[styles.timeframeChip, timeframe === '24h' && styles.activeTimeframeChip]}
            onPress={() => handleTimeframePress('24h')}
          >
            <Text style={[styles.timeframeText, timeframe === '24h' && styles.activeTimeframeText]}>
              24H
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.timeframeChip, timeframe === '7d' && styles.activeTimeframeChip]}
            onPress={() => handleTimeframePress('7d')}
          >
            <Text style={[styles.timeframeText, timeframe === '7d' && styles.activeTimeframeText]}>
              7D
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.timeframeChip, timeframe === '30d' && styles.activeTimeframeChip]}
            onPress={() => handleTimeframePress('30d')}
          >
            <Text style={[styles.timeframeText, timeframe === '30d' && styles.activeTimeframeText]}>
              30D
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.thresholdContainer}>
          <Text style={styles.thresholdLabel}>Min trade size:</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.thresholdScrollView}
          >
            {isLoadingThresholds ? (
              <>
                <View style={styles.thresholdSkeleton} />
                <View style={styles.thresholdSkeleton} />
                <View style={styles.thresholdSkeleton} />
                <View style={styles.thresholdSkeleton} />
              </>
            ) : (
              thresholds?.map((threshold) => (
                <TouchableOpacity 
                  key={threshold}
                  style={[
                    styles.thresholdChip, 
                    selectedThreshold === threshold && styles.activeThresholdChip
                  ]}
                  onPress={() => handleThresholdPress(threshold)}
                >
                  <Text style={[
                    styles.thresholdText, 
                    selectedThreshold === threshold && styles.activeThresholdText
                  ]}>
                    {formatThreshold(threshold)}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
        
        <View style={styles.content}>
          {isError ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={64} color={Colors.error} />
              <Text style={styles.errorTitle}>Failed to load whale trades</Text>
              <Text style={styles.errorSubtitle}>
                Please check your connection and try again
              </Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : isLoading ? (
            <>
              <SkeletonWhaleRow />
              <SkeletonWhaleRow />
              <SkeletonWhaleRow />
              <SkeletonWhaleRow />
              <SkeletonWhaleRow />
            </>
          ) : whaleTrades && whaleTrades.length > 0 ? (
            <>
              {whaleTrades.map((trade) => (
                <WhaleTradeRow
                  key={trade.id}
                  trade={trade}
                  onPress={() => handleTradePress(trade.id)}
                  isPro={isPro}
                />
              ))}
              
              {!isPro && whaleTrades.length > 3 && (
                <View style={styles.proGate}>
                  <View style={styles.proBlur} />
                  <View style={styles.proCta}>
                    <Ionicons name="diamond" size={32} color={Colors.accent} />
                    <Text style={styles.proCtaTitle}>Go Pro to see all trades</Text>
                    <Text style={styles.proCtaSubtitle}>
                      Unlock real-time whale alerts and full history
                    </Text>
                    <TouchableOpacity style={styles.proButton} onPress={handleGoPro}>
                      <Text style={styles.proButtonText}>Go Pro</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="fish-outline" size={64} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>No whale trades found</Text>
              <Text style={styles.emptySubtitle}>
                {selectedThreshold > 0 
                  ? `No trades over ${formatThreshold(selectedThreshold)} in the last ${getTimeframeLabel(timeframe).toLowerCase()}`
                  : 'Try lowering the minimum trade size'
                }
              </Text>
              {selectedThreshold > 0 && (
                <TouchableOpacity 
                  style={styles.clearFilterButton}
                  onPress={() => setSelectedThreshold(0)}
                >
                  <Text style={styles.clearFilterText}>Show all trades</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          
          {whaleTrades && whaleTrades.length > 0 && (
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Showing {whaleTrades.length} trade{whaleTrades.length !== 1 ? 's' : ''} over {formatThreshold(selectedThreshold)}
              </Text>
              <Text style={styles.footerSubtext}>
                Updates every 30 seconds
              </Text>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    backgroundColor: Colors.textPrimary,
    borderRadius: 4,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  timeframeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 8,
  },
  timeframeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.elevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeTimeframeChip: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  timeframeText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  activeTimeframeText: {
    color: Colors.background,
  },
  thresholdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  thresholdLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginRight: 12,
    fontWeight: '500',
  },
  thresholdScrollView: {
    flex: 1,
  },
  thresholdChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.elevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  activeThresholdChip: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  thresholdText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  activeThresholdText: {
    color: Colors.background,
  },
  thresholdSkeleton: {
    width: 60,
    height: 32,
    backgroundColor: Colors.elevated,
    borderRadius: 20,
    marginRight: 8,
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
    marginBottom: 24,
  },
  clearFilterButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  clearFilterText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.background,
  },
  proGate: {
    marginTop: 24,
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    height: 200,
  },
  proBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.elevated,
    opacity: 0.7,
  },
  proCta: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  proCtaTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  proCtaSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  proButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  proButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.background,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});