"use client";

import { LuPackage } from "react-icons/lu";

interface ProductImagePlaceholderProps {
  label?: string;
  className?: string;
}

export default function ProductImagePlaceholder({
  label = "No image",
  className = "",
}: ProductImagePlaceholderProps) {
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-1 rounded-[inherit] bg-gradient-to-br from-gray-50 to-gray-100 text-gray-400 ${className}`}
    >
      <LuPackage size={22} strokeWidth={1.8} />
      <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
        {label}
      </span>
    </div>
  );
}
