"use client";

import React from "react";
import { Empty, Segmented, Table, Tabs } from "antd";
import type { TableProps } from "antd/es/table";
import { CreditCard, FileText, PackageCheck, Receipt, Undo2 } from "lucide-react";
import AppTable from "@/components/ui/AppTable";
import { ActionDropdown } from "@/components/ui/ActionDropdown";
import PreviewImage from "@/components/ui/PreviewImage";
import { formatDate } from "@/lib/dateUtils";
import { useGetCurrencyQuery, useGetStoreSettingsQuery } from "@/lib/redux/services";
import { Payment, Purchase, PurchaseLandedCost, PurchaseLineItem, PurchaseReturnEvent, PurchaseStockEvent } from "@/types/index";

type PurchaseTableView = "items" | "fulfillments" | "returns" | "landedCosts" | "payments";
type PurchaseTableRow = PurchaseLineItem | PurchaseStockEvent | PurchaseReturnEvent | PurchaseLandedCost | Payment;

interface PurchaseOrderDetailTablesProps {
  purchase: Purchase;
  currency: string;
  canManage?: boolean;
  isCancelled: boolean;
  isReadOnly?: boolean;
  onEditFulfillment: (event: PurchaseStockEvent) => void;
  onDeleteFulfillment: (event: PurchaseStockEvent) => void;
  onEditReturn: (event: PurchaseReturnEvent) => void;
  onDeleteReturn: (event: PurchaseReturnEvent) => void;
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

function landedCostAmountLabel(cost: PurchaseLandedCost, baseCurrency: string) {
  const landedCostCurrency = landedCostCurrencyCode(cost);
  const formattedAmount = `${landedCostCurrency} ${Number(cost.amount).toFixed(2)}`;

  if (!baseCurrency || landedCostCurrency === baseCurrency) {
    return <span>{formattedAmount}</span>;
  }

  return (
    <div className="">
      <p>{formattedAmount}</p>
      {/* <p className="text-xs font-normal text-gray-500">
        Base: {baseCurrency} {Number(cost.baseAmount || 0).toFixed(2)}
      </p> */}
    </div>
  );
}

function landedCostCurrencyCode(cost: Pick<PurchaseLandedCost, "currencyCode" | "currencyId">) {
  return cost.currencyCode || (typeof cost.currencyId === "string" ? "" : cost.currencyId?.code) || "";
}

function money(currency: string, value: number | undefined) {
  return `${currency} ${Number(value || 0).toFixed(2)}`.trim();
}

const tableOptions = [
  { label: <SegmentLabel icon={<FileText size={15} />} text="Items" />, value: "items" },
  { label: <SegmentLabel icon={<PackageCheck size={15} />} text="Fulfillment" />, value: "fulfillments" },
  { label: <SegmentLabel icon={<Undo2 size={15} />} text="Returns" />, value: "returns" },
  { label: <SegmentLabel icon={<Receipt size={15} />} text="Landed Costs" />, value: "landedCosts" },
  { label: <SegmentLabel icon={<CreditCard size={15} />} text="Payments" />, value: "payments" },
];

export default function PurchaseOrderDetailTables({
  purchase,
  currency,
  canManage = false,
  isCancelled,
  isReadOnly = false,
  onEditFulfillment,
  onDeleteFulfillment,
  onEditReturn,
  onDeleteReturn,
  onEditPayment,
  onDeletePayment,
  onEditLandedCost,
  onDeleteLandedCost,
}: PurchaseOrderDetailTablesProps) {
  const [view, setView] = React.useState<PurchaseTableView>("items");
  const canMutate = canManage && !isCancelled && !isReadOnly;
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
  const { data: storeSettings } = useGetStoreSettingsQuery();
  const fallbackStoreCurrencyId = user?.store?.currencyId;
  const baseCurrencyId = storeSettings?.businessProfile?.currencyId || fallbackStoreCurrencyId;
  const { data: baseCurrencyRecord } = useGetCurrencyQuery(baseCurrencyId, { skip: !baseCurrencyId });
  const baseCurrency = baseCurrencyRecord?.code || user?.store?.currency?.code || user?.store?.currencyCode || user?.store?.settings?.currency || "";
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
    { title: "Ordered", dataIndex: "quantity", key: "quantity" },
    { title: "Fulfilled", key: "fulfilled", render: (_, line) => Number(line.fulfilledQuantity || 0).toLocaleString() },
    { title: "Returned", key: "returned", render: (_, line) => Number(line.returnedQuantity || 0).toLocaleString() },
    { title: "Remaining", key: "remaining", render: (_, line) => Math.max(Number(line.quantity || 0) - Number(line.fulfilledQuantity || 0), 0).toLocaleString() },
    { title: "Unit Cost", key: "unitPrice", render: (_, line) => Number(line.unitPrice).toFixed(2) },
    { title: "Tax", key: "tax", render: (_, line) => (line.taxDescription ? `${line.taxDescription} (${line.taxRate || 0}%)` : "No tax") },
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
      render: (_, event) => (canMutate ? <ActionDropdown openEditModal={() => onEditFulfillment(event)} onDelete={() => onDeleteFulfillment(event)} /> : null),
    },
  ];
  const returnColumns: TableProps<PurchaseReturnEvent>["columns"] = [
    { title: "Product", key: "product", className: "!pl-8", render: (_, event) => <ProductCell name={productName(event.productId)} sku={productSku(event.productId)} imageUrl={productImage(event.productId)} /> },
    { title: "Returned Qty", dataIndex: "quantity", key: "quantity" },
    { title: "Reason", key: "reason", render: (_, event) => event.reason || "-" },
    { title: "Date", key: "date", className: "!pr-8", render: (_, event) => formatDate(event.returnedAt) },
    {
      title: "",
      key: "actions",
      dataIndex: "id",
      align: "right",
      className: "!pr-8",
      width: 80,
      render: (_, event) => (canMutate ? <ActionDropdown openEditModal={() => onEditReturn(event)} onDelete={() => onDeleteReturn(event)} /> : null),
    },
  ];
  const costColumns: TableProps<PurchaseLandedCost>["columns"] = [
    { title: "Description", dataIndex: "name", key: "name", className: "!pl-8", width: "30%" },
    { title: "Paid To", dataIndex: "contactName", key: "contactName", render: (value: string) => value || "-" },
    { title: "Date", key: "date", render: (_, cost) => (cost.date ? formatDate(cost.date) : "-") },
    // {
    //   title: "Applied To",
    //   key: "appliesTo",
    //   render: (_, cost) => (cost.appliesTo === "SELECTED_ITEMS" ? `${cost.lineItemIds.length} selected product${cost.lineItemIds.length === 1 ? "" : "s"}` : "All products"),
    // },
    { title: "Allocation", dataIndex: "allocationMethod", key: "allocationMethod", render: (method: string) => method.replaceAll("_", " ").toLowerCase() },
    { title: "Amount", key: "amount", render: (_, cost) => landedCostAmountLabel(cost, baseCurrency) },
    {
      title: "Breakdown",
      key: "breakdown",
      className: "!pr-8",
      render: (_, cost) => `${cost.allocations?.length || 0} product${cost.allocations?.length === 1 ? "" : "s"}`,
    },
    {
      title: "",
      key: "actions",
      dataIndex: "id",
      align: "right",
      className: "!pr-8",
      width: 40,
      render: (_, cost) => (canMutate ? <ActionDropdown openEditModal={() => onEditLandedCost(cost)} onDelete={() => onDeleteLandedCost(cost)} /> : null),
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
      render: (_, payment) => (canMutate ? <ActionDropdown openEditModal={() => onEditPayment(payment)} onDelete={() => onDeletePayment(payment)} /> : null),
    },
  ];
  const tables = {
    items: { title: "Line Items", columns: itemColumns, data: purchase.lineItems },
    fulfillments: { title: "Fulfillment History", columns: fulfillmentColumns, data: purchase.fulfilledItems || [] },
    returns: { title: "Return History", columns: returnColumns, data: purchase.returnedItems || [] },
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
        </div>
        {current.data.length ? (
          <>
            <div className="md:hidden">
              <MobilePurchaseList
                view={view}
                purchase={purchase}
                currency={currency}
                baseCurrency={baseCurrency}
                canMutate={canMutate}
                onEditFulfillment={onEditFulfillment}
                onDeleteFulfillment={onDeleteFulfillment}
                onEditReturn={onEditReturn}
                onDeleteReturn={onDeleteReturn}
                onEditPayment={onEditPayment}
                onDeletePayment={onDeletePayment}
                onEditLandedCost={onEditLandedCost}
                onDeleteLandedCost={onDeleteLandedCost}
              />
            </div>
            <div className="hidden md:block">
              <AppTable<PurchaseTableRow>
                columns={(current.columns || []) as TableProps<PurchaseTableRow>["columns"]}
                dataSource={current.data as unknown as PurchaseTableRow[]}
                rowKey="id"
                pagination={false}
                scrollX={900}
                expandable={
                  view === "landedCosts"
                    ? {
                        rowExpandable: (cost) => Boolean((cost as PurchaseLandedCost).allocations?.length),
                        expandedRowRender: (cost) => <LandedCostBreakdownTable cost={cost as PurchaseLandedCost} baseCurrency={baseCurrency} />,
                      }
                    : undefined
                }
              />
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
  baseCurrency,
  canMutate,
  onEditFulfillment,
  onDeleteFulfillment,
  onEditReturn,
  onDeleteReturn,
  onEditPayment,
  onDeletePayment,
  onEditLandedCost,
  onDeleteLandedCost,
}: {
  view: PurchaseTableView;
  purchase: Purchase;
  currency: string;
  baseCurrency: string;
  canMutate: boolean;
  onEditFulfillment: (event: PurchaseStockEvent) => void;
  onDeleteFulfillment: (event: PurchaseStockEvent) => void;
  onEditReturn: (event: PurchaseReturnEvent) => void;
  onDeleteReturn: (event: PurchaseReturnEvent) => void;
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
            <div className="mt-3 grid grid-cols-2 gap-2 text-[13px]">
              <MobileStat label="Ordered" value={Number(line.quantity).toLocaleString()} />
              <MobileStat label="Fulfilled" value={Number(line.fulfilledQuantity || 0).toLocaleString()} />
              <MobileStat label="Returned" value={Number(line.returnedQuantity || 0).toLocaleString()} />
              <MobileStat label="Remaining" value={Math.max(Number(line.quantity || 0) - Number(line.fulfilledQuantity || 0), 0).toLocaleString()} />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-[13px]">
              <span className="text-gray-500">Unit Cost {Number(line.unitPrice).toFixed(2)}</span>
              <span className="font-semibold text-gray-900">
                {currency} {Number(line.total).toFixed(2)}
              </span>
            </div>
          </MobileCard>
        ))}
      </div>
    );
  }

  if (view === "returns") {
    return (
      <div className="grid">
        {(purchase.returnedItems || []).map((event) => (
          <MobileCard key={event.id}>
            <div className="flex items-start justify-between gap-3">
              <MobileProductHeader name={productName(event.productId)} sku={productSku(event.productId)} imageUrl={productImage(event.productId)} />
              {canMutate && <ActionDropdown openEditModal={() => onEditReturn(event)} onDelete={() => onDeleteReturn(event)} />}
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 text-[13px] text-gray-500">
              <span>Qty {Number(event.quantity).toLocaleString()}</span>
              <span>{formatDate(event.returnedAt)}</span>
            </div>
            {event.reason ? <MobileTotal label="Reason" value={event.reason} /> : null}
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
              {canMutate && <ActionDropdown openEditModal={() => onEditFulfillment(event)} onDelete={() => onDeleteFulfillment(event)} />}
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

              {canMutate && <ActionDropdown openEditModal={() => onEditLandedCost(cost)} onDelete={() => onDeleteLandedCost(cost)} />}
            </div>

            <div className="mt-3 shrink-0 text-base font-semibold text-gray-900">{landedCostAmountLabel(cost, baseCurrency)}</div>
            <div className="mt-3 flex items-center justify-between gap-3 text-sm">
              <span className="text-gray-500">{cost.contactName || "No contact"}</span>
              <span className="text-gray-500">{cost.date ? formatDate(cost.date) : "-"}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-sm">
              <span className="text-gray-500 capitalize ">Allocation: {cost.allocationMethod.replaceAll("_", " ").toLowerCase()}</span>
              <span className="text-gray-500">{cost.appliesTo === "SELECTED_ITEMS" ? `${cost.lineItemIds.length} selected product${cost.lineItemIds.length === 1 ? "" : "s"}` : "All products"}</span>
            </div>
            {(cost.allocations || []).length ? (
              <div className="mt-3 grid gap-2">
                {(cost.allocations || []).map((allocation) => (
                  <div key={allocation.lineItemId} className="rounded-md bg-gray-50 px-3 py-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-gray-800">{allocation.productName || "Product"}</span>
                      <span className="font-semibold text-gray-900">{money(allocation.currencyCode || landedCostCurrencyCode(cost), allocation.allocatedAmount)}</span>
                    </div>
                    <p className="mt-1 text-gray-500">
                      Qty {Number(allocation.quantity || 0).toLocaleString()} · {money(allocation.currencyCode || landedCostCurrencyCode(cost), allocation.allocatedPerUnit)} per unit
                      {baseCurrency ? ` · Base ${money(baseCurrency, allocation.baseAllocatedAmount)}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
            {cost.note ? <MobileTotal label="Note" value={cost.note} /> : null}
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
            {canMutate && <ActionDropdown openEditModal={() => onEditPayment(payment)} onDelete={() => onDeletePayment(payment)} />}
          </div>
          <p className="mt-3 shrink-0 text-base font-semibold text-gray-900">
            {currency} {Number(payment.amount || 0).toFixed(2)}
          </p>
          <MobileTotal label="Note" value={payment.note || "-"} />
        </MobileCard>
      ))}
    </div>
  );
}

function LandedCostBreakdownTable({ cost, baseCurrency }: { cost: PurchaseLandedCost; baseCurrency: string }) {
  type AllocationRow = NonNullable<PurchaseLandedCost["allocations"]>[number];
  const rows: AllocationRow[] = cost.allocations || [];

  return (
    <div className="rounded-md bg-gray-50 p-3">
      <Table
        rowKey={(row: AllocationRow) => `${cost.id}-${row.lineItemId || row.productName}`}
        size="small"
        pagination={false}
        dataSource={rows}
        columns={[
          { title: "Product", dataIndex: "productName", key: "productName", render: (value) => value || "Product" },
          { title: "Qty", dataIndex: "quantity", key: "quantity", width: 100, render: (value) => Number(value || 0).toLocaleString() },
          { title: "Allocated", key: "allocatedAmount", width: 100, align: "right", render: (_, row) => money(row.currencyCode || landedCostCurrencyCode(cost), row.allocatedAmount) },
          //{ title: "Base Allocated", key: "baseAllocatedAmount", width: 150, align: "right", render: (_, row) => money(baseCurrency, row.baseAllocatedAmount) },
          { title: "Per Unit", key: "allocatedPerUnit", width: 100, align: "right", render: (_, row) => money(row.currencyCode || landedCostCurrencyCode(cost), row.allocatedPerUnit) },
          //{ title: "Base / Unit", key: "baseAllocatedPerUnit", width: 140, align: "right", render: (_, row) => money(baseCurrency, row.baseAllocatedPerUnit) },
        ]}
      />
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

function MobileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 px-3 py-2">
      <p className="text-[11px] uppercase tracking-[0.12em] text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}
