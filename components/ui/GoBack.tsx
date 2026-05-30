"use client";

import { Button } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoChevronLeft } from "react-icons/go";

export function GoBack() {
  const router = useRouter();

  return (
    <Button
      shape="circle"
      type="text"
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push("/dashboard");
        }
      }}
      className="cursor-pointer  !bg-gray-200 "
    >
      <GoChevronLeft />
    </Button>
  );
}
