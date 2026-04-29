import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Linking, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMarket } from '../../hooks/useMarkets';
import { ConfidenceGauge } from '../../components/ui/ConfidenceGauge';
import { VerdictBadge } from '../../components/ui/VerdictBadge';
import { MetricsRow } from '../../components/ui/MetricsRow';
import { BulletList } from '../../components/ui/BulletList';
import { generateMarketAnalysis, type MarketAnalysis } from '../../services/generateOnDemand';
import ProbabilityChart from '../../components/ProbabilityChart';
import { useAdMonetisation } from '../../hooks/useAdMonetisation';
import { PaywallModal } from '../../components/PaywallModal';
import { openStripeCheckout } from '../../services/stripe-new';

const fmt = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000   ? `$${(n / 1_000).toFixed(1)}K`
  : `$${n.toFixed(0)}`;

const fmtDate = (s: string) => {
  try {
    return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return '—'; }
};

type AnalysisState = 'idle' | 'loading' | 'done' | 'error';

export default function MarketDetailScreen() {
  const { id, question } = useLocalSearchParams<{ id: string; question?: string }>();
  const router  = useRouter();
  const [chartRange, setChartRange] = useState<'7d' | '30d' | 'all'>('7d');
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState('');

  const { data: market, isLoading, isError } = useMarket(id, question);

  const { config, remainingFree, isPro, requestAnalysis } = useAdMonetisation();
  const [showPaywall, setShowPaywall] = useState(false);

  const handleGenerate = async () => {
    if (!market) return;

    // Run monetisation gate (ads + daily limit)
    const gate = await requestAnalysis();

    if (gate === 'paywall' || gate === 'ad_failed') {
      setShowPaywall(true);
      return;
    }

    // Gate === 'proceed' — run analysis
    setAnalysisState('loading');
    setAnalysisError('');
    try {
      const result = await generateMarketAnalysis(market);
      setAnalysis(result);
      setAnalysisState('done');
    } catch (e: any) {
      setAnalysisError(e.message ?? 'Analysis failed');
      setAnalysisState('error');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading…</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00D4AA" />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !market) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Not Found</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={56} color="#FF4757" />
          <Text style={styles.errorText}>Market not found</Text>
          <TouchableOpacity style={styles.backBtnFull} onPress={() => router.back()}>
            <Text style={styles.backBtnFullText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const yesPct = (market.yes_price ?? 0.5) * 100;
  const noPct  = (market.no_price  ?? 0.5) * 100;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {market.category || 'Market'}
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* CARD 1 — Question */}
        <View style={styles.card}>
          <View style={styles.questionRow}>
            <Text style={styles.question}>{market.question}</Text>
          </View>
          {market.description ? (
            <Text style={styles.description}>{market.description}</Text>
          ) : null}
        </View>

        {/* CARD 2 — Gauge + Stats */}
        <View style={[styles.card, styles.gaugeCard]}>
          <View style={styles.gaugeWrap}>
            <ConfidenceGauge score={yesPct} size="lg" />
            <Text style={styles.gaugeLabel}>YES ODDS</Text>
          </View>

          <View style={styles.statsGrid}>
            <StatBox label="YES" value={`${yesPct.toFixed(1)}%`} color="#00C07F" />
            <StatBox label="NO"  value={`${noPct.toFixed(1)}%`}  color="#FF4757" />
            <StatBox label="24h Vol"   value={fmt(market.volume_24h ?? 0)} color="#FFFFFF" />
            <StatBox label="Total Vol" value={fmt(market.total_volume ?? 0)} color="#FFFFFF" />
            <StatBox label="Ends" value={fmtDate(market.end_date)} color="#7A7A9A" />
            <StatBox label="Category" value={market.category || '—'} color="#7A7A9A" />
          </View>
        </View>

        {/* CARD 3 — AI Analysis */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>AI Analysis</Text>

          {analysisState === 'idle' && (
            <TouchableOpacity style={styles.generateBtn} onPress={handleGenerate} activeOpacity={0.8}>
              <Ionicons name="flash" size={18} color="#08080F" />
              <Text style={styles.generateBtnText}>
                {isPro
                  ? '✦ Generate Strategy'
                  : remainingFree > 0
                    ? `✦ Generate Strategy (${remainingFree} free left)`
                    : '▶ Watch ad for 1 more analysis'}
              </Text>
            </TouchableOpacity>
          )}

          {analysisState === 'loading' && (
            <View style={styles.analysisLoading}>
              <ActivityIndicator size="small" color="#00D4AA" />
              <Text style={styles.analysisLoadingText}>Analysing market…</Text>
            </View>
          )}

          {analysisState === 'error' && (
            <View style={styles.analysisError}>
              <Text style={styles.analysisErrorText}>{analysisError}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={handleGenerate}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {analysisState === 'done' && analysis && (
            <View style={styles.analysisResult}>
              <VerdictBadge verdict={analysis.verdict} riskLevel={analysis.risk_level} />
              <View style={{ marginTop: 16 }}>
                <MetricsRow
                  edge={analysis.edge_pct}
                  confidence={analysis.confidence}
                  stake={analysis.stake}
                />
              </View>
              <BulletList bullets={analysis.bullets} kellyWarning={analysis.kelly_pct <= 0} />

              {/* Action button — only shown for BUY/STRONG_BUY signals */}
              {(analysis.verdict === 'STRONG_BUY' || analysis.verdict === 'BUY') && (
                <TouchableOpacity
                  style={styles.betBtn}
                  onPress={() => Linking.openURL(`https://polymarket.com/event/${market!.id}`)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="open-outline" size={16} color="#08080F" />
                  <Text style={styles.betBtnText}>
                    Bet {analysis.recommended_outcome ?? 'YES'} on Polymarket
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.regenerateBtn}
                onPress={() => { setAnalysis(null); setAnalysisState('idle'); }}
              >
                <Text style={styles.regenerateBtnText}>Regenerate</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* CARD 4 — Chart */}
        <View style={styles.card}>
          <View style={styles.chartHeader}>
            <Text style={styles.cardTitle}>Probability History</Text>
            <View style={styles.rangeRow}>
              {(['7d', '30d', 'all'] as const).map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.rangeChip, chartRange === r && styles.rangeChipActive]}
                  onPress={() => setChartRange(r)}
                >
                  <Text style={[styles.rangeText, chartRange === r && styles.rangeTextActive]}>
                    {r.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <ProbabilityChart
            marketId={id}
            range={chartRange}
            currentPrice={market.yes_price ?? 0.5}
            conditionId={market.condition_id}
          />
        </View>
      </ScrollView>

      {/* Sticky Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.alertBtn}
          onPress={() => router.push(`/alerts/create?marketId=${id}`)}
          activeOpacity={0.8}
        >
          <Ionicons name="notifications-outline" size={18} color="#00D4AA" />
          <Text style={styles.alertBtnText}>Set Alert</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.polyBtn}
          onPress={() => Linking.openURL(`https://polymarket.com/market/${market.id}`)}
          activeOpacity={0.8}
        >
          <Text style={styles.polyBtnText}>View on Polymarket</Text>
          <Ionicons name="open-outline" size={16} color="#08080F" />
        </TouchableOpacity>
      </View>

      {/* Paywall modal */}
      <PaywallModal
        visible={showPaywall}
        config={config}
        onUpgrade={() => {
          setShowPaywall(false);
          openStripeCheckout('monthly', 'guest').catch(() => {});
        }}
        onPayPerUse={() => {
          setShowPaywall(false);
          router.push('/pro');
        }}
        onClose={() => setShowPaywall(false)}
      />
    </SafeAreaView>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={statStyles.box}>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  box: {
    width: '30%',
    backgroundColor: '#0F0F1A',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  label: {
    fontSize: 11,
    color: '#7A7A9A',
  },
});

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#08080F' },
  center:        { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  errorText:     { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: { padding: 4, marginRight: 8 },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: '#FFFFFF', textAlign: 'center' },

  backBtnFull: {
    marginTop: 16,
    backgroundColor: '#00D4AA',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  backBtnFullText: { fontSize: 16, fontWeight: '700', color: '#08080F' },

  scroll:        { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },

  card: {
    backgroundColor: '#161625',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },

  questionRow: { flexDirection: 'row', alignItems: 'flex-start' },
  question: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 26,
  },
  description: {
    marginTop: 10,
    fontSize: 14,
    color: '#7A7A9A',
    lineHeight: 20,
  },

  gaugeCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  gaugeWrap: { alignItems: 'center' },
  gaugeLabel: { fontSize: 10, fontWeight: '700', color: '#7A7A9A', marginTop: 4, letterSpacing: 1 },

  statsGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  cardTitle: { fontSize: 14, fontWeight: '700', color: '#FFFFFF', marginBottom: 14, letterSpacing: 0.5 },

  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00D4AA',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  generateBtnText: { fontSize: 16, fontWeight: '700', color: '#08080F' },

  analysisLoading: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 20, justifyContent: 'center' },
  analysisLoadingText: { fontSize: 14, color: '#7A7A9A' },

  analysisError: { alignItems: 'center', gap: 10, paddingVertical: 16 },
  analysisErrorText: { fontSize: 13, color: '#FF4757', textAlign: 'center' },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF4757',
  },
  retryBtnText: { fontSize: 13, fontWeight: '600', color: '#FF4757' },

  analysisResult: { gap: 0 },
  brief: {
    fontSize: 14,
    color: '#A0A0B8',
    lineHeight: 21,
    marginTop: 14,
    marginBottom: 12,
  },

  betBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    backgroundColor: '#00D4AA',
    borderRadius: 12,
    paddingVertical: 14,
  },
  betBtnText: { fontSize: 15, fontWeight: '700', color: '#08080F' },

  regenerateBtn: { marginTop: 12, alignSelf: 'flex-end' },
  regenerateBtnText: { fontSize: 12, color: '#7A7A9A', textDecorationLine: 'underline' },

  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  rangeRow: { flexDirection: 'row', gap: 6 },
  rangeChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#0F0F1A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2A45',
  },
  rangeChipActive: { backgroundColor: '#00D4AA', borderColor: '#00D4AA' },
  rangeText: { fontSize: 11, fontWeight: '600', color: '#7A7A9A' },
  rangeTextActive: { color: '#08080F' },

  chartPlaceholder: {
    height: 160,
    backgroundColor: '#0F0F1A',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  chartPlaceholderText: { fontSize: 13, color: '#7A7A9A' },

  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#161625',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  alertBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#00D4AA',
  },
  alertBtnText: { fontSize: 15, fontWeight: '700', color: '#00D4AA' },

  polyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: '#00D4AA',
  },
  polyBtnText: { fontSize: 15, fontWeight: '700', color: '#08080F' },
});
