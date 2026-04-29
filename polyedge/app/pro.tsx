import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'react-native';
import { Images } from '../constants/Images';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { openStripeCheckout } from '../services/stripe-new';
import { useSubscription, useIsPro } from '../hooks/useSubscription';
import { useUserStore } from '../stores/useUserStore';
import { getMonetisationConfig, type MonetisationConfig } from '../services/geoMonetisation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FEATURES = [
  { icon: '✦', color: '#00D4AA', title: '5 AI picks every morning', limit: 'vs 3 free' },
  { icon: '🐋', color: '#00D4AA', title: 'Real-time whale trade feed', limit: 'vs 1hr delay' },
  { icon: '🏆', color: '#00D4AA', title: 'Full Top 50 trader leaderboard', limit: 'vs Top 5 only' },
  { icon: '🔔', color: '#00D4AA', title: 'Unlimited price alerts', limit: 'vs 3 max' },
  { icon: '⚡', color: '#F5A623', title: 'Unlimited AI market analysis', limit: 'vs 3/day' },
  { icon: '🚫', color: '#FF6B6B', title: 'No interstitial ads', limit: 'Ad-free' },
];

export default function ProScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'monthly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [geoConfig, setGeoConfig] = useState<MonetisationConfig | null>(null);
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getMonetisationConfig().then(setGeoConfig).catch(() => {});
  }, []);

  // Glow animation loop
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [glowAnim]);

  const { isLoading } = useSubscription();
  const isPro = useIsPro();

  const handleStartTrial = async () => {
    if (isPro) {
      Alert.alert('Already Pro', 'You already have an active Pro subscription!');
      return;
    }

    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to start your free trial.');
      return;
    }

    setIsProcessing(true);
    try {
      await openStripeCheckout(selectedPlan, user.id);
      Alert.alert(
        'Checkout Started',
        'Complete your purchase in the browser window that opened.',
        [{ text: 'OK', onPress: () => console.log('Checkout started') }],
      );
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.', [{ text: 'OK' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestorePurchase = () => {
    Alert.alert(
      'Checking subscription...',
      'Please wait while we check your subscription status.',
      [{ text: 'OK' }],
    );
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  // ── Loading state ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Already Pro state ──────────────────────────────────────────
  if (isPro) {
    return (
      <LinearGradient colors={['#08080F', '#0F0F1A', '#08080F']} style={styles.container}>
        <SafeAreaView edges={['top']} style={{ flex: 1 }}>
          {/* Close */}
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#7A7A9A" />
          </TouchableOpacity>

          <View style={styles.proActiveSection}>
            <View style={styles.proBadge}>
              <Ionicons name="sparkles" size={48} color="#00D4AA" />
            </View>
            <Text style={styles.proActiveTitle}>You're a Pro! 🎉</Text>
            <Text style={styles.proActiveSubtitle}>Thank you for subscribing to PolyEdge Pro</Text>

            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureRowPro}>
                <Text style={[styles.featureIconPro, { color: f.color }]}>{f.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureTitlePro}>{f.title}</Text>
                </View>
                <Ionicons name="checkmark-circle" size={20} color="#00D4AA" />
              </View>
            ))}

            <TouchableOpacity style={styles.manageBtn} onPress={() => Alert.alert('Manage Subscription', 'Manage via customer portal.')}>
              <Text style={styles.manageBtnText}>Manage Subscription</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ── Tier 3 — PolyEdge is free in your region ───────────────────
  if (geoConfig?.tier === 3) {
    return (
      <LinearGradient colors={['#08080F', '#0F0F1A', '#08080F']} style={styles.container}>
        <SafeAreaView edges={['top']} style={{ flex: 1 }}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#7A7A9A" />
          </TouchableOpacity>

          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
            <Text style={{ fontSize: 72, marginBottom: 16 }}>✅</Text>
            <Text style={styles.freeTitle}>PolyEdge is free in your region</Text>
            <Text style={styles.freeSubtitle}>
              Enjoy unlimited AI analyses.{'\n'}We show brief ads to keep the service free.
            </Text>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
            >
              <Text style={styles.backBtnText}>Back to Markets</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ── Dynamic price ──────────────────────────────────────────────
  const monthlyPrice = geoConfig?.proPriceMonthly ?? '€9.99';
  const isTier2 = geoConfig?.tier === 2;
  const displayMonthlyPrice = isTier2 ? '€4.99' : monthlyPrice;

  return (
    <LinearGradient colors={['#08080F', '#0F0F1A', '#08080F']} style={styles.container}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        {/* Close */}
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#7A7A9A" />
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
        >
          {/* ── HERO ───────────────────────────────────────────── */}
          <View style={styles.heroSection}>
            {/* Hero image — Image component removes source on error so it falls back gracefully */}
            <View style={styles.heroCard}>
              <Image
                source={Images.heroPaywall}
                style={styles.heroCardImage}
                resizeMode="cover"
              />
              <Animated.View style={[styles.glowRing, { opacity: glowOpacity }]} />
              <Text style={styles.heroEmoji}>🔮</Text>
            </View>

            <Text style={styles.heroTitle}>Unlock PolyEdge Pro</Text>
            <Text style={styles.heroSubtitle}>
              The smartest money on Polymarket.{'\n'}Now in your pocket.
            </Text>
          </View>

          {/* ── FEATURES LIST ──────────────────────────────────── */}
          <View style={styles.featuresSection}>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Text style={[styles.featureIcon, { color: f.color }]}>{f.icon}</Text>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureLimit}>{f.limit}</Text>
              </View>
            ))}
          </View>

          {/* ── PRICING TOGGLE ──────────────────────────────────── */}
          <View style={styles.pricingSection}>
            <View style={styles.pricingToggle}>
              {/* Weekly */}
              <TouchableOpacity
                style={[
                  styles.pricingPill,
                  selectedPlan === 'weekly' && styles.pricingPillSelected,
                ]}
                onPress={() => setSelectedPlan('weekly')}
              >
                <Text style={[styles.pillLabel, selectedPlan === 'weekly' && styles.pillLabelSelected]}>
                  Weekly
                </Text>
              </TouchableOpacity>

              {/* Monthly */}
              <TouchableOpacity
                style={[
                  styles.pricingPill,
                  selectedPlan === 'monthly' && styles.pricingPillSelected,
                ]}
                onPress={() => setSelectedPlan('monthly')}
              >
                {selectedPlan !== 'monthly' && (
                  <View style={styles.bestValueBadge}>
                    <Text style={styles.bestValueText}>BEST VALUE</Text>
                  </View>
                )}
                <Text style={[styles.pillLabel, selectedPlan === 'monthly' && styles.pillLabelSelected]}>
                  Monthly
                </Text>
              </TouchableOpacity>
            </View>

            {/* Price Display */}
            <View style={styles.priceDisplay}>
              {selectedPlan === 'weekly' ? (
                <>
                  <Text style={styles.priceAmount}>€2.50</Text>
                  <Text style={styles.pricePeriod}>/ week</Text>
                </>
              ) : (
                <>
                  <Text style={styles.priceAmount}>{displayMonthlyPrice}</Text>
                  <Text style={styles.pricePeriod}>/ month</Text>
                </>
              )}
            </View>
            <Text style={styles.priceNote}>
              {selectedPlan === 'weekly' ? 'Cancel anytime' : 'Save 20% vs weekly'}
            </Text>
          </View>

          {/* ── CTA ─────────────────────────────────────────────── */}
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={handleStartTrial}
            disabled={isProcessing}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#00D4AA', '#0099CC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaText}>
                {isProcessing ? 'Processing...' : 'Start 7-Day Free Trial'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.ctaSub}>
            Then {displayMonthlyPrice}/month · Cancel anytime
          </Text>

          {/* ── TRUST ROW ───────────────────────────────────────── */}
          <View style={styles.trustRow}>
            <View style={styles.trustItem}>
              <Text style={styles.trustIcon}>🔒</Text>
              <Text style={styles.trustLabel}>Secure payment</Text>
            </View>
            <View style={styles.trustItem}>
              <Text style={styles.trustIcon}>⭐</Text>
              <Text style={styles.trustLabel}>Cancel anytime</Text>
            </View>
            <View style={styles.trustItem}>
              <Text style={styles.trustIcon}>💳</Text>
              <Text style={styles.trustLabel}>No hidden fees</Text>
            </View>
          </View>

          {/* ── RESTORE ─────────────────────────────────────────── */}
          <TouchableOpacity onPress={handleRestorePurchase} style={styles.restoreBtn}>
            <Text style={styles.restoreText}>Restore purchase</Text>
          </TouchableOpacity>

          {/* ── LEGAL ───────────────────────────────────────────── */}
          <Text style={styles.legalText}>
            Payment processed by Stripe. Subscription auto-renews monthly. Cancel anytime in Profile settings.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ══════════════════════════════════════════════════════════════════
