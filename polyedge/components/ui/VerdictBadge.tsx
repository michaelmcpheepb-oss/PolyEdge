import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Verdict   = 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'AVOID' | 'STRONG_AVOID';
type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

interface VerdictBadgeProps {
  verdict: Verdict;
  riskLevel?: RiskLevel;
}

const VERDICT_CONFIG: Record<Verdict, {
  label: string;
  color: string;
}> = {
  STRONG_BUY:   { label: '↑↑ STRONG BUY',   color: '#00C07F' },
  BUY:          { label: '↑ BUY',            color: '#00D4AA' },
  NEUTRAL:      { label: '→ NEUTRAL',        color: '#7A7A9A' },
  AVOID:        { label: '↓ AVOID',          color: '#FF4757' },
  STRONG_AVOID: { label: '↓↓ STRONG AVOID', color: '#FF4757' },
};

const RISK_COLOR: Record<RiskLevel, string> = {
  LOW:    '#00C07F',
  MEDIUM: '#FFD700',
  HIGH:   '#FF4757',
};

export function VerdictBadge({ verdict, riskLevel }: VerdictBadgeProps) {
  const cfg   = VERDICT_CONFIG[verdict] ?? VERDICT_CONFIG.NEUTRAL;
  const rColor = riskLevel ? RISK_COLOR[riskLevel] : cfg.color;

  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: cfg.color }]}>{cfg.label}</Text>
      {riskLevel && (
        <View style={[styles.pill, { backgroundColor: rColor + '20', borderColor: rColor + '60' }]}>
          <Text style={[styles.pillText, { color: rColor }]}>{riskLevel}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  pill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
