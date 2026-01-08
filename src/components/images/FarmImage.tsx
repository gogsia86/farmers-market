/**
 * 🖼️ FARM IMAGE COMPONENT
 * Reusable component for displaying farm images with intelligent fallbacks
 * ALWAYS shows an image - uses placeholders when none available
 */

import type { Farm } from "@prisma/client";
import Image from "next/image";

interface FarmImageProps {
  farm: Pick<Farm, "id" | "name" | "images" | "logoUrl" | "bannerUrl">;
  variant?: "hero" | "card" | "thumbnail" | "logo";
  className?: string;
  priority?: boolean;
  sizes?: string;
}

/**
 * Get the best available image for a farm
 * Priority: bannerUrl > logoUrl > images[0] > null
 */
function getBestFarmImage(farm: FarmImageProps["farm"], variant: FarmImageProps["variant"]): string | null {
  if (variant === "logo" && farm.logoUrl) {
    return farm.logoUrl;
  }

  if (variant === "hero" && farm.bannerUrl) {
    return farm.bannerUrl;
  }

  // For card and thumbnail, prefer banner then logo
  if (farm.bannerUrl) return farm.bannerUrl;
  if (farm.logoUrl) return farm.logoUrl;
  if (farm.images && farm.images.length > 0) return farm.images[0];

  return null;
}

/**
 * FarmImage Component
 *
 * Displays farm images with automatic fallback to placeholder
 * Uses Next.js Image for optimization
 *
 * @example
 * ```tsx
 * <FarmImage
 *   farm={farm}
 *   variant="card"
 *   className="rounded-lg"
 * />
 * ```
 */
export function FarmImage({
  farm,
  variant = "card",
  className = "",
  priority = false,
  sizes,
}: FarmImageProps) {
  const imageUrl = getBestFarmImage(farm, variant);

  // Define responsive sizes based on variant
  const defaultSizes = {
    hero: "100vw",
    card: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
    thumbnail: "(max-width: 768px) 25vw, 10vw",
    logo: "(max-width: 768px) 80px, 120px",
  };

  const imageSizes = sizes || defaultSizes[variant];

  // Aspect ratio classes based on variant
  const aspectRatioClasses = {
    hero: "h-96",
    card: "h-48",
    thumbnail: "h-24 w-24",
    logo: "h-20 w-20",
  };

  if (!imageUrl) {
    // Show beautiful placeholder when no image available
    return (
      <div
        className={`relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 ${aspectRatioClasses[variant]} ${className}`}
      >
        <div className="flex h-full w-full items-center justify-center">
          <div className="text-center">
            <div
              className={`${variant === "hero"
                  ? "text-9xl"
                  : variant === "card"
                    ? "text-6xl"
                    : variant === "thumbnail"
                      ? "text-3xl"
                      : "text-4xl"
                }`}
            >
              🌾
            </div>
            {variant === "hero" && (
              <p className="mt-2 text-xl font-semibold text-gray-700">
                {farm.name}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show optimized image
  return (
    <div
      className={`relative overflow-hidden ${variant !== "thumbnail" && variant !== "logo" ? aspectRatioClasses[variant] : ""
        } ${className}`}
    >
      <Image
        src={imageUrl}
        alt={`${farm.name} - Farm Photo`}
        fill={variant !== "thumbnail" && variant !== "logo"}
        width={variant === "thumbnail" ? 96 : variant === "logo" ? 80 : undefined}
        height={variant === "thumbnail" ? 96 : variant === "logo" ? 80 : undefined}
        className={`object-cover transition-transform duration-300 ${variant === "card" ? "group-hover:scale-105" : ""
          }`}
        sizes={imageSizes}
        priority={priority}
        quality={85}
      />
    </div>
  );
}

/**
 * FarmImageGallery Component
 *
 * Displays a photo gallery for farm detail pages
 * Shows primary image + grid of additional photos
 */
interface FarmImageGalleryProps {
  farm: Pick<Farm, "id" | "name" | "images" | "logoUrl" | "bannerUrl">;
  additionalPhotos?: string[];
}

export function FarmImageGallery({ farm, additionalPhotos = [] }: FarmImageGalleryProps) {
  // Collect all available photos
  const allPhotos = [
    ...(farm.bannerUrl ? [farm.bannerUrl] : []),
    ...(farm.logoUrl && farm.logoUrl !== farm.bannerUrl ? [farm.logoUrl] : []),
    ...farm.images,
    ...additionalPhotos,
  ];

  // Remove duplicates
  const uniquePhotos = Array.from(new Set(allPhotos));

  const primaryPhoto = uniquePhotos[0];
  const secondaryPhotos = uniquePhotos.slice(1, 5);

  if (uniquePhotos.length === 0) {
    // Show beautiful placeholder gallery
    return (
      <div className="mb-8">
        <div className="relative h-96 w-full overflow-hidden rounded-lg bg-gradient-to-br from-green-50 to-emerald-100">
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-4 text-9xl">🌾</div>
              <p className="text-xl font-semibold text-gray-700">{farm.name}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {/* Primary Photo */}
      <div className="relative h-96 w-full overflow-hidden rounded-t-lg">
        <Image
          src={primaryPhoto}
          alt={`${farm.name} - Main Photo`}
          fill
          className="object-cover"
          priority
          sizes="100vw"
          quality={90}
        />
      </div>

      {/* Additional Photos Grid */}
      {secondaryPhotos.length > 0 && (
        <div className="grid grid-cols-2 gap-2 rounded-b-lg bg-white p-2 md:grid-cols-4">
          {secondaryPhotos.map((photo, index) => (
            <div
              key={index}
              className="relative h-24 overflow-hidden rounded-md"
            >
              <Image
                src={photo}
                alt={`${farm.name} - Photo ${index + 2}`}
                fill
                className="object-cover transition-transform hover:scale-110"
                sizes="(max-width: 768px) 50vw, 25vw"
                quality={80}
              />
            </div>
          ))}
          {uniquePhotos.length > 5 && (
            <div className="relative flex h-24 items-center justify-center rounded-md bg-gray-100">
              <span className="text-lg font-semibold text-gray-600">
                +{uniquePhotos.length - 5} more
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * FarmLogoAvatar Component
 *
 * Small circular avatar for farm logos
 * Used in navigation, comments, etc.
 */
interface FarmLogoAvatarProps {
  farm: Pick<Farm, "id" | "name" | "logoUrl">;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function FarmLogoAvatar({ farm, size = "md", className = "" }: FarmLogoAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const emojiSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  if (!farm.logoUrl) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-100 ${sizeClasses[size]} ${className}`}
      >
        <span className={emojiSizes[size]}>🌾</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-full ${sizeClasses[size]} ${className}`}>
      <Image
        src={farm.logoUrl}
        alt={`${farm.name} logo`}
        fill
        className="object-cover"
        sizes="100px"
        quality={85}
      />
    </div>
  );
}
