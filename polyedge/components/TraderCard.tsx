import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Trader } from '../types';
import { Colors } from '../constants/Colors';
import { useRouter } from 'expo-router';

interface TraderCardProps {
  trader: Trader;
  rank: number;
  isFollowing?: boolean;
  onFollowToggle?: () => void;
}

export function TraderCard({ trader, rank, isFollowing = false, onFollowToggle }: TraderCardProps) {
  const router = useRouter();
  
  const getRankColor = () => {
    switch (rank) {
      case 1: return Colors.gold;
      case 2: return Colors.silver;
      case 3: return Colors.bronze;
      default: return Colors.textSecondary;
    }
  };
  
  const getRankEmoji = () => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${rank}`;
    }
  };
  
  const getTraderInitials = () => {
    if (trader.pseudonym) {
      const parts = trader.pseudonym.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return trader.pseudonym.substring(0, 2).toUpperCase();
    }
    return '??';
  };
  
  const formatPnL = (pnl: number) => {
    const sign = pnl >= 0 ? '+' : '';
    const color = pnl >= 0 ? Colors.success : Colors.error;
    const formatted = Math.abs(pnl) >= 1000 
      ? `$${(Math.abs(pnl) / 1000).toFixed(1)}K`
      : `$${Math.abs(pnl).toFixed(0)}`;
    
    return { formatted: `${sign}${formatted}`, color };
  };
  
  const handlePress = () => {
    router.push(`/trader/${trader.wallet_address}`);
  };
  
  const pnlInfo = formatPnL(trader.pnl_30d);
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Rank */}
        <View style={styles.rankContainer}>
          <Text style={[styles.rank, { color: getRankColor() }]}>
            {getRankEmoji()}
          </Text>
        </View>
        
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getTraderInitials()}</Text>
          </View>
        </View>
        
        {/* Trader Info */}
        <View style={styles.traderInfo}>
          <Text style={styles.pseudonym} numberOfLines={1}>
            {trader.pseudonym}
          </Text>
          <Text style={styles.walletAddress} numberOfLines={1}>
            {trader.wallet_address.slice(0, 6)}...{trader.wallet_address.slice(-4)}
          </Text>
          <View style={styles.statsRow}>
            <Text style={styles.winRate}>
              {trader.win_rate}% win rate
            </Text>
            <Text style={styles.totalTrades}>
              {trader.total_trades} trades
            </Text>
          </View>
        </View>
        
        {/* PnL */}
        <View style={styles.pnlContainer}>
          <Text style={[styles.pnl, { color: pnlInfo.color }]}>
            {pnlInfo.formatted}
          </Text>
          <Text style={styles.pnlLabel}>30d PnL</Text>
        </View>
        
        {/* Follow Button */}
        {onFollowToggle && (
          <TouchableOpacity 
            style={[styles.followButton, isFollowing && styles.followingButton]}
            onPress={(e) => {
              e.stopPropagation();
              onFollowToggle();
            }}
          >
            <Text style={[styles.followText, isFollowing && styles.followingText]}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        )}
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
    alignItems: 'center',
    padding: 16,
  },
  rankContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  rank: {
    fontSize: 20,
    fontWeight: '700',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.background,
  },
  traderInfo: {
    flex: 1,
    marginRight: 12,
  },
  pseudonym: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  walletAddress: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  winRate: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '500',
  },
  totalTrades: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  pnlContainer: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  pnl: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  pnlLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'transparent',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  followingButton: {
    backgroundColor: Colors.accent,
  },
  followText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.accent,
  },
  followingText: {
    color: Colors.background,
  },
});