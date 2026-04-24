import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/Colors';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';

interface ProGateProps {
  children: ReactNode;
  featureName?: string;
  showGate?: boolean;
}

export function ProGate({ children, featureName = 'this feature', showGate = true }: ProGateProps) {
  const router = useRouter();
  
  // For now, hardcode to false (not pro)
  // In production, this would come from useSubscription hook
  const isPro = false;
  
  if (isPro || !showGate) {
    return <>{children}</>;
  }
  
  return (
    <View style={styles.container}>
      {children}
      
      <BlurView intensity={20} style={styles.blurOverlay}>
        <View style={styles.gateContent}>
          <Text style={styles.gateTitle}>Pro Feature</Text>
          <Text style={styles.gateDescription}>
            {featureName} is available with PolyEdge Pro
          </Text>
          <TouchableOpacity 
            style={styles.goProButton}
            onPress={() => router.push('/pro')}
          >
            <Text style={styles.goProButtonText}>Go Pro</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  gateContent: {
    backgroundColor: 'rgba(26, 26, 46, 0.9)',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.accent + '30',
    margin: 16,
  },
  gateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.accent,
    marginBottom: 8,
  },
  gateDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  goProButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  goProButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.background,
  },
});