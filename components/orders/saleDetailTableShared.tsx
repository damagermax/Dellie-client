"use client";

import React from "react";
import { CreditCard, FileText, PackageCheck, Undo2 } from "lucide-react";

import PreviewImage from "@/components/ui/PreviewImage";
import { ResolvedProductName } from "@/components/products/ResolvedProductName";
import { Payment, PurchaseLineItem, PurchaseReturnEvent, PurchaseStockEvent } from "@/types/index";

export type SaleTableView = "items" | "fulfillments" | "returns" | "payments";
export type SaleTableRow = PurchaseLineItem | PurchaseStockEvent | PurchaseReturnEvent | Payment;

export interface SaleTableSectionHandlers {
  onEditFulfillment: (event: PurchaseStockEvent) => void;
  onDeleteFulfillment: (event: PurchaseStockEvent) => void;
  onEditReturn: (event: PurchaseReturnEvent) => void;
  onDeleteReturn: (event: PurchaseReturnEvent) => void;
  onEditPayment: (payment: Payment) => void;
  onDeletePayment: (payment: Payment) => void;
}

export const saleTableOptions = [
  { label: <SegmentLabel icon={<FileText size={15} />} text="Items" />, value: "items" },
  { label: <SegmentLabel icon={<PackageCheck size={15} />} text="Fulfillment" />, value: "fulfillments" },
  { label: <SegmentLabel icon={<Undo2 size={15} />} text="Returns" />, value: "returns" },
  { label: <SegmentLabel icon={<CreditCard size={15} />} text="Payments" />, value: "payments" },
] as const;

export function productName(product: string | { name: string }) {
  return typeof product === "string" ? "-" : product.name;
}

export function productSku(product: string | { sku?: string }) {
  return typeof product === "string" ? undefined : product.sku;
}

export function productImage(product: string | { media?: { url: string }[] }) {
  return typeof product === "string" ? undefined : product.media?.[0]?.url;
}

export function ProductCell({ name, sku, imageUrl, product }: { name: string; sku?: string; imageUrl?: string; product?: string | { id?: string; name?: string } }) {
  return (
    <div className="flex items-center gap-x-2">
      <PreviewImage width={28} height={28} src={imageUrl} />
      <div className="min-w-0">
        <ResolvedProductName name={name} product={product} className="line-clamp-1" />
        {sku && <p className="text-xs text-gray-500">SKU: {sku}</p>}
      </div>
    </div>
  );
}

export function InlineSummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 ${strong ? "text-sm font-semibold text-gray-950 md:text-[15px]" : "text-xs text-gray-600 md:text-sm"}`}>
      <span>{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

export function MobileMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-0.5 font-medium text-gray-900">{value}</p>
    </div>
  );
}

export function MobileEvent({ title, detail, date, value, action }: { title: React.ReactNode; detail: string; date: string; value: string; action: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 px-4 py-4">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium capitalize text-gray-950">{title}</p>
        <p className="mt-1 truncate text-sm text-gray-500">{detail}</p>
        <p className="mt-1 text-xs text-gray-400">{date}</p>
      </div>
      <div className="flex shrink-0 items-start gap-2">
        <span className="text-sm font-semibold text-gray-950">{value}</span>
        {action}
      </div>
    </div>
  );
}

export function SaleReturnRestockIndicator({ restock }: { restock?: boolean }) {
  const isRestocked = restock !== false;

  return <span className="text-sm font-medium text-gray-700">{isRestocked ? "Yes" : "No"}</span>;
}

export function money(currency: string, value: number | undefined) {
  const amount = Number(value || 0);
  const prefix = amount < 0 ? "-" : "";
  return `${prefix}${currency ? `${currency} ` : ""}${Math.abs(amount).toFixed(2)}`.trim();
}

function SegmentLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="flex items-center gap-x-2 px-1">
      {icon}
      <span>{text}</span>
    </span>
  );
}
