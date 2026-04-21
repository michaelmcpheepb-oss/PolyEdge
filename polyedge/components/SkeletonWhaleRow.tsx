import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

interface SkeletonWhaleRowProps {
  compact?: boolean;
}

export function SkeletonWhaleRow({ compact = false }: SkeletonWhaleRowProps) {
  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatarSkeleton} />
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.traderNameSkeleton} />
          <View style={styles.amountSkeleton} />
        </View>
        
        <View style={styles.marketQuestionSkeleton} />
        <View style={styles.marketQuestionSkeletonShort} />
        
        <View style={styles.footer}>
          <View style={styles.outcomeSkeleton} />
          <View style={styles.timeSkeleton} />
        </View>
      </View>
      
      <View style={styles.chevronSkeleton} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  compactContainer: {
    padding: 8,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatarSkeleton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.elevated,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  traderNameSkeleton: {
    width: 80,
    height: 16,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
  },
  amountSkeleton: {
    width: 60,
    height: 16,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
  },
  marketQuestionSkeleton: {
    width: '100%',
    height: 14,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
    marginBottom: 4,
  },
  marketQuestionSkeletonShort: {
    width: '70%',
    height: 14,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  outcomeSkeleton: {
    width: 60,
    height: 20,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
  },
  timeSkeleton: {
    width: 40,
    height: 14,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
  },
  chevronSkeleton: {
    width: 20,
    height: 20,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
    marginLeft: 8,
  },
});