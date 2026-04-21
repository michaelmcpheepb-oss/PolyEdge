import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FeedScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>PolyEdge</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.categoryContainer}>
          {['All', 'Politics', 'Crypto', 'Sports', 'Science', 'Business'].map((category) => (
            <TouchableOpacity key={category} style={styles.categoryChip}>
              <Text style={styles.categoryText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.content}>
          <Text style={styles.placeholderText}>Hot Markets Feed</Text>
          <Text style={styles.placeholderSubtext}>
            This screen will show real Polymarket data sorted by volume
          </Text>
          
          <View style={styles.placeholderCard}>
            <View style={styles.placeholderCardHeader}>
              <View style={styles.placeholderCategory} />
              <View style={styles.placeholderVolume} />
            </View>
            <View style={styles.placeholderQuestion} />
            <View style={styles.placeholderPriceContainer}>
              <View style={styles.placeholderPrice} />
              <View style={styles.placeholderChange} />
            </View>
          </View>
          
          <View style={styles.placeholderCard}>
            <View style={styles.placeholderCardHeader}>
              <View style={styles.placeholderCategory} />
              <View style={styles.placeholderVolume} />
            </View>
            <View style={styles.placeholderQuestion} />
            <View style={styles.placeholderPriceContainer}>
              <View style={styles.placeholderPrice} />
              <View style={styles.placeholderChange} />
            </View>
          </View>
          
          <View style={styles.placeholderCard}>
            <View style={styles.placeholderCardHeader}>
              <View style={styles.placeholderCategory} />
              <View style={styles.placeholderVolume} />
            </View>
            <View style={styles.placeholderQuestion} />
            <View style={styles.placeholderPriceContainer}>
              <View style={styles.placeholderPrice} />
              <View style={styles.placeholderChange} />
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
    color: Colors.accent,
  },
  settingsButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: Colors.surface,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.elevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryText: {
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
  placeholderCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  placeholderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  placeholderCategory: {
    width: 60,
    height: 24,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
  },
  placeholderVolume: {
    width: 80,
    height: 24,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
  },
  placeholderQuestion: {
    width: '100%',
    height: 40,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
    marginBottom: 16,
  },
  placeholderPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeholderPrice: {
    width: 100,
    height: 48,
    backgroundColor: Colors.elevated,
    borderRadius: 8,
  },
  placeholderChange: {
    width: 60,
    height: 24,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
  },
});