//  STYLES
// ══════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 8 : 12,
    right: 16,
    zIndex: 100,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#08080F',
  },
  loadingText: {
    fontSize: 16,
    color: '#A0A0B8',
  },
  scrollContent: {
    paddingBottom: 60,
  },

  // ── Hero ──
  heroSection: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  heroCard: {
    width: SCREEN_WIDTH - 48,
    height: 200,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 24,
    backgroundColor: '#1A1A2E',
  },
  heroCardImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  glowRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(0, 212, 170, 0.15)',
  },
  heroEmoji: {
    fontSize: 80,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#A0A0B8',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 8,
  },

  // ── Features ──
  featuresSection: {
    marginHorizontal: 24,
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: '#161625',
    overflow: 'hidden',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A45',
  },
  featureIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  featureTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  featureLimit: {
    fontSize: 13,
    color: '#7A7A9A',
  },

  // ── Pricing ──
  pricingSection: {
    marginHorizontal: 24,
    marginTop: 24,
    alignItems: 'center',
  },
  pricingToggle: {
    flexDirection: 'row',
    backgroundColor: '#161625',
    borderRadius: 12,
    padding: 4,
  },
  pricingPill: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#161625',
  },
  pricingPillSelected: {
    backgroundColor: '#00D4AA',
  },
  pillLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#7A7A9A',
  },
  pillLabelSelected: {
    color: '#08080F',
  },
  bestValueBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: '#00D4AA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  bestValueText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#08080F',
  },
  priceDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 20,
  },
  priceAmount: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  pricePeriod: {
    fontSize: 16,
    color: '#A0A0B8',
    marginLeft: 4,
  },
  priceNote: {
    fontSize: 13,
    color: '#7A7A9A',
    marginTop: 6,
  },

  // ── CTA ──
  ctaBtn: {
    marginHorizontal: 24,
    marginTop: 20,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
  },
  ctaGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#08080F',
  },
  ctaSub: {
    fontSize: 12,
    color: '#7A7A9A',
    textAlign: 'center',
    marginTop: 8,
  },

  // ── Trust Row ──
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 20,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trustIcon: {
    fontSize: 11,
  },
  trustLabel: {
    fontSize: 11,
    color: '#7A7A9A',
  },

  // ── Restore ──
  restoreBtn: {
    marginTop: 12,
    padding: 12,
  },
  restoreText: {
    fontSize: 12,
    color: '#00D4AA',
    textDecorationLine: 'underline',
    textAlign: 'center',
  },

  // ── Legal ──
  legalText: {
    fontSize: 10,
    color: '#404058',
    textAlign: 'center',
    marginHorizontal: 32,
    marginTop: 12,
    lineHeight: 14,
  },

  // ── Already Pro ──
  proActiveSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  proBadge: {
    marginBottom: 16,
  },
  proActiveTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#00D4AA',
    marginBottom: 8,
  },
  proActiveSubtitle: {
    fontSize: 15,
    color: '#A0A0B8',
    textAlign: 'center',
    marginBottom: 24,
  },
  featureRowPro: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161625',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    width: '100%',
  },
  featureIconPro: {
    fontSize: 18,
    marginRight: 12,
  },
  featureTitlePro: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  manageBtn: {
    backgroundColor: '#00D4AA',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 24,
  },
  manageBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#08080F',
  },

  // ── Free region ──
  freeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  freeSubtitle: {
    fontSize: 15,
    color: '#A0A0B8',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 12,
  },
  backBtn: {
    marginTop: 24,
    backgroundColor: '#00D4AA',
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#08080F',
  },
});
