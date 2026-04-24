import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

interface DailyPick {
  id: string;
  market_id: string;
  market_question: string;
  recommended_outcome: 'YES' | 'NO';
  confidence_score: number;
  ai_reasoning: string;
  smart_money_direction?: 'YES' | 'NO' | 'MIXED';
  smart_money_pct?: number;
  current_yes_price: number;
  current_no_price: number;
  category?: string;
  created_at: string;
}

interface AccuracyMetrics {
  total_picks: number;
  correct_picks: number;
  accuracy_pct: number;
}

interface TrendingMarket {
  id: string;
  market_id: string;
  market_question: string;
  confidence_score: number;
  momentum: string;
  momentum_pct: number;
}

export default function TodayScreen() {
  const [dailyPicks, setDailyPicks] = useState<DailyPick[]>([]);
  const [accuracy, setAccuracy] = useState<AccuracyMetrics | null>(null);
  const [trendingMarkets, setTrendingMarkets] = useState<TrendingMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isProUser, setIsProUser] = useState(false); // TODO: Implement real subscription check

  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    try {
      const [picksData, accuracyData, trendingData] = await Promise.all([
        loadDailyPicks(),
        loadAccuracyMetrics(),
        loadTrendingMarkets()
      ]);

      setDailyPicks(picksData);
      setAccuracy(accuracyData);
      setTrendingMarkets(trendingData);
    } catch (error) {
      console.error('Failed to load today data:', error);
      Alert.alert('Error', 'Failed to load daily picks. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadDailyPicks = async (): Promise<DailyPick[]> => {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_picks')
      .select('*')
      .eq('pick_date', today)
      .order('confidence_score', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const loadAccuracyMetrics = async (): Promise<AccuracyMetrics | null> => {
    const { data, error } = await supabase
      .from('prediction_accuracy')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) return null;
    return data;
  };

  const loadTrendingMarkets = async (): Promise<TrendingMarket[]> => {
    const { data, error } = await supabase
      .from('market_intelligence')
      .select('*')
      .not('momentum', 'eq', 'NEUTRAL')
      .order('momentum_pct', { ascending: false })
      .limit(3);

    if (error) return [];
    return data || [];
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTodayData();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 75) return Colors.success;
    if (score >= 50) return Colors.warning;
    return Colors.textSecondary;
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 75) return 'HIGH';
    if (score >= 50) return 'MEDIUM';
    return 'LOW';
  };

  const getSmartMoneyIndicator = (direction?: string, pct?: number) => {
    if (!direction || !pct) return null;

    const color = direction === 'YES' ? Colors.success :
                 direction === 'NO' ? Colors.error : Colors.textSecondary;

    return (
      <View style={[styles.smartMoneyBadge, { backgroundColor: color + '20' }]}>
        <View style={[styles.smartMoneyDot, { backgroundColor: color }]} />
        <Text style={[styles.smartMoneyText, { color }]}>
          Smart Money: {direction} ({pct}%)
        </Text>
      </View>
    );
  };

  const handleUpgrade = () => {
    // TODO: Navigate to subscription screen
    Alert.alert('Upgrade to Pro', 'Get access to all 5 daily picks and advanced analytics!');
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.loadingText}>Loading daily picks...</Text>
      </View>
    );
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const visiblePicks = isProUser ? dailyPicks : dailyPicks.slice(0, 3);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.accent}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.date}>{today}</Text>
        </View>

        {/* Accuracy Badge */}
        {accuracy && (
          <View style={styles.accuracyBadge}>
            <Text style={styles.accuracyTitle}>Track Record</Text>
            <Text style={styles.accuracyScore}>{accuracy.accuracy_pct.toFixed(1)}%</Text>
            <Text style={styles.accuracySubtext}>
              {accuracy.correct_picks}/{accuracy.total_picks} picks
            </Text>
          </View>
        )}
      </View>

      {/* Daily Picks Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Picks</Text>
          <Text style={styles.sectionSubtitle}>
            AI-selected predictions with confidence scores
          </Text>
        </View>

        {visiblePicks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="hourglass-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>Daily picks loading...</Text>
            <Text style={styles.emptySubtitle}>
              Our AI is analyzing markets and will have picks ready soon.
            </Text>
          </View>
        ) : (
          visiblePicks.map((pick, index) => (
            <View key={pick.id} style={styles.pickCard}>
              <View style={styles.pickHeader}>
                <View style={styles.pickIndex}>
                  <Text style={styles.pickIndexText}>{index + 1}</Text>
                </View>

                <View style={styles.confidenceContainer}>
                  <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(pick.confidence_score) + '20' }]}>
                    <Text style={[styles.confidenceText, { color: getConfidenceColor(pick.confidence_score) }]}>
                      {getConfidenceLabel(pick.confidence_score)} ({pick.confidence_score})
                    </Text>
                  </View>
                </View>

                {pick.category && (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{pick.category}</Text>
                  </View>
                )}
              </View>

              <Text style={styles.pickQuestion}>{pick.market_question}</Text>

              {/* Recommendation */}
              <View style={styles.recommendationContainer}>
                <View style={[
                  styles.recommendationBadge,
                  {
                    backgroundColor: pick.recommended_outcome === 'YES' ? Colors.success + '20' : Colors.error + '20'
                  }
                ]}>
                  <Text style={[
                    styles.recommendationText,
                    {
                      color: pick.recommended_outcome === 'YES' ? Colors.success : Colors.error
                    }
                  ]}>
                    Recommendation: {pick.recommended_outcome}
                  </Text>
                </View>

                <View style={styles.priceContainer}>
                  <Text style={styles.priceText}>
                    Current: {pick.recommended_outcome === 'YES' ?
                      Math.round(pick.current_yes_price * 100) :
                      Math.round(pick.current_no_price * 100)}%
                  </Text>
                </View>
              </View>

              {/* Smart Money Indicator */}
              {getSmartMoneyIndicator(pick.smart_money_direction, pick.smart_money_pct)}

              {/* AI Reasoning */}
              <View style={styles.reasoningContainer}>
                <Text style={styles.reasoningLabel}>AI Analysis:</Text>
                <Text style={styles.reasoningText}>{pick.ai_reasoning}</Text>
              </View>
            </View>
          ))
        )}

        {/* Upgrade CTA for free users */}
        {!isProUser && dailyPicks.length > 3 && (
          <Pressable style={styles.upgradeCTA} onPress={handleUpgrade}>
            <View style={styles.upgradeContent}>
              <Ionicons name="star" size={20} color={Colors.accent} />
              <Text style={styles.upgradeText}>
                Unlock {dailyPicks.length - 3} more daily picks with Pro
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.accent} />
          </Pressable>
        )}
      </View>

      {/* Trending Markets */}
      {trendingMarkets.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Now</Text>
            <Text style={styles.sectionSubtitle}>
              Markets with significant momentum
            </Text>
          </View>

          {trendingMarkets.map((market) => (
            <View key={market.id} style={styles.trendingCard}>
              <View style={styles.trendingHeader}>
                <View style={[
                  styles.momentumBadge,
                  {
                    backgroundColor: market.momentum?.includes('YES') ? Colors.success + '20' : Colors.error + '20'
                  }
                ]}>
                  <Text style={[
                    styles.momentumText,
                    {
                      color: market.momentum?.includes('YES') ? Colors.success : Colors.error
                    }
                  ]}>
                    {market.momentum_pct > 0 ? '+' : ''}{market.momentum_pct}%
                  </Text>
                </View>
              </View>

              <Text style={styles.trendingQuestion}>{market.market_question}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  date: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  accuracyBadge: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  accuracyTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  accuracyScore: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.success,
    marginTop: 2,
  },
  accuracySubtext: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
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
  pickCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pickHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  pickIndex: {
    backgroundColor: Colors.accent + '20',
    borderRadius: 20,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickIndexText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.accent,
  },
  confidenceContainer: {
    flex: 1,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryBadge: {
    backgroundColor: Colors.textSecondary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  pickQuestion: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 12,
    lineHeight: 22,
  },
  recommendationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  recommendationBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  recommendationText: {
    fontSize: 14,
    fontWeight: '600',
  },
  priceContainer: {
    backgroundColor: Colors.textSecondary + '10',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priceText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  smartMoneyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
    gap: 6,
  },
  smartMoneyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  smartMoneyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  reasoningContainer: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
  },
  reasoningLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  reasoningText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  upgradeCTA: {
    backgroundColor: Colors.accent + '10',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.accent + '20',
  },
  upgradeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  upgradeText: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '500',
  },
  trendingCard: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  trendingHeader: {
    marginBottom: 8,
  },
  momentumBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  momentumText: {
    fontSize: 12,
    fontWeight: '600',
  },
  trendingQuestion: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
});