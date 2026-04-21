import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WhalesScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>Whale Feed</Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.thresholdContainer}>
          {['$1K', '$5K', '$10K', '$25K', '$50K'].map((threshold) => (
            <TouchableOpacity key={threshold} style={styles.thresholdChip}>
              <Text style={styles.thresholdText}>{threshold}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.content}>
          <Text style={styles.placeholderText}>Whale Trade Feed</Text>
          <Text style={styles.placeholderSubtext}>
            Real-time trades over $10,000 minimum
          </Text>
          
          <View style={styles.placeholderTrade}>
            <View style={styles.placeholderAvatar} />
            <View style={styles.placeholderTradeDetails}>
              <View style={styles.placeholderMarket} />
              <View style={styles.placeholderAmount} />
            </View>
            <View style={styles.placeholderTime} />
          </View>
          
          <View style={styles.placeholderTrade}>
            <View style={styles.placeholderAvatar} />
            <View style={styles.placeholderTradeDetails}>
              <View style={styles.placeholderMarket} />
              <View style={styles.placeholderAmount} />
            </View>
            <View style={styles.placeholderTime} />
          </View>
          
          <View style={styles.placeholderTrade}>
            <View style={styles.placeholderAvatar} />
            <View style={styles.placeholderTradeDetails}>
              <View style={styles.placeholderMarket} />
              <View style={styles.placeholderAmount} />
            </View>
            <View style={styles.placeholderTime} />
          </View>
          
          <View style={styles.proGate}>
            <View style={styles.proBlur} />
            <View style={styles.proCta}>
              <Text style={styles.proCtaTitle}>Go Pro to see trades under 10 minutes old</Text>
              <Text style={styles.proCtaSubtitle}>Unlock real-time whale alerts</Text>
              <TouchableOpacity style={styles.proButton}>
                <Text style={styles.proButtonText}>Go Pro</Text>
              </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    backgroundColor: Colors.textPrimary,
    borderRadius: 4,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  thresholdContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: Colors.surface,
  },
  thresholdChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.elevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  thresholdText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
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
  placeholderTrade: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  placeholderAvatar: {
    width: 40,
    height: 40,
    backgroundColor: Colors.elevated,
    borderRadius: 20,
  },
  placeholderTradeDetails: {
    flex: 1,
    gap: 8,
  },
  placeholderMarket: {
    width: '80%',
    height: 20,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
  },
  placeholderAmount: {
    width: '40%',
    height: 24,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
  },
  placeholderTime: {
    width: 60,
    height: 20,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
  },
  proGate: {
    width: '100%',
    marginTop: 24,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  proBlur: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.elevated,
    opacity: 0.7,
  },
  proCta: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  proCtaTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  proCtaSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
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