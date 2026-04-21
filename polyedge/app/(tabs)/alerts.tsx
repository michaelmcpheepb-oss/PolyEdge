import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function AlertsScreen() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<any[]>([
    // Example alerts
    {
      id: '1',
      marketId: '540816',
      marketQuestion: 'Russia-Ukraine Ceasefire before GTA VI?',
      alertType: 'price_above',
      threshold: 60,
      active: true,
      created_at: '2026-04-20T10:30:00Z',
    },
    {
      id: '2',
      marketId: '540817',
      marketQuestion: 'New Rihanna Album before GTA VI?',
      alertType: 'price_below',
      threshold: 40,
      active: false,
      created_at: '2026-04-19T14:20:00Z',
    },
  ]);

  const handleCreateAlert = () => {
    router.push('/alerts/create');
  };

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, active: !alert.active } : alert
    ));
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'price_above': return 'Price above';
      case 'price_below': return 'Price below';
      case 'move_24h': return '24h move';
      case 'whale_trade': return 'Whale trade';
      default: return 'Alert';
    }
  };

  const renderAlertItem = ({ item }: { item: any }) => (
    <View style={styles.alertCard}>
      <View style={styles.alertHeader}>
        <Text style={styles.marketQuestion} numberOfLines={1}>
          {item.marketQuestion}
        </Text>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => deleteAlert(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color={Colors.error} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.alertDetails}>
        <View style={styles.alertTypeBadge}>
          <Text style={styles.alertTypeText}>
            {getAlertTypeLabel(item.alertType)}
          </Text>
        </View>
        <Text style={styles.threshold}>
          {item.alertType === 'whale_trade' ? '$' : ''}{item.threshold}{item.alertType === 'whale_trade' ? '' : '%'}
        </Text>
      </View>
      
      <View style={styles.alertFooter}>
        <TouchableOpacity 
          style={[styles.toggleButton, item.active && styles.toggleButtonActive]}
          onPress={() => toggleAlert(item.id)}
        >
          <View style={[styles.toggleCircle, item.active && styles.toggleCircleActive]} />
          <Text style={[styles.toggleText, item.active && styles.toggleTextActive]}>
            {item.active ? 'Active' : 'Inactive'}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.createdDate}>
          Created {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Alerts</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleCreateAlert}
        >
          <Ionicons name="add" size={24} color={Colors.background} />
        </TouchableOpacity>
      </View>
      
      {alerts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-off-outline" size={96} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>No Alerts Yet</Text>
          <Text style={styles.emptySubtitle}>
            Create your first alert to get notified about market movements
          </Text>
          <TouchableOpacity 
            style={styles.emptyCreateButton}
            onPress={handleCreateAlert}
          >
            <Ionicons name="add" size={20} color={Colors.background} />
            <Text style={styles.emptyCreateButtonText}>Create Alert</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={alerts}
          renderItem={renderAlertItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {/* Pro Upsell */}
      <View style={styles.proUpsell}>
        <Ionicons name="star" size={20} color={Colors.accent} />
        <Text style={styles.proUpsellText}>
          Unlimited alerts with PolyEdge Pro
        </Text>
        <TouchableOpacity 
          style={styles.proUpsellButton}
          onPress={() => router.push('/pro')}
        >
          <Text style={styles.proUpsellButtonText}>Upgrade</Text>
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
    backgroundColor: Colors.accent,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyCreateButton: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyCreateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.background,
  },
  listContent: {
    padding: 16,
  },
  alertCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  marketQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
  alertDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  alertTypeBadge: {
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  alertTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.accent,
  },
  threshold: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.elevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  toggleButtonActive: {
    backgroundColor: Colors.success + '20',
  },
  toggleCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.textTertiary,
  },
  toggleCircleActive: {
    backgroundColor: Colors.success,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  toggleTextActive: {
    color: Colors.success,
  },
  createdDate: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  proUpsell: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.accent + '10',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  proUpsellText: {
    flex: 1,
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '500',
    marginLeft: 8,
  },
  proUpsellButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  proUpsellButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.background,
  },
});