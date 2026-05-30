"use client";

import React from "react";
import { Button, Empty, Segmented } from "antd";
import type { TableProps } from "antd/es/table";
import { CreditCard, FileText, PackageCheck, Receipt, RotateCcw } from "lucide-react";
import AppTable from "@/components/ui/AppTable";
import PreviewImage from "@/components/ui/PreviewImage";
import { formatDate } from "@/lib/dateUtils";
import { Purchase, PurchaseLandedCost, PurchaseLineItem, PurchaseReturnEvent, PurchaseStockEvent } from "@/types/index";

type PurchaseTableView = "items" | "fulfillments" | "returns" | "landedCosts" | "payments";

function productName(product: string | { name: string }) {
  return typeof product === "string" ? "-" : product.name;
}

function productImage(product: string | { media?: { url: string }[] }) {
  return typeof product === "string" ? undefined : product.media?.[0]?.url;
}

function ProductCell({ name, imageUrl }: { name: string; imageUrl?: string }) {
  return (
    <div className="flex items-center gap-x-2">
      <PreviewImage width={28} height={28} src={imageUrl} />
      <span className="line-clamp-1">{name}</span>
    </div>
  );
}

function SegmentLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="flex items-center gap-x-2 px-1">
      {icon}
      <span>{text}</span>
    </span>
  );
}

const tableOptions = [
  { label: <SegmentLabel icon={<FileText size={15} />} text="Items" />, value: "items" },
  { label: <SegmentLabel icon={<PackageCheck size={15} />} text="Fulfillment" />, value: "fulfillments" },
  { label: <SegmentLabel icon={<RotateCcw size={15} />} text="Returns" />, value: "returns" },
  { label: <SegmentLabel icon={<Receipt size={15} />} text="Landed Costs" />, value: "landedCosts" },
  { label: <SegmentLabel icon={<CreditCard size={15} />} text="Payments" />, value: "payments" },
];

export default function PurchaseOrderDetailTables({ purchase, currency }: { purchase: Purchase; currency: string }) {
  const [view, setView] = React.useState<PurchaseTableView>("items");
  const itemColumns: TableProps<PurchaseLineItem>["columns"] = [
    { title: "Product", key: "productName", className: "!pl-8", width: "45%", render: (_, line) => <ProductCell name={line.productName} imageUrl={line.productUrl || productImage(line.productId)} /> },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    { title: "Fulfilled", key: "fulfilled", render: (_, line) => Number(line.fulfilledQuantity || 0).toLocaleString() },
    { title: "Returned", key: "returned", render: (_, line) => Number(line.returnedQuantity || 0).toLocaleString() },
    { title: "Unit Cost", key: "unitPrice", render: (_, line) => Number(line.unitPrice).toFixed(2) },
    //{ title: "Tax", key: "tax", render: (_, line) => (line.taxDescription ? `${line.taxDescription} (${line.taxRate || 0}%)` : "No tax") },
    { title: "Total", key: "total", className: "!pr-8", render: (_, line) => Number(line.total).toFixed(2) },
  ];
  const fulfillmentColumns: TableProps<PurchaseStockEvent>["columns"] = [
    { title: "Product", key: "product", className: "!pl-8", render: (_, event) => <ProductCell name={productName(event.productId)} imageUrl={productImage(event.productId)} /> },
    { title: "Received Qty", dataIndex: "quantity", key: "quantity" },
    { title: "Date", key: "date", className: "!pr-8", render: (_, event) => formatDate(event.fulfilledAt) },
  ];
  const returnColumns: TableProps<PurchaseReturnEvent>["columns"] = [
    { title: "Product", key: "product", className: "!pl-8", render: (_, event) => <ProductCell name={productName(event.productId)} imageUrl={productImage(event.productId)} /> },
    { title: "Returned Qty", dataIndex: "quantity", key: "quantity" },
    { title: "Reason", dataIndex: "reason", key: "reason", render: (reason) => reason || "-" },
    { title: "Date", key: "date", className: "!pr-8", render: (_, event) => formatDate(event.returnedAt) },
  ];
  const costColumns: TableProps<PurchaseLandedCost>["columns"] = [
    { title: "Cost", dataIndex: "name", key: "name", className: "!pl-8" },
    {
      title: "Applied To",
      key: "appliesTo",
      render: (_, cost) => (cost.appliesTo === "SELECTED_ITEMS" ? `${cost.lineItemIds.length} selected product${cost.lineItemIds.length === 1 ? "" : "s"}` : "All products"),
    },
    { title: "Allocation", dataIndex: "allocationMethod", key: "allocationMethod", render: (method: string) => method.replaceAll("_", " ").toLowerCase() },
    { title: "Amount", key: "amount", className: "!pr-8", render: (_, cost) => `${currency} ${Number(cost.amount).toFixed(2)}` },
  ];
  const paymentColumns: TableProps<any>["columns"] = [
    { title: "Date", key: "date", className: "!pl-8", render: (_, payment) => formatDate(payment.date) },
    { title: "Reference", dataIndex: "reference", key: "reference", render: (reference) => reference || "-" },
    { title: "Type", dataIndex: "type", key: "type", render: (type: string) => type?.replaceAll("_", " ") || "Payment" },
    { title: "Amount", key: "amount", className: "!pr-8", render: (_, payment) => `${currency} ${Number(payment.amount || 0).toFixed(2)}` },
  ];
  const tables = {
    items: { title: "Line Items", columns: itemColumns, data: purchase.lineItems },
    fulfillments: { title: "Fulfillment History", columns: fulfillmentColumns, data: purchase.fulfilledItems || [] },
    returns: { title: "Returns", columns: returnColumns, data: purchase.returnedItems || [] },
    landedCosts: { title: "Landed Costs", columns: costColumns, data: purchase.landedCosts || [] },
    payments: { title: "Payments", columns: paymentColumns, data: (purchase.payments || []) as any[] },
  };
  const current = tables[view];

  return (
    <>
      <div className="mb-8 overflow-x-auto pb-1">
        <div className="flex w-max min-w-full justify-center">
          <Segmented
            shape="round"
            options={tableOptions}
            value={view}
            onChange={(value) => setView(value as PurchaseTableView)}
            className="[&_.ant-segmented-item-selected]:!bg-green-600 [&_.ant-segmented-item-selected]:!text-white"
            style={{ backgroundColor: "#ebebeb", padding: "5px" }}
          />
        </div>
      </div>
      <div>
        <div className="mb-3 px-8 hidden flex items-center justify-between">
          <h2 className=" text-base font-medium text-gray-900">{current.title}</h2>

          {/* <div className=" flex items-center gap-2">
            <Button type="primary" className="-!bg-black  !shadow-none">
              Fulfill
            </Button>
            <Button>Pay</Button>
          </div> */}
        </div>
        {current.data.length ? (
          <AppTable columns={current.columns || []} dataSource={current.data as any[]} rowKey="id" pagination={false} />
        ) : (
          <div className="border-t border-gray-200 py-12">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={`No ${current.title.toLowerCase()} recorded`} />
          </div>
        )}
      </div>
    </>
  );
}
