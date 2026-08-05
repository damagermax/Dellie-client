import { useSelector } from "react-redux";
import type { RootState } from "@/lib/redux/store";

const RESTRICTED_ROLES = new Set(["manager", "staff"]);

export function useAssignedLocationScope() {
  const user = useSelector((state: RootState) => state.currentUser.user);
  const activeStoreRole = user?.stores?.find((store) => store.id === user.activeStoreId)?.role;
  const role = String((user as any)?.role || activeStoreRole || "").toLowerCase();
  const assignedLocationId = user?.assignedLocationId || null;
  const assignedLocation = user?.assignedLocation || null;
  const isRestricted = RESTRICTED_ROLES.has(role);

  return {
    role,
    isRestricted,
    assignedLocationId,
    assignedLocation,
    hasAssignedLocation: !isRestricted || Boolean(assignedLocationId),
  };
}
