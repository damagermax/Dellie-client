"use client";

import Link from "next/link";
import { Tag } from "antd";
import type { ReactNode } from "react";

import { getProductTypeLabel } from "@/lib/products/type-label";

import { ProductDetail } from "./types";

export function BatchContextCard({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <div className="mb-4 grid gap-3 rounded-sm border border-gray-200 bg-gray-50 px-5 py-2 md:grid-cols-2">
      {items.map((item) => (
        <div key={String(item.label)} className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400">{item.label}</p>
          <p className="mt-1 truncate text-sm font-medium capitalize text-gray-900">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export function DetailGrid({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <div className="grid grid-cols-2 border-y border-gray-200 md:grid-cols-4">
      {items.map((item, index) => (
        <div
          key={`${item.label}-${index}`}
          className={`min-w-0 border-gray-200 p-3 md:p-4 ${index % 2 === 0 ? "border-r" : ""} ${index % 4 !== 3 ? "sm:border-r" : "sm:border-r-0"} ${index < items.length - 2 ? "border-b" : ""} ${index < items.length - 4 ? "sm:border-b" : "sm:border-b-0"}`}
        >
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">{item.label}</p>
          <p className="mt-1 truncate text-sm font-medium text-gray-900">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`border border-gray-200 bg-white ${className}`}>{children}</div>;
}

export function ProductThumb({ src, name, href }: { src?: string | null; name?: string; href?: string }) {
  const image = (
    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-sm border border-gray-200 bg-gray-50">
      {src ? <img className="h-full w-full object-cover" src={src} alt={name || "Product"} /> : <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">-</div>}
    </div>
  );

  return href ? <Link href={href}>{image}</Link> : image;
}

export function TabLabel({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      {icon}
      {text}
    </span>
  );
}

export function TypeBadge({ product }: { product: Pick<ProductDetail, "type" | "bundleItems"> }) {
  const colors: Record<string, string> = {
    STOCK: "green",
    NON_STOCK: "blue",
    SERVICE: "purple",
    PACKAGING: "gold",
    BUNDLE: "cyan",
  };

  return (
    <Tag color={colors[product.type] || "default"} className=" !px-3 !rounded-4xl">
      <span className="capitalize">
        {getProductTypeLabel(product) || "product"} <span className="md:hidden">Product</span>{" "}
      </span>
    </Tag>
  );
}
