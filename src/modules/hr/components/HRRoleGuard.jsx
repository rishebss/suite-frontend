import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { Loader } from "lucide-react";

/**
 * HR Role Guard — Restricts HR route access based on user role.
 *
 * Usage:
 *   <HRRoleGuard requiredRole="admin"><AdminPage /></HRRoleGuard>
 *   <HRRoleGuard requiredRole="manager"><MSSPage /></HRRoleGuard>
 *   <HRRoleGuard requiredRole="employee"><ESSPage /></HRRoleGuard>
 *
 * Role hierarchy: admin > manager > employee
 * - admin: Superadmin, Admin
 * - manager: Superadmin, Admin, Manager
 * - employee: anyone authenticated
 */

const ROLE_HIERARCHY = {
  superadmin: ["Superadmin"],
  admin: ["Superadmin", "Admin"],
  manager: ["Superadmin", "Admin", "Manager"],
  employee: ["Superadmin", "Admin", "Manager", "Staff", "User"],
};

export const HRRoleGuard = ({ children, requiredRole = "employee", fallbackPath = "/hr" }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-white/40 text-sm">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const allowedRoles = ROLE_HIERARCHY[requiredRole] || ROLE_HIERARCHY.employee;
  const userRole = user.role || "User";

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

/**
 * Hook to check if the current user has a specific role level.
 * Useful for conditional rendering within pages.
 *
 * Usage:
 *   const { isAdmin, isManager, isEmployee } = useHRRole();
 *   {isAdmin && <AdminButton />}
 */
export const useHRRole = () => {
  const { user } = useAuth();
  const userRole = user?.role || "User";

  return {
    isSuperadmin: ROLE_HIERARCHY.superadmin.includes(userRole),
    isAdmin: ROLE_HIERARCHY.admin.includes(userRole),
    isManager: ROLE_HIERARCHY.manager.includes(userRole),
    isEmployee: ROLE_HIERARCHY.employee.includes(userRole),
    role: userRole,
  };
};

export default HRRoleGuard;
