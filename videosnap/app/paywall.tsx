// VideoSnap — Paywall / Subscription Screen
import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from 'react-native'
import { router } from 'expo-router'
import { Colors, Fonts, Spacing, BorderRadius } from '../lib/theme'
import { PRICING, API_BASE_URL } from '../lib/constants'

const { width } = Dimensions.get('window')

export default function PaywallScreen() {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'pro'>('monthly')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubscribe() {
    setLoading(true)
    setError(null)

    try {
      const sessionStr = localStorage.getItem('videosnap_session')
      let authToken = ''
      if (sessionStr) {
        const session = JSON.parse(sessionStr)
        authToken = session.access_token
      }

      const response = await fetch(`${API_BASE_URL}/api/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          plan: selectedPlan,
          successUrl: window.location.origin + '/generate',
          cancelUrl: window.location.origin + '/paywall',
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create checkout')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else if (data.sessionUrl) {
        window.location.href = data.sessionUrl
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const plan = selectedPlan === 'monthly' ? PRICING.monthly : PRICING.pro

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Upgrade</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🎬</Text>
          <Text style={styles.heroTitle}>Unlock unlimited videos</Text>
          <Text style={styles.heroSubtitle}>
            Go beyond the 3 free videos. Full HD, all styles, priority processing.
          </Text>
        </View>

        {/* Plan Toggle */}
        <View style={styles.planToggle}>
          <Pressable
            style={[styles.planOption, selectedPlan === 'monthly' && styles.planOptionActive]}
            onPress={() => setSelectedPlan('monthly')}
          >
            <Text style={[styles.planOptionText, selectedPlan === 'monthly' && styles.planOptionTextActive]}>
              Monthly
            </Text>
          </Pressable>
          <Pressable
            style={[styles.planOption, selectedPlan === 'pro' && styles.planOptionActive]}
            onPress={() => setSelectedPlan('pro')}
          >
            <Text style={[styles.planOptionText, selectedPlan === 'pro' && styles.planOptionTextActive]}>
              Pro
            </Text>
          </Pressable>
        </View>

        {/* Price Card */}
        <View style={styles.priceCard}>
          <Text style={styles.price}>${plan.price}</Text>
          <Text style={styles.pricePeriod}>/month</Text>

          <View style={styles.featureList}>
            {plan.features.map((feature, i) => (
              <View key={i} style={styles.featureRow}>
                <Text style={styles.checkmark}>✅</Text>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          <Pressable
            style={[styles.subscribeBtn, loading && styles.subscribeBtnDisabled]}
            onPress={handleSubscribe}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <Text style={styles.subscribeText}>
                Subscribe — ${plan.price}/month
              </Text>
            )}
          </Pressable>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Text style={styles.cancelText}>Cancel anytime</Text>
        </View>

        {/* Compare Table */}
        <View style={styles.compareSection}>
          <Text style={styles.compareTitle}>Compare plans</Text>
          <View style={styles.compareRow}>
            <Text style={styles.compareLabel}>Free videos</Text>
            <Text style={styles.compareValue}>3/mo</Text>
          </View>
          <View style={styles.compareRow}>
            <Text style={styles.compareLabel}>Styles</Text>
            <Text style={styles.compareValue}>All styles</Text>
          </View>
          <View style={styles.compareRow}>
            <Text style={styles.compareLabel}>Resolution</Text>
            <Text style={styles.compareValue}>HD</Text>
          </View>
          <View style={styles.compareRow}>
            <Text style={styles.compareLabel}>Priority</Text>
            <Text style={styles.compareValue}>Pro: Highest</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: 54,
    paddingBottom: Spacing.md,
  },
  backBtn: { width: 40 },
  backText: { fontSize: 24, color: Colors.text },
  headerTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: Colors.text,
  },
  headerRight: { width: 40 },
  scroll: {
    padding: Spacing.xl,
  },
  hero: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  heroEmoji: { fontSize: 48, marginBottom: Spacing.md },
  heroTitle: {
    fontSize: Fonts.sizes['2xl'],
    fontWeight: Fonts.weights.bold,
    color: Colors.text,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: Fonts.sizes.base,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 22,
  },
  planToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.full,
    padding: 4,
    marginBottom: Spacing['2xl'],
  },
  planOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
  },
  planOptionActive: {
    backgroundColor: Colors.accent,
  },
  planOptionText: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.medium,
    color: Colors.textMuted,
  },
  planOptionTextActive: {
    color: '#000',
    fontWeight: Fonts.weights.semibold,
  },
  priceCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.xl,
    padding: Spacing['2xl'],
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing['2xl'],
  },
  price: {
    fontSize: Fonts.sizes['4xl'],
    fontWeight: Fonts.weights.bold,
    color: Colors.text,
  },
  pricePeriod: {
    fontSize: Fonts.sizes.base,
    color: Colors.textMuted,
    marginBottom: Spacing['2xl'],
  },
  featureList: {
    gap: Spacing.md,
    marginBottom: Spacing['2xl'],
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  checkmark: { fontSize: 16 },
  featureText: {
    fontSize: Fonts.sizes.base,
    color: Colors.text,
  },
  subscribeBtn: {
    height: 54,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subscribeBtnDisabled: { opacity: 0.6 },
  subscribeText: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    color: '#000',
  },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  errorText: {
    color: Colors.error,
    fontSize: Fonts.sizes.sm,
  },
  cancelText: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: Fonts.sizes.sm,
    marginTop: Spacing.md,
  },
  compareSection: {
    gap: Spacing.md,
  },
  compareTitle: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.semibold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  compareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  compareLabel: {
    fontSize: Fonts.sizes.base,
    color: Colors.textMuted,
  },
  compareValue: {
    fontSize: Fonts.sizes.base,
    color: Colors.text,
    fontWeight: Fonts.weights.medium,
  },
})
