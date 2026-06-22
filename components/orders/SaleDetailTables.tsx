"use client";

import React from "react";
import { Empty, Segmented } from "antd";
import type { TableProps } from "antd/es/table";
import { CreditCard, FileText, PackageCheck, Undo2 } from "lucide-react";
import AppTable from "@/components/ui/AppTable";
import { ActionDropdown } from "@/components/ui/ActionDropdown";
import PreviewImage from "@/components/ui/PreviewImage";
import { formatDate } from "@/lib/dateUtils";
import { Payment, PurchaseLineItem, PurchaseReturnEvent, PurchaseStockEvent, Sale } from "@/types/index";
import { ResolvedProductName } from "@/components/products/ResolvedProductName";

type SaleTableView = "items" | "fulfillments" | "returns" | "payments";

interface SaleDetailTablesProps {
  sale: Sale;
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
}

function productName(product: string | { name: string }) {
  return typeof product === "string" ? "-" : product.name;
}

function productSku(product: string | { sku?: string }) {
  return typeof product === "string" ? undefined : product.sku;
}

function productImage(product: string | { media?: { url: string }[] }) {
  return typeof product === "string" ? undefined : product.media?.[0]?.url;
}

function ProductCell({ name, sku, imageUrl, product }: { name: string; sku?: string; imageUrl?: string; product?: string | { id?: string; name?: string } }) {
  return (
    <div className="flex items-center gap-x-2">
      <PreviewImage width={28} height={28} src={imageUrl} />
      <div className="min-w-0">
        <ResolvedProductName name={name} product={product} className="line-clamp-1" />
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
  { label: <SegmentLabel icon={<Undo2 size={15} />} text="Returns" />, value: "returns" },
  { label: <SegmentLabel icon={<CreditCard size={15} />} text="Payments" />, value: "payments" },
] as const;

export default function SaleDetailTables({
  sale,
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
}: SaleDetailTablesProps) {
  const [view, setView] = React.useState<SaleTableView>("items");
  const canMutate = canManage && !isCancelled && !isReadOnly;
  const availableOptions = React.useMemo(() => tableOptions.filter((option) => option.value !== "returns" || Boolean(sale.returnedItems?.length)), [sale.returnedItems?.length]);
  React.useEffect(() => {
    if (!availableOptions.some((option) => option.value === view)) {
      setView("items");
    }
  }, [availableOptions, view]);
  const hasReturnedItems = sale.lineItems.some((line) => Number(line.returnedQuantity || 0) > 0);
  const hasTaxedItems = sale.lineItems.some((line) => Boolean(line.taxDescription) || Number(line.taxAmount || 0) > 0);
  const itemColumns: TableProps<PurchaseLineItem>["columns"] = [
    { title: "Product", key: "productName", className: "!pl-8", width: "45%", render: (_, line) => <ProductCell name={line.productName} product={line.productId} sku={line.productSku || productSku(line.productId)} imageUrl={line.productUrl || productImage(line.productId)} /> },
    { title: "Ordered", dataIndex: "quantity", key: "quantity" },
    { title: "Fulfilled", key: "fulfilled", render: (_, line) => Number(line.fulfilledQuantity || 0).toLocaleString() },
    ...(hasReturnedItems ? [{ title: "Returned", key: "returned", render: (_: unknown, line: PurchaseLineItem) => Number(line.returnedQuantity || 0).toLocaleString() }] : []),
    { title: "Remaining", key: "remaining", render: (_, line) => Math.max(Number(line.quantity || 0) - Number(line.fulfilledQuantity || 0), 0).toLocaleString() },
    { title: "Unit Price", key: "unitPrice", render: (_, line) => Number(line.unitPrice).toFixed(2) },
    ...(hasTaxedItems ? [{ title: "Tax", key: "tax", render: (_: unknown, line: PurchaseLineItem) => (line.taxDescription ? `${line.taxRate || 0}%` : "-") }] : []),
    { title: "Total", key: "total", className: "!pr-8", render: (_, line) => Number(line.total).toFixed(2) },
  ];
  const fulfillmentColumns: TableProps<PurchaseStockEvent>["columns"] = [
    { title: "Product", key: "product", className: "!pl-8", render: (_, event) => <ProductCell name={productName(event.productId)} product={event.productId} sku={productSku(event.productId)} imageUrl={productImage(event.productId)} /> },
    { title: "Fulfilled Qty", dataIndex: "quantity", key: "quantity" },
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
    { title: "Product", key: "product", className: "!pl-8", render: (_, event) => <ProductCell name={productName(event.productId)} product={event.productId} sku={productSku(event.productId)} imageUrl={productImage(event.productId)} /> },
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
    items: { title: "Line Items", columns: itemColumns, data: sale.lineItems },
    fulfillments: { title: "Fulfillment History", columns: fulfillmentColumns, data: sale.fulfilledItems || [] },
    returns: { title: "Return History", columns: returnColumns, data: sale.returnedItems || [] },
    payments: { title: "Payments", columns: paymentColumns, data: (sale.payments || []) as Payment[] },
  };
  const current = tables[view];
  const discountedSubtotal = Math.max(Number(sale.subTotal) - Number(sale.discountAmount || 0), 0);
  const paidAmount = Number(sale.amount || 0) - Number(sale.balance || 0);
  const taxSummary = Object.entries(
    (sale.taxes || []).reduce<Record<string, number>>((summary, tax) => {
      const name = sale.taxId ? `${tax.name} @${tax.value}%` : tax.name;
      summary[name] = (summary[name] || 0) + Number(tax.amount || 0);
      return summary;
    }, {}),
  ).map(([name, amount]) => ({ name, amount }));

  return (
    <>
      <div className="mb-8 overflow-x-auto pb-1">
        <div className="flex w-max min-w-full justify-center">
          <Segmented
            shape="round"
            options={availableOptions}
            value={view}
            onChange={(value) => setView(value as SaleTableView)}
            className="[&_.ant-segmented-item-selected]:!bg-[#2d837d] [&_.ant-segmented-item-selected]:!text-white"
            style={{ backgroundColor: "#ebebeb", padding: "5px" }}
          />
        </div>
      </div>
      <div>
        {current.data.length ? (
          <>
            <div className="md:hidden">
              <MobileSaleList
                view={view}
                sale={sale}
                currency={currency}
                hasReturnedItems={hasReturnedItems}
                hasTaxedItems={hasTaxedItems}
                canMutate={canMutate}
                onEditFulfillment={onEditFulfillment}
                onDeleteFulfillment={onDeleteFulfillment}
                onEditReturn={onEditReturn}
                onDeleteReturn={onDeleteReturn}
                onEditPayment={onEditPayment}
                onDeletePayment={onDeletePayment}
              />
            </div>
            <div className="hidden md:block">
              <AppTable columns={(current.columns || []) as TableProps<PurchaseLineItem | PurchaseStockEvent | PurchaseReturnEvent | Payment>["columns"]} dataSource={current.data as Array<PurchaseLineItem | PurchaseStockEvent | PurchaseReturnEvent | Payment>} rowKey="id" pagination={false} scrollX={860} />
            </div>
            {view === "items" ? (
              <SaleItemsTotalsCard
                currency={currency}
                subTotal={Number(sale.subTotal || 0)}
                discountAmount={Number(sale.discountAmount || 0)}
                discountedSubtotal={discountedSubtotal}
                total={Number(sale.amount || 0)}
                paid={paidAmount}
                balance={Number(sale.balance || 0)}
                taxSummary={taxSummary}
                taxAmount={Number(sale.taxAmount || 0)}
              />
            ) : null}
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

function SaleItemsTotalsCard({
  currency,
  subTotal,
  discountAmount,
  discountedSubtotal,
  total,
  paid,
  balance,
  taxSummary,
  taxAmount,
}: {
  currency: string;
  subTotal: number;
  discountAmount: number;
  discountedSubtotal: number;
  total: number;
  paid: number;
  balance: number;
  taxSummary: Array<{ name: string; amount: number }>;
  taxAmount: number;
}) {
  return (
    <div className="px-4 pb-6 pt-5 md:px-8">
      <div className="ml-auto w-full md:w-[40%] md:min-w-[320px]">
        <div className="space-y-4">
          <InlineSummaryRow label="Items Total" value={money(currency, subTotal)} />
          <InlineSummaryRow label="Discount" value={`- ${money(currency, discountAmount)}`} />
          <InlineSummaryRow label="Subtotal" value={money(currency, discountedSubtotal)} />
          {taxSummary.length
            ? taxSummary.map((tax) => <InlineSummaryRow key={tax.name} label={tax.name} value={money(currency, tax.amount)} />)
            : taxAmount > 0
              ? <InlineSummaryRow label="Taxes" value={money(currency, taxAmount)} />
              : null}
          <div className="border-t border-gray-300 pt-4">
            <InlineSummaryRow label="Total" value={money(currency, total)} strong />
          </div>
          <InlineSummaryRow label="Paid" value={money(currency, paid)} />
          <div className="border-t border-gray-300 pt-4">
            <InlineSummaryRow label="Balance" value={money(currency, balance)} strong />
          </div>
        </div>
      </div>
    </div>
  );
}

function InlineSummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 ${strong ? "text-sm font-semibold text-gray-950 md:text-[15px]" : "text-xs text-gray-600 md:text-sm"}`}>
      <span>{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

function money(currency: string, value: number | undefined) {
  const amount = Number(value || 0);
  const prefix = amount < 0 ? "-" : "";
  return `${prefix}${currency} ${Math.abs(amount).toFixed(2)}`;
}

type MobileSaleListProps = Pick<
  SaleDetailTablesProps,
  "currency" | "onEditFulfillment" | "onDeleteFulfillment" | "onEditReturn" | "onDeleteReturn" | "onEditPayment" | "onDeletePayment"
> & { view: SaleTableView; sale: Sale; canMutate: boolean; hasReturnedItems: boolean; hasTaxedItems: boolean };

function MobileSaleList({ view, sale, currency, hasReturnedItems, hasTaxedItems, canMutate, onEditFulfillment, onDeleteFulfillment, onEditReturn, onDeleteReturn, onEditPayment, onDeletePayment }: MobileSaleListProps) {
  if (view === "items") {
    return (
      <div className="divide-y divide-gray-200 border-y border-gray-200">
        {sale.lineItems.map((line) => (
          <div key={line.id} className="px-4 py-4">
            <ProductCell name={line.productName} product={line.productId} sku={line.productSku || productSku(line.productId)} imageUrl={line.productUrl || productImage(line.productId)} />
            <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
              <MobileMetric label="Ordered" value={Number(line.quantity || 0).toLocaleString()} />
              <MobileMetric label="Fulfilled" value={Number(line.fulfilledQuantity || 0).toLocaleString()} />
              {hasReturnedItems ? <MobileMetric label="Returned" value={Number(line.returnedQuantity || 0).toLocaleString()} /> : null}
              <MobileMetric label="Remaining" value={Math.max(Number(line.quantity || 0) - Number(line.fulfilledQuantity || 0), 0).toLocaleString()} />
              {hasTaxedItems ? <MobileMetric label="Tax" value={line.taxDescription ? `${line.taxRate || 0}%` : "-"} /> : null}
            </div>
            <div className="mt-3 flex justify-between border-t border-gray-100 pt-3 text-sm"><span className="text-gray-500">Line total</span><span className="font-semibold text-gray-950">{currency} {Number(line.total || 0).toFixed(2)}</span></div>
          </div>
        ))}
      </div>
    );
  }

  if (view === "payments") {
    return <div className="divide-y divide-gray-200 border-y border-gray-200">{((sale.payments || []) as Payment[]).map((payment) => <MobileEvent key={payment.id} title={payment.type?.replaceAll("_", " ") || "Payment"} date={formatDate(payment.date)} detail={payment.note || "No reference"} value={`${currency} ${Number(payment.amount || 0).toFixed(2)}`} action={canMutate ? <ActionDropdown openEditModal={() => onEditPayment(payment)} onDelete={() => onDeletePayment(payment)} /> : null} />)}</div>;
  }

  if (view === "returns") {
    return <div className="divide-y divide-gray-200 border-y border-gray-200">{(sale.returnedItems || []).map((event) => <MobileEvent key={event.id} title={<ResolvedProductName name={productName(event.productId)} product={event.productId} />} date={formatDate(event.returnedAt)} detail={event.reason || "No reason provided"} value={`${Number(event.quantity || 0).toLocaleString()} returned`} action={canMutate ? <ActionDropdown openEditModal={() => onEditReturn(event)} onDelete={() => onDeleteReturn(event)} /> : null} />)}</div>;
  }

  return <div className="divide-y divide-gray-200 border-y border-gray-200">{(sale.fulfilledItems || []).map((event) => <MobileEvent key={event.id} title={<ResolvedProductName name={productName(event.productId)} product={event.productId} />} date={formatDate(event.fulfilledAt)} detail={productSku(event.productId) ? `SKU: ${productSku(event.productId)}` : "Fulfillment"} value={`${Number(event.quantity || 0).toLocaleString()} fulfilled`} action={canMutate ? <ActionDropdown openEditModal={() => onEditFulfillment(event)} onDelete={() => onDeleteFulfillment(event)} /> : null} />)}</div>;
}

function MobileMetric({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-gray-500">{label}</p><p className="mt-0.5 font-medium text-gray-900">{value}</p></div>;
}

function MobileEvent({ title, detail, date, value, action }: { title: React.ReactNode; detail: string; date: string; value: string; action: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 px-4 py-4">
      <div className="min-w-0 flex-1"><p className="truncate font-medium capitalize text-gray-950">{title}</p><p className="mt-1 truncate text-sm text-gray-500">{detail}</p><p className="mt-1 text-xs text-gray-400">{date}</p></div>
      <div className="flex shrink-0 items-start gap-2"><span className="text-sm font-semibold text-gray-950">{value}</span>{action}</div>
    </div>
  );
}
