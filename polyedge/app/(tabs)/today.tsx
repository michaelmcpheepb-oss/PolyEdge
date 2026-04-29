import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, RefreshControl, Image, Platform, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Images } from '../../constants/Images';
import { createClient } from '@supabase/supabase-js';
import { PickCard, type PickCardData } from '../../components/PickCard';
import { useIsPro } from '../../hooks/useSubscription';
import { useRouter } from 'expo-router';
import { AD_UNITS } from '../../services/admob';

const ONBOARDING_BANNER_KEY = 'polyedge_onboarding_dismissed';
// Launch date — show "we just launched" card for 30 days
const LAUNCH_DATE = new Date('2026-04-01');
const DAYS_SINCE_LAUNCH = Math.floor((Date.now() - LAUNCH_DATE.getTime()) / 86400000);

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

function todayLabel() {
  const d = new Date();
  const day  = d.toLocaleDateString('en-US', { weekday: 'long' });
  const date = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  return `${day}, ${date}`;
}

function todayShort() {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function TodayScreen() {
  const router = useRouter();
  const [picks,          setPicks]          = useState<PickCardData[]>([]);
  const [accuracy,       setAccuracy]       = useState<AccuracyMetrics | null>(null);
  const [recentResolved, setRecentResolved] = useState<ResolvedPick[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [refreshing,     setRefreshing]     = useState(false);
  const [showBanner,     setShowBanner]     = useState(false);

  useEffect(() => { load(); }, []);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_BANNER_KEY).then((val) => {
      if (!val) setShowBanner(true);
    });
  }, []);

  const dismissBanner = async () => {
    setShowBanner(false);
    await AsyncStorage.setItem(ONBOARDING_BANNER_KEY, '1');
  };

  const withTimeout = <T,>(promise: Promise<T>, ms = 10000): Promise<T> => {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ms)
    );
    return Promise.race([promise, timeout]);
  };

  const load = async () => {
    try {
      const [picksData, accData, resolvedData] = await withTimeout(
        Promise.all([loadPicks(), loadAccuracy(), loadRecentResolved()])
      );
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

  // Track record only shown once we have 30+ resolved picks
  const showTrackRecord = (accuracy?.total_picks ?? 0) >= 30;

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
        {/* ── HEADER ── */}
        <View style={styles.header}>
          <Image source={Images.logo} style={styles.logo} resizeMode="contain" />
        </View>

        {/* ── ONBOARDING BANNER ── */}
        {showBanner && (
          <View style={styles.banner}>
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>AI-powered prediction market intelligence</Text>
              <Text style={styles.bannerText}>
                We analyse Polymarket odds, smart money positions and momentum every day to find the highest-value bets. Tap any pick to see our full analysis.
              </Text>
            </View>
            <TouchableOpacity style={styles.bannerClose} onPress={dismissBanner}>
              <Ionicons name="close" size={20} color="#7A7A9A" />
            </TouchableOpacity>
          </View>
        )}

        {/* ── HERO SECTION ── */}
        <View style={styles.hero}>
          {/* Top row: label + date */}
          <View style={styles.heroTopRow}>
            <Text style={styles.heroLabel}>🧠 AI PICKS</Text>
            <Text style={styles.heroDate}>{todayShort()}</Text>
          </View>

          {/* Headline */}
          <Text style={styles.heroHeadline}>
            Today's top prediction market opportunities
          </Text>

          {/* Feature pills */}
          <View style={styles.heroPills}>
            <View style={styles.heroPill}><Text style={styles.heroPillText}>📊 Smart money analysis</Text></View>
            <View style={styles.heroPill}><Text style={styles.heroPillText}>🐋 Whale wallet signals</Text></View>
            <View style={styles.heroPill}><Text style={styles.heroPillText}>⚡ Edge scoring</Text></View>
          </View>

          {/* Footer row */}
          <View style={styles.heroFooterRow}>
            <Text style={styles.heroFooterLeft}>Updated daily at 7 AM</Text>
            {!isPro && (
              <TouchableOpacity onPress={() => router.push('/pro')}>
                <Text style={styles.heroFooterRight}>Pro: unlock all 5 →</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── TRACK RECORD (only when earned) ── */}
        {showTrackRecord && accuracy && (
          <View style={styles.trackCard}>
            <Text style={styles.trackLabel}>AI TRACK RECORD</Text>
            <Text style={styles.trackNum}>{accuracy.accuracy_pct.toFixed(0)}%</Text>
            <Text style={styles.trackSubNum}>of our AI predictions were correct</Text>
            <Text style={styles.trackSub}>
              {accuracy.correct_picks} correct out of {accuracy.total_picks} resolved picks (last 30 days)
            </Text>
            {recentResolved.length > 0 && (
              <View style={styles.trackDotsSection}>
                <Text style={styles.trackDotsLabel}>Last {recentResolved.length} picks:</Text>
                <View style={styles.trackDots}>
                  {recentResolved.map((pick, i) => (
                    <View
                      key={pick.id ?? i}
                      style={[styles.trackDot, { backgroundColor: pick.was_correct ? '#00FFB2' : '#FF4757' }]}
                    />
                  ))}
                </View>
                <View style={styles.trackLegend}>
                  <View style={styles.trackLegendItem}>
                    <View style={[styles.trackDot, { backgroundColor: '#00FFB2' }]} />
                    <Text style={styles.trackLegendText}>Correct</Text>
                  </View>
                  <View style={styles.trackLegendItem}>
                    <View style={[styles.trackDot, { backgroundColor: '#FF4757' }]} />
                    <Text style={styles.trackLegendText}>Wrong</Text>
                  </View>
                </View>
              </View>
            )}
            <Text style={styles.trackFooter}>
              Verified on-chain when markets resolve. Updated daily.
            </Text>
          </View>
        )}

        {/* ── PICKS SECTION HEADER ── */}
        <Text style={styles.picksHeading}>Top Picks for {todayLabel()}</Text>

        {/* ── PICK LIST ── */}
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
                {i === 1 && !isPro && Platform.OS !== 'web' && (
                  <BannerAdView unitId={AD_UNITS.banner} />
                )}
              </React.Fragment>
            ))
          )}
        </View>

        {/* ── LAUNCH CARD (first 30 days only) ── */}
        {DAYS_SINCE_LAUNCH < 30 && (
          <View style={styles.launchCard}>
            <Text style={styles.launchTitle}>🚀 We just launched</Text>
            <Text style={styles.launchBody}>
              PolyEdge launched in April 2026. Every prediction we make is tracked publicly. As our pick history grows our accuracy score will appear here automatically.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * BannerAdView — loads AdMob banner via lazy require (native only).
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

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  logo: { width: 120, height: 32 },

  // ── Banner ──
  banner: {
    margin: 16,
    marginBottom: 0,
    backgroundColor: '#1A1A2E',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.3)',
    flexDirection: 'row',
    padding: 14,
    gap: 10,
  },
  bannerContent: { flex: 1, gap: 6 },
  bannerTitle: { fontSize: 14, fontWeight: '700', color: '#00D4AA' },
  bannerText:  { fontSize: 13, color: '#A0A0B8', lineHeight: 19 },
  bannerClose: { padding: 2 },

  // ── Hero ──
  hero: {
    backgroundColor: '#161625',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.15)',
    gap: 12,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLabel: { fontSize: 11, fontWeight: '700', color: '#00D4AA', letterSpacing: 1.2 },
  heroDate:  { fontSize: 11, color: '#7A7A9A' },
  heroHeadline: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 26,
  },
  heroPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  heroPill: {
    backgroundColor: '#0F0F1A',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  heroPillText: { fontSize: 11, color: '#A0A0B8' },
  heroFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroFooterLeft:  { fontSize: 11, color: '#7A7A9A' },
  heroFooterRight: { fontSize: 11, color: '#00D4AA', fontWeight: '600' },

  // ── Track Record ──
  trackCard: {
    backgroundColor: '#161625',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  trackLabel:   { fontSize: 11, fontWeight: '700', color: '#7A7A9A', letterSpacing: 1.5, marginBottom: 4 },
  trackNum:     { fontSize: 64, fontWeight: '900', color: '#00D4AA', lineHeight: 72 },
  trackSubNum:  { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginTop: 4, marginBottom: 4, textAlign: 'center' },
  trackSub:     { fontSize: 13, color: '#7A7A9A', marginBottom: 16, textAlign: 'center' },
  trackDotsSection: { width: '100%', alignItems: 'center', marginBottom: 12 },
  trackDotsLabel:   { fontSize: 12, fontWeight: '600', color: '#7A7A9A', marginBottom: 8 },
  trackDots:        { flexDirection: 'row', gap: 5, marginBottom: 10 },
  trackDot:         { width: 10, height: 10, borderRadius: 5 },
  trackLegend:      { flexDirection: 'row', gap: 16, alignItems: 'center' },
  trackLegendItem:  { flexDirection: 'row', alignItems: 'center', gap: 5 },
  trackLegendText:  { fontSize: 11, color: '#7A7A9A' },
  trackFooter:      { fontSize: 11, color: '#7A7A9A', fontStyle: 'italic', textAlign: 'center', paddingHorizontal: 8 },

  // ── Picks section header ──
  picksHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },

  // ── Pick list ──
  pickList: { paddingHorizontal: 16, paddingBottom: 16 },
  empty:     { alignItems: 'center', paddingVertical: 64, gap: 10 },
  emptyImg:  { width: 100, height: 100, opacity: 0.6 },
  emptyTitle:{ fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  emptySub:  { fontSize: 14, color: '#7A7A9A', textAlign: 'center', paddingHorizontal: 24 },

  // ── Launch card ──
  launchCard: {
    backgroundColor: '#161625',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: 6,
  },
  launchTitle: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  launchBody:  { fontSize: 13, color: '#A0A0B8', lineHeight: 19 },
});
