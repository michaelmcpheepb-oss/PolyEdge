import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MetricsRowProps {
  edge: number;
  confidence: number;
  stake: number;
}

function MetricBox({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) {
  return (
    <View style={styles.box}>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

export function MetricsRow({ edge, confidence, stake }: MetricsRowProps) {
  const edgeColor      = edge >= 0 ? '#00C07F' : '#FF4757';
  const edgeStr        = edge >= 0 ? `+${edge.toFixed(1)}` : edge.toFixed(1);

  return (
    <View style={styles.row}>
      <MetricBox value={edgeStr}         label="Edge"       color={edgeColor} />
      <MetricBox value={`${confidence}%`} label="Confidence" color="#00D4AA"  />
      <MetricBox value={`${stake.toFixed(1)}`} label="Stake"  color="#FFFFFF" />
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
