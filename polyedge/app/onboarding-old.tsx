import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'sports', label: 'Sports', icon: '🏈' },
  { id: 'politics', label: 'Politics', icon: '🏛️' },
  { id: 'crypto', label: 'Crypto', icon: '₿' },
  { id: 'science', label: 'Science', icon: '🔬' },
  { id: 'world_events', label: 'World Events', icon: '🌍' },
  { id: 'economics', label: 'Economics', icon: '📈' },
];

const WHALE_THRESHOLDS = [
  { value: 1000, label: '$1K' },
  { value: 5000, label: '$5K' },
  { value: 10000, label: '$10K' },
  { value: 25000, label: '$25K' },
  { value: 50000, label: '$50K' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [whaleThreshold, setWhaleThreshold] = useState(10000);
  const [isLoading, setIsLoading] = useState(false);
  
  // For now, use mock user ID - in production, get from auth
  const userId = 'user_mock_id';
  
  const steps = [
    {
      title: 'Welcome to PolyEdge',
      description: 'Your personal Polymarket analytics companion',
      component: (
        <View style={styles.stepContent}>
          <View style={styles.welcomeIcon}>
            <Ionicons name="analytics" size={80} color={Colors.accent} />
          </View>
          <Text style={styles.stepTitle}>Track Markets Like a Pro</Text>
          <Text style={styles.stepDescription}>
            Get real-time insights on Polymarket predictions, whale trades, and trader performance.
          </Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="flash" size={24} color={Colors.accent} />
              <Text style={styles.featureText}>Real-time market data</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="trending-up" size={24} color={Colors.accent} />
              <Text style={styles.featureText}>Whale trade alerts</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="trophy" size={24} color={Colors.accent} />
              <Text style={styles.featureText}>Trader leaderboards</Text>
            </View>
          </View>
        </View>
      ),
    },
    {
      title: 'Choose Your Interests',
      description: 'Select categories you want to focus on',
      component: (
        <View style={styles.stepContent}>
          <Text style={styles.categoryTitle}>Market Categories</Text>
          <Text style={styles.categorySubtitle}>
            Select one or more categories to personalize your feed
          </Text>
          
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategories.includes(category.id);
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    isSelected && styles.selectedCategoryCard,
                  ]}
                  onPress={() => {
                    if (isSelected) {
                      setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                    } else {
                      setSelectedCategories([...selectedCategories, category.id]);
                    }
                  }}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text style={[
                    styles.categoryLabel,
                    isSelected && styles.selectedCategoryLabel,
                  ]}>
                    {category.label}
                  </Text>
                  {isSelected && (
                    <View style={styles.selectedBadge}>
                      <Ionicons name="checkmark" size={16} color={Colors.background} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          
          <Text style={[styles.categoryTitle, { marginTop: 32 }]}>
            Whale Trade Threshold
          </Text>
          <Text style={styles.categorySubtitle}>
            Minimum trade size to show in Whale Feed
          </Text>
          
          <View style={styles.thresholdContainer}>
            {WHALE_THRESHOLDS.map((threshold) => (
              <TouchableOpacity
                key={threshold.value}
                style={[
                  styles.thresholdChip,
                  whaleThreshold === threshold.value && styles.selectedThresholdChip,
                ]}
                onPress={() => setWhaleThreshold(threshold.value)}
              >
                <Text style={[
                  styles.thresholdText,
                  whaleThreshold === threshold.value && styles.selectedThresholdText,
                ]}>
                  {threshold.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.thresholdNote}>
            Trades below ${whaleThreshold.toLocaleString()} will be hidden from Whale Feed
          </Text>
        </View>
      ),
    },
    {
      title: 'You\'re All Set!',
      description: 'Start exploring Polymarket like a pro',
      component: (
        <View style={styles.stepContent}>
          <View style={styles.completionIcon}>
            <Ionicons name="checkmark-circle" size={100} color={Colors.accent} />
          </View>
          <Text style={styles.completionTitle}>Ready to Go!</Text>
          <Text style={styles.completionDescription}>
            Your PolyEdge experience is now personalized based on your preferences.
          </Text>
          
          <View style={styles.preferencesSummary}>
            <Text style={styles.summaryTitle}>Your Preferences:</Text>
            
            {selectedCategories.length > 0 ? (
              <View style={styles.summarySection}>
                <Text style={styles.summaryLabel}>Categories:</Text>
                <View style={styles.summaryChips}>
                  {selectedCategories.map(categoryId => {
                    const category = CATEGORIES.find(c => c.id === categoryId);
                    return (
                      <View key={categoryId} style={styles.summaryChip}>
                        <Text style={styles.summaryChipText}>{category?.label}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : (
              <View style={styles.summarySection}>
                <Text style={styles.summaryLabel}>Categories:</Text>
                <Text style={styles.summaryValue}>All categories</Text>
              </View>
            )}
            
            <View style={styles.summarySection}>
              <Text style={styles.summaryLabel}>Whale Threshold:</Text>
              <Text style={styles.summaryValue}>${whaleThreshold.toLocaleString()}+</Text>
            </View>
          </View>
          
          <Text style={styles.completionNote}>
            You can change these preferences anytime from the filter icon in the feed.
          </Text>
        </View>
      ),
    },
  ];
  
  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save preferences and finish onboarding
      await savePreferences();
      router.back();
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };
  
  const savePreferences = async () => {
    setIsLoading(true);
    
    try {
      // Save to Supabase user_preferences table
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          categories: selectedCategories,
          whale_threshold: whaleThreshold,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      
      if (error) {
        console.error('Error saving preferences:', error);
        // Continue anyway - preferences will be saved locally
      }
      
      console.log('Preferences saved:', { selectedCategories, whaleThreshold });
      
      // Also save to local storage for immediate use
      // (We'll implement this in the feed screens)
      
    } catch (error) {
      console.error('Error in savePreferences:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const currentStepData = steps[currentStep];
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons 
            name={currentStep === 0 ? "close" : "arrow-back"} 
            size={24} 
            color={Colors.textPrimary} 
          />
        </TouchableOpacity>
        
        <View style={styles.progressBar}>
          {steps.map((_, index) => (
            <View 
              key={index}
              style={[
                styles.progressDot,
                index <= currentStep && styles.activeProgressDot,
              ]}
            />
          ))}
        </View>
        
        <View style={styles.headerRight}>
          <Text style={styles.stepCounter}>
            {currentStep + 1}/{steps.length}
          </Text>
        </View>
      </View>
      
      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.title}>{currentStepData.title}</Text>
        <Text style={styles.description}>{currentStepData.description}</Text>
        
        {currentStepData.component}
      </ScrollView>
      
      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.nextButton,
            isLoading && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={styles.nextButtonText}>Saving...</Text>
          ) : (
            <>
              <Text style={styles.nextButtonText}>
                {currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
              </Text>
              <Ionicons 
                name="arrow-forward" 
                size={20} 
                color={Colors.background} 
              />
            </>
          )}
        </TouchableOpacity>
        
        {currentStep === steps.length - 1 && (
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={() => router.back()}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 4,
    width: 40,
  },
  progressBar: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  activeProgressDot: {
    backgroundColor: Colors.accent,
    width: 24,
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  stepCounter: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 32,
    lineHeight: 22,
  },
  stepContent: {
    marginTop: 16,
  },
  welcomeIcon: {
    alignItems: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  featureList: {
    gap: 16,
    marginTop: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.elevated,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureText: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  categorySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  categoryCard: {
    width: (width - 72) / 3, // 3 columns with padding
    backgroundColor: Colors.elevated,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    position: 'relative',
  },
  selectedCategoryCard: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '10',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  selectedCategoryLabel: {
    color: Colors.accent,
    fontWeight: '700',
  },
  selectedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.accent,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  thresholdContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  thresholdChip: {
    backgroundColor: Colors.elevated,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  selectedThresholdChip: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  thresholdText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  selectedThresholdText: {
    color: Colors.background,
    fontWeight: '700',
  },
  thresholdNote: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  completionIcon: {
    alignItems: 'center',
    marginBottom: 24,
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.accent,
    textAlign: 'center',
    marginBottom: 12,
  },
  completionDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  preferencesSummary: {
    backgroundColor: Colors.elevated,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  summarySection: {
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  summaryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  summaryChip: {
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.accent + '40',
  },
  summaryChipText: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '600',
  },
  completionNote: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
  nextButton: {
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
  nextButtonDisabled: {
    opacity: 0.7,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.background,
  },
  skipButton: {
    padding: 12,
  },
  skipButtonText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
