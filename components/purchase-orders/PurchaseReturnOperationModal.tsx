"use client";

import React from "react";
import { message } from "antd";
import TransactionReturnModal from "@/components/transactions/TransactionReturnModal";
import { useReturnPurchaseMutation } from "@/lib/redux/services";
import { Purchase } from "@/types/index";
import { purchaseApiError } from "./purchaseDetailUtils";
import { getProductRefId, useResolvedProductNameMap } from "@/components/products/ResolvedProductName";

interface PurchaseReturnOperationModalProps {
  open: boolean;
  toggle: () => void;
  purchase: Purchase;
  onSaved: () => void;
}

function productImage(product: Purchase["lineItems"][number]["productId"]) {
  return typeof product === "string" ? undefined : product.media?.[0]?.url;
}

function productSku(line: Purchase["lineItems"][number]) {
  return line.productSku || (typeof line.productId === "string" ? undefined : line.productId.sku);
}

function productType(line: Purchase["lineItems"][number]) {
  return typeof line.productId === "string" ? line.productType : line.productId.type || line.productType;
}

export default function PurchaseReturnOperationModal({ open, toggle, purchase, onSaved }: PurchaseReturnOperationModalProps) {
  const [returnPurchase, { isLoading }] = useReturnPurchaseMutation();
  const resolvedNames = useResolvedProductNameMap(
    purchase.lineItems.map((line) => ({
      id: getProductRefId(line.productId),
      name: line.productName,
    })),
  );

  const lines = React.useMemo(
    () =>
      purchase.lineItems
        .filter((line) => productType(line) !== "BUNDLE")
        .map((line) => ({
          id: line.id,
          name: resolvedNames[getProductRefId(line.productId) || line.productName] || line.productName,
          sku: productSku(line),
          imageUrl: line.productUrl || productImage(line.productId),
          maxQuantity: Math.max(Number(line.fulfilledQuantity || 0) - Number(line.returnedQuantity || 0), 0),
        }))
        .filter((line) => line.maxQuantity > 0),
    [purchase.lineItems, resolvedNames],
  );

  const submit = async (items: { lineItemId: string; quantity: number; reason?: string }[]) => {
    try {
      await returnPurchase({ id: purchase.id, items }).unwrap();
      message.success("Return recorded.");
      onSaved();
      toggle();
    } catch (error) {
      message.error(purchaseApiError(error, "Return could not be recorded."));
    }
  };

  return (
    <TransactionReturnModal
      open={open}
      toggle={toggle}
      title="Return Items"
      description={`Record returned items from ${purchase.locationId?.name || "the purchase location"}.`}
      lines={lines}
      loading={isLoading}
      okText="Save return"
      onSubmit={submit}
    />
  );
}
