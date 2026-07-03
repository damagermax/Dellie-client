"use client";

import { InputNumber } from "antd";
import type { TableProps } from "antd/es/table";
import { Trash2 } from "lucide-react";

import PreviewImage from "@/components/ui/PreviewImage";
import { ResolvedProductName } from "@/components/products/ResolvedProductName";
import type { PurchaseDiscountType, Tax } from "@/types/index";
export { SaleProductSearchResults } from "./saleFormSearchResults";
export { SaleSummaryPanel } from "./saleFormSummaryPanel";

export interface SaleFormLineItem {
  id: string;
  productImageUrl?: string;
  productName: string;
  productSku?: string;
  quantity: number;
  unitPrice: number;
  discountValue?: number;
  discountType?: PurchaseDiscountType;
  tax?: Tax;
}

type BuildSaleFormColumnsArgs = {
  currency?: string;
  differentProductTax: boolean;
  formatMoney: (amount: number) => string;
  lineTotal: (item: SaleFormLineItem) => { discountedSubtotal: number; tax: number };
  onOpenLineTax: (productId: string) => void;
  onRemoveLine: (productId: string) => void;
  onUpdateLineItem: (id: string, patch: Partial<SaleFormLineItem>) => void;
};

export function buildSaleFormColumns({ currency, differentProductTax, formatMoney, lineTotal, onOpenLineTax, onRemoveLine, onUpdateLineItem }: BuildSaleFormColumnsArgs): TableProps<SaleFormLineItem>["columns"] {
  return [
    {
      title: "Product",
      dataIndex: "productName",
      key: "productName",
      className: "!pl-8",
      width: differentProductTax ? "50%" : "60%",
      render: (_: string, item: SaleFormLineItem) => (
        <div className="flex items-center gap-x-2">
          <PreviewImage width={28} height={28} src={item.productImageUrl} />
          <div className="min-w-0">
            <ResolvedProductName name={item.productName} productId={item.id} className="line-clamp-1" />
            {item.productSku ? <p className="text-xs text-gray-500">SKU: {item.productSku}</p> : null}
          </div>
        </div>
      ),
    },
    {
      title: "Qty",
      key: "quantity",
      width: "10%",
      render: (_: unknown, item: SaleFormLineItem) => <InputNumber variant="underlined" controls={false} min={0.000001} value={item.quantity} onChange={(value) => onUpdateLineItem(item.id, { quantity: Number(value || 1) })} />,
    },
    {
      title: "Price",
      key: "price",
      width: "10%",
      render: (_: unknown, item: SaleFormLineItem) => <InputNumber prefix={currency || undefined} variant="underlined" controls={false} min={0} value={item.unitPrice} onChange={(value) => onUpdateLineItem(item.id, { unitPrice: Number(value || 0) })} />,
    },
    ...(differentProductTax
      ? [
          {
            title: "Tax",
            key: "tax",
            render: (_: unknown, item: SaleFormLineItem) => (
              <button type="button" className="text-blue-600" onClick={() => onOpenLineTax(item.id)}>
                {item.tax ? formatMoney(lineTotal(item).tax) : "Add Tax"}
              </button>
            ),
          },
        ]
      : []),
    { title: "Total", key: "total", render: (_: unknown, item: SaleFormLineItem) => formatMoney(lineTotal(item).discountedSubtotal + lineTotal(item).tax) },
    { title: "", key: "remove", className: "!pr-8", render: (_: unknown, item: SaleFormLineItem) => <Trash2 size={15} className="cursor-pointer text-gray-500 hover:text-red-500" onClick={() => onRemoveLine(item.id)} /> },
  ];
}
