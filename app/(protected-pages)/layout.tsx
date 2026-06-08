"use client";

import { useGetCurrentUserQuery } from "@/lib/redux/services/userApi";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearAccessToken } from "@/lib/redux/features/authSlice";
import { setCurrentUser } from "@/lib/redux/features/userSlice";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { data: currentUser, error, isError, isSuccess } = useGetCurrentUserQuery();
  const authenticationRequired = isError && typeof error === "object" && error !== null && "status" in error && (error as { status?: number }).status === 401;

  useEffect(() => {
    if (currentUser && isSuccess) {
      dispatch(
        setCurrentUser({
          user: { ...currentUser },
          store: currentUser.store,
          stores: currentUser.stores || [],
          activeStoreId: currentUser.activeStoreId || currentUser.store?.id || null,
          permissions: currentUser.permissions || [],
        }),
      );
    }
  }, [currentUser, dispatch, isSuccess]);

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
