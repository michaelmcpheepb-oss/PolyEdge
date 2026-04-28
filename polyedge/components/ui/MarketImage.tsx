import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

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

function getCategoryColor(category: string | null | undefined): string {
  return CAT_COLORS[(category ?? '').toLowerCase()] ?? '#7A7A9A';
}

interface MarketImageProps {
  image?: string | null;
  category?: string | null;
  size?: number;
}

export function MarketImage({ image, category, size = 56 }: MarketImageProps) {
  const [imgError, setImgError] = useState(false);
  const color   = getCategoryColor(category);
  const initial = ((category ?? 'G')[0] ?? 'G').toUpperCase();

  // Show real image — fall back to initial avatar only on load error
  if (image && !imgError) {
    return (
      <Image
        source={{ uri: image }}
        style={{ width: size, height: size, borderRadius: 10 }}
        resizeMode="cover"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <View
      style={[
        styles.placeholder,
        {
          width: size,
          height: size,
          borderRadius: 10,
          backgroundColor: color + '33',
          borderColor: color + '80',
        },
      ]}
    >
      <Text style={[styles.initial, { fontSize: size * 0.4, color }]}>
        {initial}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initial: {
    fontWeight: '800',
  },
});
