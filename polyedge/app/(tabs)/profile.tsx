import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useUserStore } from '../../stores/useUserStore';
import { usePreferencesStore } from '../../stores/usePreferencesStore';
import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';

interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  destructive?: boolean;
}

function SettingRow({ icon, label, subtitle, onPress, rightElement, destructive }: SettingRowProps) {
  return (
    <Pressable style={styles.settingRow} onPress={onPress} disabled={!onPress}>
      <View style={styles.settingLeft}>
        <Ionicons
          name={icon}
          size={20}
          color={destructive ? Colors.error : Colors.accent}
          style={styles.settingIcon}
        />
        <View>
          <Text style={[styles.settingLabel, destructive && { color: Colors.error }]}>
            {label}
          </Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement || (
        <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
      )}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user, signOut, showAuthSheet } = useUserStore();
  const { whaleThreshold, categories, setWhaleThreshold } = usePreferencesStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const handleUpgrade = () => {
    router.push('/pro');
  };

  const handleOpenLink = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch {
      // Silently fail
    }
  };

  const renderProfileHub = () => (
    <View style={styles.profileHub}>
      <View style={styles.avatar}>
        <Ionicons name="person" size={32} color={Colors.accent} />
      </View>
      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>
          {user?.email ? user.email.split('@')[0] : 'Trader'}
        </Text>
        <Text style={styles.profileEmail}>{user?.email || 'Not signed in'}</Text>
      </View>
      {!user && (
        <Pressable style={styles.signInButton} onPress={showAuthSheet}>
          <Text style={styles.signInText}>Sign In</Text>
        </Pressable>
      )}
    </View>
  );

  const renderSubscriptionCard = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Subscription</Text>
      <View style={styles.planCard}>
        <View style={styles.planInfo}>
          <Ionicons name="flash" size={24} color={Colors.warning} />
          <View style={styles.planTextContainer}>
            <Text style={styles.planName}>Free Plan</Text>
            <Text style={styles.planDescription}>
              3 daily picks · Limited features
            </Text>
          </View>
        </View>
        <Pressable style={styles.upgradeButton} onPress={handleUpgrade}>
          <Text style={styles.upgradeButtonText}>Upgrade</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderStatsCard = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Your Activity</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Markets</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Alerts</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
      </View>
    </View>
  );

  const renderPreferences = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Preferences</Text>

      <View style={styles.preferenceRow}>
        <Text style={styles.preferenceLabel}>Notifications</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: Colors.border, true: Colors.accent + '60' }}
          thumbColor={notificationsEnabled ? Colors.accent : Colors.textTertiary}
        />
      </View>

      <SettingRow
        icon="fish"
        label="Whale Threshold"
        subtitle={`${whaleThreshold.toLocaleString()} USDC`}
        onPress={() => {
          const options = [1000, 5000, 10000, 25000, 50000];
          Alert.alert(
            'Whale Threshold',
            'Minimum trade amount to show',
            options.map((val) => ({
              text: `$${val.toLocaleString()}`,
              onPress: () => setWhaleThreshold(val),
            }))
          );
        }}
      />

      <SettingRow
        icon="pricetags"
        label="Category Preferences"
        subtitle={`${categories.length} selected`}
        onPress={() => {}}
      />
    </View>
  );

  const renderSettings = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Settings</Text>

      <SettingRow
        icon="settings-outline"
        label="App Settings"
        onPress={() => router.push('/settings')}
      />

      <SettingRow
        icon="shield-outline"
        label="Privacy Policy"
        onPress={() => handleOpenLink('https://michaelmcpheepb-oss.github.io/PolyEdge/privacy')}
      />

      <SettingRow
        icon="document-text-outline"
        label="Terms of Service"
        onPress={() => handleOpenLink('https://michaelmcpheepb-oss.github.io/PolyEdge/privacy')}
      />

      {user && (
        <SettingRow
          icon="log-out-outline"
          label="Sign Out"
          destructive
          onPress={handleSignOut}
        />
      )}
    </View>
  );

  const renderAbout = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>About</Text>

      <SettingRow
        icon="star-outline"
        label="Rate PolyEdge"
        onPress={() => {}}
      />

      <View style={styles.versionRow}>
        <Text style={styles.versionLabel}>Version</Text>
        <Text style={styles.versionValue}>1.0.0</Text>
      </View>

      <Text style={styles.tagline}>
        Your AI prediction market analyst. We do the research. You decide.
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {renderProfileHub()}
      {renderSubscriptionCard()}
      {renderStatsCard()}
      {renderPreferences()}
      {renderSettings()}
      {renderAbout()}

      {/* Bottom spacing */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
  },
  profileHub: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  profileEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  signInButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  signInText: {
    color: Colors.buttonPrimaryText,
    fontWeight: '600',
    fontSize: 14,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.elevated,
    borderRadius: 12,
    padding: 14,
  },
  planInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  planTextContainer: {},
  planName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  planDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  upgradeButton: {
    backgroundColor: Colors.warning,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: Colors.buttonPrimaryText,
    fontWeight: '700',
    fontSize: 13,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.accent,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  settingLabel: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  preferenceLabel: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  versionLabel: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  versionValue: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  tagline: {
    fontSize: 13,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});
