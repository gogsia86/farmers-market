import { requireAdmin } from "@/lib/auth";
import { database } from "@/lib/database";
import {
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";

/**
 * Divine Farm Management - Agricultural Entity Oversight Portal
 * Manages farm consciousness across quantum agricultural dimensions
 */
export default async function AdminFarmsPage() {
  await requireAdmin(); // Ensure divine admin access

  // Manifest farm consciousness entities
  const farms = await database.farm.findMany({
    take: 50,
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
  });

  const stats = {
    total: farms.length,
    active: farms.filter((f) => f.status === "ACTIVE").length,
    pending: farms.filter((f) => f.status === "PENDING").length,
    suspended: farms.filter((f) => f.status === "SUSPENDED").length,
  };
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
            {[
              {
                label: "Total Farms",
                value: farmStats.total,
                color: "agricultural",
                icon: "🌾",
              },
              {
                label: "Active",
                value: farmStats.active,
                color: "green",
                icon: "✅",
              },
              {
                label: "Pending Review",
                value: farmStats.pending,
                color: "amber",
                icon: "⏳",
              },
              {
                label: "Suspended",
                value: farmStats.suspended,
                color: "red",
                icon: "🚫",
              },
              {
                label: "Inactive",
                value: farmStats.inactive,
                color: "gray",
                icon: "💤",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-lg shadow border border-agricultural-200 p-6"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{stat.icon}</span>
                  <div>
                    <dt className="text-sm font-medium text-agricultural-500 truncate">
                      {stat.label}
                    </dt>
                    <dd
                      className={`text-2xl font-semibold text-${stat.color}-600`}
                    >
                      {stat.value}
                    </dd>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quantum Filters & Search */}
          <div className="bg-white shadow rounded-lg border border-agricultural-200 mb-6">
            <div className="px-6 py-4 border-b border-agricultural-200">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-agricultural-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search farms by name, location, or owner..."
                      className="block w-full pl-10 pr-3 py-2 border border-agricultural-300 rounded-md leading-5 bg-white placeholder-agricultural-500 focus:outline-none focus:placeholder-agricultural-400 focus:ring-1 focus:ring-agricultural-500 focus:border-agricultural-500"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="flex gap-3">
                  <select className="block pl-3 pr-10 py-2 text-base border-agricultural-300 focus:outline-none focus:ring-agricultural-500 focus:border-agricultural-500 rounded-md">
                    <option value="">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="PENDING">Pending Review</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

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

            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-agricultural-200">
                <thead className="bg-agricultural-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-agricultural-500 uppercase tracking-wider">
                      Farm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-agricultural-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-agricultural-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-agricultural-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-agricultural-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-agricultural-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-agricultural-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-agricultural-200">
                  {farms.map((farm) => (
                    <tr key={farm.id} className="hover:bg-agricultural-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-agricultural-600 flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {farm.name[0]}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-agricultural-900">
                              {farm.name}
                            </div>
                            <div className="text-sm text-agricultural-500">
                              ID: {farm.id.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-agricultural-900">
                            {farm.owner.name || "Unnamed Owner"}
                          </div>
                          <div className="text-sm text-agricultural-500">
                            {farm.owner.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${(() => {
                            switch (farm.status) {
                              case "ACTIVE":
                                return "bg-green-100 text-green-800";
                              case "PENDING":
                                return "bg-amber-100 text-amber-800";
                              case "SUSPENDED":
                                return "bg-red-100 text-red-800";
                              case "INACTIVE":
                                return "bg-gray-100 text-gray-800";
                              default:
                                return "bg-gray-100 text-gray-800";
                            }
                          })()}`}
                        >
                          {farm.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-agricultural-500">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          {farm.address ? (
                            <span className="truncate max-w-[200px]">
                              {farm.address}
                            </span>
                          ) : (
                            <span className="text-agricultural-400">
                              No address
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-agricultural-500">
                          <div>{farm._count.products} products</div>
                          <div>{farm._count.orders} orders</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-agricultural-500">
                        {new Date(farm.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className="text-agricultural-600 hover:text-agricultural-900"
                            title="View farm details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>

                          {farm.status === "PENDING" && (
                            <>
                              <button
                                type="button"
                                className="text-green-600 hover:text-green-900"
                                title="Approve farm"
                              >
                                <CheckBadgeIcon className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                className="text-red-600 hover:text-red-900"
                                title="Reject farm"
                              >
                                <NoSymbolIcon className="h-4 w-4" />
                              </button>
                            </>
                          )}

                          {farm.status === "ACTIVE" && (
                            <button
                              type="button"
                              className="text-amber-600 hover:text-amber-900"
                              title="Suspend farm"
                            >
                              <ExclamationTriangleIcon className="h-4 w-4" />
                            </button>
                          )}

                          {farm.status === "SUSPENDED" && (
                            <button
                              type="button"
                              className="text-green-600 hover:text-green-900"
                              title="Reactivate farm"
                            >
                              <CheckBadgeIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-agricultural-50 px-6 py-3 border-t border-agricultural-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-agricultural-700">
                  Showing 1 to {farms.length} of {farms.length} farms
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-sm border border-agricultural-300 rounded-md text-agricultural-700 bg-white hover:bg-agricultural-50">
                    Previous
                  </button>
                  <button className="px-3 py-1 text-sm border border-agricultural-300 rounded-md text-agricultural-700 bg-white hover:bg-agricultural-50">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Farms Alert */}
          {farmStats.pending > 0 && (
            <div className="mt-6 bg-amber-50 border-l-4 border-amber-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-5 w-5 text-amber-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-amber-700">
                    <span className="font-medium">{farmStats.pending}</span>{" "}
                    farms are pending verification. Review these farms to
                    maintain platform quality and help farmers get their
                    products to market.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

