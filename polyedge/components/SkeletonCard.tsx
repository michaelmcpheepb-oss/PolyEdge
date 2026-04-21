import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

interface SkeletonCardProps {
  compact?: boolean;
}

export function SkeletonCard({ compact = false }: SkeletonCardProps) {
  return (
    <View style={[styles.card, compact && styles.compactCard]}>
      <View style={styles.header}>
        <View style={styles.categorySkeleton} />
        <View style={styles.volumeSkeleton} />
      </View>
      
      <View style={styles.questionSkeleton} />
      <View style={styles.questionSkeletonShort} />
      
      <View style={styles.priceContainer}>
        <View style={styles.priceColumn}>
          <View style={styles.priceLabelSkeleton} />
          <View style={styles.priceSkeleton} />
        </View>
        
        <View style={styles.priceColumn}>
          <View style={styles.priceLabelSkeleton} />
          <View style={styles.priceSkeleton} />
        </View>
        
        <View style={styles.timeColumn}>
          <View style={styles.timeLabelSkeleton} />
          <View style={styles.timeSkeleton} />
        </View>
      </View>
      
      {!compact && (
        <View style={styles.descriptionSkeleton} />
      )}
      
      {!compact && (
        <View style={styles.footer}>
          <View style={styles.footerSkeleton} />
          <View style={styles.footerSkeletonShort} />
        </View>
      )}
    </View>
  );
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
  categorySkeleton: {
    width: 60,
    height: 24,
    backgroundColor: Colors.elevated,
    borderRadius: 16,
  },
  volumeSkeleton: {
    width: 80,
    height: 32,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
  },
  questionSkeleton: {
    width: '100%',
    height: 20,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
    marginBottom: 8,
  },
  questionSkeletonShort: {
    width: '70%',
    height: 20,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
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
  priceLabelSkeleton: {
    width: 30,
    height: 12,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
    marginBottom: 4,
  },
  priceSkeleton: {
    width: 50,
    height: 24,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
  },
  timeColumn: {
    alignItems: 'center',
    flex: 1,
  },
  timeLabelSkeleton: {
    width: 40,
    height: 12,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
    marginBottom: 4,
  },
  timeSkeleton: {
    width: 60,
    height: 20,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
  },
  descriptionSkeleton: {
    width: '100%',
    height: 40,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
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
  footerSkeleton: {
    width: 100,
    height: 12,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
  },
  footerSkeletonShort: {
    width: 80,
    height: 12,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
  },
});