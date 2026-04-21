import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AlertsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Alerts</Text>
        <TouchableOpacity style={styles.createButton}>
          <Ionicons name="add-circle" size={24} color={Colors.accent} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyStateTitle}>No alerts yet</Text>
            <Text style={styles.emptyStateSubtitle}>
              Create alerts to get notified when markets move or whales trade
            </Text>
            <TouchableOpacity style={styles.createAlertButton}>
              <Text style={styles.createAlertButtonText}>Create Your First Alert</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.placeholderSection}>
            <Text style={styles.placeholderSectionTitle}>How alerts work</Text>
            
            <View style={styles.placeholderFeature}>
              <View style={styles.placeholderIcon} />
              <View style={styles.placeholderFeatureText}>
                <View style={styles.placeholderFeatureTitle} />
                <View style={styles.placeholderFeatureDescription} />
              </View>
            </View>
            
            <View style={styles.placeholderFeature}>
              <View style={styles.placeholderIcon} />
              <View style={styles.placeholderFeatureText}>
                <View style={styles.placeholderFeatureTitle} />
                <View style={styles.placeholderFeatureDescription} />
              </View>
            </View>
            
            <View style={styles.placeholderFeature}>
              <View style={styles.placeholderIcon} />
              <View style={styles.placeholderFeatureText}>
                <View style={styles.placeholderFeatureTitle} />
                <View style={styles.placeholderFeatureDescription} />
              </View>
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
  content: {
    padding: 16,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 32,
    width: '100%',
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
  placeholderSection: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  placeholderSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  placeholderFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  placeholderIcon: {
    width: 40,
    height: 40,
    backgroundColor: Colors.elevated,
    borderRadius: 20,
  },
  placeholderFeatureText: {
    flex: 1,
    gap: 8,
  },
  placeholderFeatureTitle: {
    width: '60%',
    height: 20,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
  },
  placeholderFeatureDescription: {
    width: '90%',
    height: 16,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
  },
});