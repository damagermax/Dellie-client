"use client";

import { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { StorePermission } from "@/types/store-access";

export function usePermissions() {
  const user = useSelector((state: RootState) => state.currentUser.user);
  const permissions = useSelector((state: RootState) => state.currentUser.permissions);

  const hasPermission = useCallback(
    (permission: StorePermission) => permissions.includes(permission),
    [permissions],
  );

  const hasAnyPermission = useCallback(
    (requiredPermissions: StorePermission[]) => requiredPermissions.some((permission) => permissions.includes(permission)),
    [permissions],
  );

  const hasAllPermissions = useCallback(
    (requiredPermissions: StorePermission[]) => requiredPermissions.every((permission) => permissions.includes(permission)),
    [permissions],
  );

  const ready = Boolean(user);

  return useMemo(
    () => ({
      user,
      permissions,
      ready,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
    }),
    [hasPermission, hasAllPermissions, hasAnyPermission, permissions, ready, user],
  );
}
