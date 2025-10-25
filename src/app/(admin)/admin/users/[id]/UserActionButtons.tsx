"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  CheckBadgeIcon,
  NoSymbolIcon,
  ShieldCheckIcon,
  ArrowDownIcon,
  TrashIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";
import {
  suspendUser,
  activateUser,
  promoteToAdmin,
  demoteFromAdmin,
  deleteUser,
  resetUserPassword,
} from "../actions";

interface UserActionButtonsProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    status: string;
    role: string;
  };
}

/**
 * Divine User Action Buttons - Administrative Controls
 * Quantum user management with agricultural consciousness
 */
export function UserActionButtons({ user }: UserActionButtonsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleAction = async (
    action: () => Promise<{ success: boolean; message: string }>,
    actionType: string
  ) => {
    setIsLoading(actionType);

    try {
      const result = await action();

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Action failed:", error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleSuspend = () =>
    handleAction(() => suspendUser(user.id), "suspend");
  const handleActivate = () =>
    handleAction(() => activateUser(user.id), "activate");
  const handlePromote = () =>
    handleAction(() => promoteToAdmin(user.id), "promote");
  const handleDemote = () =>
    handleAction(() => demoteFromAdmin(user.id), "demote");
  const handleResetPassword = () =>
    handleAction(() => resetUserPassword(user.id), "reset");

  const handleDelete = async () => {
    const confirmed = globalThis.confirm(
      `Are you sure you want to permanently delete ${user.name || user.email}? This action cannot be undone.`
    );

    if (confirmed) {
      await handleAction(() => deleteUser(user.id), "delete");
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {/* Status Actions */}
      {user.status === "ACTIVE" && (
        <button
          onClick={handleSuspend}
          disabled={isLoading === "suspend"}
          className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <NoSymbolIcon className="h-4 w-4 mr-2" />
          {isLoading === "suspend" ? "Suspending..." : "Suspend User"}
        </button>
      )}

      {user.status === "SUSPENDED" && (
        <button
          onClick={handleActivate}
          disabled={isLoading === "activate"}
          className="inline-flex items-center px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-white hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckBadgeIcon className="h-4 w-4 mr-2" />
          {isLoading === "activate" ? "Activating..." : "Activate User"}
        </button>
      )}

      {/* Role Actions */}
      {user.role !== "ADMIN" && (
        <button
          onClick={handlePromote}
          disabled={isLoading === "promote"}
          className="inline-flex items-center px-4 py-2 border border-agricultural-300 rounded-md shadow-sm text-sm font-medium text-agricultural-700 bg-white hover:bg-agricultural-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShieldCheckIcon className="h-4 w-4 mr-2" />
          {isLoading === "promote" ? "Promoting..." : "Promote to Admin"}
        </button>
      )}

      {user.role === "ADMIN" && (
        <button
          onClick={handleDemote}
          disabled={isLoading === "demote"}
          className="inline-flex items-center px-4 py-2 border border-orange-300 rounded-md shadow-sm text-sm font-medium text-orange-700 bg-white hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowDownIcon className="h-4 w-4 mr-2" />
          {isLoading === "demote" ? "Demoting..." : "Demote from Admin"}
        </button>
      )}

      {/* Password Reset */}
      <button
        onClick={handleResetPassword}
        disabled={isLoading === "reset"}
        className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <KeyIcon className="h-4 w-4 mr-2" />
        {isLoading === "reset" ? "Resetting..." : "Reset Password"}
      </button>

      {/* Danger Zone - Delete */}
      <button
        onClick={handleDelete}
        disabled={isLoading === "delete"}
        className="inline-flex items-center px-4 py-2 border border-red-600 rounded-md shadow-sm text-sm font-medium text-red-800 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <TrashIcon className="h-4 w-4 mr-2" />
        {isLoading === "delete" ? "Deleting..." : "Delete User"}
      </button>
    </div>
  );
}
