"use client";

import { InputNumber } from "antd";

import { ResolvedProductName } from "@/components/products/ResolvedProductName";
import PreviewImage from "@/components/ui/PreviewImage";
import { Purchase } from "@/types/index";

export type PurchaseReceiptLine = Purchase["lineItems"][number] & {
  remainingQuantity: number;
};

export function buildPurchaseReceiptLines(purchase: Purchase): PurchaseReceiptLine[] {
  return purchase.lineItems
    .map((line) => {
      const type = typeof line.productId === "string" ? line.productType : line.productId.type || line.productType;
      return {
        ...line,
        lineProductType: type,
        remainingQuantity: Math.max(Number(line.quantity) - Number(line.fulfilledQuantity || 0), 0),
      };
    })
    .filter((line) => line.lineProductType !== "BUNDLE" && line.remainingQuantity > 0);
}

export function buildDefaultReceiptQuantities(lines: PurchaseReceiptLine[]) {
  return Object.fromEntries(lines.map((line) => [line.id, line.remainingQuantity]));
}

export function PurchaseReceiptLineList({
  lines,
  quantities,
  onQuantityChange,
}: {
  lines: PurchaseReceiptLine[];
  quantities: Record<string, number>;
  onQuantityChange: (lineId: string, value: number) => void;
}) {
  return (
    <div className="space-y-3">
      {lines.map((line) => (
        <div key={line.id} className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-x-3">
            <PreviewImage width={32} height={32} src={line.productUrl || productImage(line.productId)} />
            <div>
              <ResolvedProductName name={line.productName} product={line.productId} className="text-sm font-medium" />
              <p className="text-xs text-gray-500">{line.remainingQuantity.toLocaleString()} available to fulfill</p>
            </div>
          </div>
          <InputNumber min={0} max={line.remainingQuantity} controls={false} value={quantities[line.id]} onChange={(value) => onQuantityChange(line.id, Number(value || 0))} />
        </div>
      ))}
    </div>
  );
}

function productImage(product: Purchase["lineItems"][number]["productId"]) {
  return typeof product === "string" ? undefined : product.media?.[0]?.url;
}
