import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

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

function fmtDate(s?: string) {
  if (!s) return null;
  try {
    return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch { return null; }
}

function confLabel(score: number): { label: string; color: string; bg: string; border: string } {
  if (score >= 65) return { label: 'HIGH',   color: '#00D4AA', bg: '#00D4AA20', border: '#00D4AA' };
  if (score >= 45) return { label: 'MEDIUM', color: '#FFD700', bg: '#FFD70020', border: '#FFD700' };
  return               { label: 'LOW',    color: '#7A7A9A', bg: '#7A7A9A20', border: '#7A7A9A' };
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
  pick_date?: string;
  end_date?: string;
  // enriched fields
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

  // Confidence pill
  const conf = confLabel(pick.confidence_score);

  // Odds
  const yesPct = Math.round((pick.current_yes_price ?? 0.5) * 100);
  const noPct  = Math.round((pick.current_no_price  ?? 0.5) * 100);

  // Verdict / recommendation
  const verdict = pick.verdict ?? 'NEUTRAL';
  const isBuy   = verdict === 'STRONG_BUY' || verdict === 'BUY';
  const isAvoid = verdict === 'STRONG_AVOID' || verdict === 'AVOID';
  const edge    = pick.edge_pct ?? 0;

  let recoBg     = '#7A7A9A12';
  let recoBorder = '#7A7A9A35';
  let recoColor  = '#7A7A9A';
  let recoLabel  = '→ NO CLEAR EDGE';
  let edgeLabel  = '';

  if (isBuy) {
    recoBg     = '#00C07F12';
    recoBorder = '#00C07F35';
    recoColor  = '#00C07F';
    recoLabel  = '↑ BET YES';
    edgeLabel  = `Edge +${Math.abs(edge).toFixed(1)}%`;
  } else if (isAvoid) {
    recoBg     = '#FF475712';
    recoBorder = '#FF475735';
    recoColor  = '#FF4757';
    recoLabel  = '↓ BET NO';
    edgeLabel  = `Edge −${Math.abs(edge).toFixed(1)}%`;
  }

  // Single insight sentence — first bullet or first sentence of ai_reasoning
  let insight = '';
  if (pick.reasoning_bullets?.length) {
    insight = pick.reasoning_bullets[0];
  } else if (pick.ai_reasoning) {
    insight = pick.ai_reasoning.split(/[.\n]/)[0].trim();
  }

  // Smart money line — only show when strong + not MIXED
  const smPct = pick.smart_money_pct ?? 0;
  const smDir = pick.smart_money_direction;
  const showSmartMoney = smPct >= 60 && smDir && smDir !== 'MIXED';
  const smMatchesReco = (isBuy && smDir === 'YES') || (isAvoid && smDir === 'NO');

  // Date display
  const dateStr = pick.end_date
    ? `Ends ${fmtDate(pick.end_date)}`
    : pick.pick_date
      ? `Added ${fmtDate(pick.pick_date)}`
      : null;

  const handlePress = () => router.push({
    pathname: '/market/[id]',
    params: { id: pick.market_id, question: pick.market_question },
  });

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.75}>
      {/* Accent line */}
      <View style={[styles.topLine, { backgroundColor: accentColor }]} />

      {/* ── TOP ROW: category chip + confidence pill ── */}
      <View style={styles.topRow}>
        <View style={styles.topRowLeft}>
          {pick.category && (
            <View style={[styles.catChip, { borderColor: accentColor + '70' }]}>
              <Text style={[styles.catChipText, { color: accentColor }]}>
                {pick.category.charAt(0).toUpperCase() + pick.category.slice(1)}
              </Text>
            </View>
          )}
          {dateStr && <Text style={styles.dateText}>{dateStr}</Text>}
        </View>
        <View style={[styles.confPill, { backgroundColor: conf.bg, borderColor: conf.border }]}>
          <Text style={[styles.confPillText, { color: conf.color }]}>{conf.label}</Text>
        </View>
      </View>

      {/* ── QUESTION ── */}
      <Text style={styles.question} numberOfLines={2}>{pick.market_question}</Text>

      {/* ── CURRENT ODDS ── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Current market odds</Text>
        <View style={styles.oddsRow}>
          <View style={styles.oddsBoxYes}>
            <Text style={styles.oddsOutcomeYes}>YES</Text>
            <Text style={styles.oddsPct}>{yesPct}%</Text>
          </View>
          <View style={styles.oddsBoxNo}>
            <Text style={styles.oddsOutcomeNo}>NO</Text>
            <Text style={styles.oddsPct}>{noPct}%</Text>
          </View>
        </View>
      </View>

      {/* ── OUR RECOMMENDATION ── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Our recommendation</Text>
        <View style={[styles.recoBox, { backgroundColor: recoBg, borderColor: recoBorder }]}>
          <Text style={[styles.recoLabel, { color: recoColor }]}>{recoLabel}</Text>
          {edgeLabel ? (
            <Text style={[styles.recoEdge, { color: recoColor }]}>{edgeLabel}</Text>
          ) : null}
        </View>
      </View>

      {/* ── AI INSIGHT ── */}
      {insight ? (
        <View style={styles.insightWrap}>
          <Text style={styles.insightText} numberOfLines={2}>{insight}</Text>
        </View>
      ) : null}

      {/* ── BOTTOM ROW ── */}
      <View style={styles.bottomRow}>
        {showSmartMoney ? (
          <Text style={[styles.smText, { color: smMatchesReco ? '#00D4AA' : '#7A7A9A' }]}>
            {Math.round(smPct)}% of top wallets: {smDir}
          </Text>
        ) : (
          <View />
        )}
        <Text style={styles.viewLink}>View full analysis →</Text>
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

  // Top row
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 2,
  },
  topRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  catChip: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  catChipText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  dateText: { fontSize: 11, color: '#7A7A9A' },
  confPill: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  confPillText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

  // Question
  question: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 24,
    paddingHorizontal: 16,
    marginTop: 10,
  },

  // Shared section wrapper
  section: { paddingHorizontal: 16, marginTop: 12 },
  sectionLabel: { fontSize: 11, color: '#7A7A9A', marginBottom: 6 },

  // Odds
  oddsRow: { flexDirection: 'row', gap: 8 },
  oddsBoxYes: {
    flex: 1,
    backgroundColor: '#00C07F10',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  oddsBoxNo: {
    flex: 1,
    backgroundColor: '#FF475710',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  oddsOutcomeYes: { fontSize: 11, fontWeight: '700', color: '#00C07F', marginBottom: 2 },
  oddsOutcomeNo:  { fontSize: 11, fontWeight: '700', color: '#FF4757', marginBottom: 2 },
  oddsPct: { fontSize: 28, fontWeight: '900', color: '#FFFFFF' },

  // Recommendation
  recoBox: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recoLabel: { fontSize: 18, fontWeight: '800' },
  recoEdge:  { fontSize: 13, fontWeight: '600' },

  // Insight
  insightWrap: { paddingHorizontal: 16, marginTop: 10 },
  insightText: {
    fontSize: 13,
    color: '#A0A0B8',
    lineHeight: 20,
    fontStyle: 'italic',
  },

  // Bottom row
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#2A2A45',
  },
  smText:   { fontSize: 11, flex: 1, marginRight: 8 },
  viewLink: { fontSize: 12, color: '#00D4AA', fontWeight: '600' },
});
