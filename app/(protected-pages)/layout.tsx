"use client";

import { useGetCurrentUserQuery } from "@/lib/redux/services/userApi";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearAccessToken } from "@/lib/redux/features/authSlice";
import { setCurrentUser, setStoreSettings } from "@/lib/redux/features/userSlice";
import { useGetStoreSettingsQuery } from "@/lib/redux/services/storeSettingsApi";
import { DEFAULT_ENABLED_MODULES, DEFAULT_STORE_SETTINGS } from "@/types/store-settings";
import { StorePermission } from "@/types/store-access";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { data: currentUser, error, isError, isSuccess } = useGetCurrentUserQuery();
  const canReadStoreSettings = Boolean(currentUser?.permissions?.some((permission) => permission === StorePermission.SETTINGS_VIEW || permission === StorePermission.SETTINGS_MANAGE));
  const { data: storeSettings } = useGetStoreSettingsQuery(undefined, { skip: !canReadStoreSettings });
  const authenticationRequired = isError && typeof error === "object" && error !== null && "status" in error && (error as { status?: number }).status === 401;

  useEffect(() => {
    if (currentUser && isSuccess) {
      const enabledModules = {
        ...DEFAULT_ENABLED_MODULES,
        ...(currentUser.store?.settings?.enabledModules || {}),
      };

      dispatch(
        setCurrentUser({
          user: { ...currentUser },
          store: currentUser.store,
          stores: currentUser.stores || [],
          activeStoreId: currentUser.activeStoreId || currentUser.store?.id || null,
          permissions: currentUser.permissions || [],
        }),
      );
      dispatch(
        setStoreSettings({
          ...DEFAULT_STORE_SETTINGS,
          enabledModules,
        }),
      );
    }
  }, [currentUser, dispatch, isSuccess]);

  useEffect(() => {
    if (storeSettings) {
      dispatch(setStoreSettings(storeSettings));
    }
  }, [dispatch, storeSettings]);

  useEffect(() => {
    if (authenticationRequired) {
      dispatch(clearAccessToken());
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      router.replace("/auth/signin");
    }
  }, [authenticationRequired, dispatch, router]);

  if (authenticationRequired) return null;

  return <div>{children}</div>;
}
