"use client";

import React from "react";
import { message } from "antd";
import { useReturnSaleMutation } from "@/lib/redux/services";
import { Sale } from "@/types/index";
import TransactionReturnModal from "@/components/transactions/TransactionReturnModal";
import { saleApiError } from "./saleUtils";

interface SaleReturnOperationModalProps {
  open: boolean;
  toggle: () => void;
  sale: Sale;
  onSaved: () => void;
}

function productImage(product: Sale["lineItems"][number]["productId"]) {
  return typeof product === "string" ? undefined : product.media?.[0]?.url;
}

function productSku(line: Sale["lineItems"][number]) {
  return line.productSku || (typeof line.productId === "string" ? undefined : line.productId.sku);
}

export default function SaleReturnOperationModal({ open, toggle, sale, onSaved }: SaleReturnOperationModalProps) {
  const [returnSale, { isLoading }] = useReturnSaleMutation();

  const lines = React.useMemo(
    () =>
      sale.lineItems
        .map((line) => ({
          id: line.id,
          name: line.productName,
          sku: productSku(line),
          imageUrl: line.productUrl || productImage(line.productId),
          maxQuantity: Math.max(Number(line.fulfilledQuantity || 0) - Number(line.returnedQuantity || 0), 0),
        }))
        .filter((line) => line.maxQuantity > 0),
    [sale.lineItems],
  );

  const submit = async (items: { lineItemId: string; quantity: number; reason?: string }[]) => {
    try {
      await returnSale({ id: sale.id, items }).unwrap();
      message.success("Return recorded.");
      onSaved();
      toggle();
    } catch (error) {
      message.error(saleApiError(error, "Return could not be recorded."));
    }
  };

  return (
    <TransactionReturnModal
      open={open}
      toggle={toggle}
      title="Return Items"
      description={`Record returned items from ${sale.locationId?.name || "the sale location"}.`}
      lines={lines}
      loading={isLoading}
      okText="Save return"
      onSubmit={submit}
    />
  );
}
