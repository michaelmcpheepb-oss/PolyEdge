import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useUserStore } from '../stores/useUserStore';
import { usePreferencesStore } from '../stores/usePreferencesStore';
import * as WebBrowser from 'expo-web-browser';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut, showAuthSheet } = useUserStore();
  
  // If no user, show sign in prompt
  if (!user) {
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
            <Text style={styles.headerTitleText}>Settings</Text>
          </View>
          <View style={styles.headerRight} />
        </View>
        
        <View style={styles.signInPromptContainer}>
          <Ionicons name="person-circle-outline" size={64} color={Colors.textSecondary} />
          <Text style={styles.signInPromptTitle}>Sign In Required</Text>
          <Text style={styles.signInPromptText}>
            Please sign in to access settings and save your preferences
          </Text>
          <TouchableOpacity style={styles.signInPromptButton} onPress={showAuthSheet}>
            <Text style={styles.signInPromptButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  const { 
    categories, 
    whaleThreshold, 
    notificationFrequency, 
    pushNotificationsEnabled,
    setNotificationFrequency,
    setPushNotificationsEnabled,
  } = usePreferencesStore();
  
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        },
      ]
    );
  };

  const handleNotificationToggle = async (value: boolean) => {
    if (!value) {
      // If turning off, open system settings
      Alert.alert(
        'Notifications Disabled',
        'You can enable notifications in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => {
            // This would open system notification settings
            console.log('Open system notification settings');
          }},
        ]
      );
    }
    setPushNotificationsEnabled(value);
  };

  const handleFrequencyChange = () => {
    Alert.alert(
      'Alert Frequency',
      'Choose how often you want to receive alerts',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Instant', onPress: () => setNotificationFrequency('instant') },
        { text: 'Every 5 min', onPress: () => setNotificationFrequency('5min') },
        { text: 'Every 15 min', onPress: () => setNotificationFrequency('15min') },
        { text: 'Hourly', onPress: () => setNotificationFrequency('hourly') },
      ]
    );
  };

  const handleThresholdChange = () => {
    Alert.alert(
      'Default Whale Threshold',
      'Set your default minimum whale trade size',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: '$1,000', onPress: () => usePreferencesStore.getState().setWhaleThreshold(1000) },
        { text: '$5,000', onPress: () => usePreferencesStore.getState().setWhaleThreshold(5000) },
        { text: '$10,000', onPress: () => usePreferencesStore.getState().setWhaleThreshold(10000) },
        { text: '$25,000', onPress: () => usePreferencesStore.getState().setWhaleThreshold(25000) },
        { text: '$50,000', onPress: () => usePreferencesStore.getState().setWhaleThreshold(50000) },
      ]
    );
  };

  const handleUpgradeToPro = () => {
    router.push('/pro');
  };

  const handleManageSubscription = async () => {
    // This would open Stripe customer portal
    Alert.alert('Manage Subscription', 'This would open Stripe customer portal in production');
  };

  const handleOpenLink = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.error('Failed to open link:', error);
    }
  };

  const renderAccountSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>ACCOUNT</Text>
      <View style={styles.sectionContent}>
        {user ? (
          <>
            <View style={styles.accountRow}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountEmail}>{user.email}</Text>
                <View style={styles.planBadge}>
                  <Text style={styles.planBadgeText}>Free Plan</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.signInButton} onPress={showAuthSheet}>
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>
            <Text style={styles.signInSubtext}>
              Sign in to save preferences and get personalised alerts
            </Text>
          </>
        )}
      </View>
    </View>
  );

  const renderPreferencesSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>PREFERENCES</Text>
      <View style={styles.sectionContent}>
        <TouchableOpacity style={styles.row} onPress={() => router.push('/onboarding')}>
          <View style={styles.rowLeft}>
            <Ionicons name="filter-outline" size={22} color={Colors.textPrimary} />
            <Text style={styles.rowLabel}>Category Interests</Text>
          </View>
          <View style={styles.rowRight}>
            {categories.length > 0 ? (
              <View style={styles.categoryChips}>
                {categories.slice(0, 2).map((cat, index) => (
                  <View key={index} style={styles.categoryChip}>
                    <Text style={styles.categoryChipText}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </View>
                ))}
                {categories.length > 2 && (
                  <Text style={styles.moreText}>+{categories.length - 2}</Text>
                )}
              </View>
            ) : (
              <Text style={styles.rowValue}>Not set</Text>
            )}
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={handleThresholdChange}>
          <View style={styles.rowLeft}>
            <Ionicons name="fish-outline" size={22} color={Colors.textPrimary} />
            <Text style={styles.rowLabel}>Default Whale Threshold</Text>
          </View>
          <View style={styles.rowRight}>
            <Text style={styles.rowValue}>
              ${whaleThreshold >= 1000 ? `${whaleThreshold/1000}K` : whaleThreshold}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderNotificationsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>NOTIFICATIONS</Text>
      <View style={styles.sectionContent}>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
            <Text style={styles.rowLabel}>Push Notifications</Text>
          </View>
          <Switch
            value={pushNotificationsEnabled}
            onValueChange={handleNotificationToggle}
            trackColor={{ false: Colors.border, true: Colors.accent }}
            thumbColor={Colors.background}
          />
        </View>

        <TouchableOpacity style={styles.row} onPress={handleFrequencyChange}>
          <View style={styles.rowLeft}>
            <Ionicons name="time-outline" size={22} color={Colors.textPrimary} />
            <Text style={styles.rowLabel}>Alert Frequency</Text>
          </View>
          <View style={styles.rowRight}>
            <Text style={styles.rowValue}>
              {notificationFrequency === 'instant' ? 'Instant' :
               notificationFrequency === '5min' ? 'Every 5 min' :
               notificationFrequency === '15min' ? 'Every 15 min' : 'Hourly'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSubscriptionSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>SUBSCRIPTION</Text>
      <View style={styles.sectionContent}>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="card-outline" size={22} color={Colors.textPrimary} />
            <Text style={styles.rowLabel}>Current Plan</Text>
          </View>
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>Free Plan</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgradeToPro}>
          <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
        </TouchableOpacity>

        <Text style={styles.upgradeSubtext}>
          Unlock real-time whale feed, full leaderboard & unlimited alerts
        </Text>

        {user && (
          <TouchableOpacity style={styles.manageButton} onPress={handleManageSubscription}>
            <Text style={styles.manageButtonText}>Manage Subscription</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderAboutSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>ABOUT</Text>
      <View style={styles.sectionContent}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>App Version</Text>
          <Text style={styles.rowValue}>1.0.0</Text>
        </View>

        <TouchableOpacity style={styles.row} onPress={() => handleOpenLink('https://play.google.com/store/apps/details?id=com.polyedge.app')}>
          <Text style={styles.rowLabel}>Rate PolyEdge</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={() => handleOpenLink('https://polyedge.app/privacy')}>
          <Text style={styles.rowLabel}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={() => handleOpenLink('https://polyedge.app/terms')}>
          <Text style={styles.rowLabel}>Terms of Service</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={() => handleOpenLink('https://twitter.com/polyedgeapp')}>
          <View style={styles.rowLeft}>
            <Ionicons name="logo-twitter" size={22} color={Colors.textPrimary} />
            <Text style={styles.rowLabel}>Follow us on X</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );

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
          <Text style={styles.headerTitleText}>Settings</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderAccountSection()}
        {renderPreferencesSection()}
        {renderNotificationsSection()}
        {renderSubscriptionSection()}
        {renderAboutSection()}

        <View style={styles.footer}>
          <Text style={styles.footerText}>PolyEdge v1.0.0</Text>
          <Text style={styles.copyrightText}>© 2026 PolyEdge. All rights reserved.</Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
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
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A0A0B8',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowLabel: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowValue: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,212,170,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.accent,
  },
  accountInfo: {
    flex: 1,
  },
  accountEmail: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  planBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.elevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  planBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  signOutButton: {
    margin: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
  },
  signInButton: {
    margin: 16,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.background,
  },
  signInSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    lineHeight: 20,
  },
  categoryChips: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryChip: {
    backgroundColor: Colors.elevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryChipText: {
    fontSize: 12,
    color: Colors.textPrimary,
  },
  moreText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  upgradeButton: {
    margin: 16,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.background,
  },
  upgradeSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    lineHeight: 20,
  },
  manageButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    alignItems: 'center',
  },
  manageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  copyrightText: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  signInPromptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  signInPromptTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  signInPromptText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  signInPromptButton: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInPromptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.background,
  },
});