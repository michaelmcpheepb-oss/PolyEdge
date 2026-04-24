import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

export default function CreateAlertScreen() {
  const router = useRouter();
  const { marketId } = useLocalSearchParams<{ marketId: string }>();
  const [alertType, setAlertType] = useState<'price_above' | 'price_below' | 'move_24h' | 'whale_trade'>('price_above');
  const [threshold, setThreshold] = useState('');
  const [marketSearch, setMarketSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const alertTypes = [
    { id: 'price_above', label: 'Price goes above X%', icon: 'trending-up' },
    { id: 'price_below', label: 'Price goes below X%', icon: 'trending-down' },
    { id: 'move_24h', label: 'Moves by X% in 24h', icon: 'swap-vertical' },
    { id: 'whale_trade', label: 'Whale trade above $X', icon: 'fish' },
  ];

  const handleCreateAlert = async () => {
    if (!threshold || isNaN(parseFloat(threshold))) {
      Alert.alert('Invalid Threshold', 'Please enter a valid number for the threshold.');
      return;
    }

    setIsCreating(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsCreating(false);
      
      // Show success animation
      Alert.alert(
        'Alert Created!',
        'You will be notified when your alert condition is met.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    }, 1500);
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
          <Text style={styles.headerTitleText}>Create Alert</Text>
        </View>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Market Search */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Market</Text>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search markets..."
              placeholderTextColor={Colors.textTertiary}
              value={marketSearch}
              onChangeText={setMarketSearch}
            />
          </View>
          {marketId && (
            <View style={styles.selectedMarket}>
              <Text style={styles.selectedMarketText}>Selected Market: {marketId}</Text>
            </View>
          )}
        </View>
        
        {/* Alert Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alert Type</Text>
          <View style={styles.alertTypeGrid}>
            {alertTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.alertTypeButton,
                  alertType === type.id && styles.alertTypeButtonActive
                ]}
                onPress={() => setAlertType(type.id as any)}
              >
                <Ionicons 
                  name={type.icon as any} 
                  size={24} 
                  color={alertType === type.id ? Colors.background : Colors.textPrimary} 
                />
                <Text style={[
                  styles.alertTypeLabel,
                  alertType === type.id && styles.alertTypeLabelActive
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Threshold Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Threshold</Text>
          <View style={styles.thresholdContainer}>
            <View style={styles.thresholdInputContainer}>
              <TextInput
                style={styles.thresholdInput}
                placeholder={alertType === 'whale_trade' ? '10000' : '50'}
                placeholderTextColor={Colors.textTertiary}
                value={threshold}
                onChangeText={setThreshold}
                keyboardType="numeric"
              />
              <Text style={styles.thresholdUnit}>
                {alertType === 'whale_trade' ? 'USD' : '%'}
              </Text>
            </View>
            <Text style={styles.thresholdDescription}>
              {alertType === 'price_above' && 'Alert when YES price goes above this percentage'}
              {alertType === 'price_below' && 'Alert when YES price goes below this percentage'}
              {alertType === 'move_24h' && 'Alert when price moves by this percentage in 24 hours'}
              {alertType === 'whale_trade' && 'Alert when a whale trade exceeds this amount'}
            </Text>
          </View>
        </View>
        
        {/* Example */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Example</Text>
          <View style={styles.exampleCard}>
            <Text style={styles.exampleText}>
              {alertType === 'price_above' && `"Alert me when YES price goes above ${threshold || '50'}%"`}
              {alertType === 'price_below' && `"Alert me when YES price goes below ${threshold || '50'}%"`}
              {alertType === 'move_24h' && `"Alert me when price moves by ${threshold || '10'}% in 24 hours"`}
              {alertType === 'whale_trade' && `"Alert me when a whale trade exceeds $${threshold || '10000'}"`}
            </Text>
          </View>
        </View>
        
        {/* Pro Feature Notice */}
        <View style={styles.proNotice}>
          <Ionicons name="star" size={20} color={Colors.accent} />
          <Text style={styles.proNoticeText}>
            Unlimited alerts available with PolyEdge Pro
          </Text>
        </View>
      </ScrollView>
      
      {/* Create Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[styles.createButton, isCreating && styles.createButtonDisabled]}
          onPress={handleCreateAlert}
          disabled={isCreating}
        >
          {isCreating ? (
            <>
              <Ionicons name="time" size={20} color={Colors.background} />
              <Text style={styles.createButtonText}>Creating...</Text>
            </>
          ) : (
            <>
              <Ionicons name="notifications" size={20} color={Colors.background} />
              <Text style={styles.createButtonText}>Create Alert</Text>
            </>
          )}
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
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.elevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  selectedMarket: {
    marginTop: 8,
    padding: 12,
    backgroundColor: Colors.accent + '20',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  selectedMarketText: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '500',
  },
  alertTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  alertTypeButton: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: Colors.elevated,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  alertTypeButtonActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  alertTypeLabel: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginTop: 8,
    textAlign: 'center',
  },
  alertTypeLabelActive: {
    color: Colors.background,
    fontWeight: '600',
  },
  thresholdContainer: {
    backgroundColor: Colors.elevated,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  thresholdInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  thresholdInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingVertical: 8,
  },
  thresholdUnit: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  thresholdDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  exampleCard: {
    backgroundColor: Colors.accent + '10',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.accent + '30',
  },
  exampleText: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  proNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: Colors.accent + '10',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.accent + '30',
  },
  proNoticeText: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '500',
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
  },
  createButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.background,
  },
});