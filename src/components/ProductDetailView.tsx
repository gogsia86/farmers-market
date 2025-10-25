/**
 * PRODUCT DETAIL VIEW COMPONENT
 * Divine React component for complete product page display
 * Comprehensive product consciousness with quantum information architecture
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Product } from "@/types/product";
import {
  Award,
  Calendar,
  Heart,
  MapPin,
  Package,
  ShoppingCart,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface ProductDetailViewProps {
  product: Product;
  onAddToCart?: (productId: string, quantity: number) => void;
  onAddToWishlist?: (productId: string) => void;
}

export function ProductDetailView({
  product,
  onAddToCart,
  onAddToWishlist,
}: ProductDetailViewProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const images =
    product.images.length > 0
      ? product.images
      : [
          {
            id: "placeholder",
            url: "/images/placeholder-product.jpg",
            alt: product.name,
            isPrimary: true,
            order: 0,
            uploadedAt: new Date(),
          },
        ];

  const isAvailable =
    product.status === "AVAILABLE" && product.inventory.inStock;
  const maxQuantity = Math.min(
    product.inventory.availableQuantity,
    product.pricing.maxOrderQuantity || 999
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={images[selectedImage].url}
              alt={images[selectedImage].alt}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />

            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isFeatured && (
                <Badge variant="default" className="bg-yellow-500">
                  Featured
                </Badge>
              )}
              {product.attributes.isOrganic && (
                <Badge variant="success" className="bg-green-600">
                  Certified Organic
                </Badge>
              )}
              {!isAvailable && (
                <Badge variant="destructive" className="text-lg px-4 py-2">
                  Out of Stock
                </Badge>
              )}
            </div>
          </div>

          {/* Image Thumbnails */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(index)}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-md border-2 transition-all",
                    selectedImage === index
                      ? "border-primary"
                      : "border-transparent hover:border-gray-300"
                  )}
                >
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 25vw, 10vw"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

            {/* Farm Info */}
            {product.farm && (
              <Link
                href={`/farms/${product.farm.slug}`}
                className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
              >
                {product.farm.logoUrl && (
                  <Image
                    src={product.farm.logoUrl}
                    alt={product.farm.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                )}
                <span className="text-lg">{product.farm.name}</span>
                {product.farm.verificationStatus === "VERIFIED" && (
                  <Badge variant="outline">
                    <Award className="h-3 w-3 mr-1" />
                    Verified Farm
                  </Badge>
                )}
              </Link>
            )}
          </div>

          {/* Price */}
          <div className="border-y py-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary">
                ${product.pricing.basePrice.amount.toFixed(2)}
              </span>
              <span className="text-xl text-gray-500">
                / {product.pricing.basePrice.unit}
              </span>
            </div>

            {/* Bulk Pricing */}
            {product.pricing.bulkPricing &&
              product.pricing.bulkPricing.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  <p className="font-medium">Bulk Pricing Available:</p>
                  <ul className="mt-1 space-y-1">
                    {product.pricing.bulkPricing.map((bulk, index) => (
                      <li key={index}>
                        {bulk.minQuantity}+ {product.pricing.basePrice.unit}: $
                        {bulk.pricePerUnit.toFixed(2)} each
                        {bulk.discountPercentage && (
                          <Badge variant="success" className="ml-2 text-xs">
                            {bulk.discountPercentage}% off
                          </Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>

          {/* Attributes */}
          <div className="flex flex-wrap gap-2">
            {product.attributes.isOrganic && (
              <Badge variant="success" className="px-3 py-1">
                <Award className="h-4 w-4 mr-1" />
                Organic
              </Badge>
            )}
            {product.attributes.isNonGMO && (
              <Badge variant="success" className="px-3 py-1">
                Non-GMO
              </Badge>
            )}
            {product.attributes.isLocallyGrown && (
              <Badge variant="outline" className="px-3 py-1">
                <MapPin className="h-4 w-4 mr-1" />
                Locally Grown
              </Badge>
            )}
            {product.attributes.isSeasonal && (
              <Badge variant="outline" className="px-3 py-1">
                <Calendar className="h-4 w-4 mr-1" />
                Seasonal
              </Badge>
            )}
            {product.attributes.isPesticideFree && (
              <Badge variant="outline" className="px-3 py-1">
                Pesticide-Free
              </Badge>
            )}
          </div>

          {/* Quantity & Add to Cart */}
          {isAvailable && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      −
                    </Button>
                    <span className="text-xl font-semibold w-16 text-center">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setQuantity(Math.min(maxQuantity, quantity + 1))
                      }
                      disabled={quantity >= maxQuantity}
                    >
                      +
                    </Button>
                    <span className="text-sm text-gray-600">
                      ({product.inventory.availableQuantity} available)
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => onAddToCart?.(product.id, quantity)}
                    className="flex-1"
                    size="lg"
                    disabled={!onAddToCart}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    onClick={() => onAddToWishlist?.(product.id)}
                    variant="outline"
                    size="lg"
                    disabled={!onAddToWishlist}
                  >
                    <Heart className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!isAvailable && (
            <Card>
              <CardContent className="p-6 text-center">
                <Package className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p className="text-lg font-semibold text-gray-600">
                  Currently Out of Stock
                </p>
                {product.inventory.nextHarvestDate && (
                  <p className="text-sm text-gray-500 mt-1">
                    Next harvest expected:{" "}
                    {new Date(
                      product.inventory.nextHarvestDate
                    ).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Product Details Tabs */}
      <Tabs defaultValue="description" className="mt-12">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="harvest">Harvest Info</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-line">
            {product.description || "No description available."}
          </p>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardContent className="p-6">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="font-semibold text-gray-600">Category</dt>
                  <dd className="mt-1">{product.category}</dd>
                </div>
                {product.subCategory && (
                  <div>
                    <dt className="font-semibold text-gray-600">Subcategory</dt>
                    <dd className="mt-1">{product.subCategory}</dd>
                  </div>
                )}
                <div>
                  <dt className="font-semibold text-gray-600">Unit</dt>
                  <dd className="mt-1">{product.pricing.basePrice.unit}</dd>
                </div>
                {product.sku && (
                  <div>
                    <dt className="font-semibold text-gray-600">SKU</dt>
                    <dd className="mt-1">{product.sku}</dd>
                  </div>
                )}
                <div>
                  <dt className="font-semibold text-gray-600">Seasons</dt>
                  <dd className="mt-1 flex gap-2">
                    {product.seasons.map((season) => (
                      <Badge key={season} variant="outline">
                        {season}
                      </Badge>
                    ))}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certifications">
          <Card>
            <CardContent className="p-6">
              {product.certifications.length > 0 ? (
                <div className="space-y-4">
                  {product.certifications.map((cert, index) => (
                    <div
                      key={index}
                      className="border-b last:border-0 pb-4 last:pb-0"
                    >
                      <div className="flex items-start gap-3">
                        <Award className="h-6 w-6 text-green-600 mt-1" />
                        <div>
                          <h4 className="font-semibold">
                            {cert.type} Certified
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Certified by: {cert.certifier}
                          </p>
                          {cert.certificateNumber && (
                            <p className="text-sm text-gray-600">
                              Certificate #: {cert.certificateNumber}
                            </p>
                          )}
                          {cert.verifiedDate && (
                            <p className="text-sm text-gray-600">
                              Verified:{" "}
                              {new Date(cert.verifiedDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">
                  No certifications listed for this product.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="harvest">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {product.harvestPeriod && (
                  <div>
                    <h4 className="font-semibold mb-2">Harvest Period</h4>
                    <p className="text-gray-700">
                      {new Date(
                        product.harvestPeriod.start
                      ).toLocaleDateString()}{" "}
                      -{" "}
                      {new Date(product.harvestPeriod.end).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {product.inventory.nextHarvestDate && (
                  <div>
                    <h4 className="font-semibold mb-2">Next Harvest</h4>
                    <p className="text-gray-700">
                      {new Date(
                        product.inventory.nextHarvestDate
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {product.inventory.lastRestocked && (
                  <div>
                    <h4 className="font-semibold mb-2">Last Restocked</h4>
                    <p className="text-gray-700">
                      {new Date(
                        product.inventory.lastRestocked
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
