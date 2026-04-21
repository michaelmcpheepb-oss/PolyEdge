import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WhaleTradeRow } from '../../components/WhaleTradeRow';
import { SkeletonWhaleRow } from '../../components/SkeletonWhaleRow';
import { ErrorState, EmptyState } from '../../components/ErrorState';
import { useWhaleTrades } from '../../hooks/useWhaleTrades';
import { useWhaleStore } from '../../stores/useWhaleStore';
import { useState } from 'react';
import { useRouter } from 'expo-router';

export default function WhalesScreen() {
  const router = useRouter();
  const { threshold, setThreshold, timeframe, setTimeframe } = useWhaleStore();
  const [showProGate, setShowProGate] = useState(false);
  
  const {
    data: whaleTrades,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useWhaleTrades({
    minAmount: threshold,
    timeframe,
    limit: 100,
  });

  const thresholdOptions = [1000, 5000, 10000, 25000, 50000];
  const timeframeOptions: { value: '24h' | '7d' | '30d'; label: string }[] = [
    { value: '24h', label: '24H' },
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
  ];

  const handleThresholdPress = (newThreshold: number) => {
    setThreshold(newThreshold);
  };

  const handleTimeframePress = (newTimeframe: '24h' | '7d' | '30d') => {
    setTimeframe(newTimeframe);
  };

  const handleTradePress = (trade: any) => {
    // Navigate to market detail
    router.push(`/market/${trade.market_id}`);
  };

  const renderWhaleTrade = ({ item }: { item: any }) => (
    <WhaleTradeRow 
      trade={item} 
      onPress={() => handleTradePress(item)}
    />
  );

  const renderSkeleton = () => (
    <>
      <SkeletonWhaleRow />
      <SkeletonWhaleRow />
      <SkeletonWhaleRow />
      <SkeletonWhaleRow />
      <SkeletonWhaleRow />
      <SkeletonWhaleRow />
      <SkeletonWhaleRow />
      <SkeletonWhaleRow />
    </>
  );

  const renderProGate = () => {
    if (!showProGate) return null;
    
    return (
      <View style={styles.proGateOverlay}>
        <View style={styles.proGateContent}>
          <Ionicons name="lock-closed" size={48} color={Colors.accent} />
          <Text style={styles.proGateTitle}>Real-time Whale Feed</Text>
          <Text style={styles.proGateSubtitle}>
            See trades as they happen with PolyEdge Pro
          </Text>
          <TouchableOpacity 
            style={styles.goProButton}
            onPress={() => router.push('/pro')}
          >
            <Text style={styles.goProButtonText}>Go Pro</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.closeProGateButton}
            onPress={() => setShowProGate(false)}
          >
            <Text style={styles.closeProGateText}>Continue with delayed data</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Whale Feed</Text>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.infoButton}>
          <Ionicons name="information-circle-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Threshold:</Text>
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.thresholdScrollView}
          contentContainerStyle={styles.thresholdScrollContent}
        >
          {thresholdOptions.map((option) => (
            <TouchableOpacity 
              key={option}
              style={[
                styles.thresholdChip,
                threshold === option && styles.activeThresholdChip
              ]}
              onPress={() => handleThresholdPress(option)}
            >
              <Text style={[
                styles.thresholdText,
                threshold === option && styles.activeThresholdText
              ]}>
                ${option >= 1000 ? `${option/1000}K` : option}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Timeframe:</Text>
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.timeframeScrollView}
          contentContainerStyle={styles.timeframeScrollContent}
        >
          {timeframeOptions.map((option) => (
            <TouchableOpacity 
              key={option.value}
              style={[
                styles.timeframeChip,
                timeframe === option.value && styles.activeTimeframeChip
              ]}
              onPress={() => handleTimeframePress(option.value)}
            >
              <Text style={[
                styles.timeframeText,
                timeframe === option.value && styles.activeTimeframeText
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <FlatList
        data={whaleTrades}
        renderItem={renderWhaleTrade}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.accent}
            colors={[Colors.accent]}
          />
        }
        ListEmptyComponent={
          isError ? (
            <ErrorState 
              type="network"
              title="Failed to load whale trades"
              message="Please check your connection and try again"
              onRetry={() => refetch()}
            />
          ) : isLoading ? (
            renderSkeleton()
          ) : (
            <EmptyState 
              icon="fish-outline"
              title="No whale trades found"
              message={threshold > 1000 
                ? `No trades above $${threshold >= 1000 ? `${threshold/1000}K` : threshold}`
                : 'Try lowering the threshold'
              }
              actionLabel={threshold > 1000 ? "Lower threshold" : undefined}
              onAction={threshold > 1000 ? () => setThreshold(1000) : undefined}
            />
          )
        }
        ListFooterComponent={
          whaleTrades && whaleTrades.length > 0 ? (
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Showing {whaleTrades.length} whale trade{whaleTrades.length !== 1 ? 's' : ''}
              </Text>
              <TouchableOpacity 
                style={styles.proUpsellButton}
                onPress={() => setShowProGate(true)}
              >
                <Ionicons name="flash" size={16} color={Colors.accent} />
                <Text style={styles.proUpsellText}>See real-time trades with Pro</Text>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.success,
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
  thresholdScrollView: {
    flexGrow: 0,
  },
  thresholdScrollContent: {
    gap: 8,
  },
  thresholdChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.elevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
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
  timeframeScrollView: {
    flexGrow: 0,
  },
  timeframeScrollContent: {
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
  listContent: {
    padding: 16,
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