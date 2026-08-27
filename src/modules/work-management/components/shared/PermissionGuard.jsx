import React from "react";
import { useAuth } from "@/context/AuthContext";

const ROLE_HIERARCHY = {
  VIEWER: 0,
  MEMBER: 1,
  EDITOR: 2,
  ADMIN: 3,
};

const PermissionGuard = ({
  children,
  requiredRole = "MEMBER",
  userRole = null,
  fallback = null,
}) => {
  const { user } = useAuth();

  const userEffectiveRole = userRole || user?.role || "VIEWER";

  const isSuper = ["Superadmin", "Admin"].includes(user?.role);
  if (isSuper) return <>{children}</>;

  const required = ROLE_HIERARCHY[requiredRole] ?? 0;
  const actual = ROLE_HIERARCHY[userEffectiveRole] ?? 0;

  if (actual >= required) return <>{children}</>;

  if (fallback !== undefined) return <>{fallback}</>;

  return null;
};

export const roleAccess = {
  isAdmin: (role) => ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.ADMIN,
  isEditor: (role) => ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.EDITOR,
  isMember: (role) => ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.MEMBER,
  isViewer: (role) => ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.VIEWER,
};

export default PermissionGuard;
