import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ConfidenceGauge } from './ui/ConfidenceGauge';
import { VerdictBadge } from './ui/VerdictBadge';
import { MetricsRow } from './ui/MetricsRow';
import { BulletList } from './ui/BulletList';

const CAT_COLORS: Record<string, string> = {
  politics:   '#5B8CFF',
  crypto:     '#9B59FF',
  sports:     '#FF7B2C',
  science:    '#2CE8FF',
  technology: '#2CE8FF',
  economics:  '#FFD700',
  world:      '#FF4CAD',
  tech:       '#00D4AA',
  general:    '#7A7A9A',
};

function catColor(cat?: string) {
  return CAT_COLORS[(cat ?? '').toLowerCase()] ?? '#7A7A9A';
}

export interface PickCardData {
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
  // optional enriched fields
  verdict?: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'AVOID' | 'STRONG_AVOID';
  edge_pct?: number;
  kelly_pct?: number;
  risk_level?: 'LOW' | 'MEDIUM' | 'HIGH';
  reasoning_bullets?: string[];
  ai_probability?: number;
}

interface PickCardProps {
  pick: PickCardData;
  index: number;
}

export function PickCard({ pick, index }: PickCardProps) {
  const router = useRouter();
  const accentColor = catColor(pick.category);
  const isYes = pick.recommended_outcome === 'YES';
  const outcomeColor = isYes ? '#00C07F' : '#FF4757';

  const smPct = pick.smart_money_pct ?? 50;
  const smDots = Array.from({ length: 10 }, (_, i) => {
    const filled = i < Math.round(smPct / 10);
    const dir = pick.smart_money_direction;
    const dotColor = filled
      ? dir === 'YES' ? '#00C07F' : dir === 'NO' ? '#FF4757' : '#FFD700'
      : '#2A2A45';
    return <View key={i} style={[styles.smDot, { backgroundColor: dotColor }]} />;
  });

  const bullets: string[] = pick.reasoning_bullets?.length
    ? pick.reasoning_bullets
    : pick.ai_reasoning
      ? [pick.ai_reasoning]
      : [];

  const hasEnriched = !!(pick.verdict && pick.edge_pct !== undefined && pick.kelly_pct !== undefined);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/market/${pick.market_id}`)}
      activeOpacity={0.75}
    >
      {/* Category accent line */}
      <View style={[styles.topLine, { backgroundColor: accentColor }]} />

      <View style={styles.body}>
        {/* Row 1: number + gauge + verdict/outcome */}
        <View style={styles.row1}>
          <Text style={styles.indexNum}>{index + 1}</Text>

          <ConfidenceGauge score={pick.confidence_score} size="sm" />

          <View style={styles.outcomeWrap}>
            {hasEnriched && pick.verdict ? (
              <VerdictBadge verdict={pick.verdict} riskLevel={pick.risk_level} />
            ) : (
              <View style={[styles.outcomeBadge, { borderColor: outcomeColor + '80', backgroundColor: outcomeColor + '15' }]}>
                <Text style={[styles.outcomeText, { color: outcomeColor }]}>
                  {isYes ? 'BUY YES' : 'BUY NO'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Question */}
        <Text style={styles.question} numberOfLines={3}>{pick.market_question}</Text>

        {/* Metrics row (if enriched) */}
        {hasEnriched && (
          <View style={styles.metricsWrap}>
            <MetricsRow
              edge={pick.edge_pct!}
              confidence={pick.confidence_score}
              stake={pick.kelly_pct! / 2.5}
            />
          </View>
        )}

        {/* Bullets (preferred) or AI brief fallback */}
        {bullets.length > 0 ? (
          <View style={styles.bulletsWrap}>
            <BulletList bullets={bullets.slice(0, 3)} kellyWarning={(pick.kelly_pct ?? 1) <= 0} />
          </View>
        ) : pick.ai_reasoning ? (
          <Text style={styles.brief} numberOfLines={2}>{pick.ai_reasoning}</Text>
        ) : null}

        {/* Smart money bar */}
        <View style={styles.smRow}>
          <Text style={styles.smLabel}>Smart Money</Text>
          <View style={styles.smDots}>{smDots}</View>
          <Text style={[styles.smDir, { color: outcomeColor }]}>
            {pick.smart_money_direction ?? 'MIXED'}
          </Text>
        </View>
      </View>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>YES</Text>
          <Text style={[styles.priceVal, { color: '#00C07F' }]}>
            {(pick.current_yes_price * 100).toFixed(0)}%
          </Text>
          <Text style={styles.priceLabel}>NO</Text>
          <Text style={[styles.priceVal, { color: '#FF4757' }]}>
            {(pick.current_no_price * 100).toFixed(0)}%
          </Text>
        </View>
        <Text style={styles.viewLink}>View →</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#161625',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  topLine: { height: 3, width: '100%' },

  body: { padding: 14, gap: 10 },

  row1: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  indexNum: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7A7A9A',
    width: 18,
  },
  outcomeWrap: { flex: 1, alignItems: 'flex-end' },
  outcomeBadge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  outcomeText: { fontSize: 12, fontWeight: '700' },

  question: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 22,
  },

  metricsWrap: { marginTop: 2 },

  brief: {
    fontSize: 13,
    color: '#A0A0B8',
    lineHeight: 19,
  },

  bulletsWrap: { marginTop: 2 },

  smRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  smLabel: { fontSize: 11, color: '#7A7A9A', fontWeight: '600' },
  smDots: { flexDirection: 'row', gap: 3 },
  smDot: { width: 8, height: 8, borderRadius: 2 },
  smDir: { fontSize: 11, fontWeight: '700', marginLeft: 'auto' },

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    backgroundColor: '#0F0F1A',
  },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  priceLabel: { fontSize: 11, color: '#7A7A9A', fontWeight: '600' },
  priceVal: { fontSize: 14, fontWeight: '800' },
  viewLink: { fontSize: 12, color: '#00D4AA', fontWeight: '600' },
});
