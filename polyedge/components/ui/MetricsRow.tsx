import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MetricsRowProps {
  edge: number;
  confidence: number;
  stake?: number; // kept for API compat but no longer rendered
}

function MetricBox({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <View style={styles.box}>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

function confLabel(score: number) {
  if (score >= 65) return 'HIGH';
  if (score >= 45) return 'MEDIUM';
  return 'LOW';
}

export function MetricsRow({ edge, confidence }: MetricsRowProps) {
  const edgeColor = edge >= 0 ? '#00C07F' : '#FF4757';
  const edgeStr   = edge >= 0 ? `+${edge.toFixed(1)}%` : `${edge.toFixed(1)}%`;
  const confColor = confidence >= 65 ? '#00D4AA' : confidence >= 45 ? '#FFD700' : '#7A7A9A';

  return (
    <View style={styles.row}>
      <MetricBox value={edgeStr}          label="Edge"       color={edgeColor} />
      <MetricBox value={confLabel(confidence)} label="Confidence" color={confColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  box: {
    flex: 1,
    backgroundColor: '#0F0F1A',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 11,
    color: '#7A7A9A',
    marginTop: 3,
  },
});
