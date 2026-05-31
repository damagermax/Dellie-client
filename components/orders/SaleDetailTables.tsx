"use client";

import React from "react";
import { Empty, Segmented } from "antd";
import type { TableProps } from "antd/es/table";
import { CreditCard, FileText, PackageCheck, RotateCcw } from "lucide-react";
import AppTable from "@/components/ui/AppTable";
import PreviewImage from "@/components/ui/PreviewImage";
import { formatDate } from "@/lib/dateUtils";
import { PurchaseLineItem, PurchaseReturnEvent, PurchaseStockEvent, Sale } from "@/types/index";

type SaleTableView = "items" | "fulfillments" | "returns" | "payments";

function productName(product: string | { name: string }) {
  return typeof product === "string" ? "-" : product.name;
}

function productSku(product: string | { sku?: string }) {
  return typeof product === "string" ? undefined : product.sku;
}

function productImage(product: string | { media?: { url: string }[] }) {
  return typeof product === "string" ? undefined : product.media?.[0]?.url;
}

function ProductCell({ name, sku, imageUrl }: { name: string; sku?: string; imageUrl?: string }) {
  return (
    <div className="flex items-center gap-x-2">
      <PreviewImage width={28} height={28} src={imageUrl} />
      <div className="min-w-0">
        <p className="line-clamp-1">{name}</p>
        {sku && <p className="text-xs text-gray-500">SKU: {sku}</p>}
      </div>
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
  { label: <SegmentLabel icon={<CreditCard size={15} />} text="Payments" />, value: "payments" },
];

export default function SaleDetailTables({ sale, currency }: { sale: Sale; currency: string }) {
  const [view, setView] = React.useState<SaleTableView>("items");
  const itemColumns: TableProps<PurchaseLineItem>["columns"] = [
    { title: "Product", key: "productName", className: "!pl-8", width: "45%", render: (_, line) => <ProductCell name={line.productName} sku={line.productSku || productSku(line.productId)} imageUrl={line.productUrl || productImage(line.productId)} /> },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    { title: "Fulfilled", key: "fulfilled", render: (_, line) => Number(line.fulfilledQuantity || 0).toLocaleString() },
    { title: "Returned", key: "returned", render: (_, line) => Number(line.returnedQuantity || 0).toLocaleString() },
    { title: "Unit Price", key: "unitPrice", render: (_, line) => Number(line.unitPrice).toFixed(2) },
    { title: "Total", key: "total", className: "!pr-8", render: (_, line) => Number(line.total).toFixed(2) },
  ];
  const fulfillmentColumns: TableProps<PurchaseStockEvent>["columns"] = [
    { title: "Product", key: "product", className: "!pl-8", render: (_, event) => <ProductCell name={productName(event.productId)} sku={productSku(event.productId)} imageUrl={productImage(event.productId)} /> },
    { title: "Fulfilled Qty", dataIndex: "quantity", key: "quantity" },
    { title: "Date", key: "date", className: "!pr-8", render: (_, event) => formatDate(event.fulfilledAt) },
  ];
  const returnColumns: TableProps<PurchaseReturnEvent>["columns"] = [
    { title: "Product", key: "product", className: "!pl-8", render: (_, event) => <ProductCell name={productName(event.productId)} sku={productSku(event.productId)} imageUrl={productImage(event.productId)} /> },
    { title: "Returned Qty", dataIndex: "quantity", key: "quantity" },
    { title: "Reason", dataIndex: "reason", key: "reason", render: (reason) => reason || "-" },
    { title: "Date", key: "date", className: "!pr-8", render: (_, event) => formatDate(event.returnedAt) },
  ];
  const paymentColumns: TableProps<any>["columns"] = [
    { title: "Date", key: "date", className: "!pl-8", render: (_, payment) => formatDate(payment.date) },
    { title: "Reference", dataIndex: "reference", key: "reference", render: (reference) => reference || "-" },
    { title: "Type", dataIndex: "type", key: "type", render: (type: string) => type?.replaceAll("_", " ") || "Payment" },
    { title: "Amount", key: "amount", className: "!pr-8", render: (_, payment) => `${currency} ${Number(payment.amount || 0).toFixed(2)}` },
  ];
  const tables = {
    items: { title: "Line Items", columns: itemColumns, data: sale.lineItems },
    fulfillments: { title: "Fulfillment History", columns: fulfillmentColumns, data: sale.fulfilledItems || [] },
    returns: { title: "Returns", columns: returnColumns, data: sale.returnedItems || [] },
    payments: { title: "Payments", columns: paymentColumns, data: (sale.payments || []) as any[] },
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
            onChange={(value) => setView(value as SaleTableView)}
            className="[&_.ant-segmented-item-selected]:!bg-[#2d837d] [&_.ant-segmented-item-selected]:!text-white"
            style={{ backgroundColor: "#ebebeb", padding: "5px" }}
          />
        </div>
      </div>
      <div>
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
