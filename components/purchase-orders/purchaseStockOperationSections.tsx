"use client";

import type { TableProps } from "antd/es/table";
import { InputNumber } from "antd";

import { ResolvedProductName } from "@/components/products/ResolvedProductName";
import AppTable from "@/components/ui/AppTable";
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
  const columns: TableProps<PurchaseReceiptLine>["columns"] = [
    {
      title: "Product",
      dataIndex: "productName",
      key: "product",
      className: "!pl-8",
      width: "75%",
      render: (_value, line) => (
        <div className="flex items-center gap-x-2">
          <PreviewImage width={28} height={28} src={line.productUrl || productImage(line.productId)} />
          <div className="min-w-0">
            <ResolvedProductName name={line.productName} product={line.productId} className="line-clamp-1" />
            <p className="text-xs text-gray-500">
              {productSku(line) || "No SKU"} | Available {Number(line.remainingQuantity || 0).toLocaleString()}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Qty",
      dataIndex: "id",
      key: "quantity",
      width: "25%",
      render: (_value, line) => (
        <InputNumber
          className="!w-24"
          variant="underlined"
          min={0}
          max={line.remainingQuantity}
          controls={false}
          precision={0}
          value={quantities[line.id]}
          placeholder="0"
          onChange={(value) => onQuantityChange(line.id, Number(value || 0))}
        />
      ),
    },
  ];

  return <AppTable columns={columns} dataSource={lines} rowKey="id" pagination={false} scrollX={720} />;
}

function productImage(product: Purchase["lineItems"][number]["productId"]) {
  return typeof product === "string" ? undefined : product.media?.[0]?.url;
}

function productSku(line: Purchase["lineItems"][number]) {
  return line.productSku || (typeof line.productId === "string" ? undefined : line.productId.sku);
}
