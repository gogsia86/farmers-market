"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Star,
  Clock,
  Phone,
  Mail,
  Globe,
  Award,
  Package,
  MessageSquare,
  Navigation,
  Heart,
  Share2,
} from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

/**
 * 🏪 FARM PROFILE TABS COMPONENT - Phase 3
 * Tabbed interface for farm profiles
 * Tabs: Products | About | Reviews | Location
 */

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  inStock: boolean;
  image: string;
  organic?: boolean;
  rating?: number;
}

interface Review {
  id: string;
  customerName: string;
  rating: number;
  reviewText: string;
  createdAt: string;
  isVerifiedPurchase: boolean;
  productName?: string;
}

interface FarmData {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  story: string;
  farmType: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  deliveryRadius: number;
  farmSize: string;
  establishedYear: number;
  rating: number;
  reviewCount: number;
  certifications: string[];
  farmingPractices: string[];
  specialties: string[];
  email?: string;
  phone?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
  };
  products: Product[];
  reviews?: Review[];
  operatingHours?: {
    [key: string]: string;
  };
  owner: {
    name: string;
    bio: string;
    joinedYear: number;
  };
}

interface FarmProfileTabsProps {
  farm: FarmData;
  onAddToCart?: (productId: string) => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
}

type TabType = "products" | "about" | "reviews" | "location";

