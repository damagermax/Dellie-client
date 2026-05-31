"use client";

import React from "react";
import { Input, InputNumber, message } from "antd";
import { AppModal } from "@/components/ui/AppModal";
import PreviewImage from "@/components/ui/PreviewImage";
import { useFulfillPurchaseMutation, useReturnPurchaseStockMutation } from "@/lib/redux/services";
import { Purchase } from "@/types/index";
import { purchaseApiError } from "./purchaseDetailUtils";

interface PurchaseOrderStockOperationModalProps {
  mode: "fulfill" | "return";
  open: boolean;
  toggle: () => void;
  purchase: Purchase;
  onSaved: () => void;
}

export default function PurchaseOrderStockOperationModal({ mode, open, toggle, purchase, onSaved }: PurchaseOrderStockOperationModalProps) {
  const [quantities, setQuantities] = React.useState<Record<string, number>>({});
  const [reason, setReason] = React.useState("");
  const [fulfillPurchase, { isLoading: fulfilling }] = useFulfillPurchaseMutation();
  const [returnPurchase, { isLoading: returning }] = useReturnPurchaseStockMutation();
  const isReturn = mode === "return";
  const productImage = (product: typeof purchase.lineItems[number]["productId"]) =>
    typeof product === "string" ? undefined : product.media?.[0]?.url;
  const productType = (line: typeof purchase.lineItems[number]) =>
    typeof line.productId === "string" ? line.productType : line.productId.type || line.productType;
  const lines = purchase.lineItems.filter((line) => {
    if (productType(line) === "BUNDLE") return false;
    const limit = isReturn ? Number(line.fulfilledQuantity || 0) - Number(line.returnedQuantity || 0) : Number(line.quantity) - Number(line.fulfilledQuantity || 0);
    return limit > 0;
  });

  React.useEffect(() => {
    if (open) {
      setQuantities({});
      setReason("");
    }
  }, [open]);

  const submit = async () => {
    const items = lines
      .filter((line) => Number(quantities[line.id] || 0) > 0)
      .map((line) => ({
        lineItemId: line.id,
        quantity: quantities[line.id],
        ...(isReturn && reason.trim() ? { reason: reason.trim() } : {}),
      }));

    if (!items.length) {
      message.error(`Enter a quantity to ${isReturn ? "return" : "fulfill"}.`);
      return;
    }

    try {
      if (isReturn) await returnPurchase({ id: purchase.id, items }).unwrap();
      else await fulfillPurchase({ id: purchase.id, items }).unwrap();
      message.success(isReturn ? "Return recorded." : "Purchase fulfilled.");
      onSaved();
      toggle();
    } catch (error) {
      message.error(purchaseApiError(error, isReturn ? "Items could not be returned." : "Items could not be fulfilled."));
    }
  };

  return (
    <AppModal open={open} toggle={toggle} title={isReturn ? "Return Items" : "Fulfill Items"} onOk={submit} width={640} loading={fulfilling || returning} okText={isReturn ? "Record Return" : "Fulfill"}>
      <div className="px-5 py-4">
        <p className="mb-4 text-sm text-gray-500">{isReturn ? `Return fulfilled items from ${purchase.locationId?.name || "this location"}.` : `Fulfill purchase items for ${purchase.locationId?.name || "the purchase location"}.`}</p>
        <div className="space-y-3">
          {lines.map((line) => {
            const max = isReturn ? Number(line.fulfilledQuantity || 0) - Number(line.returnedQuantity || 0) : Number(line.quantity) - Number(line.fulfilledQuantity || 0);
            return (
              <div key={line.id} className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-x-3">
                  <PreviewImage width={32} height={32} src={line.productUrl || productImage(line.productId)} />
                  <div>
                    <p className="text-sm font-medium">{line.productName}</p>
                    <p className="text-xs text-gray-500">
                      {max.toLocaleString()} available to {isReturn ? "return" : "fulfill"}
                    </p>
                  </div>
                </div>
                <InputNumber min={0} max={max} controls={false} value={quantities[line.id]} onChange={(value) => setQuantities((current) => ({ ...current, [line.id]: Number(value || 0) }))} />
              </div>
            );
          })}
        </div>
        {isReturn && (
          <div className="mt-5">
            <p className="mb-2 text-sm text-gray-600">Reason</p>
            <Input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Optional return reason" />
          </div>
        )}
      </div>
    </AppModal>
  );
}
