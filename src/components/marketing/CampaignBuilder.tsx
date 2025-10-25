/**
 * CAMPAIGN BUILDER COMPONENT
 * Divine email campaign creation interface
 */

"use client";

import type {
  CampaignSegment,
  CreateCampaignInput,
} from "@/types/marketing.types";
import { Calendar, Mail, Send, Users } from "lucide-react";
import { useState } from "react";

const EMAIL_TEMPLATES = [
  { id: "welcome", name: "Welcome Email", thumbnail: "👋", type: "WELCOME" },
  { id: "promo", name: "Promotional", thumbnail: "🎉", type: "PROMOTIONAL" },
  { id: "newsletter", name: "Newsletter", thumbnail: "📰", type: "NEWSLETTER" },
  {
    id: "cart",
    name: "Abandoned Cart",
    thumbnail: "🛒",
    type: "ABANDONED_CART",
  },
];

const AUDIENCE_SEGMENTS: Array<{
  value: CampaignSegment;
  label: string;
  icon: string;
}> = [
  { value: "ALL_USERS", label: "All Users", icon: "👥" },
  { value: "FARMERS_ONLY", label: "Farmers Only", icon: "🚜" },
  { value: "CONSUMERS_ONLY", label: "Consumers Only", icon: "🛍️" },
  { value: "NEW_USERS", label: "New Users", icon: "🆕" },
  { value: "INACTIVE_USERS", label: "Inactive Users", icon: "😴" },
  { value: "VIP_CUSTOMERS", label: "VIP Customers", icon: "⭐" },
];

export function CampaignBuilder() {
  const [formData, setFormData] = useState<Partial<CreateCampaignInput>>({
    name: "",
    subject: "",
    preheader: "",
    templateId: "",
    segment: "ALL_USERS",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/marketing/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to create campaign");
      }

      setSuccess(true);
      // Reset form
      setFormData({
        name: "",
        subject: "",
        preheader: "",
        templateId: "",
        segment: "ALL_USERS",
      });

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create campaign"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <Mail className="h-8 w-8 text-agricultural-600" />
          <h2 className="text-3xl font-bold text-gray-900">
            Create Email Campaign
          </h2>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">
              ✅ Campaign created successfully!
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campaign Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Summer Harvest Promotion"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agricultural-500"
              required
            />
          </div>

          {/* Email Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Subject
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              placeholder="e.g., 🌾 Fresh Summer Produce - 20% OFF This Week!"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agricultural-500"
              required
            />
          </div>

          {/* Preheader */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preheader (Preview Text)
            </label>
            <input
              type="text"
              value={formData.preheader}
              onChange={(e) =>
                setFormData({ ...formData, preheader: e.target.value })
              }
              placeholder="Short preview text that appears after the subject"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agricultural-500"
              maxLength={150}
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.preheader?.length || 0}/150 characters
            </p>
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Template
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {EMAIL_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, templateId: template.id })
                  }
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.templateId === template.id
                      ? "border-agricultural-600 bg-agricultural-50"
                      : "border-gray-200 hover:border-agricultural-300"
                  }`}
                >
                  <div className="text-4xl mb-2">{template.thumbnail}</div>
                  <p className="text-sm font-medium text-gray-900">
                    {template.name}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Audience Segment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline h-4 w-4 mr-1" />
              Target Audience
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {AUDIENCE_SEGMENTS.map((segment) => (
                <button
                  key={segment.value}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, segment: segment.value })
                  }
                  className={`p-3 border-2 rounded-lg transition-all ${
                    formData.segment === segment.value
                      ? "border-agricultural-600 bg-agricultural-50"
                      : "border-gray-200 hover:border-agricultural-300"
                  }`}
                >
                  <span className="text-2xl mr-2">{segment.icon}</span>
                  <span className="text-sm font-medium">{segment.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Schedule (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Schedule For Later (Optional)
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledFor || ""}
              onChange={(e) =>
                setFormData({ ...formData, scheduledFor: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agricultural-500"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || !formData.templateId}
              className="flex-1 px-6 py-3 bg-agricultural-600 text-white rounded-lg hover:bg-agricultural-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? "Creating..." : "Create Campaign"}
            </button>

            <button
              type="button"
              disabled={loading || !formData.templateId}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
            >
              <Send className="h-5 w-5" />
              Send Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
