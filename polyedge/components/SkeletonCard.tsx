import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors } from '../constants/Colors';

interface SkeletonCardProps {
  compact?: boolean;
}

export function SkeletonCard({ compact = false }: SkeletonCardProps) {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    
    pulse.start();
    
    return () => {
      pulse.stop();
    };
  }, []);

  return (
    <Animated.View style={[styles.card, compact && styles.compactCard, { opacity: pulseAnim }]}>
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
          <View style={styles.changeSkeleton} />
        </View>
        
        <View style={styles.dividerSkeleton} />
        
        <View style={styles.priceColumn}>
          <View style={styles.priceLabelSkeleton} />
          <View style={styles.priceSkeleton} />
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
    width: 100,
    height: 42,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
    marginBottom: 4,
  },
  changeSkeleton: {
    width: 50,
    height: 14,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
  },
  dividerSkeleton: {
    width: 1,
    height: 60,
    backgroundColor: Colors.elevated,
    marginHorizontal: 16,
  },
  timeLabelSkeleton: {
    width: 40,
    height: 12,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
    marginTop: 8,
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