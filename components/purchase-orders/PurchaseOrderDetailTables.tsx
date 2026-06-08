"use client";

import React from "react";
import { Empty, Segmented, Tabs } from "antd";
import type { TableProps } from "antd/es/table";
import { CreditCard, FileText, PackageCheck, Receipt } from "lucide-react";
import AppTable from "@/components/ui/AppTable";
import { ActionDropdown } from "@/components/ui/ActionDropdown";
import PreviewImage from "@/components/ui/PreviewImage";
import { formatDate } from "@/lib/dateUtils";
import { Payment, Purchase, PurchaseLandedCost, PurchaseLineItem, PurchaseStockEvent } from "@/types/index";

type PurchaseTableView = "items" | "fulfillments" | "landedCosts" | "payments";

interface PurchaseOrderDetailTablesProps {
  purchase: Purchase;
  currency: string;
  canManage?: boolean;
  isCancelled: boolean;
  onEditFulfillment: (event: PurchaseStockEvent) => void;
  onDeleteFulfillment: (event: PurchaseStockEvent) => void;
  onEditPayment: (payment: Payment) => void;
  onDeletePayment: (payment: Payment) => void;
  onEditLandedCost: (landedCost: PurchaseLandedCost) => void;
  onDeleteLandedCost: (landedCost: PurchaseLandedCost) => void;
}

