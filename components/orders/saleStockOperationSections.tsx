"use client";

import { InputNumber } from "antd";

import { ResolvedProductName } from "@/components/products/ResolvedProductName";
import PreviewImage from "@/components/ui/PreviewImage";
import { Sale } from "@/types/index";

export type SaleFulfillmentLine = Sale["lineItems"][number] & {
  remainingQuantity: number;
};

export function buildSaleFulfillmentLines(sale: Sale): SaleFulfillmentLine[] {
  return sale.lineItems
    .map((line) => ({
      ...line,
      remainingQuantity: Math.max(Number(line.quantity) - Number(line.fulfilledQuantity || 0), 0),
    }))
    .filter((line) => line.remainingQuantity > 0);
}

export function buildDefaultFulfillmentQuantities(lines: SaleFulfillmentLine[]) {
  return Object.fromEntries(lines.map((line) => [line.id, line.remainingQuantity]));
}

export function SaleFulfillmentLineList({
  lines,
  quantities,
  onQuantityChange,
}: {
  lines: SaleFulfillmentLine[];
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
              {productSku(line) ? <p className="text-xs text-gray-500">SKU: {productSku(line)}</p> : null}
              <p className="text-xs text-gray-500">{line.remainingQuantity.toLocaleString()} available to fulfill</p>
            </div>
          </div>
          <InputNumber min={0} max={line.remainingQuantity} controls={false} value={quantities[line.id]} onChange={(value) => onQuantityChange(line.id, Number(value || 0))} />
        </div>
      ))}
    </div>
  );
}

function productImage(product: Sale["lineItems"][number]["productId"]) {
  return typeof product === "string" ? undefined : product.media?.[0]?.url;
}

function productSku(line: Sale["lineItems"][number]) {
  return line.productSku || (typeof line.productId === "string" ? undefined : line.productId.sku);
}
