"use client";

import { Table } from "antd";
import type { TableProps } from "antd/es/table";

import { ActionDropdown } from "@/components/ui/ActionDropdown";
import { formatDate } from "@/lib/dateUtils";
import { canMutatePayment } from "@/lib/paymentMutationWindow";
import { canMutateStockEvent } from "@/lib/stockMutationWindow";
import { Payment, Purchase, PurchaseLandedCost, PurchaseLineItem, PurchaseReturnEvent, PurchaseStockEvent } from "@/types/index";

import {
  landedCostAmountLabel,
  landedCostCurrencyCode,
  ProductCell,
  productImage,
  productName,
  productSku,
  PurchaseTableRow,
  PurchaseTableSectionHandlers,
  PurchaseTableView,
  money,
} from "./purchaseDetailTableShared";

interface BuildPurchaseTablesParams extends PurchaseTableSectionHandlers {
  purchase: Purchase;
  currency: string;
  baseCurrency: string;
  canMutate: boolean;
  isStaffUser: boolean;
  hasReturnedItems: boolean;
  hasTaxedItems: boolean;
}

export function buildPurchaseTables({
  purchase,
  currency,
  baseCurrency,
  canMutate,
  isStaffUser,
  hasReturnedItems,
  hasTaxedItems,
  onEditFulfillment,
  onDeleteFulfillment,
  onEditReturn,
  onDeleteReturn,
  onEditPayment,
  onDeletePayment,
  onEditLandedCost,
  onDeleteLandedCost,
}: BuildPurchaseTablesParams): Record<PurchaseTableView, { title: string; columns: TableProps<PurchaseTableRow>["columns"]; data: PurchaseTableRow[] }> {
  const showPaymentActionColumn = canMutate && ((purchase.payments || []) as Payment[]).some((payment) => canMutatePayment(payment));
  const showFulfillmentActionColumn = canMutate && (!isStaffUser || (purchase.fulfilledItems || []).some((event) => canMutateStockEvent(event)));
  const showReturnActionColumn = canMutate && (!isStaffUser || (purchase.returnedItems || []).some((event) => canMutateStockEvent(event)));

  const itemColumns: TableProps<PurchaseLineItem>["columns"] = [
    {
      title: "Product",
      key: "productName",
      className: "!pl-8",
      width: "45%",
      render: (_, line) => <ProductCell name={line.productName} product={line.productId} sku={line.productSku || productSku(line.productId)} imageUrl={line.productUrl || productImage(line.productId)} />,
    },
    { title: "Ordered", dataIndex: "quantity", key: "quantity" },
    { title: "Fulfilled", key: "fulfilled", render: (_, line) => Number(line.fulfilledQuantity || 0).toLocaleString() },
    ...(hasReturnedItems ? [{ title: "Returned", key: "returned", render: (_: unknown, line: PurchaseLineItem) => Number(line.returnedQuantity || 0).toLocaleString() }] : []),
    { title: "Remaining", key: "remaining", render: (_, line) => Math.max(Number(line.quantity || 0) - Number(line.fulfilledQuantity || 0), 0).toLocaleString() },
    { title: "Unit Cost", key: "unitPrice", render: (_, line) => money(currency, Number(line.unitPrice || 0)) },
    ...(hasTaxedItems ? [{ title: "Tax", key: "tax", render: (_: unknown, line: PurchaseLineItem) => (line.taxDescription ? `${line.taxDescription} (${line.taxRate || 0}%)` : "-") }] : []),
    { title: "Total", key: "total", className: "!pr-8", align: "end", render: (_, line) => money(currency, Number(line.total || 0)) },
  ];

  const fulfillmentColumns: TableProps<PurchaseStockEvent>["columns"] = [
    { title: "Product", key: "product", className: "!pl-8", render: (_, event) => <ProductCell name={productName(event.productId)} product={event.productId} sku={productSku(event.productId)} imageUrl={productImage(event.productId)} /> },
    { title: "Received Qty", dataIndex: "quantity", key: "quantity" },
    { title: "Date", key: "date", className: "!pr-8", render: (_, event) => formatDate(event.fulfilledAt) },
    ...(showFulfillmentActionColumn
      ? [
          {
            title: "",
            key: "actions",
            dataIndex: "id",
            align: "right" as const,
            className: "!pr-8",
            width: 80,
            render: (_: unknown, event: PurchaseStockEvent) =>
              !isStaffUser || canMutateStockEvent(event) ? <ActionDropdown openEditModal={() => onEditFulfillment(event)} onDelete={() => onDeleteFulfillment(event)} /> : null,
          },
        ]
      : []),
  ];

  const returnColumns: TableProps<PurchaseReturnEvent>["columns"] = [
    { title: "Product", key: "product", className: "!pl-8", render: (_, event) => <ProductCell name={productName(event.productId)} product={event.productId} sku={productSku(event.productId)} imageUrl={productImage(event.productId)} /> },
    { title: "Returned Qty", dataIndex: "quantity", key: "quantity" },
    { title: "Reason", key: "reason", render: (_, event) => event.reason || "-" },
    { title: "Date", key: "date", className: "!pr-8", render: (_, event) => formatDate(event.returnedAt) },
    ...(showReturnActionColumn
      ? [
          {
            title: "",
            key: "actions",
            dataIndex: "id",
            align: "right" as const,
            className: "!pr-8",
            width: 80,
            render: (_: unknown, event: PurchaseReturnEvent) =>
              !isStaffUser || canMutateStockEvent(event) ? <ActionDropdown openEditModal={() => onEditReturn(event)} onDelete={() => onDeleteReturn(event)} /> : null,
          },
        ]
      : []),
  ];

  const costColumns: TableProps<PurchaseLandedCost>["columns"] = [
    { title: "Description", dataIndex: "name", key: "name", className: "!pl-8", width: "30%" },
    { title: "Paid To", dataIndex: "contactName", key: "contactName", render: (value: string) => value || "-" },
    { title: "Date", key: "date", render: (_, cost) => (cost.date ? formatDate(cost.date) : "-") },
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
    { title: "Method", dataIndex: "paymentMethod", key: "paymentMethod", render: (paymentMethod: Payment["paymentMethod"]) => paymentMethod?.name || "-" },
    { title: "Amount", key: "amount", className: "!pr-8", render: (_, payment) => `${currency} ${Number(payment.amount || 0).toFixed(2)}` },
    ...(showPaymentActionColumn
      ? [
          {
            title: "",
            key: "actions",
            dataIndex: "id",
            align: "right" as const,
            className: "!pr-8",
            width: 80,
            render: (_: unknown, payment: Payment) => (canMutatePayment(payment) ? <ActionDropdown openEditModal={() => onEditPayment(payment)} onDelete={() => onDeletePayment(payment)} /> : null),
          },
        ]
      : []),
  ];

  return {
    items: { title: "Line Items", columns: itemColumns as TableProps<PurchaseTableRow>["columns"], data: purchase.lineItems as PurchaseTableRow[] },
    fulfillments: { title: "Fulfillment History", columns: fulfillmentColumns as TableProps<PurchaseTableRow>["columns"], data: (purchase.fulfilledItems || []) as PurchaseTableRow[] },
    returns: { title: "Return History", columns: returnColumns as TableProps<PurchaseTableRow>["columns"], data: (purchase.returnedItems || []) as PurchaseTableRow[] },
    landedCosts: { title: "Landed Costs", columns: costColumns as TableProps<PurchaseTableRow>["columns"], data: (purchase.landedCosts || []) as PurchaseTableRow[] },
    payments: { title: "Payments", columns: paymentColumns as TableProps<PurchaseTableRow>["columns"], data: ((purchase.payments || []) as Payment[]) as PurchaseTableRow[] },
  };
}

export function LandedCostBreakdownTable({ cost }: { cost: PurchaseLandedCost }) {
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
          { title: "Per Unit", key: "allocatedPerUnit", width: 100, align: "right", render: (_, row) => money(row.currencyCode || landedCostCurrencyCode(cost), row.allocatedPerUnit) },
        ]}
      />
    </div>
  );
}
