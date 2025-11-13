import { UserRole } from "@prisma/client";
import React from "react";
import { hasPermission, Permission } from "./index";

/**
 * Divine Permission React Components
 * Agricultural consciousness UI permission guards
 */

/**
 * Higher-order component for permission-based rendering
 */
export function withPermission<T extends object>(
  Component: React.ComponentType<T>,
  requiredPermission: Permission,
) {
  return function PermissionGuardedComponent(
    props: T & { userRole: UserRole },
  ) {
    const { userRole, ...restProps } = props;

    if (!hasPermission(userRole, requiredPermission)) {
      return (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-2xl">🔒</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">
                Insufficient Permissions
              </h3>
              <div className="mt-2 text-sm text-amber-700">
                Your role ({userRole}) does not have permission to access this
                feature.
                <br />
                Required permission: {requiredPermission}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return <Component {...(restProps as T)} />;
  };
}

/**
 * Component to conditionally render based on permissions
 */
interface PermissionGateProps {
  role: UserRole;
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGate({
  role,
  permission,
  children,
  fallback = null,
}: PermissionGateProps) {
  if (!hasPermission(role, permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Administrative action button with permission checking
 */
interface AdminActionButtonProps {
  role: UserRole;
  permission: Permission;
  onClick: () => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
  disabled?: boolean;
}

export function AdminActionButton({
  role,
  permission,
  onClick,
  children,
  variant = "primary",
  className = "",
  disabled = false,
}: AdminActionButtonProps) {
  const hasPermissionToAct = hasPermission(role, permission);

  if (!hasPermissionToAct) {
    return (
      <button
        disabled
        className={`opacity-50 cursor-not-allowed px-4 py-2 text-sm font-medium rounded-md ${className}`}
        title={`Insufficient permissions. Required: ${permission}`}
      >
        🔒 {children}
      </button>
    );
  }

  const variantClasses = {
    primary: "bg-agricultural-600 hover:bg-agricultural-700 text-white",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${variantClasses[variant]} ${className} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Role badge component for displaying user role with agricultural styling
 */
interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

export function RoleBadge({ role, className = "" }: RoleBadgeProps) {
  const roleStyles = {
    CONSUMER: "bg-blue-100 text-blue-800 border-blue-200",
    FARMER: "bg-green-100 text-green-800 border-green-200",
    MODERATOR: "bg-yellow-100 text-yellow-800 border-yellow-200",
    ADMIN: "bg-purple-100 text-purple-800 border-purple-200",
    SUPER_ADMIN: "bg-red-100 text-red-800 border-red-200",
  };

  const roleIcons = {
    CONSUMER: "🛒",
    FARMER: "🌾",
    MODERATOR: "⚖️",
    ADMIN: "👨‍💼",
    SUPER_ADMIN: "👑",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleStyles[role]} ${className}`}
    >
      <span className="mr-1">{roleIcons[role]}</span>
      {role.replace("_", " ")}
    </span>
  );
}

/**
 * Permission list component for displaying what a role can do
 */
interface PermissionListProps {
  role: UserRole;
  permissions: Permission[];
  className?: string;
}

export function PermissionList({
  role,
  permissions,
  className = "",
}: PermissionListProps) {
  const userPermissions = permissions.filter((permission) =>
    hasPermission(role, permission),
  );

  if (userPermissions.length === 0) {
    return (
      <div className={`text-sm text-gray-500 italic ${className}`}>
        No permissions available for this role.
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <h4 className="text-sm font-medium text-gray-900 mb-2">
        Available Permissions:
      </h4>
      <ul className="space-y-1">
        {userPermissions.map((permission) => (
          <li
            key={permission}
            className="flex items-center text-sm text-gray-600"
          >
            <span className="text-green-500 mr-2">✓</span>
            {permission.split("_").join(" ").toLowerCase()}
          </li>
        ))}
      </ul>
    </div>
  );
}
