// 🌾 Farm List Screen - Browse All Farms
// Displays a list of all farms with search and filtering

import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { apiClient } from '../../services/api';
import { theme } from '../../theme';

// ========================================
// 🎯 TYPES & INTERFACES
// ========================================

interface Farm {
  id: string;
  name: string;
  description: string;
  image: string | null;
  location: string;
  distance?: number;
  rating: number;
  reviewCount: number;
  productCount: number;
  isVerified: boolean;
  isCertified: boolean;
  certifications: string[];
}

interface FarmFilters {
  certified?: boolean;
  verified?: boolean;
  searchQuery?: string;
}

// ========================================
// 🎨 COMPONENT
// ========================================

export const FarmListScreen: React.FC = () => {
  const navigation = useNavigation();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [filteredFarms, setFilteredFarms] = useState<Farm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FarmFilters>({});

  // ========================================
  // 🔄 DATA FETCHING
  // ========================================

  const fetchFarms = async () => {
    try {
      setError(null);
      const response = await apiClient.farms.list({
        limit: 100,
      });

      // Transform API response to our Farm interface
      const farmsData: Farm[] = response.data.map((farm: any) => ({
        id: farm.id,
        name: farm.name,
        description: farm.description || '',
        image: farm.image || null,
        location: farm.location || 'Location not specified',
        distance: farm.distance,
        rating: farm.rating || 0,
        reviewCount: farm.reviewCount || 0,
        productCount: farm.productCount || 0,
        isVerified: farm.isVerified || false,
        isCertified: farm.isCertified || false,
        certifications: farm.certifications || [],
      }));

      setFarms(farmsData);
      setFilteredFarms(farmsData);
    } catch (error: any) {
      console.error('Error fetching farms:', error);
      setError('Failed to load farms. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  // ========================================
  // 🔍 FILTERING & SEARCH
  // ========================================

  const applyFilters = useCallback(() => {
    let filtered = [...farms];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (farm) =>
          farm.name.toLowerCase().includes(query) ||
          farm.location.toLowerCase().includes(query) ||
          farm.description.toLowerCase().includes(query)
      );
    }

    // Certified filter
    if (filters.certified) {
      filtered = filtered.filter((farm) => farm.isCertified);
    }

    // Verified filter
    if (filters.verified) {
      filtered = filtered.filter((farm) => farm.isVerified);
    }

    setFilteredFarms(filtered);
  }, [farms, searchQuery, filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // ========================================
  // 🎬 HANDLERS
  // ========================================

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchFarms();
  };

  const handleFarmPress = (farmId: string) => {
    navigation.navigate('FarmDetail' as never, { farmId } as never);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const toggleFilter = (filterKey: keyof FarmFilters) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: !prev[filterKey],
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  // ========================================
  // 🎨 RENDER FUNCTIONS
  // ========================================

  const renderFarmCard = ({ item }: { item: Farm }) => (
    <Card
      onPress={() => handleFarmPress(item.id)}
      style={styles.farmCard}
      padding="none"
    >
      {/* Farm Image */}
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={styles.farmImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>🏡</Text>
          </View>
        )}

        {/* Badges Overlay */}
        <View style={styles.badgesOverlay}>
          {item.isVerified && (
            <Badge variant="success" size="sm">
              ✓ Verified
            </Badge>
          )}
          {item.isCertified && (
            <Badge variant="certified" size="sm">
              🌿 Organic
            </Badge>
          )}
        </View>
      </View>

      {/* Farm Info */}
      <View style={styles.farmInfo}>
        {/* Name and Location */}
        <Text style={styles.farmName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.farmLocation} numberOfLines={1}>
          📍 {item.location}
          {item.distance && ` • ${item.distance} miles away`}
        </Text>

        {/* Description */}
        {item.description && (
          <Text style={styles.farmDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>⭐ {item.rating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>
              ({item.reviewCount} reviews)
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>🥕 {item.productCount}</Text>
            <Text style={styles.statLabel}>products</Text>
          </View>
        </View>

        {/* Certifications */}
        {item.certifications.length > 0 && (
          <View style={styles.certifications}>
            {item.certifications.slice(0, 3).map((cert, index) => (
              <Badge key={index} variant="info" size="sm">
                {cert}
              </Badge>
            ))}
            {item.certifications.length > 3 && (
              <Text style={styles.moreCerts}>
                +{item.certifications.length - 3} more
              </Text>
            )}
          </View>
        )}
      </View>
    </Card>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search farms by name or location..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor={theme.colors.text.tertiary}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filtersRow}>
        <Button
          variant={filters.verified ? 'primary' : 'outline'}
          size="sm"
          onPress={() => toggleFilter('verified')}
          leftIcon="✓"
        >
          Verified
        </Button>
        <Button
          variant={filters.certified ? 'primary' : 'outline'}
          size="sm"
          onPress={() => toggleFilter('certified')}
          leftIcon="🌿"
        >
          Organic
        </Button>
        {(filters.verified || filters.certified || searchQuery) && (
          <Button variant="ghost" size="sm" onPress={clearFilters}>
            Clear All
          </Button>
        )}
      </View>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredFarms.length} {filteredFarms.length === 1 ? 'farm' : 'farms'}{' '}
          found
        </Text>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🏡</Text>
      <Text style={styles.emptyTitle}>No farms found</Text>
      <Text style={styles.emptyMessage}>
        {searchQuery || filters.certified || filters.verified
          ? 'Try adjusting your search or filters'
          : 'Check back soon for new farms'}
      </Text>
      {(searchQuery || filters.certified || filters.verified) && (
        <Button onPress={clearFilters} style={styles.emptyButton}>
          Clear Filters
        </Button>
      )}
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorEmoji}>😕</Text>
      <Text style={styles.errorTitle}>Oops!</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      <Button onPress={fetchFarms} style={styles.errorButton}>
        Try Again
      </Button>
    </View>
  );

  // ========================================
  // 🎨 MAIN RENDER
  // ========================================

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingSpinner message="Loading farms..." />
      </SafeAreaView>
    );
  }

  if (error && farms.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {renderError()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Page Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>🌾 Local Farms</Text>
          <Text style={styles.subtitle}>
            Discover fresh produce from local farmers
          </Text>
        </View>

        {/* Farm List */}
        <FlatList
          data={filteredFarms}
          renderItem={renderFarmCard}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary.main}
            />
          }
        />
      </View>
    </SafeAreaView>
  );
};

