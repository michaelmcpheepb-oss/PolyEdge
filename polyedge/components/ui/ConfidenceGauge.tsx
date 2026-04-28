/**
 * ConfidenceGauge — arc gauge using pure React Native (no react-native-svg).
 * Renders a coloured border circle that fills proportionally via clip+rotate trick.
 * Works on web and native.
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

type GaugeSize = 'sm' | 'md' | 'lg';

const SIZE_MAP: Record<GaugeSize, { px: number; fontSize: number; thick: number }> = {
  sm: { px: 48, fontSize: 13, thick: 5 },
  md: { px: 72, fontSize: 18, thick: 6 },
  lg: { px: 96, fontSize: 24, thick: 7 },
};

function getColor(score: number): string {
  if (score >= 70) return '#00D4AA';
  if (score >= 50) return '#FFD700';
  return '#FF4757';
}

export interface ConfidenceGaugeProps {
  score: number;
  size?: GaugeSize;
}

export function ConfidenceGauge({ score, size = 'md' }: ConfidenceGaugeProps) {
  const { px, fontSize, thick } = SIZE_MAP[size];
  const clamped = Math.max(0, Math.min(100, score));
  const color = getColor(clamped);
  const inner = px - thick * 2;

  // Animate rotation of the filled arc layer
  const rot = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(rot, {
      toValue: clamped / 100,
      duration: 700,
      useNativeDriver: false, // rotate interpolation requires JS driver on web
    }).start();
  }, [clamped]);

  // Full circle = 360deg. We clip left half and right half separately.
  // Right clip rotates from 0→180 for score 0→50
  // Left  clip rotates from 0→180 for score 50→100
  const rightDeg = rot.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['0deg', '180deg', '180deg'] });
  const leftDeg  = rot.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['0deg', '0deg', '180deg'] });

  return (
    <View style={{ width: px, height: px }}>
      {/* Track ring */}
      <View style={[styles.ring, { width: px, height: px, borderRadius: px / 2, borderWidth: thick, borderColor: '#2A2A45' }]} />

      {/* Arc — right half */}
      <View style={[styles.clip, { width: px / 2, height: px, left: px / 2, overflow: 'hidden' }]}>
        <Animated.View style={[
          styles.arcFill,
          {
            width: px, height: px, borderRadius: px / 2,
            borderWidth: thick, borderColor: color,
            transform: [{ rotate: rightDeg }],
            left: -px / 2,
          },
        ]} />
      </View>

      {/* Arc — left half (only visible for score > 50) */}
      <View style={[styles.clip, { width: px / 2, height: px, left: 0, overflow: 'hidden' }]}>
        <Animated.View style={[
          styles.arcFill,
          {
            width: px, height: px, borderRadius: px / 2,
            borderWidth: thick, borderColor: color,
            transform: [{ rotate: leftDeg }],
          },
        ]} />
      </View>

      {/* Centre text */}
      <View style={[StyleSheet.absoluteFillObject, styles.centre]}>
        <Text style={[styles.score, { fontSize, color }]}>{Math.round(clamped)}</Text>
        <Text style={[styles.pct, { color: '#7A7A9A', fontSize: Math.round(fontSize * 0.55) }]}>%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
  },
  clip: {
    position: 'absolute',
    top: 0,
  },
  arcFill: {
    position: 'absolute',
    top: 0,
  },
  centre: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  score: {
    fontWeight: '800',
  },
  pct: {
    marginTop: -2,
  },
});
