import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors } from '../constants/Colors';

export function SkeletonWhaleRow() {
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
    <Animated.View style={[styles.container, { opacity: pulseAnim }]}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <View style={styles.avatarSkeleton} />
          
          <View style={styles.tradeInfo}>
            <View style={styles.traderNameSkeleton} />
            <View style={styles.marketQuestionSkeleton} />
            <View style={styles.tradeTypeSkeleton} />
          </View>
        </View>
        
        <View style={styles.rightSection}>
          <View style={styles.amountSkeleton} />
          <View style={styles.timeAgoSkeleton} />
        </View>
      </View>
    </Animated.View>
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
  avatarSkeleton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.elevated,
    marginRight: 12,
  },
  tradeInfo: {
    flex: 1,
  },
  traderNameSkeleton: {
    width: '60%',
    height: 16,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
    marginBottom: 4,
  },
  marketQuestionSkeleton: {
    width: '80%',
    height: 14,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
    marginBottom: 4,
  },
  tradeTypeSkeleton: {
    width: '40%',
    height: 12,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amountSkeleton: {
    width: 80,
    height: 18,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
    marginBottom: 4,
  },
  timeAgoSkeleton: {
    width: 60,
    height: 12,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
  },
});