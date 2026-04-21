import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Market } from '../types';
import { Colors } from '../constants/Colors';
import { formatDistanceToNow } from 'date-fns';

interface MarketCardProps {
  market: Market;
  onPress?: () => void;
  compact?: boolean;
}

export function MarketCard({ market, onPress, compact = false }: MarketCardProps) {
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

  const Content = (
    <View style={[styles.card, compact && styles.compactCard]}>
      <View style={styles.header}>
        <View style={styles.categoryContainer}>
          <Text style={styles.category}>{market.category || 'General'}</Text>
        </View>
        <View style={styles.volumeContainer}>
          <Text style={styles.volume}>{formatCurrency(market.volume_24h)}</Text>
          <Text style={styles.volumeLabel}>24h vol</Text>
        </View>
      </View>
      
      <Text style={styles.question} numberOfLines={compact ? 2 : 3}>
        {market.question}
      </Text>
      
      <View style={styles.priceContainer}>
        <View style={styles.priceColumn}>
          <Text style={styles.priceLabel}>YES</Text>
          <Text style={[styles.price, { color: getPriceColor(market.yes_price) }]}>
            {(market.yes_price * 100).toFixed(1)}¢
          </Text>
        </View>
        
        <View style={styles.priceColumn}>
          <Text style={styles.priceLabel}>NO</Text>
          <Text style={[styles.price, { color: getPriceColor(market.no_price) }]}>
            {(market.no_price * 100).toFixed(1)}¢
          </Text>
        </View>
        
        <View style={styles.timeColumn}>
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
            Updated {formatDistanceToNow(new Date(market.updated_at), { addSuffix: true })}
          </Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {Content}
      </TouchableOpacity>
    );
  }

  return Content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
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
    fontSize: 20,
    fontWeight: '700',
  },
  timeColumn: {
    alignItems: 'center',
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
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