function productName(product: string | { name: string }) {
  return typeof product === "string" ? "-" : product.name;
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

function productSku(product: string | { sku?: string }) {
  return typeof product === "string" ? undefined : product.sku;
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
  { label: <SegmentLabel icon={<Receipt size={15} />} text="Landed Costs" />, value: "landedCosts" },
  { label: <SegmentLabel icon={<CreditCard size={15} />} text="Payments" />, value: "payments" },
];

export default function PurchaseOrderDetailTables({
  purchase,
  currency,
  canManage = false,
  isCancelled,
  onEditFulfillment,
  onDeleteFulfillment,
  onEditPayment,
  onDeletePayment,
  onEditLandedCost,
  onDeleteLandedCost,
}: PurchaseOrderDetailTablesProps) {
  const [view, setView] = React.useState<PurchaseTableView>("items");
  const availableOptions = React.useMemo(() => tableOptions.filter((option) => option.value !== "landedCosts" || Boolean(purchase.landedCosts?.length)), [purchase.landedCosts?.length]);
  React.useEffect(() => {
    if (!availableOptions.some((option) => option.value === view)) {
      setView(availableOptions[0]?.value as PurchaseTableView);
    }
  }, [availableOptions, view]);
  const mobileTabItems = availableOptions.map((option) => ({
    key: option.value,
    label: option.label,
  }));
  const itemColumns: TableProps<PurchaseLineItem>["columns"] = [
    { title: "Product", key: "productName", className: "!pl-8", width: "45%", render: (_, line) => <ProductCell name={line.productName} sku={line.productSku || productSku(line.productId)} imageUrl={line.productUrl || productImage(line.productId)} /> },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    { title: "Fulfilled", key: "fulfilled", render: (_, line) => Number(line.fulfilledQuantity || 0).toLocaleString() },
    { title: "Unit Cost", key: "unitPrice", render: (_, line) => Number(line.unitPrice).toFixed(2) },
    //{ title: "Tax", key: "tax", render: (_, line) => (line.taxDescription ? `${line.taxDescription} (${line.taxRate || 0}%)` : "No tax") },
    { title: "Total", key: "total", className: "!pr-8", render: (_, line) => Number(line.total).toFixed(2) },
  ];
  const fulfillmentColumns: TableProps<PurchaseStockEvent>["columns"] = [
    { title: "Product", key: "product", className: "!pl-8", render: (_, event) => <ProductCell name={productName(event.productId)} sku={productSku(event.productId)} imageUrl={productImage(event.productId)} /> },
    { title: "Received Qty", dataIndex: "quantity", key: "quantity" },
    { title: "Date", key: "date", className: "!pr-8", render: (_, event) => formatDate(event.fulfilledAt) },
    {
      title: "",
      key: "actions",
      dataIndex: "id",
      align: "right",
      className: "!pr-8",
      width: 80,
      render: (_, event) => (isCancelled || !canManage ? null : <ActionDropdown openEditModal={() => onEditFulfillment(event)} onDelete={() => onDeleteFulfillment(event)} />),
    },
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
    {
      title: "",
      key: "actions",
      dataIndex: "id",
      align: "right",
      className: "!pr-8",
      width: 80,
      render: (_, cost) => (isCancelled || !canManage ? null : <ActionDropdown openEditModal={() => onEditLandedCost(cost)} onDelete={() => onDeleteLandedCost(cost)} />),
    },
  ];
  const paymentColumns: TableProps<Payment>["columns"] = [
    { title: "Date", key: "date", className: "!pl-8", render: (_, payment) => formatDate(payment.date) },
    { title: "Reference", dataIndex: "reference", key: "reference", render: (reference) => reference || "-" },
    { title: "Type", dataIndex: "type", key: "type", render: (type: string) => type?.replaceAll("_", " ") || "Payment" },
    { title: "Amount", key: "amount", className: "!pr-8", render: (_, payment) => `${currency} ${Number(payment.amount || 0).toFixed(2)}` },
    {
      title: "",
      key: "actions",
      dataIndex: "id",
      align: "right",
      className: "!pr-8",
      width: 80,
      render: (_, payment) => (isCancelled || !canManage ? null : <ActionDropdown openEditModal={() => onEditPayment(payment)} onDelete={() => onDeletePayment(payment)} />),
    },
  ];
  const tables = {
    items: { title: "Line Items", columns: itemColumns, data: purchase.lineItems },
    fulfillments: { title: "Fulfillment History", columns: fulfillmentColumns, data: purchase.fulfilledItems || [] },
    landedCosts: { title: "Landed Costs", columns: costColumns, data: purchase.landedCosts || [] },
    payments: { title: "Payments", columns: paymentColumns, data: (purchase.payments || []) as Payment[] },
  };
  const current = tables[view];

  return (
    <>
      <div className="mb-6 hidden overflow-x-auto pb-1 md:block">
        <div className="flex w-max min-w-full justify-center">
          <Segmented
            shape="round"
            options={availableOptions}
            value={view}
            onChange={(value) => setView(value as PurchaseTableView)}
            className="[&_.ant-segmented-item-selected]:!bg-[#2d837d] [&_.ant-segmented-item-selected]:!text-white"
            style={{ backgroundColor: "#ebebeb", padding: "5px" }}
          />
        </div>
      </div>
      <div className=" border-y border-gray-200 bg-white px-2 md:hidden">
        <Tabs
          activeKey={view}
          items={mobileTabItems}
          onChange={(value) => setView(value as PurchaseTableView)}
          tabBarGutter={18}
          className="purchase-mobile-tabs !mb-0 [&_.ant-tabs-nav]:!mb-0 [&_.ant-tabs-nav:before]:!border-0 [&_.ant-tabs-tab]:!py-4 [&_.ant-tabs-tab-btn]:!text-gray-500 [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:!text-[#2d837d] [&_.ant-tabs-ink-bar]:!bg-[#2d837d]"
        />
      </div>
      <div>
        <div className="mb-3 hidden items-center justify-between px-8">
          <h2 className=" text-base font-medium text-gray-900">{current.title}</h2>

          {/* <div className=" flex items-center gap-2">
            <Button type="primary" className="-!bg-black  !shadow-none">
              Fulfill
            </Button>
            <Button>Pay</Button>
          </div> */}
        </div>
        {current.data.length ? (
          <>
            <div className="md:hidden">
            <MobilePurchaseList
              view={view}
              purchase={purchase}
              currency={currency}
              canManage={canManage}
              isCancelled={isCancelled}
              onEditFulfillment={onEditFulfillment}
              onDeleteFulfillment={onDeleteFulfillment}
              onEditPayment={onEditPayment}
              onDeletePayment={onDeletePayment}
              onEditLandedCost={onEditLandedCost}
              onDeleteLandedCost={onDeleteLandedCost}
            />
          </div>
          <div className="hidden md:block">
              <AppTable columns={current.columns || []} dataSource={current.data} rowKey="id" pagination={false} scrollX={900} />
          </div>
          </>
        ) : (
          <div className="border-t border-gray-200 py-12">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={`No ${current.title.toLowerCase()} recorded`} />
          </div>
        )}
      </div>
    </>
  );
}

function MobilePurchaseList({
  view,
  purchase,
  currency,
  canManage,
  isCancelled,
  onEditFulfillment,
  onDeleteFulfillment,
  onEditPayment,
  onDeletePayment,
  onEditLandedCost,
  onDeleteLandedCost,
}: {
  view: PurchaseTableView;
  purchase: Purchase;
  currency: string;
  canManage: boolean;
  isCancelled: boolean;
  onEditFulfillment: (event: PurchaseStockEvent) => void;
  onDeleteFulfillment: (event: PurchaseStockEvent) => void;
  onEditPayment: (payment: Payment) => void;
  onDeletePayment: (payment: Payment) => void;
  onEditLandedCost: (landedCost: PurchaseLandedCost) => void;
  onDeleteLandedCost: (landedCost: PurchaseLandedCost) => void;
}) {
  if (view === "items") {
    return (
      <div className="grid  ">
        {purchase.lineItems.map((line) => (
          <MobileCard key={line.id}>
            <MobileProductHeader name={line.productName} sku={line.productSku || productSku(line.productId)} imageUrl={line.productUrl || productImage(line.productId)} />
            <div className="mt-2 -pl-14 flex items-center justify-between gap-3 text-[13px]">
              <span className="text-gray-500">
                Qty {Number(line.quantity).toLocaleString()} x {line.unitPrice}
              </span>
              <span className="font-semibold text-gray-900">
                {currency} {Number(line.total).toFixed(2)}
              </span>
            </div>
          </MobileCard>
        ))}
      </div>
    );
  }

  if (view === "fulfillments") {
    return (
      <div className="grid   ">
        {(purchase.fulfilledItems || []).map((event) => (
          <MobileCard key={event.id}>
            <div className="flex items-start justify-between gap-3">
            <MobileProductHeader name={productName(event.productId)} sku={productSku(event.productId)} imageUrl={productImage(event.productId)} />
              {!isCancelled && canManage && <ActionDropdown openEditModal={() => onEditFulfillment(event)} onDelete={() => onDeleteFulfillment(event)} />}
            </div>
            <div className="mt-2 text-[13px] text-gray-500 flex items-center justify-between gap-3">
              <span>Qty {Number(event.quantity).toLocaleString()}</span>
              <span>{formatDate(event.fulfilledAt)}</span>
            </div>
          </MobileCard>
        ))}
      </div>
    );
  }

  if (view === "landedCosts") {
    return (
      <div className="">
        {(purchase.landedCosts || []).map((cost) => (
          <MobileCard key={cost.id}>
            <div className="flex items-start justify-between gap-4">
              <p className="text-base  font-medium text-gray-900">{cost.name}</p>

              {!isCancelled && canManage && <ActionDropdown openEditModal={() => onEditLandedCost(cost)} onDelete={() => onDeleteLandedCost(cost)} />}
            </div>

            <p className="mt-3 shrink-0 text-base font-semibold text-gray-900">
              {currency} {Number(cost.amount).toFixed(2)}
            </p>
            <div className="mt-3 flex items-center justify-between gap-3 text-sm">
              <span className="text-gray-500 capitalize ">Allocation: {cost.allocationMethod.replaceAll("_", " ").toLowerCase()}</span>
              <span className="text-gray-500">{cost.appliesTo === "SELECTED_ITEMS" ? `${cost.lineItemIds.length} selected product${cost.lineItemIds.length === 1 ? "" : "s"}` : "All products"}</span>
            </div>
          </MobileCard>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3  pb-6">
      {((purchase.payments || []) as Payment[]).map((payment, index) => (
        <MobileCard key={payment.id || index}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-base font-semibold capitalize text-gray-900">{payment.type?.replaceAll("_", " ") || "Payment"}</p>
                <p className="mt-1 text-xs text-gray-500">{formatDate(payment.date)}</p>
              </div>
            {!isCancelled && canManage && <ActionDropdown openEditModal={() => onEditPayment(payment)} onDelete={() => onDeletePayment(payment)} />}
          </div>
          <p className="mt-3 shrink-0 text-base font-semibold text-gray-900">
            {currency} {Number(payment.amount || 0).toFixed(2)}
          </p>
          <MobileTotal label="Reference" value={payment.reference || "-"} />
        </MobileCard>
      ))}
    </div>
  );
}

function MobileCard({ children }: { children: React.ReactNode }) {
  return <article className=" border-b border-gray-200 bg-white px-4 py-2 ">{children}</article>;
}

function MobileProductHeader({ name, sku, imageUrl }: { name: string; sku?: string; imageUrl?: string }) {
  return (
    <div className="flex gap-3">
      <div className=" flex-shrink-0">
        <PreviewImage width={42} height={42} src={imageUrl} />
      </div>
      <div className="min-w-0">
        <p className="line-clamp-2 text-sm  text-gray-900">{name}</p>
        {sku && <p className="mt-1 text-xs text-gray-500">SKU: {sku}</p>}
      </div>
    </div>
  );
}

function MobileTotal({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-4 flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}
