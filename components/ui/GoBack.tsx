"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoChevronLeft } from "react-icons/go";

export function GoBack() {
  const router = useRouter();

  return (
    <span
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push("/dashboard");
        }
      }}
      className="cursor-pointer inline-block p-[6px] bg-gray-200 rounded-full"
    >
      <GoChevronLeft />
    </span>
  );
}
