"use client";

import { Package } from "lucide-react";

import { ResolvedProductName } from "@/components/products/ResolvedProductName";
import PreviewImage from "@/components/ui/PreviewImage";
import { Purchase, PurchaseLineItem } from "@/types/index";

export function buildPurchaseSummary(purchase: Purchase) {
  const currency = purchase.currencyId?.code || "";
  const paid = Number(purchase.amount) - Number(purchase.balance);
  const discountedSubtotal = Math.max(Number(purchase.subTotal) - Number(purchase.discountAmount || 0), 0);
  const taxSummary = Object.entries(
    (purchase.taxes || []).reduce<Record<string, number>>((summary, tax) => {
      const name = purchase.taxId ? `${tax.name} @${tax.value}%` : tax.name;
      summary[name] = (summary[name] || 0) + Number(tax.amount || 0);
      return summary;
    }, {}),
  ).map(([name, amount]) => ({ name, amount }));

  return {
    currency,
    paid,
    discountedSubtotal,
    taxSummary,
    isCancelled: Boolean(purchase.isDeleted),
  };
}

export function buildCostBreakdownTotals(purchase: Purchase) {
  return {
    totalPurchaseCost: purchase.lineItems.reduce((sum, line) => sum + Number(line.baseTotal || line.total || 0), 0),
    totalLandedCost: purchase.lineItems.reduce((sum, line) => sum + Number(line.allocatedLandedCost ?? line.landedCost ?? 0), 0),
    finalInventoryCost: purchase.lineItems.reduce((sum, line) => sum + Number(line.finalLineCost || line.baseTotal || line.total || 0), 0),
  };
}

export function productImage(product: PurchaseLineItem["productId"]) {
  return typeof product === "string" ? undefined : product.media?.[0]?.url;
}

export function CostItemImage({ src }: { src?: string }) {
  if (!src) {
    return (
      <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-400">
        <Package size={16} strokeWidth={2} />
      </div>
    );
  }

  return <PreviewImage width={34} height={34} src={src} />;
}

export function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`mb-3 flex justify-between text-sm ${strong ? "font-semibold" : ""}`}>
      <span className="text-gray-600">{label}</span>
      <span>{value}</span>
    </div>
  );
}

export function CostStat({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-md bg-gray-100 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-1 text-sm ${strong ? "font-semibold text-gray-950" : "font-medium text-gray-800"}`}>{value}</p>
    </div>
  );
}

export function CostMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 font-medium text-gray-900">{value}</p>
    </div>
  );
}

export function money(currency: string, value: number | undefined) {
  const amount = Number(value || 0);
  const prefix = amount < 0 ? "-" : "";
  return `${prefix}${currency} ${Math.abs(amount).toFixed(2)}`;
}

export function PurchaseLineCostBreakdown({ line }: { line: PurchaseLineItem }) {
  return (
    <div className="flex items-center gap-3">
      <CostItemImage src={line.productUrl || productImage(line.productId)} />
      <div className="min-w-0">
        <ResolvedProductName name={line.productName} product={line.productId} className="line-clamp-1 font-medium text-gray-950" />
        {line.productSku ? <p className="text-xs text-gray-500">SKU: {line.productSku}</p> : null}
      </div>
    </div>
  );
}
