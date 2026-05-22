"use client";

import { useGetCurrentUserQuery } from "@/lib/redux/services/userApi";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { setCurrentUser } from "@/lib/redux/features/userSlice";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { data: currentUser, isSuccess } = useGetCurrentUserQuery();

  useEffect(() => {
    if (currentUser && isSuccess) {
      dispatch(setCurrentUser({ user: { ...currentUser }, store: currentUser.store }));
    }
  }, [currentUser, isSuccess]);

  return <div>{children}</div>;
}