// ========================================
// 💅 STYLES
// ========================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  container: {
    flex: 1,
  },
  titleContainer: {
    paddingHorizontal: theme.spacing[6],
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[2],
  },
  title: {
    ...theme.typography.styles.h1,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  subtitle: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.secondary,
  },
  header: {
    paddingHorizontal: theme.spacing[6],
    paddingBottom: theme.spacing[4],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    marginBottom: theme.spacing[4],
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: theme.spacing[2],
  },
  searchInput: {
    flex: 1,
    ...theme.typography.styles.body1,
    color: theme.colors.text.primary,
    padding: 0,
  },
  clearIcon: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    padding: theme.spacing[1],
  },
  filtersRow: {
    flexDirection: 'row',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[4],
  },
  resultsHeader: {
    paddingBottom: theme.spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  resultsCount: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
  },
  listContent: {
    paddingHorizontal: theme.spacing[6],
    paddingBottom: theme.spacing[8],
  },
  farmCard: {
    marginBottom: theme.spacing[4],
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
  },
  farmImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 64,
  },
  badgesOverlay: {
    position: 'absolute',
    top: theme.spacing[3],
    left: theme.spacing[3],
    flexDirection: 'row',
    gap: theme.spacing[2],
  },
  farmInfo: {
    padding: theme.spacing[4],
  },
  farmName: {
    ...theme.typography.styles.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  farmLocation: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[2],
  },
  farmDescription: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: theme.spacing[3],
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing[6],
    marginBottom: theme.spacing[3],
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1],
  },
  statValue: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.semibold,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  statLabel: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
  },
  certifications: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
    alignItems: 'center',
  },
  moreCerts: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing[12],
    paddingHorizontal: theme.spacing[6],
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: theme.spacing[4],
  },
  emptyTitle: {
    ...theme.typography.styles.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  emptyMessage: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing[4],
  },
  emptyButton: {
    marginTop: theme.spacing[2],
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[6],
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: theme.spacing[4],
  },
  errorTitle: {
    ...theme.typography.styles.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  errorMessage: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing[4],
  },
  errorButton: {
    marginTop: theme.spacing[2],
  },
});

// ========================================
// 📦 EXPORTS
// ========================================

export default FarmListScreen;