export function FarmProfileTabs({
  farm,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
}: FarmProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("products");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Get unique categories from products
  const categories = [
    "all",
    ...Array.from(new Set(farm.products.map((p) => p.category))),
  ];

  // Filter products by category
  const filteredProducts =
    selectedCategory === "all"
      ? farm.products
      : farm.products.filter((p) => p.category === selectedCategory);

  const tabs: { id: TabType; label: string; icon: any; count?: number }[] = [
    {
      id: "products",
      label: "Products",
      icon: Package,
      count: farm.products.length,
    },
    { id: "about", label: "About", icon: Award },
    {
      id: "reviews",
      label: "Reviews",
      icon: MessageSquare,
      count: farm.reviewCount,
    },
    { id: "location", label: "Location", icon: MapPin },
  ];

  const defaultOperatingHours = {
    Monday: "8:00 AM - 6:00 PM",
    Tuesday: "8:00 AM - 6:00 PM",
    Wednesday: "8:00 AM - 6:00 PM",
    Thursday: "8:00 AM - 6:00 PM",
    Friday: "8:00 AM - 6:00 PM",
    Saturday: "9:00 AM - 5:00 PM",
    Sunday: "Closed",
  };

  const operatingHours = farm.operatingHours || defaultOperatingHours;

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <nav className="flex gap-2 flex-wrap">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary-50 text-primary-700 border-b-2 border-primary-600"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        activeTab === tab.id
                          ? "bg-primary-600 text-white"
                          : "bg-accent text-muted-foreground"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleFavorite}
              className={isFavorite ? "text-red-600 border-red-600" : ""}
            >
              <Heart
                className={`h-4 w-4 mr-1 ${isFavorite ? "fill-current" : ""}`}
              />
              {isFavorite ? "Saved" : "Save"}
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* PRODUCTS TAB */}
        {activeTab === "products" && (
          <div className="space-y-6">
            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap font-medium text-sm transition-colors ${
                    selectedCategory === category
                      ? "bg-primary-600 text-white"
                      : "bg-accent text-foreground hover:bg-accent/80"
                  }`}
                >
                  {category === "all"
                    ? "All Products"
                    : category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="glass-card rounded-xl overflow-hidden hover:shadow-glow-lg transition-all group"
                >
                  {/* Product Image */}
                  <div className="relative h-48 bg-accent overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="bg-white text-foreground px-4 py-2 rounded-lg font-semibold">
                          Out of Stock
                        </span>
                      </div>
                    )}
                    {product.organic && (
                      <Badge className="absolute top-3 right-3 bg-green-600">
                        Organic
                      </Badge>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground group-hover:text-primary-600 transition-colors">
                        {product.name}
                      </h3>
                      {product.rating && (
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="font-medium">{product.rating}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-gradient-warm">
                          ${product.price.toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground ml-1">
                          / {product.unit}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        disabled={!product.inStock}
                        onClick={() => onAddToCart?.(product.id)}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No products found
                </h3>
                <p className="text-muted-foreground">
                  Try selecting a different category
                </p>
              </div>
            )}
          </div>
        )}

        {/* ABOUT TAB */}
        {activeTab === "about" && (
          <div className="space-y-8">
            {/* Farm Story */}
            <section>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Our Story
              </h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {farm.story}
              </p>
            </section>

            {/* Farm Details Grid */}
            <section className="grid md:grid-cols-2 gap-6">
              {/* Farm Info */}
              <div className="glass-card p-6 rounded-xl">
                <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary-600" />
                  Farm Details
                </h4>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">Farm Type</dt>
                    <dd className="text-sm font-medium text-foreground">
                      {farm.farmType}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">Farm Size</dt>
                    <dd className="text-sm font-medium text-foreground">
                      {farm.farmSize}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">
                      Established
                    </dt>
                    <dd className="text-sm font-medium text-foreground">
                      {farm.establishedYear}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">
                      Delivery Radius
                    </dt>
                    <dd className="text-sm font-medium text-foreground">
                      {farm.deliveryRadius} miles
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Owner Info */}
              <div className="glass-card p-6 rounded-xl">
                <h4 className="font-semibold text-foreground mb-4">
                  Meet the Farmer
                </h4>
                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium text-foreground">
                      {farm.owner.name}
                    </h5>
                    <p className="text-sm text-muted-foreground">
                      Member since {farm.owner.joinedYear}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {farm.owner.bio}
                  </p>
                </div>
              </div>
            </section>

            {/* Certifications & Practices */}
            <section className="grid md:grid-cols-2 gap-6">
              {/* Certifications */}
              {farm.certifications.length > 0 && (
                <div>
                  <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary-600" />
                    Certifications
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {farm.certifications.map((cert, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="px-3 py-1"
                      >
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Farming Practices */}
              {farm.farmingPractices.length > 0 && (
                <div>
                  <h4 className="font-semibold text-foreground mb-4">
                    Farming Practices
                  </h4>
                  <ul className="space-y-2">
                    {farm.farmingPractices.map((practice, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="text-green-600 mt-0.5">✓</span>
                        {practice}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* Specialties */}
            {farm.specialties.length > 0 && (
              <section>
                <h4 className="font-semibold text-foreground mb-4">
                  Our Specialties
                </h4>
                <div className="flex flex-wrap gap-2">
                  {farm.specialties.map((specialty, index) => (
                    <Badge
                      key={index}
                      className="bg-primary-100 text-primary-700 hover:bg-primary-200"
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            {/* Reviews Summary */}
            <div className="glass-card p-6 rounded-xl">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-gradient-warm mb-2">
                    {farm.rating.toFixed(1)}
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(farm.rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {farm.reviewCount} reviews
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-muted-foreground mb-4">
                    Based on verified purchases from our customers
                  </p>
                  <Button>Write a Review</Button>
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {farm.reviews && farm.reviews.length > 0 ? (
                farm.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="glass-card p-6 rounded-xl space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-semibold text-foreground">
                            {review.customerName}
                          </h5>
                          {review.isVerifiedPurchase && (
                            <Badge variant="outline" className="text-xs">
                              Verified Purchase
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {review.productName && (
                      <p className="text-sm text-muted-foreground">
                        Product: {review.productName}
                      </p>
                    )}
                    <p className="text-muted-foreground leading-relaxed">
                      {review.reviewText}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No reviews yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to review this farm!
                  </p>
                  <Button>Write a Review</Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* LOCATION TAB */}
        {activeTab === "location" && (
          <div className="space-y-6">
            {/* Map Placeholder */}
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="h-96 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center relative">
                <MapPin className="h-16 w-16 text-primary-600" />
                <div className="absolute bottom-4 left-4 right-4 glass-card p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Interactive map will be integrated here
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Google Maps / Mapbox integration coming soon
                  </p>
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Address & Contact */}
              <div className="glass-card p-6 rounded-xl space-y-4">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary-600" />
                  Address & Contact
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {farm.address}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {farm.city}, {farm.state} {farm.zipCode}
                    </p>
                  </div>
                  {farm.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`tel:${farm.phone}`}
                        className="text-sm text-primary-600 hover:underline"
                      >
                        {farm.phone}
                      </a>
                    </div>
                  )}
                  {farm.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`mailto:${farm.email}`}
                        className="text-sm text-primary-600 hover:underline"
                      >
                        {farm.email}
                      </a>
                    </div>
                  )}
                  {farm.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={farm.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
                <Button className="w-full">
                  <Navigation className="h-4 w-4 mr-2" />
                  Get Directions
                </Button>
              </div>

              {/* Operating Hours */}
              <div className="glass-card p-6 rounded-xl space-y-4">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary-600" />
                  Operating Hours
                </h4>
                <dl className="space-y-2">
                  {Object.entries(operatingHours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between text-sm">
                      <dt className="text-muted-foreground">{day}</dt>
                      <dd
                        className={`font-medium ${
                          hours === "Closed"
                            ? "text-red-600"
                            : "text-foreground"
                        }`}
                      >
                        {hours}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="glass-card p-6 rounded-xl">
              <h4 className="font-semibold text-foreground mb-4">
                Delivery Information
              </h4>
              <p className="text-muted-foreground mb-4">
                This farm delivers within a {farm.deliveryRadius}-mile radius of
                their location.
              </p>
              <div className="flex gap-3">
                <Button variant="outline">Check Delivery Availability</Button>
                <Button variant="outline">View Delivery Schedule</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
