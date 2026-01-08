"use client";

/**
 * 🔐 ADMIN FARMS MANAGEMENT PAGE
 * Divine farm verification and approval interface
 *
 * Features:
 * - View all farms with filtering by status
 * - Approve/reject pending farm verifications
 * - Farm details and owner information
 * - Bulk actions for efficiency
 * - Search and filtering capabilities
 *
 * Following: Claude Sonnet 4.5 guidelines & NEXTJS_DIVINE_IMPLEMENTATION
 */

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Farm {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  verificationStatus: string;
  verifiedAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  owner: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  location?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  certifications?: Array<{
    id: string;
    name: string;
  }>;
}

interface ApiResponse {
  success: boolean;
  data?: Farm[];
  error?: {
    code: string;
    message: string;
  };
}

type FilterStatus = "ALL" | "PENDING" | "VERIFIED" | "REJECTED";

export default function AdminFarmsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [filteredFarms, setFilteredFarms] = useState<Farm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/farms");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [status, session, router]);

  // Fetch farms
  useEffect(() => {
    fetchFarms();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = farms;

    // Status filter
    if (filter !== "ALL") {
      filtered = filtered.filter(farm => farm.verificationStatus === filter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(farm =>
        farm.name.toLowerCase().includes(query) ||
        farm.owner.email.toLowerCase().includes(query) ||
        (farm.owner.firstName && farm.owner.firstName.toLowerCase().includes(query)) ||
        (farm.owner.lastName && farm.owner.lastName.toLowerCase().includes(query))
      );
    }

    setFilteredFarms(filtered);
  }, [farms, filter, searchQuery]);

  const fetchFarms = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/admin/farms");
      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to fetch farms");
      }

      setFarms(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (farmId: string, action: "approve" | "reject", reason?: string) => {
    try {
      setActionLoading(farmId);

      const response = await fetch("/api/admin/farms/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          farmId,
          action,
          reason,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Verification action failed");
      }

      // Refresh farms list
      await fetchFarms();

      // Show success message (could use toast notification here)
      alert(`Farm ${action === "approve" ? "approved" : "rejected"} successfully!`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = (farmId: string) => {
    if (confirm("Are you sure you want to approve this farm?")) {
      handleVerification(farmId, "approve");
    }
  };

  const handleReject = (farmId: string) => {
    const reason = prompt("Please enter a reason for rejection:");
    if (reason) {
      handleVerification(farmId, "reject", reason);
    }
  };

  if (status === "loading" || (status === "authenticated" && session?.user?.role !== "ADMIN")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Farm Management</h1>
          <p className="text-gray-600 mt-2">
            Review and approve farm registrations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Farms</div>
            <div className="text-2xl font-bold text-gray-900 mt-2">
              {farms.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Pending Review</div>
            <div className="text-2xl font-bold text-yellow-600 mt-2">
              {farms.filter(f => f.verificationStatus === "PENDING").length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Verified</div>
            <div className="text-2xl font-bold text-green-600 mt-2">
              {farms.filter(f => f.verificationStatus === "VERIFIED").length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Rejected</div>
            <div className="text-2xl font-bold text-red-600 mt-2">
              {farms.filter(f => f.verificationStatus === "REJECTED").length}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex gap-2">
              {(["ALL", "PENDING", "VERIFIED", "REJECTED"] as FilterStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === status
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search farms by name, email, or owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
            <button
              onClick={fetchFarms}
              className="text-red-600 hover:text-red-700 font-medium mt-2"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
            <p className="text-gray-600">Loading farms...</p>
          </div>
        )}

        {/* Farms List */}
        {!isLoading && filteredFarms.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <p className="text-gray-600">No farms found</p>
          </div>
        )}

        {!isLoading && filteredFarms.length > 0 && (
          <div className="space-y-4">
            {filteredFarms.map((farm) => (
              <div
                key={farm.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                data-testid="farm-card"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    {/* Farm Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {farm.name}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${farm.verificationStatus === "VERIFIED"
                              ? "bg-green-100 text-green-800"
                              : farm.verificationStatus === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                        >
                          {farm.verificationStatus}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {farm.description || "No description provided"}
                      </p>

                      {/* Owner Info */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <span>
                            {farm.owner.firstName} {farm.owner.lastName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          <span>{farm.owner.email}</span>
                        </div>
                      </div>

                      {/* Location */}
                      {farm.location && (
                        <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span>
                            {farm.location.city}, {farm.location.state} {farm.location.zipCode}
                          </span>
                        </div>
                      )}

                      {/* Rejection Reason */}
                      {farm.rejectionReason && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-800">
                            <strong>Rejection Reason:</strong> {farm.rejectionReason}
                          </p>
                        </div>
                      )}

                      {/* Timestamps */}
                      <div className="flex gap-4 text-xs text-gray-400 mt-3">
                        <span>
                          Created: {new Date(farm.createdAt).toLocaleDateString()}
                        </span>
                        {farm.verifiedAt && (
                          <span>
                            Verified: {new Date(farm.verifiedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {farm.verificationStatus === "PENDING" && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleApprove(farm.id)}
                          disabled={actionLoading === farm.id}
                          data-testid={`approve-farm-${farm.id}`}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {actionLoading === farm.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(farm.id)}
                          disabled={actionLoading === farm.id}
                          data-testid={`reject-farm-${farm.id}`}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {actionLoading === farm.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          )}
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
