import { requireAdmin } from "@/lib/auth";
import { database } from "@/lib/database";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import type { Farm, User } from "@prisma/client";
import { FarmFilters } from "./FarmFilters";
import { FarmsTable } from "./FarmsTable";

// Force dynamic rendering for database access
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * DIVINE FARM STATISTICS TYPES
 * Agricultural consciousness metrics
 */
interface FarmStatistics {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  inactive: number;
}

interface StatCardProps {
  label: string;
  value: number;
  color: string;
  icon: string;
}

/**
 * QUANTUM FARM ENTITY WITH RELATIONS
 * Complete farm consciousness with owner and counts
 */
type QuantumFarm = Farm & {
  owner: Pick<User, "id" | "name" | "email">;
  _count: {
    products: number;
    orders: number;
  };
};

/**
 * STAT CARD COMPONENT
 * Biodynamic statistics display
 */
function StatCard({ label, value, color, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow border border-agricultural-200 p-6">
      <div className="flex items-center">
        <span className="text-2xl mr-3" role="img" aria-label={label}>
          {icon}
        </span>
        <dl>
          <dt className="text-sm font-medium text-agricultural-500 truncate">
            {label}
          </dt>
          <dd className={`text-2xl font-semibold text-${color}-600`}>
            {value}
          </dd>
        </dl>
      </div>
    </div>
  );
}

/**
 * PENDING FARMS ALERT
 * Divine notification for pending verifications
 */
function PendingFarmsAlert({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <div className="mt-6 bg-amber-50 border-l-4 border-amber-400 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-5 w-5 text-amber-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-amber-700">
            <span className="font-medium">{count}</span> farm
            {count !== 1 ? "s are" : " is"} pending verification. Review these
            farms to maintain platform quality and help farmers get their
            products to market.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * CALCULATE FARM STATISTICS
 * Biodynamic consciousness metrics aggregation
 */
function calculateFarmStatistics(farms: QuantumFarm[]): FarmStatistics {
  return {
    total: farms.length,
    active: farms.filter((f) => f.status === "ACTIVE").length,
    pending: farms.filter((f) => f.status === "PENDING").length,
    suspended: farms.filter((f) => f.status === "SUSPENDED").length,
    inactive: farms.filter((f) => f.status === "INACTIVE").length,
  };
}

/**
 * Divine Farm Management - Agricultural Entity Oversight Portal
 * Manages farm consciousness across quantum agricultural dimensions
 */
export default async function AdminFarmsPage({
  searchParams,
}: {
  searchParams: { page?: string; limit?: string; status?: string };
}) {
  // Ensure divine admin access
  await requireAdmin();

  // Parse pagination with quantum validation
  const page = Math.max(1, parseInt(searchParams.page || "1", 10));
  const limit = Math.min(
    100,
    Math.max(10, parseInt(searchParams.limit || "50", 10))
  );
  const skip = (page - 1) * limit;

  // Optional status filter
  const statusFilter = searchParams.status
    ? { status: searchParams.status.toUpperCase() as Farm["status"] }
    : {};

  try {
    // Manifest farm consciousness entities with agricultural awareness
    const [farms, totalCount] = await Promise.all([
      database.farm.findMany({
        where: statusFilter,
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              products: true,
              orders: true,
            },
          },
        },
      }),
      database.farm.count({ where: statusFilter }),
    ]);

    // Calculate quantum agricultural statistics
    const stats = calculateFarmStatistics(farms);

    // Calculate pagination quantum state
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const statCards: StatCardProps[] = [
      {
        label: "Total Farms",
        value: stats.total,
        color: "agricultural",
        icon: "🌾",
      },
      {
        label: "Active",
        value: stats.active,
        color: "green",
        icon: "✅",
      },
      {
        label: "Pending Review",
        value: stats.pending,
        color: "amber",
        icon: "⏳",
      },
      {
        label: "Suspended",
        value: stats.suspended,
        color: "red",
        icon: "🚫",
      },
      {
        label: "Inactive",
        value: stats.inactive,
        color: "gray",
        icon: "💤",
      },
    ];

    return (
      <div className="min-h-screen bg-agricultural-50">
        {/* Divine Header */}
        <header className="bg-white shadow-sm border-b border-agricultural-200">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between">
              <div className="min-w-0 flex-1">
                <h1 className="text-3xl font-bold tracking-tight text-agricultural-900">
                  Farm Consciousness Management
                </h1>
                <p className="mt-1 text-sm text-agricultural-600">
                  Monitor and verify agricultural entities across the quantum
                  farming realm
                </p>
              </div>
            </div>
          </div>
        </header>

        <main>
          <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
            {/* Quantum Farm Statistics */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5 mb-8">
              {statCards.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </div>

            {/* Quantum Filters & Search */}
            <FarmFilters />

            {/* Divine Farm List */}
            <div className="bg-white shadow rounded-lg border border-agricultural-200">
              <div className="px-6 py-4 border-b border-agricultural-200">
                <h3 className="text-lg font-medium text-agricultural-900">
                  Agricultural Entity Registry
                </h3>
                <p className="text-sm text-agricultural-500">
                  Farm consciousness manifestations in the quantum agricultural
                  field
                </p>
              </div>

              <FarmsTable initialFarms={JSON.parse(JSON.stringify(farms))} />

              {/* Divine Pagination */}
              <div className="bg-agricultural-50 px-6 py-3 border-t border-agricultural-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-agricultural-700">
                    Showing {skip + 1} to {Math.min(skip + limit, totalCount)}{" "}
                    of {totalCount} farms
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={hasPrevPage ? `?page=${page - 1}&limit=${limit}${
                        statusFilter.status
                          ? `&status=${statusFilter.status}`
                          : ""
                      }` : undefined}
                      className={`px-3 py-1 text-sm border border-agricultural-300 rounded-md ${
                        hasPrevPage
                          ? "text-agricultural-700 bg-white hover:bg-agricultural-50"
                          : "text-agricultural-400 bg-agricultural-100 cursor-not-allowed pointer-events-none"
                      }`}
                      aria-disabled={hasPrevPage ? "false" : "true"}
                      onClick={(e) => !hasPrevPage && e.preventDefault()}
                    >
                      Previous
                    </a>
                    <a
                      href={hasNextPage ? `?page=${page + 1}&limit=${limit}${
                        statusFilter.status
                          ? `&status=${statusFilter.status}`
                          : ""
                      }` : undefined}
                      className={`px-3 py-1 text-sm border border-agricultural-300 rounded-md ${
                        hasNextPage
                          ? "text-agricultural-700 bg-white hover:bg-agricultural-50"
                          : "text-agricultural-400 bg-agricultural-100 cursor-not-allowed pointer-events-none"
                      }`}
                      aria-disabled={hasNextPage ? "false" : "true"}
                      onClick={(e) => !hasNextPage && e.preventDefault()}
                    >
                      Next
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Farms Divine Alert */}
            <PendingFarmsAlert count={stats.pending} />
          </div>
        </main>
      </div>
    );
  } catch (error) {
    // Divine error manifestation
    console.error("Farm consciousness manifestation failed:", error);
    return (
      <div className="min-h-screen bg-agricultural-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg border border-red-200">
          <h2 className="text-2xl font-bold text-red-900 mb-2">
            Agricultural Consciousness Disruption
          </h2>
          <p className="text-red-700">
            Failed to manifest farm entities. Please try again or contact divine
            support.
          </p>
        </div>
      </div>
    );
  }
}
