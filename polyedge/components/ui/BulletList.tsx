import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BulletListProps {
  bullets: string[];
  kellyWarning?: boolean;
}

/** Truncate a bullet to at most maxWords words, appending '…' if trimmed. */
function truncate(text: string, maxWords = 8): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text.trim();
  return words.slice(0, maxWords).join(' ') + '…';
}

export function BulletList({ bullets, kellyWarning = false }: BulletListProps) {
  const raw = bullets.slice(0, 3); // max 3 bullets
  const items = kellyWarning
    ? [...raw, 'Kelly criterion does not support sizing']
    : raw;

  return (
    <View style={styles.container}>
      {items.map((text, i) => {
        const isWarning = kellyWarning && i === items.length - 1;
        const dotColor  = isWarning ? '#FFD700' : '#00C07F';
        const textColor = isWarning ? '#FFD700' : '#00C07F';
        return (
          <View key={i} style={styles.row}>
            <View style={[styles.dot, { backgroundColor: dotColor }]} />
            <Text style={[styles.text, { color: textColor }]}>{isWarning ? text : truncate(text)}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
    marginTop: 4,
    flexShrink: 0,
  },
  text: {
    fontSize: 13,
    flex: 1,
    lineHeight: 20,
  },
});
