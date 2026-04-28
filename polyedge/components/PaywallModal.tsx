import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { MonetisationConfig } from '../services/geoMonetisation';

interface Props {
  visible: boolean;
  config: MonetisationConfig | null;
  onUpgrade: () => void;
  onPayPerUse: () => void;
  onClose: () => void;
}

const FEATURES = [
  'Unlimited AI analyses',
  'Real-time whale feed',
  'Full Top 50 leaderboard',
  'Unlimited price alerts',
];

export function PaywallModal({ visible, config, onUpgrade, onPayPerUse, onClose }: Props) {
  if (!config?.showPaywall) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>

          {/* Close */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color="#7A7A9A" />
          </TouchableOpacity>

          <Text style={styles.emoji}>🧠</Text>
          <Text style={styles.title}>Daily limit reached</Text>
          <Text style={styles.subtitle}>
            You've used all {config.dailyLimit} free analyses today.{'\n'}
            Upgrade for unlimited access or watch an ad.
          </Text>

          {/* Feature list */}
          <View style={styles.features}>
            {FEATURES.map((f) => (
              <View key={f} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={16} color="#00D4AA" />
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>

          {/* Pro CTA */}
          <TouchableOpacity onPress={onUpgrade} style={styles.proBtn} activeOpacity={0.85}>
            <LinearGradient
              colors={['#00D4AA', '#0099CC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.proBtnGradient}
            >
              <Text style={styles.proBtnText}>
                Upgrade to Pro — {config.proPriceMonthly}/month
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Pay per use */}
          <TouchableOpacity onPress={onPayPerUse} style={styles.payBtn} activeOpacity={0.7}>
            <Text style={styles.payBtnText}>Pay €0.50 for one analysis</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>Resets daily at midnight</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#161625',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 44,
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
    marginTop: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#A0A0B8',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 20,
  },
  features: {
    alignSelf: 'stretch',
    gap: 10,
    marginBottom: 4,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#C8C8D8',
  },
  proBtn: {
    alignSelf: 'stretch',
    marginTop: 24,
    borderRadius: 14,
    overflow: 'hidden',
  },
  proBtnGradient: {
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  proBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#08080F',
  },
  payBtn: {
    marginTop: 14,
    paddingVertical: 10,
  },
  payBtnText: {
    fontSize: 14,
    color: '#00D4AA',
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 11,
    color: '#7A7A9A',
    marginTop: 10,
  },
});
