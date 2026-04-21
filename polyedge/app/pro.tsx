import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function ProScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const proFeatures = [
    {
      icon: '🐋',
      title: 'Real-time whale feed',
      description: 'See whale trades as they happen with no delay',
    },
    {
      icon: '📊',
      title: 'Full trader leaderboard',
      description: 'Access complete rankings and trader profiles',
    },
    {
      icon: '🔔',
      title: 'Unlimited price alerts',
      description: 'Set as many alerts as you want on any market',
    },
    {
      icon: '📈',
      title: 'Advanced charts',
      description: 'Detailed probability charts with historical data',
    },
    {
      icon: '👑',
      title: 'Pro badge',
      description: 'Show your Pro status to other traders',
    },
    {
      icon: '⚡',
      title: 'Priority support',
      description: 'Get help faster from our support team',
    },
  ];
  
  const handleStartTrial = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      
      Alert.alert(
        'Coming Soon',
        'Stripe integration will be added soon. For now, enjoy a simulated Pro experience!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    }, 1500);
  };
  
  const handleRestorePurchase = () => {
    Alert.alert(
      'Restore Purchase',
      'This feature will be available when Stripe is integrated.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerTitleText}>PolyEdge Pro</Text>
        </View>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.sparkleContainer}>
            <Ionicons name="sparkles" size={48} color={Colors.accent} />
          </View>
          <Text style={styles.heroTitle}>Upgrade to Pro</Text>
          <Text style={styles.heroSubtitle}>
            Get the complete Polymarket analytics experience
          </Text>
        </View>
        
        {/* Features Grid */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Pro Features</Text>
          <View style={styles.featuresGrid}>
            {proFeatures.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Pricing Section */}
        <View style={styles.pricingSection}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>
          
          <View style={styles.pricingCards}>
            {/* Monthly Plan */}
            <TouchableOpacity 
              style={[
                styles.pricingCard,
                selectedPlan === 'monthly' && styles.selectedPricingCard
              ]}
              onPress={() => setSelectedPlan('monthly')}
            >
              <View style={styles.pricingCardHeader}>
                <Text style={styles.pricingPlan}>Monthly</Text>
                {selectedPlan === 'monthly' && (
                  <View style={styles.selectedBadge}>
                    <Ionicons name="checkmark" size={16} color={Colors.background} />
                  </View>
                )}
              </View>
              <Text style={styles.pricingPrice}>€9.99</Text>
              <Text style={styles.pricingPeriod}>per month</Text>
              <Text style={styles.pricingDescription}>
                Flexible monthly billing
              </Text>
            </TouchableOpacity>
            
            {/* Yearly Plan */}
            <TouchableOpacity 
              style={[
                styles.pricingCard,
                selectedPlan === 'yearly' && styles.selectedPricingCard,
                styles.yearlyCard,
              ]}
              onPress={() => setSelectedPlan('yearly')}
            >
              <View style={styles.pricingCardHeader}>
                <Text style={styles.pricingPlan}>Yearly</Text>
                <View style={styles.saveBadge}>
                  <Text style={styles.saveBadgeText}>Save 33%</Text>
                </View>
                {selectedPlan === 'yearly' && (
                  <View style={styles.selectedBadge}>
                    <Ionicons name="checkmark" size={16} color={Colors.background} />
                  </View>
                )}
              </View>
              <Text style={styles.pricingPrice}>€79.99</Text>
              <Text style={styles.pricingPeriod}>per year</Text>
              <Text style={styles.pricingDescription}>
                Best value - equivalent to €6.67/month
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Trial Info */}
        <View style={styles.trialInfo}>
          <Ionicons name="time-outline" size={20} color={Colors.accent} />
          <Text style={styles.trialInfoText}>
            Start your 7-day free trial. Cancel anytime.
          </Text>
        </View>
        
        {/* Legal Text */}
        <Text style={styles.legalText}>
          Subscription auto-renews. Cancel anytime. By subscribing, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </ScrollView>
      
      {/* CTA Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[styles.ctaButton, isProcessing && styles.ctaButtonDisabled]}
          onPress={handleStartTrial}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Ionicons name="time" size={20} color={Colors.background} />
              <Text style={styles.ctaButtonText}>Processing...</Text>
            </>
          ) : (
            <>
              <Ionicons name="flash" size={20} color={Colors.background} />
              <Text style={styles.ctaButtonText}>Start 7-Day Free Trial</Text>
            </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.restoreButton}
          onPress={handleRestorePurchase}
        >
          <Text style={styles.restoreButtonText}>Restore Purchase</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  headerRight: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  heroSection: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sparkleContainer: {
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.accent,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  featuresSection: {
    padding: 24,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  featureCard: {
    width: '48%',
    backgroundColor: Colors.elevated,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  pricingSection: {
    padding: 24,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pricingCards: {
    gap: 16,
  },
  pricingCard: {
    backgroundColor: Colors.elevated,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  selectedPricingCard: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '10',
  },
  yearlyCard: {
    borderColor: Colors.accent,
  },
  pricingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pricingPlan: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  saveBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  saveBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.background,
  },
  selectedBadge: {
    backgroundColor: Colors.accent,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pricingPrice: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  pricingPeriod: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  pricingDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  trialInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: Colors.accent + '10',
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.accent + '30',
  },
  trialInfoText: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '500',
  },
  legalText: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 32,
    paddingTop: 16,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
  ctaButton: {
    backgroundColor: Colors.accent,
    width: '100%',
    paddingVertical: 18,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  ctaButtonDisabled: {
    opacity: 0.7,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.background,
  },
  restoreButton: {
    padding: 12,
  },
  restoreButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});