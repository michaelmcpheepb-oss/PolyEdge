/**
 * ProbabilityChart — Area chart using victory-native (Skia-based).
 *
 * On web: Skia is not available — renders a pure-RN bar sparkline.
 * On native: full victory-native CartesianChart with Skia Path.
 *
 * Platform guard prevents the Skia native module crash on web.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';

import { getPriceHistory, type PricePoint, type RangeKey } from '../services/priceHistory';

interface Props {
  marketId: string;
  range: RangeKey;
  currentPrice: number;
  conditionId?: string | null;
}

export default function ProbabilityChart({ marketId, range, currentPrice, conditionId }: Props) {
  const [points, setPoints] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPriceHistory(marketId, range, currentPrice, conditionId)
      .then((data) => { if (!cancelled) { setPoints(data); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [marketId, range, currentPrice, conditionId]);

  if (loading) {
    return (
      <View style={styles.chartBox}>
        <ActivityIndicator size="small" color="#00D4AA" />
      </View>
    );
  }

  if (points.length < 2) {
    return (
      <View style={styles.chartBox}>
        <Text style={styles.noData}>No history data</Text>
      </View>
    );
  }

  // ── Web: pure-RN sparkline, zero Skia ────────────────────────
  if (Platform.OS === 'web') {
    return <WebSparkline points={points} />;
  }

  // ── Native: Skia + victory-native loaded via require() ────────
  return <NativeSkiaChart points={points} />;
}

/* ─── Web sparkline (no Skia, no SVG) ─────────────────────── */

function WebSparkline({ points }: { points: PricePoint[] }) {
  const vals = points.map((p) => p.price * 100);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = Math.max(max - min, 1);
  const last = vals[vals.length - 1];
  const color = last >= 50 ? '#00D4AA' : '#FF4757';

  const step = Math.max(1, Math.floor(vals.length / 40));
  const sampled = vals.filter((_, i) => i % step === 0);

  return (
    <View style={styles.chartBox}>
      <View style={styles.sparkWrap}>
        <View style={styles.yLabels}>
          <Text style={styles.yLabel}>{Math.round(max)}%</Text>
          <Text style={styles.yLabel}>{Math.round((max + min) / 2)}%</Text>
          <Text style={styles.yLabel}>{Math.round(min)}%</Text>
        </View>
        <View style={styles.bars}>
          {sampled.map((v, i) => {
            const heightPct = ((v - min) / span) * 100;
            const isLast = i === sampled.length - 1;
            return (
              <View key={i} style={styles.barCol}>
                <View style={[
                  styles.bar,
                  {
                    height: `${Math.max(2, heightPct)}%` as any,
                    backgroundColor: isLast ? color : color + '70',
                  },
                ]} />
              </View>
            );
          })}
        </View>
      </View>
      <Text style={[styles.currentLabel, { color }]}>{last.toFixed(1)}% YES</Text>
    </View>
  );
}

/* ─── Native chart (require() keeps Skia out of web bundle) ── */

function NativeSkiaChart({ points }: { points: PricePoint[] }) {
  // require() inside a function body — Metro only bundles this on native
  // because the Platform.OS === 'web' branch above returns early.
  const { CartesianChart, Area } = require('victory-native');
  const { Path, Skia } = require('@shopify/react-native-skia');

  const chartData = useMemo(() => {
    const t0 = points[0].timestamp;
    return points.map((p) => ({
      t: Math.round((p.timestamp - t0) / 3600),
      p: p.price * 100,
    }));
  }, [points]);

  const yDomain: [number, number] = useMemo(() => {
    const pVals = chartData.map((d) => d.p);
    const lo = Math.min(...pVals), hi = Math.max(...pVals);
    const pad = Math.max((hi - lo) * 0.15, 3);
    return [Math.floor(Math.max(0, lo - pad)), Math.ceil(Math.min(100, hi + pad))];
  }, [chartData]);

  return (
    <View style={styles.chartBox}>
      <CartesianChart
        data={chartData}
        xKey="t"
        yKeys={['p']}
        domain={{ y: yDomain }}
        domainPadding={{ left: 8, right: 8, top: 8, bottom: 8 }}
      >
        {({ points: cp, chartBounds }: any) => {
          // Build stroke path
          if (!cp?.p?.length) return null;
          const path = Skia.Path.Make();
          path.moveTo(cp.p[0].x, cp.p[0].y ?? 0);
          for (let i = 1; i < cp.p.length; i++) path.lineTo(cp.p[i].x, cp.p[i].y ?? 0);
          return (
            <>
              <Area points={cp.p} y0={chartBounds.bottom + 4} color="#00D4AA" opacity={0.2} />
              <Path path={path} style="stroke" strokeWidth={2} color="#00D4AA" strokeCap="round" strokeJoin="round" />
            </>
          );
        }}
      </CartesianChart>
    </View>
  );
}

const styles = StyleSheet.create({
  chartBox: {
    height: 200,
    backgroundColor: '#0F0F1A',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  noData:       { fontSize: 13, color: '#7A7A9A' },
  sparkWrap:    { flex: 1, width: '100%', flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 8 },
  yLabels:      { width: 36, justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: 4 },
  yLabel:       { fontSize: 9, color: '#7A7A9A' },
  bars:         { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 1 },
  barCol:       { flex: 1, height: '100%', justifyContent: 'flex-end' },
  bar:          { borderRadius: 1, minHeight: 2 },
  currentLabel: { fontSize: 11, fontWeight: '700', marginBottom: 6 },
});
