import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePreferencesStore } from '../stores/usePreferencesStore';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'politics', label: 'Politics', emoji: '🏛️' },
  { id: 'crypto', label: 'Crypto', emoji: '💰' },
  { id: 'sports', label: 'Sports', emoji: '🏈' },
  { id: 'science', label: 'Science', emoji: '🔬' },
  { id: 'economics', label: 'Economics', emoji: '📈' },
  { id: 'world_events', label: 'World Events', emoji: '🌍' },
  { id: 'tech', label: 'Tech', emoji: '💻' },
  { id: 'culture', label: 'Culture', emoji: '🎭' },
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
  
  // Get preferences from store
  const {
    categories: selectedCategories,
    whaleThreshold,
    setCategories,
    setWhaleThreshold,
    setHasOnboarded,
    toggleCategory,
    selectAllCategories,
    clearAllCategories,
  } = usePreferencesStore();
  
  const handleSkip = async () => {
    setHasOnboarded(true);
    router.replace('/(tabs)/feed');
  };
  
  const handleNext = async () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark as onboarded
      setHasOnboarded(true);
      // TODO: Save preferences to Supabase when user is authenticated
      router.replace('/(tabs)/feed');
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // toggleCategory is now from store
  
  // selectAllCategories and clearAllCategories are now from store
  
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
      
      <View style={styles.stepContent}>
        <Text style={styles.emoji}>🐋</Text>
        <Text style={styles.headline}>Track Smart Money</Text>
        <Text style={styles.subtext}>
          See exactly where the biggest bets are going on Polymarket in real-time.
        </Text>
      </View>
      
      <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
        <Text style={styles.primaryButtonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
  
  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.headline}>What do you follow?</Text>
        <Text style={styles.subtext}>
          Personalise your feed. Change anytime.
        </Text>
        
        <View style={styles.categoryActions}>
          <TouchableOpacity onPress={selectAllCategories}>
            <Text style={styles.categoryActionText}>Select All</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={clearAllCategories}>
            <Text style={styles.categoryActionText}>Clear All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategories.includes(category.id);
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  isSelected ? styles.categoryChipSelected : styles.categoryChipUnselected
                ]}
                onPress={() => toggleCategory(category.id)}
              >
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <Text style={[
                  styles.categoryLabel,
                  isSelected ? styles.categoryLabelSelected : styles.categoryLabelUnselected
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        
        <Text style={styles.sectionTitle}>Minimum whale size</Text>
        <View style={styles.thresholdRow}>
          {WHALE_THRESHOLDS.map((threshold) => (
            <TouchableOpacity
              key={threshold.value}
              style={[
                styles.thresholdChip,
                whaleThreshold === threshold.value 
                  ? styles.thresholdChipSelected 
                  : styles.thresholdChipUnselected
              ]}
              onPress={() => setWhaleThreshold(threshold.value)}
            >
              <Text style={[
                styles.thresholdText,
                whaleThreshold === threshold.value 
                  ? styles.thresholdTextSelected 
                  : styles.thresholdTextUnselected
              ]}>
                {threshold.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      <TouchableOpacity 
        style={[
          styles.primaryButton, 
          selectedCategories.length === 0 && styles.primaryButtonDisabled
        ]}
        onPress={handleNext}
        disabled={selectedCategories.length === 0}
      >
        <Text style={styles.primaryButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
  
  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.stepContent}>
        <View style={styles.bellContainer}>
          <Text style={styles.bellEmoji}>🔔</Text>
          <View style={styles.bellGlow} />
        </View>
        <Text style={styles.headline}>Never miss a move</Text>
        <Text style={styles.subtext}>
          Get instant alerts when whales make big bets on your favourite markets.
        </Text>
      </View>
      
      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
          <Text style={styles.primaryButtonText}>Enable Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleNext}>
          <Text style={styles.secondaryButtonText}>Maybe Later</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  const renderProgressDots = () => (
    <View style={styles.progressDots}>
      {[0, 1, 2].map((step) => (
        <View
          key={step}
          style={[
            styles.progressDot,
            currentStep === step ? styles.progressDotActive : styles.progressDotInactive
          ]}
        />
      ))}
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      {currentStep === 0 && renderStep1()}
      {currentStep === 1 && renderStep2()}
      {currentStep === 2 && renderStep3()}
      {renderProgressDots()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D1A',
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  backButton: {
    padding: 8,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    color: '#A0A0B8',
  },
  stepContent: {
    flex: 1,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 32,
  },
  headline: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtext: {
    fontSize: 16,
    color: '#A0A0B8',
    textAlign: 'center',
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: '#00D4AA',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  primaryButtonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D0D1A',
  },
  categoryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 24,
    marginBottom: 16,
  },
  categoryActionText: {
    fontSize: 14,
    color: '#A0A0B8',
    fontWeight: '500',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
    marginBottom: 40,
  },
  categoryChip: {
    width: (width - 64 - 12) / 2,
    height: 44,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
  },
  categoryChipUnselected: {
    backgroundColor: '#1A1A2E',
    borderColor: '#2A2A45',
  },
  categoryChipSelected: {
    backgroundColor: 'rgba(0,212,170,0.15)',
    borderColor: '#00D4AA',
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryLabelUnselected: {
    color: '#FFFFFF',
  },
  categoryLabelSelected: {
    color: '#00D4AA',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  thresholdRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    marginBottom: 40,
  },
  thresholdChip: {
    flex: 1,
    height: 44,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  thresholdChipUnselected: {
    backgroundColor: '#1A1A2E',
    borderColor: '#2A2A45',
  },
  thresholdChipSelected: {
    backgroundColor: 'rgba(0,212,170,0.15)',
    borderColor: '#00D4AA',
  },
  thresholdText: {
    fontSize: 14,
    fontWeight: '500',
  },
  thresholdTextUnselected: {
    color: '#FFFFFF',
  },
  thresholdTextSelected: {
    color: '#00D4AA',
    fontWeight: '600',
  },
  bellContainer: {
    position: 'relative',
    marginBottom: 32,
  },
  bellEmoji: {
    fontSize: 64,
  },
  bellGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: 'rgba(0,212,170,0.1)',
    borderRadius: 50,
    zIndex: -1,
  },
  buttonGroup: {
    width: '100%',
    gap: 16,
  },
  secondaryButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 52,
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#A0A0B8',
    fontWeight: '500',
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressDotActive: {
    backgroundColor: '#00D4AA',
  },
  progressDotInactive: {
    backgroundColor: '#2A2A45',
  },
});