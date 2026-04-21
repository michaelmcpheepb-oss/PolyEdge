import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WhaleTrade } from '../types';
import { Colors } from '../constants/Colors';
import { formatDistanceToNow } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

interface WhaleTradeRowProps {
  trade: WhaleTrade;
  onPress?: () => void;
  isPro?: boolean;
  showTimeAgo?: boolean;
}

export function WhaleTradeRow({ 
  trade, 
  onPress, 
  isPro = false,
  showTimeAgo = true 
}: WhaleTradeRowProps) {
  const getTradeColor = () => {
    if (trade.outcome === 'YES' && trade.side === 'BUY') return Colors.success;
    if (trade.outcome === 'NO' && trade.side === 'SELL') return Colors.success;
    if (trade.outcome === 'YES' && trade.side === 'SELL') return Colors.error;
    if (trade.outcome === 'NO' && trade.side === 'BUY') return Colors.error;
    return Colors.textPrimary;
  };

  const getTradeIcon = () => {
    if (trade.outcome === 'YES' && trade.side === 'BUY') return 'arrow-up';
    if (trade.outcome === 'NO' && trade.side === 'SELL') return 'arrow-up';
    if (trade.outcome === 'YES' && trade.side === 'SELL') return 'arrow-down';
    if (trade.outcome === 'NO' && trade.side === 'BUY') return 'arrow-down';
    return 'swap-horizontal';
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

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    if (diffMs < 60000) { // Less than 1 minute
      return 'just now';
    }
    
    if (diffMs < 3600000) { // Less than 1 hour
      const minutes = Math.floor(diffMs / 60000);
      return `${minutes}m ago`;
    }
    
    if (diffMs < 86400000) { // Less than 1 day
      const hours = Math.floor(diffMs / 3600000);
      return `${hours}h ago`;
    }
    
    const days = Math.floor(diffMs / 86400000);
    return `${days}d ago`;
  };

  const getTraderInitials = (pseudonym: string) => {
    return pseudonym
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const Content = (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getTraderInitials(trade.trader_pseudonym)}
          </Text>
        </View>
        {isPro && (
          <View style={styles.proBadge}>
            <Ionicons name="diamond" size={8} color={Colors.accent} />
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.traderName} numberOfLines={1}>
            {trade.trader_pseudonym}
          </Text>
          <View style={styles.tradeInfo}>
            <Ionicons 
              name={getTradeIcon() as any} 
              size={16} 
              color={getTradeColor()} 
              style={styles.tradeIcon}
            />
            <Text style={[styles.amount, { color: getTradeColor() }]}>
              {formatCurrency(trade.amount_usd)}
            </Text>
          </View>
        </View>
        
        <Text style={styles.marketQuestion} numberOfLines={2}>
          {trade.market_question}
        </Text>
        
        <View style={styles.footer}>
          <View style={styles.outcomeContainer}>
            <Text style={styles.outcomeLabel}>Outcome:</Text>
            <Text style={[
              styles.outcome, 
              trade.outcome === 'YES' ? styles.outcomeYes : styles.outcomeNo
            ]}>
              {trade.outcome}
            </Text>
          </View>
          
          {showTimeAgo && (
            <Text style={styles.timeAgo}>
              {formatTimeAgo(trade.timestamp)}
            </Text>
          )}
        </View>
      </View>
      
      {onPress && (
        <TouchableOpacity style={styles.chevronButton} onPress={onPress}>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity 
        style={styles.touchableContainer} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        {Content}
      </TouchableOpacity>
    );
  }

  return Content;
}

const styles = StyleSheet.create({
  touchableContainer: {
    marginBottom: 8,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  proBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  traderName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  tradeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tradeIcon: {
    marginRight: 4,
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
  },
  marketQuestion: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  outcomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  outcomeLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginRight: 4,
  },
  outcome: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  outcomeYes: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    color: Colors.success,
  },
  outcomeNo: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: Colors.error,
  },
  timeAgo: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  chevronButton: {
    padding: 4,
    marginLeft: 8,
  },
});