// PolyEdge Snack Preview - Simplified UI
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  SafeAreaView,
  StatusBar 
} from 'react-native';

// Colors matching PolyEdge theme
const Colors = {
  background: '#0D0D1A',
  surface: '#1A1A2E',
  elevated: '#16213E',
  accent: '#00D4AA',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0B8',
  border: '#2A2A45',
  success: '#27AE60',
  error: '#E74C3C',
};

// Mock market data
const mockMarkets = [
  {
    id: '1',
    question: 'Will Bitcoin reach $100K before 2027?',
    category: 'Crypto',
    yes_price: 0.65,
    no_price: 0.35,
    volume_24h: 1250000,
    total_volume: 8500000,
    end_date: '2026-12-31T23:59:59Z',
  },
  {
    id: '2',
    question: 'Will there be a US-China trade deal in 2026?',
    category: 'Politics',
    yes_price: 0.42,
    no_price: 0.58,
    volume_24h: 890000,
    total_volume: 4200000,
    end_date: '2026-06-30T23:59:59Z',
  },
  {
    id: '3',
    question: 'Will the Lakers win the 2026 NBA championship?',
    category: 'Sports',
    yes_price: 0.28,
    no_price: 0.72,
    volume_24h: 540000,
    total_volume: 3100000,
    end_date: '2026-06-15T23:59:59Z',
  },
  {
    id: '4',
    question: 'Will AI pass the Turing test by 2027?',
    category: 'Technology',
    yes_price: 0.73,
    no_price: 0.27,
    volume_24h: 2100000,
    total_volume: 12500000,
    end_date: '2027-01-01T23:59:59Z',
  },
  {
    id: '5',
    question: 'Will there be a major earthquake in California in 2026?',
    category: 'World Events',
    yes_price: 0.15,
    no_price: 0.85,
    volume_24h: 320000,
    total_volume: 1800000,
    end_date: '2026-12-31T23:59:59Z',
  },
];

// Market Card Component
const MarketCard = ({ market }) => {
  const formatCurrency = (amount) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount}`;
  };

  const formatTimeRemaining = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffDays = Math.floor((end - now) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days` : 'Ending soon';
  };

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{market.category}</Text>
        </View>
        <View style={styles.volumeContainer}>
          <Text style={styles.volume}>{formatCurrency(market.volume_24h)}</Text>
          <Text style={styles.volumeLabel}>24h volume</Text>
        </View>
      </View>
      
      <Text style={styles.question} numberOfLines={2}>
        {market.question}
      </Text>
      
      <View style={styles.priceContainer}>
        <View style={styles.priceColumn}>
          <Text style={styles.priceLabel}>YES</Text>
          <Text style={[styles.price, { color: Colors.accent }]}>
            {(market.yes_price * 100).toFixed(1)}%
          </Text>
          <Text style={[styles.change24h, { color: Colors.success }]}>
            +2.4%
          </Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.priceColumn}>
          <Text style={styles.priceLabel}>NO</Text>
          <Text style={[styles.price, { color: Colors.error }]}>
            {(market.no_price * 100).toFixed(1)}%
          </Text>
          <Text style={styles.timeLabel}>Ends in</Text>
          <Text style={styles.time}>{formatTimeRemaining(market.end_date)}</Text>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.totalVolume}>
          Total volume: {formatCurrency(market.total_volume)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Main Feed Screen
const FeedScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('volume');
  
  const categories = ['All', 'Crypto', 'Politics', 'Sports', 'Technology', 'World Events'];
  const sortOptions = ['Volume', 'Newest', 'Ending Soon'];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>PolyEdge</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.icon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Sort Options */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.sortScroll}
        contentContainerStyle={styles.sortContent}
      >
        {sortOptions.map((sort) => (
          <TouchableOpacity
            key={sort}
            style={[
              styles.sortChip,
              sortBy.toLowerCase() === sort.toLowerCase() && styles.activeSortChip
            ]}
            onPress={() => setSortBy(sort.toLowerCase())}
          >
            <Text style={[
              styles.sortText,
              sortBy.toLowerCase() === sort.toLowerCase() && styles.activeSortText
            ]}>
              {sort}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.activeCategoryChip
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.activeCategoryText
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Market List */}
      <FlatList
        data={mockMarkets}
        renderItem={({ item }) => <MarketCard market={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
  },
  icon: {
    fontSize: 24,
  },
  sortScroll: {
    marginTop: 10,
  },
  sortContent: {
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  sortChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeSortChip: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  sortText: {
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  activeSortText: {
    color: Colors.background,
    fontWeight: '700',
  },
  categoryScroll: {
    marginTop: 10,
  },
  categoryContent: {
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeCategoryChip: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  categoryText: {
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: 15,
  },
  activeCategoryText: {
    color: Colors.background,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: Colors.elevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  volumeContainer: {
    alignItems: 'flex-end',
  },
  volume: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  volumeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
    lineHeight: 24,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceColumn: {
    flex: 1,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  change24h: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
  },
  timeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  time: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    marginTop: 8,
  },
  totalVolume: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

export default FeedScreen;