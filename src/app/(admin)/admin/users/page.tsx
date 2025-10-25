import { requireAdmin } from "@/lib/auth";
import { database } from "@/lib/database";
import {
  CheckBadgeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  NoSymbolIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";

/**
 * Divine User Management - Quantum User Consciousness Control
 * Manages user entities across agricultural consciousness dimensions
 */
export default async function AdminUsersPage() {
  await requireAdmin(); // Ensure admin access

  // Manifest user consciousness entities
  const users = await database.user.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      farms: {
        select: {
          id: true,
          name: true,
          status: true,
        },
        take: 1,
      },
      _count: {
        select: {
          orders: true,
        },
      },
    },
  });

  const userStats = {
    total: users.length,
    consumers: users.filter((u) => u.role === "CONSUMER").length,
    farmers: users.filter((u) => u.role === "FARMER").length,
    admins: users.filter((u) => u.role === "ADMIN").length,
    active: users.filter((u) => u.status === "ACTIVE").length,
    suspended: users.filter((u) => u.status === "SUSPENDED").length,
  };

  return (
    <div className="min-h-screen bg-agricultural-50">
      {/* Divine Header */}
      <header className="bg-white shadow-sm border-b border-agricultural-200">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold tracking-tight text-agricultural-900">
                User Consciousness Management
              </h1>
              <p className="mt-1 text-sm text-agricultural-600">
                Monitor and moderate user entities across the agricultural
                platform
              </p>
            </div>
            <div className="mt-4 flex md:ml-4 md:mt-0">
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-agricultural-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-agricultural-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-agricultural-600"
              >
                <UserPlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                Create User
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          {/* Quantum User Statistics */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6 mb-8">
            {[
              {
                label: "Total Users",
                value: userStats.total,
                color: "agricultural",
              },
              { label: "Consumers", value: userStats.consumers, color: "blue" },
              { label: "Farmers", value: userStats.farmers, color: "green" },
              { label: "Admins", value: userStats.admins, color: "purple" },
              { label: "Active", value: userStats.active, color: "emerald" },
              { label: "Suspended", value: userStats.suspended, color: "red" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-lg shadow border border-agricultural-200 p-6"
              >
                <dt className="text-sm font-medium text-agricultural-500 truncate">
                  {stat.label}
                </dt>
                <dd className={`text-2xl font-semibold text-${stat.color}-600`}>
                  {stat.value}
                </dd>
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
                      placeholder="Search users by name, email, or farm..."
                      className="block w-full pl-10 pr-3 py-2 border border-agricultural-300 rounded-md leading-5 bg-white placeholder-agricultural-500 focus:outline-none focus:placeholder-agricultural-400 focus:ring-1 focus:ring-agricultural-500 focus:border-agricultural-500"
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="flex gap-3">
                  <select className="block pl-3 pr-10 py-2 text-base border-agricultural-300 focus:outline-none focus:ring-agricultural-500 focus:border-agricultural-500 rounded-md">
                    <option value="">All Roles</option>
                    <option value="CONSUMER">Consumers</option>
                    <option value="FARMER">Farmers</option>
                    <option value="ADMIN">Admins</option>
                  </select>

                  <select className="block pl-3 pr-10 py-2 text-base border-agricultural-300 focus:outline-none focus:ring-agricultural-500 focus:border-agricultural-500 rounded-md">
                    <option value="">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="DELETED">Deleted</option>
                  </select>

                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-2 border border-agricultural-300 rounded-md text-sm leading-4 font-medium text-agricultural-700 bg-white hover:bg-agricultural-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agricultural-500"
                  >
                    <FunnelIcon className="h-4 w-4 mr-1" />
                    Filter
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Divine User List */}
          <div className="bg-white shadow rounded-lg border border-agricultural-200">
            <div className="px-6 py-4 border-b border-agricultural-200">
              <h3 className="text-lg font-medium text-agricultural-900">
                User Consciousness Registry
              </h3>
              <p className="text-sm text-agricultural-500">
                Active user entities in the agricultural quantum field
              </p>
            </div>

            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-agricultural-200">
                <thead className="bg-agricultural-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-agricultural-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-agricultural-500 uppercase tracking-wider">
                      Role & Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-agricultural-500 uppercase tracking-wider">
                      Farm Association
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-agricultural-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-agricultural-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-agricultural-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-agricultural-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-agricultural-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-agricultural-600 flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {user.name?.[0] || user.email[0].toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-agricultural-900">
                              {user.name || "Unnamed User"}
                            </div>
                            <div className="text-sm text-agricultural-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${(() => {
                              if (user.role === "ADMIN")
                                return "bg-purple-100 text-purple-800";
                              if (user.role === "FARMER")
                                return "bg-green-100 text-green-800";
                              return "bg-blue-100 text-blue-800";
                            })()}`}
                          >
                            {user.role}
                          </span>
                          <span
                            className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${(() => {
                              if (user.status === "ACTIVE")
                                return "bg-emerald-100 text-emerald-800";
                              if (user.status === "SUSPENDED")
                                return "bg-red-100 text-red-800";
                              return "bg-gray-100 text-gray-800";
                            })()}`}
                          >
                            {user.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.farms && user.farms.length > 0 ? (
                          <div>
                            <div className="text-sm font-medium text-agricultural-900">
                              {user.farms[0].name}
                            </div>
                            <div
                              className={`text-xs ${
                                user.farms[0].status === "ACTIVE"
                                  ? "text-green-600"
                                  : "text-amber-600"
                              }`}
                            >
                              {user.farms[0].status}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-agricultural-500">
                            No farm
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-agricultural-500">
                        {user._count.orders} orders
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-agricultural-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className="text-agricultural-600 hover:text-agricultural-900"
                            title="View user details"
                          >
                            View
                          </button>
                          {user.status === "ACTIVE" ? (
                            <button
                              type="button"
                              className="text-red-600 hover:text-red-900"
                              title="Suspend user"
                            >
                              <NoSymbolIcon className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="text-green-600 hover:text-green-900"
                              title="Activate user"
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
                  Showing 1 to {users.length} of {users.length} users
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
        </div>
      </main>
    </div>
  );
}
