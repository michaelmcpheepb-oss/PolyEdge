import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<any[]>([]); // TODO: Replace with real alerts
  const [isPro, setIsPro] = useState(false); // TODO: Connect to user subscription

  const handleCreateAlert = () => {
    // TODO: Navigate to create alert screen
    console.log('Create alert pressed');
  };

  const handleToggleAlert = (alertId: string) => {
    // TODO: Toggle alert active state
    console.log('Toggle alert:', alertId);
  };

  const handleDeleteAlert = (alertId: string) => {
    // TODO: Delete alert
    console.log('Delete alert:', alertId);
  };

  const handleGoPro = () => {
    // TODO: Navigate to pro subscription screen
    console.log('Go Pro pressed');
  };

  const alertTypes = [
    { id: 'price_above', label: 'Price Above', icon: 'trending-up' },
    { id: 'price_below', label: 'Price Below', icon: 'trending-down' },
    { id: 'price_move', label: 'Price Move %', icon: 'swap-vertical' },
    { id: 'whale_trade', label: 'Whale Trade', icon: 'fish' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Alerts</Text>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateAlert}>
          <Ionicons name="add-circle" size={24} color={Colors.accent} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {alerts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyStateTitle}>No alerts yet</Text>
            <Text style={styles.emptyStateSubtitle}>
              Create alerts to get notified when markets move or whales trade
            </Text>
            <TouchableOpacity style={styles.createAlertButton} onPress={handleCreateAlert}>
              <Text style={styles.createAlertButtonText}>Create Your First Alert</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.alertsList}>
            {/* TODO: Render real alerts */}
            <Text style={styles.comingSoon}>Alerts list coming soon</Text>
          </View>
        )}
        
        <View style={styles.alertTypesSection}>
          <Text style={styles.sectionTitle}>Alert Types</Text>
          <Text style={styles.sectionSubtitle}>
            Get notified when specific conditions are met
          </Text>
          
          <View style={styles.alertTypesGrid}>
            {alertTypes.map((type) => (
              <TouchableOpacity 
                key={type.id}
                style={styles.alertTypeCard}
                onPress={() => console.log('Select alert type:', type.id)}
              >
                <View style={styles.alertTypeIcon}>
                  <Ionicons name={type.icon as any} size={24} color={Colors.accent} />
                </View>
                <Text style={styles.alertTypeLabel}>{type.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {!isPro && (
          <View style={styles.proSection}>
            <View style={styles.proCard}>
              <Ionicons name="diamond" size={32} color={Colors.accent} />
              <Text style={styles.proTitle}>Unlock Pro Alerts</Text>
              <Text style={styles.proDescription}>
                Get real-time push notifications, custom alert sounds, and priority delivery
              </Text>
              <TouchableOpacity style={styles.proButton} onPress={handleGoPro}>
                <Text style={styles.proButtonText}>Go Pro</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        <View style={styles.howItWorksSection}>
          <Text style={styles.sectionTitle}>How Alerts Work</Text>
          
          <View style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Ionicons name="notifications" size={24} color={Colors.accent} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Real-time Notifications</Text>
              <Text style={styles.featureDescription}>
                Get instant push notifications when your alert conditions are met
              </Text>
            </View>
          </View>
          
          <View style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Ionicons name="settings" size={24} color={Colors.accent} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Custom Conditions</Text>
              <Text style={styles.featureDescription}>
                Set price thresholds, volume changes, or whale trade sizes
              </Text>
            </View>
          </View>
          
          <View style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Ionicons name="time" size={24} color={Colors.accent} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>24/7 Monitoring</Text>
              <Text style={styles.featureDescription}>
                We monitor markets around the clock, even when you're offline
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  createButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    margin: 16,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  createAlertButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createAlertButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.background,
  },
  alertsList: {
    padding: 16,
  },
  comingSoon: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    padding: 32,
  },
  alertTypesSection: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  alertTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  alertTypeCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.elevated,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  alertTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  proSection: {
    padding: 16,
  },
  proCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  proTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  proDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  proButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  proButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.background,
  },
  howItWorksSection: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    margin: 16,
    marginTop: 0,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});