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
          <Text style={styles.pseudonym} numberOfLines={1} ellipsizeMode="tail">
            {trader.pseudonym}
          </Text>
          <Text style={styles.walletAddress} numberOfLines={1}>
            {trader.wallet_address.slice(0, 6)}…{trader.wallet_address.slice(-4)}
          </Text>
          <Text style={[styles.winRate, {
            color: trader.win_rate >= 60 ? Colors.success
                 : trader.win_rate >= 45 ? Colors.warning ?? '#FFD700'
                 : Colors.error,
          }]}>
            {trader.win_rate}% win rate
          </Text>
        </View>

        {/* PnL */}
        <View style={styles.pnlContainer}>
          <Text style={[styles.pnl, { color: pnlInfo.color }]} numberOfLines={1}>
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    minHeight: 64,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  rankContainer: {
    width: 28,
    alignItems: 'center',
    marginRight: 8,
  },
  rank: {
    fontSize: 20,
    fontWeight: '700',
  },
  avatarContainer: {
    marginRight: 10,
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
    fontSize: 15,
    fontWeight: '700',
    color: Colors.background,
  },
  traderInfo: {
    flex: 1,
    marginRight: 8,
    minWidth: 0,
  },
  pseudonym: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 1,
  },
  walletAddress: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginBottom: 2,
  },
  winRate: {
    fontSize: 12,
    fontWeight: '500',
  },
  pnlContainer: {
    alignItems: 'flex-end',
    marginRight: 8,
    minWidth: 60,
  },
  pnl: {
    fontSize: 15,
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