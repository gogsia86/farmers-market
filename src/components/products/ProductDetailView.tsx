/**
 * PRODUCT DETAIL VIEW - COMPREHENSIVE PRODUCT DISPLAY
 *
 * Main component for displaying full product information including:
 * - Image gallery
 * - Product details
 * - Pricing and availability
 * - Farmer information
 * - Add to cart functionality
 *
 * Divine Patterns: Holographic component, agricultural consciousness
 */

"use client";

import type { QuantumProduct } from "@/types/product.types";
import {
  Award,
  Calendar,
  Heart,
  Leaf,
  MapPin,
  Package,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// ============================================================================
// PRODUCT DETAIL VIEW COMPONENT
// ============================================================================

interface ProductDetailViewProps {
  product: QuantumProduct;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleAddToCart = () => {
    console.log("Add to cart:", { product: product.identity.id, quantity });
    // TODO: Implement cart functionality
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    console.log("Toggle favorite:", product.identity.id);
  };

  const images = [
    `/images/products/${product.identity.slug}-1.jpg`,
    `/images/products/${product.identity.slug}-2.jpg`,
    `/images/products/${product.identity.slug}-3.jpg`,
  ];

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={images[selectedImage]}
                alt={product.identity.name}
                fill
                className="object-cover"
                priority
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.quality.organic && (
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Leaf className="w-4 h-4" />
                    Organic
                  </span>
                )}
                {!product.seasonality.isYearRound && (
                  <span className="bg-agricultural-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Seasonal
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-3 gap-4">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? "border-agricultural-600 scale-105"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.identity.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {product.identity.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={`star-${i}`}
                      className={`w-5 h-5 ${
                        product.metrics &&
                        i < Math.floor(product.metrics.rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  ({product.metrics?.reviewCount || 0} reviews)
                </span>
              </div>

              {/* Category */}
              <p className="text-sm text-gray-500 mb-4">
                Category: {String(product.metadata.category).replace(/_/g, " ")}
              </p>
            </div>

            {/* Price */}
            <div className="border-t border-b border-gray-200 py-6">
              <div className="flex items-baseline gap-3">
                {product.pricing.salePrice ? (
                  <>
                    <span className="text-4xl font-bold text-agricultural-600">
                      ${product.pricing.salePrice.toFixed(2)}
                    </span>
                    <span className="text-2xl text-gray-400 line-through">
                      ${product.pricing.basePrice.toFixed(2)}
                    </span>
                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                      Save $
                      {(
                        product.pricing.basePrice - product.pricing.salePrice
                      ).toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-4xl font-bold text-agricultural-600">
                    ${product.pricing.basePrice.toFixed(2)}
                  </span>
                )}
                <span className="text-gray-600">
                  / {product.inventory.unit}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-3">About this product</h2>
              <p className="text-gray-700 leading-relaxed">
                {product.identity.description ||
                  "Fresh, locally grown produce from our partner farms."}
              </p>
            </div>

            {/* Availability */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-agricultural-600" />
                <span className="font-semibold">
                  {product.inventory.quantumState === "AVAILABLE"
                    ? "In Stock"
                    : "Out of Stock"}
                </span>
                {product.inventory.quantityAvailable > 0 && (
                  <span className="text-sm text-gray-600">
                    ({product.inventory.quantityAvailable} available)
                  </span>
                )}
              </div>

              {product.inventory.lastHarvestDate && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span>
                    Harvested:{" "}
                    {new Date(
                      product.inventory.lastHarvestDate
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Truck className="w-5 h-5" />
                <span>Free delivery on orders over $50</span>
              </div>
            </div>

            {/* Certifications */}
            {product.quality.certifications &&
              product.quality.certifications.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-agricultural-600" />
                    Certifications
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.quality.certifications.map((cert, index) => (
                      <span
                        key={`cert-${index}`}
                        className="bg-agricultural-100 text-agricultural-700 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {cert.type.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-md border border-gray-300 hover:bg-gray-50 flex items-center justify-center font-semibold"
                  >
                    -
                  </button>
                  <span className="w-16 text-center text-lg font-semibold">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-md border border-gray-300 hover:bg-gray-50 flex items-center justify-center font-semibold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.inventory.quantumState !== "AVAILABLE"}
                  className={`flex-1 py-4 rounded-md font-semibold text-lg flex items-center justify-center gap-2 transition-all ${
                    product.inventory.quantumState === "AVAILABLE"
                      ? "bg-agricultural-600 hover:bg-agricultural-700 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {product.inventory.quantumState === "AVAILABLE"
                    ? "Add to Cart"
                    : "Out of Stock"}
                </button>

                <button
                  onClick={handleToggleFavorite}
                  className={`w-14 h-14 rounded-md border-2 flex items-center justify-center transition-all ${
                    isFavorite
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-red-500 hover:bg-red-50"
                  }`}
                >
                  <Heart
                    className={`w-6 h-6 ${
                      isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Farmer Info */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold mb-3">From the Farm</h3>
              <Link
                href={`/farms/${product.metadata.farmId}`}
                className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-agricultural-600 hover:bg-agricultural-50 transition-all"
              >
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-agricultural-600" />
                </div>
                <div>
                  <p className="font-semibold">View Farm Details</p>
                  <p className="text-sm text-gray-600">
                    Learn more about where your food comes from
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
