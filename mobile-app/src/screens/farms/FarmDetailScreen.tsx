// 🌾 Farm Detail Screen - Farm Profile Page
// Displays detailed information about a farm with products and location

import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
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

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string | null;
  stock: number;
  isOrganic: boolean;
}

interface Farm {
  id: string;
  name: string;
  description: string;
  image: string | null;
  bannerImage: string | null;
  location: string;
  address: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  distance?: number;
  rating: number;
  reviewCount: number;
  productCount: number;
  isVerified: boolean;
  isCertified: boolean;
  certifications: string[];
  story: string | null;
  ownerName: string | null;
  established: string | null;
  farmSize: string | null;
  farmingPractices: string[];
}

// ========================================
// 🎨 COMPONENT
// ========================================

export const FarmDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { farmId } = (route.params as { farmId: string }) || {};

  const [farm, setFarm] = useState<Farm | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'about' | 'products'>('about');

  // ========================================
  // 🔄 DATA FETCHING
  // ========================================

  const fetchFarmDetails = async () => {
    if (!farmId) {
      setError('Farm ID not provided');
      setIsLoading(false);
      return;
    }

    try {
      setError(null);

      // Fetch farm details
      const farmResponse = await apiClient.farms.getById(farmId);

      // Transform API response
      const farmData: Farm = {
        id: farmResponse.data.id,
        name: farmResponse.data.name,
        description: farmResponse.data.description || '',
        image: farmResponse.data.image || null,
        bannerImage: farmResponse.data.bannerImage || null,
        location: farmResponse.data.location || 'Location not specified',
        address: farmResponse.data.address || '',
        phone: farmResponse.data.phone || null,
        email: farmResponse.data.email || null,
        website: farmResponse.data.website || null,
        distance: farmResponse.data.distance,
        rating: farmResponse.data.rating || 0,
        reviewCount: farmResponse.data.reviewCount || 0,
        productCount: farmResponse.data.productCount || 0,
        isVerified: farmResponse.data.isVerified || false,
        isCertified: farmResponse.data.isCertified || false,
        certifications: farmResponse.data.certifications || [],
        story: farmResponse.data.story || null,
        ownerName: farmResponse.data.ownerName || null,
        established: farmResponse.data.established || null,
        farmSize: farmResponse.data.farmSize || null,
        farmingPractices: farmResponse.data.farmingPractices || [],
      };

      setFarm(farmData);

      // Fetch farm's products
      const productsResponse = await apiClient.farms.getProducts(farmId);
      const productsData: Product[] = productsResponse.data.map((product: any) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit || 'unit',
        image: product.image || null,
        stock: product.stock || 0,
        isOrganic: product.isOrganic || false,
      }));

      setProducts(productsData);
    } catch (error: any) {
      console.error('Error fetching farm details:', error);
      setError('Failed to load farm details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmDetails();
  }, [farmId]);

  // ========================================
  // 🎬 HANDLERS
  // ========================================

  const handleBack = () => {
    navigation.goBack();
  };

  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetail' as never, { productId } as never);
  };

  const handleCall = () => {
    if (farm?.phone) {
      Linking.openURL(`tel:${farm.phone}`);
    }
  };

  const handleEmail = () => {
    if (farm?.email) {
      Linking.openURL(`mailto:${farm.email}`);
    }
  };

  const handleWebsite = () => {
    if (farm?.website) {
      Linking.openURL(farm.website);
    }
  };

  const handleDirections = () => {
    if (farm?.address) {
      const encodedAddress = encodeURIComponent(farm.address);
      Linking.openURL(`https://maps.google.com/?q=${encodedAddress}`);
    }
  };

  // ========================================
  // 🎨 RENDER FUNCTIONS
  // ========================================

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Banner Image */}
      <View style={styles.bannerContainer}>
        {farm?.bannerImage || farm?.image ? (
          <Image
            source={{ uri: farm.bannerImage || farm.image || '' }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.bannerPlaceholder}>
            <Text style={styles.bannerPlaceholderText}>🏡</Text>
          </View>
        )}

        {/* Back Button */}
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>

        {/* Badges */}
        <View style={styles.headerBadges}>
          {farm?.isVerified && (
            <Badge variant="success" size="sm">
              ✓ Verified
            </Badge>
          )}
          {farm?.isCertified && (
            <Badge variant="certified" size="sm">
              🌿 Organic
            </Badge>
          )}
        </View>
      </View>

      {/* Farm Info */}
      <View style={styles.farmInfoSection}>
        <Text style={styles.farmName}>{farm?.name}</Text>

        <View style={styles.locationRow}>
          <Text style={styles.locationText}>
            📍 {farm?.location}
            {farm?.distance && ` • ${farm.distance} miles away`}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>⭐ {farm?.rating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>({farm?.reviewCount} reviews)</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>🥕 {farm?.productCount}</Text>
            <Text style={styles.statLabel}>products</Text>
          </View>
        </View>

        {farm?.description && (
          <Text style={styles.farmDescription}>{farm.description}</Text>
        )}
      </View>

      {/* Contact Buttons */}
      <View style={styles.contactButtons}>
        {farm?.phone && (
          <Button
            variant="outline"
            size="sm"
            onPress={handleCall}
            leftIcon="📞"
            style={styles.contactButton}
          >
            Call
          </Button>
        )}
        {farm?.email && (
          <Button
            variant="outline"
            size="sm"
            onPress={handleEmail}
            leftIcon="✉️"
            style={styles.contactButton}
          >
            Email
          </Button>
        )}
        {farm?.website && (
          <Button
            variant="outline"
            size="sm"
            onPress={handleWebsite}
            leftIcon="🌐"
            style={styles.contactButton}
          >
            Website
          </Button>
        )}
        <Button
          variant="primary"
          size="sm"
          onPress={handleDirections}
          leftIcon="🗺️"
          style={styles.contactButton}
        >
          Directions
        </Button>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, activeTab === 'about' && styles.activeTab]}
          onPress={() => setActiveTab('about')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'about' && styles.activeTabText,
            ]}
          >
            About
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'products' && styles.activeTab]}
          onPress={() => setActiveTab('products')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'products' && styles.activeTabText,
            ]}
          >
            Products ({farm?.productCount || 0})
          </Text>
        </Pressable>
      </View>
    </View>
  );

  const renderAboutTab = () => (
    <View style={styles.tabContent}>
      {/* Farm Story */}
      {farm?.story && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>🌾 Our Story</Text>
          <Text style={styles.sectionText}>{farm.story}</Text>
        </Card>
      )}

      {/* Farm Details */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Farm Details</Text>

        {farm?.ownerName && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Owner:</Text>
            <Text style={styles.detailValue}>{farm.ownerName}</Text>
          </View>
        )}

        {farm?.established && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Established:</Text>
            <Text style={styles.detailValue}>{farm.established}</Text>
          </View>
        )}

        {farm?.farmSize && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Farm Size:</Text>
            <Text style={styles.detailValue}>{farm.farmSize}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Address:</Text>
          <Text style={styles.detailValue}>{farm?.address}</Text>
        </View>
      </Card>

      {/* Certifications */}
      {farm?.certifications && farm.certifications.length > 0 && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Certifications</Text>
          <View style={styles.certificationsGrid}>
            {farm.certifications.map((cert, index) => (
              <Badge key={index} variant="certified" size="md">
                {cert}
              </Badge>
            ))}
          </View>
        </Card>
      )}

      {/* Farming Practices */}
      {farm?.farmingPractices && farm.farmingPractices.length > 0 && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>🌱 Farming Practices</Text>
          <View style={styles.practicesList}>
            {farm.farmingPractices.map((practice, index) => (
              <View key={index} style={styles.practiceItem}>
                <Text style={styles.practiceIcon}>✓</Text>
                <Text style={styles.practiceText}>{practice}</Text>
              </View>
            ))}
          </View>
        </Card>
      )}
    </View>
  );

  const renderProductsTab = () => (
    <View style={styles.tabContent}>
      {products.length === 0 ? (
        <View style={styles.emptyProducts}>
          <Text style={styles.emptyProductsEmoji}>🥕</Text>
          <Text style={styles.emptyProductsText}>
            No products available at the moment
          </Text>
        </View>
      ) : (
        <View style={styles.productsGrid}>
          {products.map((product) => (
            <Card
              key={product.id}
              onPress={() => handleProductPress(product.id)}
              style={styles.productCard}
              padding="none"
            >
              <View style={styles.productImageContainer}>
                {product.image ? (
                  <Image
                    source={{ uri: product.image }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.productImagePlaceholder}>
                    <Text style={styles.productImagePlaceholderText}>🥬</Text>
                  </View>
                )}
                {product.isOrganic && (
                  <View style={styles.organicBadge}>
                    <Badge variant="organic" size="sm">
                      🌿
                    </Badge>
                  </View>
                )}
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>
                  {product.name}
                </Text>
                <Text style={styles.productPrice}>
                  ${product.price.toFixed(2)}/{product.unit}
                </Text>
                <Text style={styles.productStock}>
                  {product.inStock && product.quantityAvailable
                    ? `${product.quantityAvailable.toString()} in stock`
                    : 'Out of stock'}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      )}
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorEmoji}>😕</Text>
      <Text style={styles.errorTitle}>Oops!</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      <Button onPress={fetchFarmDetails} style={styles.errorButton}>
        Try Again
      </Button>
      <Button
        variant="ghost"
        onPress={handleBack}
        style={styles.errorBackButton}
      >
        Go Back
      </Button>
    </View>
  );

  // ========================================
  // 🎨 MAIN RENDER
  // ========================================

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingSpinner message="Loading farm details..." />
      </SafeAreaView>
    );
  }

  if (error || !farm) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {renderError()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {activeTab === 'about' ? renderAboutTab() : renderProductsTab()}
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing[8],
  },
  headerContainer: {
    marginBottom: theme.spacing[4],
  },
  bannerContainer: {
    position: 'relative',
    width: '100%',
    height: 240,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerPlaceholderText: {
    fontSize: 80,
  },
  backButton: {
    position: 'absolute',
    top: theme.spacing[4],
    left: theme.spacing[4],
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
  },
  backButtonText: {
    fontSize: 24,
    color: theme.colors.text.primary,
  },
  headerBadges: {
    position: 'absolute',
    top: theme.spacing[4],
    right: theme.spacing[4],
    flexDirection: 'row',
    gap: theme.spacing[2],
  },
  farmInfoSection: {
    paddingHorizontal: theme.spacing[6],
    paddingTop: theme.spacing[4],
  },
  farmName: {
    ...theme.typography.styles.h1,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  locationRow: {
    marginBottom: theme.spacing[3],
  },
  locationText: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.secondary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1],
  },
  statValue: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.semibold,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  statLabel: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: theme.colors.border.light,
    marginHorizontal: theme.spacing[4],
  },
  farmDescription: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.secondary,
    lineHeight: 22,
  },
  contactButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
    paddingHorizontal: theme.spacing[6],
    paddingTop: theme.spacing[4],
  },
  contactButton: {
    flex: 1,
    minWidth: 100,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    marginTop: theme.spacing[4],
    paddingHorizontal: theme.spacing[6],
  },
  tab: {
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    marginRight: theme.spacing[2],
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary.main,
  },
  tabText: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
  },
  activeTabText: {
    color: theme.colors.primary.main,
  },
  tabContent: {
    paddingHorizontal: theme.spacing[6],
    paddingTop: theme.spacing[4],
  },
  section: {
    marginBottom: theme.spacing[4],
  },
  sectionTitle: {
    ...theme.typography.styles.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
  },
  sectionText: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.secondary,
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing[2],
  },
  detailLabel: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.secondary,
    width: 100,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
  },
  detailValue: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.primary,
    flex: 1,
  },
  certificationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
  },
  practicesList: {
    gap: theme.spacing[2],
  },
  practiceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  practiceIcon: {
    fontSize: 16,
    color: theme.colors.primary.main,
    marginRight: theme.spacing[2],
    marginTop: 2,
  },
  practiceText: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[3],
  },
  productCard: {
    width: '47%',
    marginBottom: theme.spacing[2],
  },
  productImageContainer: {
    position: 'relative',
    width: '100%',
    height: 120,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImagePlaceholderText: {
    fontSize: 40,
  },
  organicBadge: {
    position: 'absolute',
    top: theme.spacing[2],
    right: theme.spacing[2],
  },
  productInfo: {
    padding: theme.spacing[2],
  },
  productName: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.semibold,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing[1],
  },
  productPrice: {
    ...theme.typography.styles.body2,
    color: theme.colors.primary.main,
    marginBottom: theme.spacing[1],
  },
  productStock: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
  },
  emptyProducts: {
    alignItems: 'center',
    paddingVertical: theme.spacing[12],
  },
  emptyProductsEmoji: {
    fontSize: 64,
    marginBottom: theme.spacing[4],
  },
  emptyProductsText: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.secondary,
    textAlign: 'center',
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
    minWidth: 200,
  },
  errorBackButton: {
    marginTop: theme.spacing[2],
  },
});

// ========================================
// 📦 EXPORTS
// ========================================

export default FarmDetailScreen;
