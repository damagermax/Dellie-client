"use client";

import { Select, Spin } from "antd";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { setAccessToken } from "@/lib/redux/features/authSlice";
import { setCurrentUser } from "@/lib/redux/features/userSlice";
import { useSwitchStoreMutation } from "@/lib/redux/services/authApi";
import { RootState } from "@/lib/store";

export function StoreSelector() {
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.currentUser);
  const [switchStore, { isLoading }] = useSwitchStoreMutation();

  const stores = useMemo(
    () =>
      (currentUser.stores || [])
        .filter((store) => store.status === "active")
        .map((store) => ({
          value: store.id,
          label: (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">{store.name}</span>
              <span className="text-xs text-gray-500 capitalize">{store.role || "store member"}</span>
            </div>
          ),
        })),
    [currentUser.stores],
  );

  const activeStoreId = currentUser.activeStoreId || currentUser.store?.id || stores[0]?.value;

  if (stores.length <= 1) {
    return null;
  }

  const handleChange = async (storeId: string) => {
    const response = await switchStore({ storeId }).unwrap();

    dispatch(setAccessToken(response.accessToken));
    localStorage.setItem("accessToken", response.accessToken);
    localStorage.setItem("user", JSON.stringify(response.user));

    dispatch(
      setCurrentUser({
        user: response.user,
        store: response.user.store,
        stores: response.user.stores || [],
        activeStoreId: response.user.activeStoreId || response.user.store?.id || null,
        permissions: response.user.permissions || [],
      }),
    );

    window.location.reload();
  };

  return (
    <div className="px-3 pt-3">
      <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">Active store</div>
        <Select
          value={activeStoreId}
          onChange={handleChange}
          options={stores}
          placeholder="Select store"
          className="w-full"
          disabled={isLoading}
          suffixIcon={isLoading ? <Spin size="small" /> : undefined}
          popupMatchSelectWidth={false}
        />
      </div>
    </div>
  );
}
