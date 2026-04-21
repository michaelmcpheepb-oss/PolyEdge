import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LeaderboardScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Top Traders</Text>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.periodContainer}>
          {['7D', '30D', 'ALL TIME'].map((period) => (
            <TouchableOpacity key={period} style={styles.periodChip}>
              <Text style={styles.periodText}>{period}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.tab, styles.activeTab]}>
            <Text style={[styles.tabText, styles.activeTabText]}>Top Traders</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>Following</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.placeholderText}>Trader Leaderboard</Text>
          <Text style={styles.placeholderSubtext}>
            Ranked by PnL over selected period
          </Text>
          
          <View style={styles.leaderboard}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rank) => (
              <View key={rank} style={styles.leaderboardRow}>
                <View style={styles.rankContainer}>
                  <Text style={styles.rankText}>#{rank}</Text>
                </View>
                <View style={styles.traderInfo}>
                  <View style={styles.placeholderAvatar} />
                  <View style={styles.traderDetails}>
                    <View style={styles.placeholderName} />
                    <View style={styles.placeholderStats} />
                  </View>
                </View>
                <View style={styles.pnlContainer}>
                  <View style={styles.placeholderPnl} />
                </View>
              </View>
            ))}
          </View>
          
          <View style={styles.proGate}>
            <Text style={styles.proGateTitle}>Go Pro to see ranks 11+</Text>
            <Text style={styles.proGateSubtitle}>Unlock full leaderboard access</Text>
            <TouchableOpacity style={styles.proButton}>
              <Text style={styles.proButtonText}>Go Pro</Text>
            </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  periodContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: Colors.surface,
  },
  periodChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: Colors.elevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  periodText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.accent,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.accent,
  },
  content: {
    padding: 16,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  leaderboard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  traderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  placeholderAvatar: {
    width: 40,
    height: 40,
    backgroundColor: Colors.elevated,
    borderRadius: 20,
  },
  traderDetails: {
    flex: 1,
    gap: 6,
  },
  placeholderName: {
    width: '60%',
    height: 20,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
  },
  placeholderStats: {
    width: '40%',
    height: 16,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
  },
  pnlContainer: {
    width: 80,
    alignItems: 'flex-end',
  },
  placeholderPnl: {
    width: '100%',
    height: 24,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
  },
  proGate: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  proGateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  proGateSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
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
});