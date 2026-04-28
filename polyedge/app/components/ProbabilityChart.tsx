/**
 * ProbabilityChart — Area chart component using victory-native.
 *
 * Uses CartesianChart + Area from victory-native v41.
 * Renders YES outcome probability over time with semi-transparent area fill.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import {
  CartesianChart,
  Area,
  type InputDatum,
  type MaybeNumber,
} from 'victory-native';
import { Path, Skia } from '@shopify/react-native-skia';

import { getPriceHistory, type PricePoint, type RangeKey } from '../../services/priceHistory';

interface ChartDatum extends InputDatum {
  /** Timestamp as hours from first point (numeric x-axis) */
  t: number;
  /** Probability as 0–100 */
  p: number;
}

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
      .then((data) => {
        if (!cancelled) {
          setPoints(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [marketId, range, currentPrice, conditionId]);

  // Transform price history → chart data (numeric x = hours from epoch start)
  const chartData: ChartDatum[] = useMemo(() => {
    if (points.length < 2) return [];
    const t0 = points[0].timestamp;
    return points.map((p) => ({
      t: Math.round((p.timestamp - t0) / 3600),
      p: p.price * 100, // 0–1 → 0–100
    }));
  }, [points]);

  // Compute y-axis domain with padding
  const yDomain: [number, number] = useMemo(() => {
    if (chartData.length < 2) return [0, 100];
    const vals = chartData.map((d) => d.p);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const pad = Math.max((max - min) * 0.15, 3);
    return [
      Math.floor(Math.max(0, min - pad)),
      Math.ceil(Math.min(100, max + pad)),
    ];
  }, [chartData]);

  if (loading) {
    return (
      <View style={styles.chartBox}>
        <ActivityIndicator size="small" color="#00D4AA" />
      </View>
    );
  }

  if (chartData.length < 2) {
    return (
      <View style={styles.chartBox}>
        <Text style={styles.noData}>No history data</Text>
      </View>
    );
  }

  return (
    <View style={styles.chartBox}>
      <CartesianChart
        data={chartData}
        xKey="t"
        yKeys={['p']}
        domain={{ y: yDomain }}
        domainPadding={{ left: 8, right: 8, top: 8, bottom: 8 }}
      >
        {({ points, chartBounds }) => (
          <>
            {/* Horizontal grid lines */}
            <YGridLines
              domain={yDomain}
              bottom={chartBounds.bottom}
              top={chartBounds.top}
              left={chartBounds.left}
              right={chartBounds.right}
            />
            {/* Semi-transparent area fill */}
            <Area
              points={points.p}
              y0={chartBounds.bottom + 4}
              color="#00D4AA"
              opacity={0.2}
            />
            {/* Stroke line on top */}
            {points.p.length > 1 && (
              <AreaStrokeLine points={points.p} color="#00D4AA" />
            )}
          </>
        )}
      </CartesianChart>
    </View>
  );
}

/* ─── Tiny sub-components ─────────────────────────────────── */

function AreaStrokeLine({
  points,
  color,
}: {
  points: { x: number; y: MaybeNumber }[];
  color: string;
}) {
  if (points.length < 2) return null;
  const path = Skia.Path.Make();
  const px0 = points[0].x; const py0 = points[0].y ?? 0;
  path.moveTo(px0, py0);
  for (let i = 1; i < points.length; i++) {
    const xi = points[i].x; const yi = points[i].y ?? 0;
    path.lineTo(xi, yi);
  }
  return (
    <Path
      path={path}
      style="stroke"
      strokeWidth={2}
      color={color}
      strokeCap="round"
      strokeJoin="round"
    />
  );
}

function YGridLines({
  domain,
  bottom,
  top,
  left,
  right,
}: {
  domain: [number, number];
  bottom: number;
  top: number;
  left: number;
  right: number;
}) {
  const [min, max] = domain;
  const range = max - min;
  if (range <= 0) return null;

  // Pick a round step
  let step: number;
  if (range > 40) step = 20;
  else if (range > 20) step = 10;
  else if (range > 10) step = 5;
  else step = 2;
  if (step <= 0) return null;

  const elements: React.ReactElement[] = [];

  for (let v = Math.ceil(min / step) * step; v <= max; v += step) {
    const fraction = (v - min) / range;
    const y = bottom - fraction * (bottom - top);

    const gridPath = Skia.Path.Make();
    gridPath.moveTo(left, y);
    gridPath.lineTo(right, y);

    elements.push(
      <Path
        key={`g-${v}`}
        path={gridPath}
        style="stroke"
        strokeWidth={0.5}
        color="#2A2A45"
      />,
    );
  }
  return <>{elements}</>;
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
  noData: {
    fontSize: 13,
    color: '#7A7A9A',
  },
});
