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
  const authenticationRequired = isError && (error as any)?.status === 401;

  useEffect(() => {
    if (currentUser && isSuccess) {
      dispatch(setCurrentUser({ user: { ...currentUser }, store: currentUser.store }));
    }
  }, [currentUser, isSuccess]);

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
