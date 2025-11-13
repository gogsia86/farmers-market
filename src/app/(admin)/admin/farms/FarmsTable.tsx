"use client";

import {
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  MapPinIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import type { Farm, User } from "@prisma/client";
import { useState, useTransition } from "react";
import { toast } from "sonner"; // Install: npm install sonner
import { updateFarmStatus } from "./actions";

type FarmWithRelations = Farm & {
  owner: Pick<User, "id" | "name" | "email">;
  _count: {
    products: number;
    orders: number;
  };
};

interface FarmsTableProps {
  initialFarms: FarmWithRelations[];
}

export function FarmsTable({ initialFarms }: FarmsTableProps) {
  const [farms, setFarms] = useState(initialFarms);
  const [isPending, startTransition] = useTransition();
  const [actioningFarmId, setActioningFarmId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleStatusChange = async (
    farmId: string,
    newStatus: Farm["status"]
  ) => {
    setActioningFarmId(farmId);

    // Optimistic update
    setFarms((prevFarms) =>
      prevFarms.map((f) => (f.id === farmId ? { ...f, status: newStatus } : f))
    );

    startTransition(async () => {
      const result = await updateFarmStatus(farmId, newStatus);

      if (result.success) {
        toast.success("Farm status updated successfully");
        setNotification({
          type: "success",
          message: `Farm status transformed to ${newStatus} successfully! 🌾`,
        });
      } else {
        // Revert optimistic update on failure
        setFarms(initialFarms);
        setNotification({
          type: "error",
          message: result.error || "Failed to update farm status",
        });
      }

      setActioningFarmId(null);

      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    });
  };

  return (
    <>
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg ${
            notification.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {notification.message}
        </div>
      )}

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
              <tr
                key={farm.id}
                className={`hover:bg-agricultural-50 transition-colors ${
                  actioningFarmId === farm.id ? "opacity-50" : ""
                }`}
              >
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
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      farm.status === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : farm.status === "PENDING"
                          ? "bg-amber-100 text-amber-800"
                          : farm.status === "SUSPENDED"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
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
                      <span className="text-agricultural-400">No address</span>
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
                      className="text-agricultural-600 hover:text-agricultural-900 disabled:opacity-50"
                      title="View farm details"
                      disabled={isPending && actioningFarmId === farm.id}
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>

                    {farm.status === "PENDING" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(farm.id, "ACTIVE")}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          title="Approve farm"
                          disabled={isPending && actioningFarmId === farm.id}
                        >
                          <CheckBadgeIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(farm.id, "SUSPENDED")
                          }
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          title="Reject farm"
                          disabled={isPending && actioningFarmId === farm.id}
                        >
                          <NoSymbolIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}

                    {farm.status === "ACTIVE" && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(farm.id, "SUSPENDED")}
                        className="text-amber-600 hover:text-amber-900 disabled:opacity-50"
                        title="Suspend farm"
                        disabled={isPending && actioningFarmId === farm.id}
                      >
                        <ExclamationTriangleIcon className="h-4 w-4" />
                      </button>
                    )}

                    {farm.status === "SUSPENDED" && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(farm.id, "ACTIVE")}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                        title="Reactivate farm"
                        disabled={isPending && actioningFarmId === farm.id}
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
    </>
  );
}
