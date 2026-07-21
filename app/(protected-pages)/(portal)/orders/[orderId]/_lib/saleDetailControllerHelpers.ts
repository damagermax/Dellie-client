"use client";

import { PurchaseReturnEvent, PurchaseStockEvent } from "@/types/purchase";
import { Sale } from "@/types/sale";
import { getRemainingRefundablePaidAmount } from "@/components/payment/saleRefundMath";

type EditableItem = { kind: "fulfillment"; item: PurchaseStockEvent } | { kind: "return"; item: PurchaseReturnEvent };

export function deriveSaleDetailState({
  sale,
  editingItem,
  deletingItem,
  featureSettings,
}: {
  sale: Sale;
  editingItem: EditableItem | null;
  deletingItem: EditableItem | null;
  featureSettings?: {
    salesReturnsEnabled?: boolean;
    refundPaymentsEnabled?: boolean;
    writeOffPaymentsEnabled?: boolean;
  };
}) {
  const isCancelled = Boolean(sale.isDeleted);
  const isQuote = sale.status === "draft" && !isCancelled;
  const canEdit = !sale.locked && sale.receiptStatus !== "received" && !isCancelled;
  const canFulfill = !sale.locked && !isCancelled && !isQuote && sale.lineItems.some((line) => Number(line.quantity) > Number(line.fulfilledQuantity || 0));
  const canReturn = !sale.locked && !isCancelled && !isQuote && sale.lineItems.some((line) => Number(line.fulfilledQuantity || 0) > Number(line.returnedQuantity || 0));
  const isFullyFulfilled = !sale.locked && !isCancelled && !isQuote && sale.lineItems.length > 0 && sale.lineItems.every((line) => Number(line.fulfilledQuantity || 0) >= Number(line.quantity || 0));
  const canRecordPayment = !sale.locked && !isCancelled && !isQuote && Number(sale.balance || 0) > 0;
  const remainingRefundablePaidAmount = getRemainingRefundablePaidAmount(sale.payments || []);
  const canRefundPayment = !sale.locked && !isCancelled && !isQuote && remainingRefundablePaidAmount > 0;
  const canUseReturns = featureSettings?.salesReturnsEnabled !== false;
  const canUseRefunds = featureSettings?.refundPaymentsEnabled !== false;
  const canUseWriteOffs = featureSettings?.writeOffPaymentsEnabled !== false;
  const editingItemName = editingItem ? resolveTransactionItemName(editingItem.item.productId) : "";
  const deletingItemName = deletingItem ? resolveTransactionItemName(deletingItem.item.productId) : "";
  const deletingItemType = deletingItem ? getSaleProductType(sale, deletingItem.item) : undefined;
  const deletingItemAffectsStock = deletingItemType ? ["STOCK"].includes(deletingItemType) : false;

  return {
    isCancelled,
    isQuote,
    canEdit,
    canFulfill,
    canReturn,
    isFullyFulfilled,
    canRecordPayment,
    canRefundPayment,
    remainingRefundablePaidAmount,
    canUseReturns,
    canUseRefunds,
    canUseWriteOffs,
    editingItemName,
    deletingItemName,
    deletingItemAffectsStock,
  };
}

function getSaleProductType(sale: Sale, item: PurchaseStockEvent | PurchaseReturnEvent) {
  const lineItem = sale.lineItems.find((line) => line.id === item.lineItemId);
  if (!lineItem) return undefined;

  return typeof lineItem.productId === "string" ? lineItem.productType : lineItem.productId.type || lineItem.productType;
}

function resolveTransactionItemName(product: PurchaseStockEvent["productId"] | PurchaseReturnEvent["productId"]) {
  return typeof product === "string" ? "Selected item" : product.name || "Selected item";
}
