"use client";

import React from "react";
import { TabsProps } from "antd";
import { CreditCard, FileText, PackageCheck, Receipt, Undo2 } from "lucide-react";

import PreviewImage from "@/components/ui/PreviewImage";
import { ResolvedProductName } from "@/components/products/ResolvedProductName";
import { Payment, PurchaseLandedCost, PurchaseLineItem, PurchaseReturnEvent, PurchaseStockEvent } from "@/types/index";

export type PurchaseTableView = "items" | "fulfillments" | "returns" | "landedCosts" | "payments";
export type PurchaseTableRow = PurchaseLineItem | PurchaseStockEvent | PurchaseReturnEvent | PurchaseLandedCost | Payment;

export interface PurchaseTableSectionHandlers {
  onEditFulfillment: (event: PurchaseStockEvent) => void;
  onDeleteFulfillment: (event: PurchaseStockEvent) => void;
  onEditReturn: (event: PurchaseReturnEvent) => void;
  onDeleteReturn: (event: PurchaseReturnEvent) => void;
  onEditPayment: (payment: Payment) => void;
  onDeletePayment: (payment: Payment) => void;
  onEditLandedCost: (landedCost: PurchaseLandedCost) => void;
  onDeleteLandedCost: (landedCost: PurchaseLandedCost) => void;
}

export const purchaseTableOptions = [
  { label: <SegmentLabel icon={<FileText size={15} />} text="Items" />, value: "items" },
  { label: <SegmentLabel icon={<PackageCheck size={15} />} text="Fulfillment" />, value: "fulfillments" },
  { label: <SegmentLabel icon={<Undo2 size={15} />} text="Returns" />, value: "returns" },
  { label: <SegmentLabel icon={<Receipt size={15} />} text="Landed Costs" />, value: "landedCosts" },
  { label: <SegmentLabel icon={<CreditCard size={15} />} text="Payments" />, value: "payments" },
] as const;

export function buildPurchaseMobileTabItems(options: Array<{ label: React.ReactNode; value: PurchaseTableView }>): TabsProps["items"] {
  return options.map((option) => ({
    key: option.value,
    label: option.label,
  }));
}

export function landedCostAmountLabel(cost: PurchaseLandedCost, baseCurrency: string) {
  const landedCostCurrency = landedCostCurrencyCode(cost);
  const formattedAmount = `${landedCostCurrency} ${Number(cost.amount).toFixed(2)}`;

  if (!baseCurrency || landedCostCurrency === baseCurrency) {
    return <span>{formattedAmount}</span>;
  }

  return (
    <div>
      <p>{formattedAmount}</p>
    </div>
  );
}

export function landedCostCurrencyCode(cost: Pick<PurchaseLandedCost, "currencyCode" | "currencyId">) {
  return cost.currencyCode || (typeof cost.currencyId === "string" ? "" : cost.currencyId?.code) || "";
}

export function productName(product: string | { name: string }) {
  return typeof product === "string" ? "-" : product.name;
}

export function productImage(product: string | { media?: { url: string }[] }) {
  return typeof product === "string" ? undefined : product.media?.[0]?.url;
}

export function productSku(product: string | { sku?: string }) {
  return typeof product === "string" ? undefined : product.sku;
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

export function MobileCard({ children }: { children: React.ReactNode }) {
  return <article className="border-b border-gray-200 bg-white px-4 py-4">{children}</article>;
}

export function MobileProductHeader({ name, sku, imageUrl, product }: { name: string; sku?: string; imageUrl?: string; product?: string | { id?: string; name?: string } }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0">
        <PreviewImage width={42} height={42} src={imageUrl} />
      </div>
      <div className="min-w-0">
        <ResolvedProductName name={name} product={product} className="line-clamp-2 text-sm text-gray-900" />
        {sku && <p className="mt-1 text-xs text-gray-500">SKU: {sku}</p>}
      </div>
    </div>
  );
}

export function MobileTotal({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-4 flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}

export function MobileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 px-3 py-2">
      <p className="text-[11px] uppercase tracking-[0.12em] text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

export function money(currency: string, value: number | undefined) {
  return `${currency} ${Number(value || 0).toFixed(2)}`.trim();
}

function SegmentLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="flex items-center gap-x-2 px-1">
      {icon}
      <span>{text}</span>
    </span>
  );
}
