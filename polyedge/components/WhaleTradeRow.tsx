import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WhaleTrade } from '../types';
import { Colors } from '../constants/Colors';
import { formatDistanceToNow } from 'date-fns';

interface WhaleTradeRowProps {
  trade: WhaleTrade;
  onPress?: () => void;
}

export function WhaleTradeRow({ trade, onPress }: WhaleTradeRowProps) {
  const isRecent = () => {
    const tradeTime = new Date(trade.timestamp);
    const now = new Date();
    const diffMinutes = (now.getTime() - tradeTime.getTime()) / (1000 * 60);
    return diffMinutes < 5;
  };

  const getTraderInitials = () => {
    if (trade.trader_pseudonym) {
      const parts = trade.trader_pseudonym.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return trade.trader_pseudonym.substring(0, 2).toUpperCase();
    }
    return '??';
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  const formatTimeAgo = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  };

  const isBuy = trade.side === 'BUY';
  const isYes = trade.outcome === 'YES';
  const amountColor = isBuy ? Colors.success : Colors.error;
  const tradeType = `${isBuy ? 'BUY' : 'SELL'} ${isYes ? 'YES' : 'NO'}`;

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getTraderInitials()}</Text>
            </View>
            {isRecent() && <View style={styles.recentDot} />}
          </View>
          
          <View style={styles.tradeInfo}>
            <Text style={styles.traderName} numberOfLines={1}>
              {trade.trader_pseudonym || 'Unknown Whale'}
            </Text>
            <Text style={styles.marketQuestion} numberOfLines={1}>
              {trade.market_question}
            </Text>
            <Text style={[styles.tradeType, { color: Colors.textSecondary }]}>
              {tradeType}
            </Text>
          </View>
        </View>
        
        <View style={styles.rightSection}>
          <Text style={[styles.amount, { color: amountColor }]}>
            {formatAmount(trade.amount_usd)}
          </Text>
          <Text style={styles.timeAgo}>
            {formatTimeAgo(trade.timestamp)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.background,
  },
  recentDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.warning,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  tradeInfo: {
    flex: 1,
  },
  traderName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  marketQuestion: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  tradeType: {
    fontSize: 12,
    fontWeight: '500',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  timeAgo: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
});