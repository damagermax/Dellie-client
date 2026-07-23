"use client";

import type { Key } from "react";
import { Input, InputNumber, Table } from "antd";
import type { TableProps } from "antd/es/table";

import { Purchase, PurchaseLineItem } from "@/types/index";

export const landedCostAllocationOptions = [
  { value: "BUY_VALUE", label: "Product value" },
  { value: "QUANTITY", label: "Quantity" },
  { value: "WEIGHT", label: "Weight" },
] as const;

export const landedCostScopeOptions = [
  { value: "ALL_ITEMS", label: "All products" },
  { value: "SELECTED_ITEMS", label: "Selected products" },
] as const;

export function buildLandedCostProductColumns({
  purchase,
  onUpdateLineWeight,
  amountCurrencyCode,
}: {
  purchase: Purchase;
  onUpdateLineWeight: (lineId: string, weight: number) => void;
  amountCurrencyCode: string;
}): TableProps<PurchaseLineItem>["columns"] {
  return [
    { title: "Product", dataIndex: "productName", key: "productName" },
    { title: "Qty", dataIndex: "quantity", key: "quantity", width: 72 },
    {
      title: "Weight",
      key: "weight",
      width: 120,
      render: (_, line) => <InputNumber className="!w-full" controls={false} min={0} suffix="kg" value={Number(line.weight || 0)} onChange={(value) => onUpdateLineWeight(line.id, Number(value || 0))} />,
    },
    { title: "Value", key: "total", width: 115, render: (_, line) => `${amountCurrencyCode || purchase.currencyId?.code || ""} ${Number(line.total).toFixed(2)}`.trim() },
  ];
}

export function LandedCostProductSelector({
  lineItems,
  columns,
  productSearch,
  onSearchChange,
  selectedLineItemIds,
  onSelectionChange,
  selectionError,
}: {
  lineItems: PurchaseLineItem[];
  columns: TableProps<PurchaseLineItem>["columns"];
  productSearch: string;
  onSearchChange: (value: string) => void;
  selectedLineItemIds: Key[];
  onSelectionChange: (keys: Key[]) => void;
  selectionError: boolean;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm text-gray-700">Products</p>
        <p className="text-xs text-gray-500">{selectedLineItemIds.length} selected</p>
      </div>
      <Input.Search allowClear className="mb-3" placeholder="Search purchase products" value={productSearch} onChange={(event) => onSearchChange(event.target.value)} />
      <Table<PurchaseLineItem>
        columns={columns}
        dataSource={lineItems}
        rowKey="id"
        size="small"
        locale={{ emptyText: "No matching products" }}
        pagination={false}
        rowSelection={{
          selectedRowKeys: selectedLineItemIds,
          preserveSelectedRowKeys: true,
          onChange: onSelectionChange,
        }}
      />
      {selectionError ? <p className="mt-2 text-xs text-red-600">Select at least one product.</p> : null}
    </div>
  );
}
