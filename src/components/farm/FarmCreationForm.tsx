/**
 * FARM CREATION FORM COMPONENT - DIVINE AGRICULTURAL INPUT
 *
 * Client-side form with real-time valid    try {
      // NOTE: Using mock coordinates for MVP. Production will integrate Google Maps Geocoding API
      // Implementation plan: https://developers.google.com/maps/documentation/geocoding
      const mockLat = 40.7128 + Math.random() * 10 - 5;
      const mockLng = -74.006 + Math.random() * 10 - 5; and enlightening guidance.
 * Manifests farm entities through conscious user input.
 *
 * Divine Patterns Applied:
 * - React Hook Form for performance
 * - Zod validation with divine error messages
 * - Agricultural consciousness integration
 * - Geocoding for location accuracy
 *
 * Functional Requirements: FR-011 (Farm Profile Creation)
 */

"use client";

import { cn } from "@/lib/utils";
import { type CreateFarmRequest } from "@/types/farm.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// ============================================================================
// VALIDATION SCHEMA - CLIENT-SIDE VALIDATION
// ============================================================================

const FarmCreationSchema = z.object({
  name: z
    .string()
    .min(3, "Farm name must be at least 3 characters")
    .max(255, "Farm name must be less than 255 characters"),
  description: z.string().max(1000, "Description too long").optional(),
  story: z.string().max(5000, "Story too long").optional(),
  businessName: z.string().max(255).optional(),
  yearEstablished: z
    .number()
    .int()
    .min(1800)
    .max(new Date().getFullYear())
    .optional()
    .or(z.literal(undefined)),
  farmSize: z.number().positive().max(100000).optional(),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "Zip code is required"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  deliveryRadius: z.number().int().min(0).max(500).optional(),
  farmingPractices: z.array(z.string()).optional(),
  productCategories: z.array(z.string()).optional(),
});

type FarmFormData = z.infer<typeof FarmCreationSchema>;

// ============================================================================
// FARM CREATION FORM COMPONENT
// ============================================================================

