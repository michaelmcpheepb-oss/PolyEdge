import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, RefreshControl, Image, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Images } from '../../constants/Images';
import { createClient } from '@supabase/supabase-js';
import { PickCard, type PickCardData } from '../../components/PickCard';
import { useIsPro } from '../../hooks/useSubscription';
import { AD_UNITS } from '../../services/admob';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

interface AccuracyMetrics {
  total_picks: number;
  correct_picks: number;
  accuracy_pct: number;
}

interface ResolvedPick {
  id: string;
  was_correct: boolean | null;
}

export default function TodayScreen() {
  const [picks,         setPicks]         = useState<PickCardData[]>([]);
  const [accuracy,      setAccuracy]      = useState<AccuracyMetrics | null>(null);
  const [recentResolved,setRecentResolved]= useState<ResolvedPick[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [picksData, accData, resolvedData] = await Promise.all([
        loadPicks(),
        loadAccuracy(),
        loadRecentResolved(),
      ]);
      setPicks(picksData);
      setAccuracy(accData);
      setRecentResolved(resolvedData);
    } catch (e) {
      console.error('Failed to load today data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadPicks = async (): Promise<PickCardData[]> => {
    // Fetch picks from last 7 days so seeded/recent picks always show
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('daily_picks')
      .select('*')
      .gte('pick_date', since)
      .order('pick_date',        { ascending: false })
      .order('confidence_score', { ascending: false })
      .limit(10);
    if (error) console.error('loadPicks error:', error.message);
    return (data ?? []) as PickCardData[];
  };

  const loadAccuracy = async (): Promise<AccuracyMetrics | null> => {
    const { data, error } = await supabase
      .from('prediction_accuracy')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1);
    if (error) console.error('loadAccuracy error:', error.message);
    return data?.[0] ?? null;
  };

  const loadRecentResolved = async (): Promise<ResolvedPick[]> => {
    const { data, error } = await supabase
      .from('daily_picks')
      .select('id, was_correct')
      .eq('resolved', true)
      .not('was_correct', 'is', null)
      .order('pick_date', { ascending: false })
      .limit(10);
    if (error) console.error('loadRecentResolved error:', error.message);
    return (data ?? []) as ResolvedPick[];
  };

  const isPro = useIsPro();
  const accPct = accuracy?.accuracy_pct ?? 0;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00D4AA" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            tintColor="#00D4AA"
            colors={['#00D4AA']}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Image source={Images.logo} style={styles.logo} resizeMode="contain" />
          {accuracy && (
            <View style={styles.accuracyPill}>
              <Text style={styles.accuracyPillText}>
                {accPct.toFixed(0)}% Accurate
              </Text>
            </View>
          )}
        </View>

        {/* Track Record Card */}
        {accuracy && (
          <View style={styles.trackCard}>
            <Text style={styles.trackLabel}>TRACK RECORD</Text>
            <Text style={styles.trackSub}>Last 30 days</Text>
            <Text style={styles.trackNum}>{accPct.toFixed(0)}%</Text>
            <Text style={styles.trackSubNum}>
              {accuracy.correct_picks} of {accuracy.total_picks} picks correct
            </Text>
            <View style={styles.trackDots}>
              {recentResolved.length > 0 ? (
                recentResolved.map((pick, i) => (
                  <View
                    key={pick.id ?? i}
                    style={[
                      styles.trackDot,
                      { backgroundColor: pick.was_correct ? '#00FFB2' : '#FF4757' },
                    ]}
                  />
                ))
              ) : (
                Array.from({ length: 10 }, (_, i) => (
                  <View key={i} style={[styles.trackDot, { backgroundColor: '#2A2A45' }]} />
                ))
              )}
            </View>
            <Text style={styles.trackFooter}>
              *Based on resolved picks where outcome was confirmed on-chain
            </Text>
          </View>
        )}

        {/* Today's Picks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Picks</Text>
          <Text style={styles.sectionSub}>AI-selected predictions with confidence scores</Text>
        </View>

        <View style={styles.pickList}>
          {picks.length === 0 ? (
            <View style={styles.empty}>
              {Images.emptyState && (
                <Image source={Images.emptyState} style={styles.emptyImg} resizeMode="contain" />
              )}
              <Text style={styles.emptyTitle}>Picks loading…</Text>
              <Text style={styles.emptySub}>
                Our AI is analysing markets and will have picks ready soon.
              </Text>
            </View>
          ) : (
            picks.map((pick, i) => (
              <React.Fragment key={pick.id}>
                <PickCard pick={pick} index={i} />
                {/* Banner ad after 2nd pick for free users, native only */}
                {i === 1 && !isPro && Platform.OS !== 'web' && (
                  <BannerAdView unitId={AD_UNITS.banner} />
                )}
              </React.Fragment>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * BannerAdView — loads AdMob banner via lazy require (native only).
 * Only rendered when Platform.OS !== 'web', so the require() is safe.
 */
function BannerAdView({ unitId }: { unitId: string }) {
  const { BannerAd, BannerAdSize } = require('react-native-google-mobile-ads');
  return (
    <View style={{ alignItems: 'center', marginVertical: 8, backgroundColor: '#161625', borderRadius: 12, overflow: 'hidden' }}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#08080F' },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#08080F' },
  scroll:    { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  logo: { width: 120, height: 34 },

  accuracyPill: {
    backgroundColor: '#00D4AA',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  accuracyPillText: { fontSize: 13, fontWeight: '700', color: '#08080F' },

  trackCard: {
    backgroundColor: '#161625',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  trackLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7A7A9A',
    letterSpacing: 1.5,
  },
  trackSub: {
    fontSize: 12,
    color: '#7A7A9A',
    marginTop: 2,
    marginBottom: 4,
  },
  trackNum: {
    fontSize: 64,
    fontWeight: '900',
    color: '#00D4AA',
    lineHeight: 72,
  },
  trackSubNum: {
    fontSize: 13,
    color: '#7A7A9A',
    marginTop: 4,
    marginBottom: 12,
  },
  trackDots: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 12,
  },
  trackDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  trackFooter: {
    fontSize: 11,
    color: '#7A7A9A',
    fontStyle: 'italic',
    textAlign: 'center',
  },

  section: { paddingHorizontal: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  sectionSub:   { fontSize: 13, color: '#7A7A9A', marginTop: 4 },

  pickList: { paddingHorizontal: 16, paddingBottom: 32 },

  empty:     { alignItems: 'center', paddingVertical: 64, gap: 10 },
  emptyImg:  { width: 100, height: 100, opacity: 0.6 },
  emptyTitle:{ fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  emptySub:  { fontSize: 14, color: '#7A7A9A', textAlign: 'center', paddingHorizontal: 24 },
});
