// VideoSnap — Landing Screen
import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native'
import { router } from 'expo-router'
import { Colors, Fonts, Spacing, BorderRadius } from '../lib/theme'

const { width, height } = Dimensions.get('window')

export default function LandingScreen() {
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  if (!showContent) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.logoShadow}>VideoSnap</Text>
          <Text style={styles.logo}>VideoSnap</Text>
          <Text style={styles.tagline}>Photos come alive.</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>🎬</Text>
        <Text style={styles.heroTitle}>Turn photos into{'\n'}cinematic videos</Text>
        <Text style={styles.heroSubtitle}>
          One tap. AI-powered. Ready to share.
        </Text>
      </View>

      {/* Feature Cards */}
      <View style={styles.features}>
        <FeatureItem emoji="📸" text="Upload any photo" />
        <FeatureItem emoji="🎨" text="Pick a cinematic style" />
        <FeatureItem emoji="⚡" text="AI creates 5s video" />
        <FeatureItem emoji="📱" text="Download & share" />
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Pressable
          style={styles.primaryBtn}
          onPress={() => router.push('/generate')}
        >
          <Text style={styles.primaryBtnText}>Try It Free →</Text>
        </Pressable>
        <Pressable
          style={styles.secondaryBtn}
          onPress={() => router.push('/paywall')}
        >
          <Text style={styles.secondaryBtnText}>See Pricing</Text>
        </Pressable>
      </View>

      <Text style={styles.footer}>3 free videos • No watermark</Text>
    </View>
  )
}

function FeatureItem({ emoji, text }: { emoji: string; text: string }) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.featureEmoji}>{emoji}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
  },
  logo: {
    fontSize: Fonts.sizes['5xl'],
    fontWeight: Fonts.weights.bold,
    color: Colors.accent,
    letterSpacing: 3,
    position: 'absolute',
  },
  logoShadow: {
    fontSize: Fonts.sizes['5xl'],
    fontWeight: Fonts.weights.bold,
    color: 'rgba(0,212,255,0.15)',
    letterSpacing: 3,
    transform: [{ translateY: 3 }],
  },
  tagline: {
    fontSize: Fonts.sizes.lg,
    color: Colors.textMuted,
    marginTop: Spacing.lg,
  },
  hero: {
    alignItems: 'center',
    marginBottom: Spacing['4xl'],
  },
  heroEmoji: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  heroTitle: {
    fontSize: Fonts.sizes['3xl'],
    fontWeight: Fonts.weights.bold,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 40,
  },
  heroSubtitle: {
    fontSize: Fonts.sizes.md,
    color: Colors.textMuted,
    marginTop: Spacing.md,
  },
  features: {
    gap: Spacing.lg,
    marginBottom: Spacing['4xl'],
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    backgroundColor: Colors.bgCard,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureEmoji: {
    fontSize: 24,
  },
  featureText: {
    fontSize: Fonts.sizes.base,
    color: Colors.text,
    fontWeight: Fonts.weights.medium,
  },
  actions: {
    gap: Spacing.md,
  },
  primaryBtn: {
    height: 56,
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semibold,
    color: '#000',
  },
  secondaryBtn: {
    height: 56,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryBtnText: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
    color: Colors.text,
  },
  footer: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: Fonts.sizes.sm,
    marginTop: Spacing.xl,
  },
})
