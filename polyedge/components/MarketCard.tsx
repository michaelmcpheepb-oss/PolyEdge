import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Market } from '../types';
import { Colors } from '../constants/Colors';

// Lightweight time-ago helper (no date-fns dependency)
const timeAgo = (date: Date): string => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  const days = Math.floor(seconds / 86400);
  return days === 1 ? '1 day ago' : `${days} days ago`;
};

interface MarketCardProps {
  market: Market;
  compact?: boolean;
}

function MarketCardComponent({ market, compact = false }: MarketCardProps) {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const getPriceColor = (price: number) => {
    if (price > 0.6) return Colors.success;
    if (price > 0.4) return Colors.warning;
    return Colors.error;
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  const formatTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    
    if (end < now) {
      return 'Ended';
    }
    
    const diffMs = end.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) {
      const diffMonths = Math.floor(diffDays / 30);
      return `${diffMonths} month${diffMonths !== 1 ? 's' : ''}`;
    }
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    }
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours > 0) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    }
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
  };

  const calculate24hChange = () => {
    // For now, simulate a random change
    // In production, this would come from historical data
    const change = (Math.random() * 20 - 10); // -10% to +10%
    return {
      value: change,
      formatted: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
      color: change > 0 ? Colors.success : Colors.error,
    };
  };

  const handlePress = () => {
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Scale animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.97,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Navigate to market detail
    setTimeout(() => {
      router.push(`/market/${market.id}`);
    }, 150);
  };

  const change24h = calculate24hChange();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity 
        onPress={handlePress}
        activeOpacity={0.7}
        style={[styles.card, compact && styles.compactCard]}
      >
        <View style={styles.header}>
          <View style={styles.categoryContainer}>
            <Text style={styles.category}>{market.category || 'General'}</Text>
          </View>
          <View style={styles.volumeContainer}>
            <Text style={styles.volume}>{formatCurrency(market.volume_24h)}</Text>
            <Text style={styles.volumeLabel}>24h vol</Text>
          </View>
        </View>
        
        <Text style={styles.question} numberOfLines={2}>
          {market.question}
        </Text>
        
        <View style={styles.priceContainer}>
          <View style={styles.priceColumn}>
            <Text style={styles.priceLabel}>YES</Text>
            <Text style={[styles.price, { color: Colors.accent }]}>
              {(market.yes_price * 100).toFixed(1)}%
            </Text>
            <Text style={[styles.change24h, { color: change24h.color }]}>
              {change24h.formatted}
            </Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.priceColumn}>
            <Text style={styles.priceLabel}>NO</Text>
            <Text style={[styles.price, { color: getPriceColor(market.no_price) }]}>
              {(market.no_price * 100).toFixed(1)}%
            </Text>
            <Text style={styles.timeLabel}>Ends in</Text>
            <Text style={styles.time}>{formatTimeRemaining(market.end_date)}</Text>
          </View>
        </View>
        
        {!compact && market.description && (
          <Text style={styles.description} numberOfLines={2}>
            {market.description}
          </Text>
        )}
        
        {!compact && (
          <View style={styles.footer}>
            <Text style={styles.totalVolume}>
              Total volume: {formatCurrency(market.total_volume)}
            </Text>
            <Text style={styles.updated}>
              Updated {timeAgo(new Date(market.updated_at))}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '100%',
  },
  compactCard: {
    padding: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryContainer: {
    backgroundColor: Colors.elevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  volumeContainer: {
    alignItems: 'flex-end',
  },
  volume: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  volumeLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 22,
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceColumn: {
    alignItems: 'center',
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  price: {
    fontSize: 42,
    fontWeight: '700',
    marginBottom: 4,
  },
  change24h: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  timeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  time: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  totalVolume: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  updated: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
});

export const MarketCard = React.memo(MarketCardComponent);