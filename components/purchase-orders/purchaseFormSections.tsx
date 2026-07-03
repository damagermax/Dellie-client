"use client";

import { InputNumber } from "antd";
import type { TableProps } from "antd/es/table";
import { Trash2 } from "lucide-react";

import PreviewImage from "@/components/ui/PreviewImage";
import { ResolvedProductName } from "@/components/products/ResolvedProductName";
import type { Tax } from "@/types/index";
export { PurchaseProductSearchResults } from "./purchaseFormSearchResults";
export { PurchaseSummaryPanel } from "./purchaseFormSummaryPanel";

export interface ProductLineItem {
  id: string;
  productImageUrl?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  weight?: number;
  tax?: Tax;
}

type BuildPurchaseFormColumnsArgs = {
  currency?: string;
  formatMoney: (amount: number) => string;
  isDifferentProductTax: boolean;
  onOpenLineTax: (productId: string) => void;
  onRemoveLine: (productId: string) => void;
  onUpdateLineItem: (id: string, patch: Partial<ProductLineItem>) => void;
  calculateLineTotal: (item: ProductLineItem) => { tax: number; total: number };
};

export function buildPurchaseFormColumns({ currency, formatMoney, isDifferentProductTax, onOpenLineTax, onRemoveLine, onUpdateLineItem, calculateLineTotal }: BuildPurchaseFormColumnsArgs): TableProps<ProductLineItem>["columns"] {
  return [
    {
      title: "Product",
      dataIndex: "productName",
      key: "productName",
      className: "!pl-8",
      width: isDifferentProductTax ? "50%" : "60%",
      render: (_: unknown, record: ProductLineItem) => (
        <div className="flex items-center gap-x-2">
          <PreviewImage width={28} height={28} src={record.productImageUrl} />
          <ResolvedProductName name={record.productName} productId={record.id} className="line-clamp-1" />
        </div>
      ),
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      key: "quantity",
      width: "10%",
      render: (_: unknown, record: ProductLineItem) => <InputNumber variant="underlined" controls={false} min={1} value={record.quantity} onChange={(value) => onUpdateLineItem(record.id, { quantity: Number(value || 1) })} />,
    },
    {
      title: "Cost",
      dataIndex: "unitPrice",
      key: "unitPrice",
      width: "10%",
      render: (_: unknown, record: ProductLineItem) => <InputNumber prefix={currency || undefined} variant="underlined" controls={false} min={0} value={record.unitPrice} onChange={(value) => onUpdateLineItem(record.id, { unitPrice: Number(value || 0) })} />,
    },
    ...(isDifferentProductTax
      ? [
          {
            title: "Tax",
            dataIndex: "tax",
            key: "tax",
            width: "10%",
            render: (_: unknown, record: ProductLineItem) => (
              <div onClick={() => onOpenLineTax(record.id)} className={`cursor-pointer ${record.tax ? "text-gray-800" : "text-blue-600 hover:underline"}`}>
                {record.tax ? <p>{formatMoney(calculateLineTotal(record).tax)}</p> : <p className="text-blue-600">Add Tax</p>}
              </div>
            ),
          },
        ]
      : []),
    {
      title: "Total ",
      dataIndex: "__total",
      key: "__total",
      align: "end",
      width: "15%",
      render: (_: unknown, record: ProductLineItem) => <p>{formatMoney(calculateLineTotal(record).total)}</p>,
    },
    {
      title: "",
      dataIndex: "id",
      key: "id",
      align: "end",
      render: (id: string) => (
        <div className="cursor-pointer pl-5 text-gray-500 hover:text-red-400" onClick={() => onRemoveLine(id)}>
          <Trash2 size={15} className="cursor-pointer" />
        </div>
      ),
    },
  ];
}