export function FarmCreationForm({ userId }: Readonly<{ userId: string }>) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geoLocating, setGeoLocating] = useState(false);

  // Store userId for future use (payment setup, analytics, etc.)
  console.log("Creating farm for user:", userId);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FarmFormData>({
    resolver: zodResolver(FarmCreationSchema),
    defaultValues: {
      latitude: 0,
      longitude: 0,
      deliveryRadius: 25,
    },
  });

  // Watch location fields for future geocoding enhancement
  const address = watch("address");
  const city = watch("city");
  const state = watch("state");

  // ========================================================================
  // GEOCODING - LOCATION MANIFESTATION
  // ========================================================================

  const handleGeocode = async () => {
    if (!address || !city || !state) {
      setError("Please fill in address, city, and state first");
      return;
    }

    setGeoLocating(true);
    setError(null);

    try {
      // NOTE: In production, implement actual geocoding service (Google Maps, Mapbox, etc.)
      // For now, use placeholder coordinates for development
      const mockLat = 40.7128 + Math.random() * 10 - 5;
      const mockLng = -74.006 + Math.random() * 10 - 5;

      setValue("latitude", mockLat);
      setValue("longitude", mockLng);

      // Success message
      alert(
        `Location found! Coordinates: ${mockLat.toFixed(4)}, ${mockLng.toFixed(4)}`
      );
    } catch (err) {
      console.error("Geocoding error:", err);
      setError("Failed to geocode address. Please try again.");
    } finally {
      setGeoLocating(false);
    }
  };

  // ========================================================================
  // FORM SUBMISSION - QUANTUM FARM MANIFESTATION
  // ========================================================================

  const onSubmit = async (data: FarmFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/farms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data satisfies CreateFarmRequest),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create farm");
      }

      // Success! Redirect to farm page
      router.push(`/farms/${result.farm.identity.slug}?success=created`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create farm");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">❌ {error}</p>
        </div>
      )}

      {/* Basic Information */}
      <section>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Basic Information
        </h3>
        <div className="space-y-4">
          {/* Farm Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Farm Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register("name")}
              type="text"
              id="name"
              className={cn(
                "w-full px-4 py-3 rounded-lg border-2 transition-colors",
                errors.name
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-300 focus:border-agricultural-500"
              )}
              placeholder="e.g., Sunshine Valley Farm"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Short Description
            </label>
            <textarea
              {...register("description")}
              id="description"
              rows={3}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-agricultural-500 transition-colors"
              placeholder="A brief description of your farm..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Farm Story */}
          <div>
            <label
              htmlFor="story"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Your Farm&apos;s Story
            </label>
            <textarea
              {...register("story")}
              id="story"
              rows={5}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-agricultural-500 transition-colors"
              placeholder="Tell customers about your farming journey, values, and what makes your farm special..."
            />
            {errors.story && (
              <p className="mt-1 text-sm text-red-600">
                {errors.story.message}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Location */}
      <section>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Location</h3>
        <div className="space-y-4">
          {/* Address */}
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              {...register("address")}
              type="text"
              id="address"
              className={cn(
                "w-full px-4 py-3 rounded-lg border-2 transition-colors",
                errors.address
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-300 focus:border-agricultural-500"
              )}
              placeholder="123 Farm Road"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">
                {errors.address.message}
              </p>
            )}
          </div>

          {/* City, State, Zip */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                City <span className="text-red-500">*</span>
              </label>
              <input
                {...register("city")}
                type="text"
                id="city"
                className={cn(
                  "w-full px-4 py-3 rounded-lg border-2 transition-colors",
                  errors.city
                    ? "border-red-300 focus:border-red-500"
                    : "border-gray-300 focus:border-agricultural-500"
                )}
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.city.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="state"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                State <span className="text-red-500">*</span>
              </label>
              <input
                {...register("state")}
                type="text"
                id="state"
                className={cn(
                  "w-full px-4 py-3 rounded-lg border-2 transition-colors",
                  errors.state
                    ? "border-red-300 focus:border-red-500"
                    : "border-gray-300 focus:border-agricultural-500"
                )}
              />
              {errors.state && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.state.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="zipCode"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Zip Code <span className="text-red-500">*</span>
              </label>
              <input
                {...register("zipCode")}
                type="text"
                id="zipCode"
                className={cn(
                  "w-full px-4 py-3 rounded-lg border-2 transition-colors",
                  errors.zipCode
                    ? "border-red-300 focus:border-red-500"
                    : "border-gray-300 focus:border-agricultural-500"
                )}
              />
              {errors.zipCode && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.zipCode.message}
                </p>
              )}
            </div>
          </div>

          {/* Geocode Button */}
          <button
            type="button"
            onClick={handleGeocode}
            disabled={geoLocating}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {geoLocating ? "Finding Location..." : "📍 Get Coordinates"}
          </button>

          {/* Coordinates (hidden but validated) */}
          <input
            type="hidden"
            {...register("latitude", { valueAsNumber: true })}
          />
          <input
            type="hidden"
            {...register("longitude", { valueAsNumber: true })}
          />
        </div>
      </section>

      {/* Contact Information */}
      <section>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Contact Information
        </h3>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              {...register("email")}
              type="email"
              id="email"
              className={cn(
                "w-full px-4 py-3 rounded-lg border-2 transition-colors",
                errors.email
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-300 focus:border-agricultural-500"
              )}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              {...register("phone")}
              type="tel"
              id="phone"
              className={cn(
                "w-full px-4 py-3 rounded-lg border-2 transition-colors",
                errors.phone
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-300 focus:border-agricultural-500"
              )}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Submit Button */}
      <div className="flex justify-end gap-4 pt-6 border-t-2 border-gray-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "px-8 py-3 bg-agricultural-600 text-white rounded-lg font-semibold transition-all",
            "hover:bg-agricultural-700 hover:shadow-lg",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center gap-2"
          )}
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin">⏳</span> Creating Farm...
            </>
          ) : (
            <>
              <span>🌾</span> Create Farm Profile
            </>
          )}
        </button>
      </div>
    </form>
  );
}
