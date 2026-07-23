"use client";

import type { TableProps } from "antd/es/table";

import { ActionDropdown } from "@/components/ui/ActionDropdown";
import { formatDate } from "@/lib/dateUtils";
import { canMutatePayment } from "@/lib/paymentMutationWindow";
import { canMutateStockEvent } from "@/lib/stockMutationWindow";
import { Payment, PurchaseLineItem, PurchaseReturnEvent, PurchaseStockEvent, Sale } from "@/types/index";

import { money, ProductCell, productImage, productName, productSku, SaleReturnRestockIndicator, SaleTableRow, SaleTableSectionHandlers, SaleTableView } from "./saleDetailTableShared";

interface BuildSaleTablesParams extends SaleTableSectionHandlers {
  sale: Sale;
  currency: string;
  canMutate: boolean;
  isStaffUser: boolean;
  hasReturnedItems: boolean;
  hasTaxedItems: boolean;
}

export function buildSaleTables({
  sale,
  currency,
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
}: BuildSaleTablesParams): Record<SaleTableView, { title: string; columns: TableProps<SaleTableRow>["columns"]; data: SaleTableRow[] }> {
  const showPaymentActionColumn = canMutate && ((sale.payments || []) as Payment[]).some((payment) => canMutatePayment(payment));
  const showFulfillmentActionColumn = canMutate && (!isStaffUser || (sale.fulfilledItems || []).some((event) => canMutateStockEvent(event)));
  const showReturnActionColumn = canMutate && (!isStaffUser || (sale.returnedItems || []).some((event) => canMutateStockEvent(event)));

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
    { title: "Unit Price", key: "unitPrice", render: (_, line) => money(currency, Number(line.unitPrice || 0)) },
    ...(hasTaxedItems ? [{ title: "Tax", key: "tax", render: (_: unknown, line: PurchaseLineItem) => (line.taxDescription ? `${line.taxRate || 0}%` : "-") }] : []),
    { title: "Total", key: "total", className: "!pr-8", align: "end", render: (_, line) => money(currency, Number(line.total || 0)) },
  ];

  const fulfillmentColumns: TableProps<PurchaseStockEvent>["columns"] = [
    { title: "Product", key: "product", className: "!pl-8", width: "40%", render: (_, event) => <ProductCell name={productName(event.productId)} product={event.productId} sku={productSku(event.productId)} imageUrl={productImage(event.productId)} /> },
    { title: "Fulfilled Qty", dataIndex: "quantity", key: "quantity" },
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
    { title: "Product", key: "product", className: "!pl-8", width: "48%", render: (_, event) => <ProductCell name={productName(event.productId)} product={event.productId} sku={productSku(event.productId)} imageUrl={productImage(event.productId)} /> },
    { title: "Qty", dataIndex: "quantity", key: "quantity" },
    { title: "Reason", key: "reason", render: (_, event) => event.reason || "-" },
    { title: "Date", key: "date", className: "!pr-8", render: (_, event) => formatDate(event.returnedAt) },
    { title: "Restock", key: "restock", align: "center", width: 96, render: (_, event) => <SaleReturnRestockIndicator restock={event.restock} /> },
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
    items: { title: "Line Items", columns: itemColumns as TableProps<SaleTableRow>["columns"], data: sale.lineItems as SaleTableRow[] },
    fulfillments: { title: "Fulfillment History", columns: fulfillmentColumns as TableProps<SaleTableRow>["columns"], data: (sale.fulfilledItems || []) as SaleTableRow[] },
    returns: { title: "Return History", columns: returnColumns as TableProps<SaleTableRow>["columns"], data: (sale.returnedItems || []) as SaleTableRow[] },
    payments: { title: "Payments", columns: paymentColumns as TableProps<SaleTableRow>["columns"], data: ((sale.payments || []) as Payment[]) as SaleTableRow[] },
  };
}
