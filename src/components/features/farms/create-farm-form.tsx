/**
 * 🌟 Create Farm Form - Divine Agricultural Input Interface
 * Comprehensive form for farm creation with validation and map integration
 * Following: 10_AGRICULTURAL_FEATURE_PATTERNS & 08_UX_DESIGN_CONSCIOUSNESS
 */

"use client";

import { createFarmAction } from "@/app/actions/farm.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CreateFarmFormProps {
  userId: string;
}

export function CreateFarmForm({ userId }: CreateFarmFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    formData.append("userId", userId);

    try {
      const result = await createFarmAction(formData);

      if (result.success && result.farm) {
        // Redirect to farm dashboard
        router.push(`/farmer/farms/${result.farm.id}`);
      } else {
        setError(result.error || "Failed to create farm");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Basic Information
        </h3>

        <div>
          <Label htmlFor="name">
            Farm Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            minLength={3}
            maxLength={100}
            placeholder="Green Valley Organic Farm"
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Choose a memorable name for your farm (3-100 characters)
          </p>
        </div>

        <div>
          <Label htmlFor="description">
            Description <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            name="description"
            required
            minLength={20}
            maxLength={2000}
            rows={4}
            placeholder="Tell customers about your farm, your practices, and what makes your products special..."
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Describe your farm and farming practices (20-2000 characters)
          </p>
        </div>
      </div>

      {/* Location Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Location</h3>

        <div>
          <Label htmlFor="address">
            Street Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="address"
            name="address"
            type="text"
            required
            placeholder="123 Farm Road"
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city">
              City <span className="text-red-500">*</span>
            </Label>
            <Input
              id="city"
              name="city"
              type="text"
              required
              placeholder="Springfield"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="state">
              State <span className="text-red-500">*</span>
            </Label>
            <Input
              id="state"
              name="state"
              type="text"
              required
              maxLength={2}
              placeholder="CA"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">2-letter code</p>
          </div>

          <div>
            <Label htmlFor="zipCode">
              ZIP Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="zipCode"
              name="zipCode"
              type="text"
              required
              pattern="[0-9]{5}"
              placeholder="12345"
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="latitude">
              Latitude <span className="text-red-500">*</span>
            </Label>
            <Input
              id="latitude"
              name="latitude"
              type="number"
              step="any"
              required
              min={-90}
              max={90}
              placeholder="37.7749"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Decimal degrees (-90 to 90)
            </p>
          </div>

          <div>
            <Label htmlFor="longitude">
              Longitude <span className="text-red-500">*</span>
            </Label>
            <Input
              id="longitude"
              name="longitude"
              type="number"
              step="any"
              required
              min={-180}
              max={180}
              placeholder="-122.4194"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Decimal degrees (-180 to 180)
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> You can find your farm's coordinates using{" "}
            <a
              href="https://www.google.com/maps"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-900"
            >
              Google Maps
            </a>
            . Right-click on your location and select "What's here?" to see
            coordinates.
          </p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Contact Information
        </h3>

        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="(555) 123-4567"
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Optional - Customers can use this to contact you
          </p>
        </div>

        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="contact@greenvaleyfarm.com"
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Optional - Public contact email for customer inquiries
          </p>
        </div>

        <div>
          <Label htmlFor="website">Website URL</Label>
          <Input
            id="website"
            name="website"
            type="url"
            placeholder="https://www.greenvaleyfarm.com"
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Optional - Link to your farm's website
          </p>
        </div>
      </div>

      {/* Certifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Certifications</h3>

        <div>
          <Label htmlFor="certifications">
            Organic Certifications & Awards
          </Label>
          <Textarea
            id="certifications"
            name="certifications"
            rows={3}
            placeholder="USDA Organic Certified, Certified Naturally Grown, Best Organic Farm 2023..."
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Optional - List any certifications, awards, or credentials (one per
            line or comma-separated)
          </p>
        </div>
      </div>

      {/* Farm Size */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Farm Details</h3>

        <div>
          <Label htmlFor="sizeAcres">Farm Size (acres)</Label>
          <Input
            id="sizeAcres"
            name="sizeAcres"
            type="number"
            step="0.1"
            min={0}
            placeholder="50"
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Optional - Total size of your farm in acres
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-700"
        >
          {isSubmitting ? "Creating Farm..." : "Create Farm"}
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>
          By creating a farm profile, you agree to provide accurate information
          and comply with our platform's terms of service.
        </p>
      </div>
    </form>
  );
}
