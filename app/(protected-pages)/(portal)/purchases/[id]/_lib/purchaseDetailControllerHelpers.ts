"use client";

import { getRemainingRefundablePaidAmount } from "@/components/payment/purchaseRefundMath";
import { Purchase } from "@/types/index";
import { PurchaseReturnEvent, PurchaseStockEvent } from "@/types/purchase";

type EditableItem = { kind: "fulfillment"; item: PurchaseStockEvent } | { kind: "return"; item: PurchaseReturnEvent };

export function derivePurchaseDetailState({
  purchase,
  editingItem,
  deletingItem,
  featureSettings,
}: {
  purchase: Purchase;
  editingItem: EditableItem | null;
  deletingItem: EditableItem | null;
  featureSettings?: {
    purchaseReturnsEnabled?: boolean;
    refundPaymentsEnabled?: boolean;
    writeOffPaymentsEnabled?: boolean;
  };
}) {
  const isCancelled = Boolean(purchase.isDeleted);
  const canEdit = !purchase.locked && purchase.receiptStatus !== "received" && !isCancelled;
  const fulfillableLines = purchase.lineItems.filter((line) => {
    const productType = typeof line.productId === "string" ? line.productType : line.productId.type || line.productType;
    return productType !== "BUNDLE";
  });
  const canReceive = !purchase.locked && !isCancelled && fulfillableLines.some((line) => Number(line.quantity) > Number(line.fulfilledQuantity || 0));
  const canReturn = !purchase.locked && !isCancelled && fulfillableLines.some((line) => Number(line.fulfilledQuantity || 0) > Number(line.returnedQuantity || 0));
  const isFullyReceived = !purchase.locked && !isCancelled && fulfillableLines.length > 0 && fulfillableLines.every((line) => Number(line.fulfilledQuantity || 0) >= Number(line.quantity || 0));
  const canRecordPayment = !purchase.locked && !isCancelled && Number(purchase.balance || 0) > 0;
  const remainingRefundablePaidAmount = getRemainingRefundablePaidAmount(purchase.payments || []);
  const canRefundPayment = !purchase.locked && !isCancelled && remainingRefundablePaidAmount > 0;
  const canUseReturns = featureSettings?.purchaseReturnsEnabled !== false;
  const canUseRefunds = featureSettings?.refundPaymentsEnabled !== false;
  const canUseWriteOffs = featureSettings?.writeOffPaymentsEnabled !== false;
  const currency = purchase.currencyId?.code || "";
  const editingItemName = editingItem ? resolveTransactionItemName(editingItem.item.productId) : "";
  const deletingItemName = deletingItem ? resolveTransactionItemName(deletingItem.item.productId) : "";
  const deletingItemType = deletingItem ? getPurchaseProductType(purchase, deletingItem.item) : undefined;
  const deletingItemAffectsStock = deletingItemType ? ["STOCK"].includes(deletingItemType) : false;

  return {
    isCancelled,
    canEdit,
    canReceive,
    canReturn,
    isFullyReceived,
    canRecordPayment,
    canRefundPayment,
    remainingRefundablePaidAmount,
    canUseReturns,
    canUseRefunds,
    canUseWriteOffs,
    currency,
    editingItemName,
    deletingItemName,
    deletingItemAffectsStock,
  };
}

function getPurchaseProductType(purchase: Purchase, item: PurchaseStockEvent | PurchaseReturnEvent) {
  const lineItem = purchase.lineItems.find((line) => line.id === item.lineItemId);
  if (!lineItem) return undefined;

  return typeof lineItem.productId === "string" ? lineItem.productType : lineItem.productId.type || lineItem.productType;
}

function resolveTransactionItemName(product: PurchaseStockEvent["productId"] | PurchaseReturnEvent["productId"]) {
  return typeof product === "string" ? "Selected item" : product.name || "Selected item";
}
