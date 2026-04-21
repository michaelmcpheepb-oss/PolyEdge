import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { openStripeCheckout } from '../services/stripe-new';
import { useSubscription, useIsPro } from '../hooks/useSubscription';
import { useUserStore } from '../stores/useUserStore';

export default function ProScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'monthly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { data: subscription, isLoading } = useSubscription();
  const isPro = useIsPro();
  
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
      // Open Stripe checkout
      await openStripeCheckout(selectedPlan, user.id);
      
      // Show success message
      Alert.alert(
        'Checkout Started',
        'Complete your purchase in the browser window that opened.',
        [
          { 
            text: 'OK', 
            onPress: () => {
              // Subscription status will be refreshed automatically
              console.log('Checkout started');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert(
        'Error',
        'Something went wrong during checkout. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleRestorePurchase = () => {
    Alert.alert(
      'Restore Purchase',
      'This feature will be available when you set up your backend API.',
      [{ text: 'OK' }]
    );
  };
  
  if (isLoading) {
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
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (isPro) {
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
          <View style={styles.proActiveSection}>
            <View style={styles.proBadge}>
              <Ionicons name="sparkles" size={48} color={Colors.accent} />
            </View>
            <Text style={styles.proActiveTitle}>You're a Pro! 🎉</Text>
            <Text style={styles.proActiveSubtitle}>
              Thank you for subscribing to PolyEdge Pro
            </Text>
            
            <View style={styles.activeFeatures}>
              <Text style={styles.activeFeaturesTitle}>Your Pro Features:</Text>
              {proFeatures.map((feature, index) => (
                <View key={index} style={styles.activeFeatureItem}>
                  <Text style={styles.activeFeatureIcon}>{feature.icon}</Text>
                  <View style={styles.activeFeatureText}>
                    <Text style={styles.activeFeatureTitle}>{feature.title}</Text>
                    <Text style={styles.activeFeatureDescription}>{feature.description}</Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                </View>
              ))}
            </View>
            
            <TouchableOpacity 
              style={styles.manageSubscriptionButton}
              onPress={() => {
                Alert.alert(
                  'Manage Subscription',
                  'You can manage your subscription through the customer portal.',
                  [{ text: 'OK' }]
                );
              }}
            >
              <Text style={styles.manageSubscriptionText}>Manage Subscription</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

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
            {/* Weekly Plan */}
            <TouchableOpacity 
              style={[
                styles.pricingCard,
                selectedPlan === 'weekly' && styles.selectedPricingCard
              ]}
              onPress={() => setSelectedPlan('weekly')}
            >
              <View style={styles.pricingCardHeader}>
                <Text style={styles.pricingPlan}>Weekly</Text>
                <View style={styles.bestForBadge}>
                  <Text style={styles.bestForBadgeText}>Best for trying out</Text>
                </View>
                {selectedPlan === 'weekly' && (
                  <View style={styles.selectedBadge}>
                    <Ionicons name="checkmark" size={16} color={Colors.background} />
                  </View>
                )}
              </View>
              <Text style={styles.pricingPrice}>€2.50</Text>
              <Text style={styles.pricingPeriod}>/week</Text>
              <Text style={styles.pricingDescription}>
                Perfect for testing the waters
              </Text>
            </TouchableOpacity>
            
            {/* Monthly Plan */}
            <TouchableOpacity 
              style={[
                styles.pricingCard,
                selectedPlan === 'monthly' && styles.selectedPricingCard,
                styles.monthlyCard,
              ]}
              onPress={() => setSelectedPlan('monthly')}
            >
              <View style={styles.pricingCardHeader}>
                <Text style={styles.pricingPlan}>Monthly</Text>
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>Most Popular</Text>
                </View>
                {selectedPlan === 'monthly' && (
                  <View style={styles.selectedBadge}>
                    <Ionicons name="checkmark" size={16} color={Colors.background} />
                  </View>
                )}
              </View>
              <Text style={styles.pricingPrice}>€9.99</Text>
              <Text style={styles.pricingPeriod}>/month</Text>
              <Text style={styles.pricingDescription}>
                Best value for active traders
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Trial notes */}
          <View style={styles.trialNotes}>
            <View style={styles.trialNoteRow}>
              <Ionicons name="checkmark" size={16} color="#27AE60" />
              <Text style={styles.trialNoteText}>7-day free trial included</Text>
            </View>
            <View style={styles.trialNoteRow}>
              <Ionicons name="checkmark" size={16} color="#27AE60" />
              <Text style={styles.trialNoteText}>Cancel anytime</Text>
            </View>
            <View style={styles.trialNoteRow}>
              <Ionicons name="checkmark" size={16} color="#27AE60" />
              <Text style={styles.trialNoteText}>No commitment</Text>
            </View>
          </View>
        </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
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
  bestForBadge: {
    backgroundColor: Colors.elevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  bestForBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  popularBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  popularBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.background,
  },
  trialNotes: {
    marginTop: 16,
    gap: 8,
  },
  trialNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trialNoteText: {
    fontSize: 13,
    color: '#27AE60',
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
  monthlyCard: {
    borderColor: Colors.accent,
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
  proActiveSection: {
    alignItems: 'center',
    padding: 32,
  },
  proBadge: {
    marginBottom: 16,
  },
  proActiveTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.accent,
    marginBottom: 8,
  },
  proActiveSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  activeFeatures: {
    width: '100%',
    marginBottom: 32,
  },
  activeFeaturesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  activeFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.elevated,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeFeatureIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  activeFeatureText: {
    flex: 1,
  },
  activeFeatureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  activeFeatureDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  manageSubscriptionButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
  },
  manageSubscriptionText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.background,
  },
});