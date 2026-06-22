"use client";

import React from "react";
import { InputNumber, message } from "antd";
import { AppModal } from "@/components/ui/AppModal";
import PreviewImage from "@/components/ui/PreviewImage";
import { useFulfillPurchaseMutation } from "@/lib/redux/services";
import { Purchase } from "@/types/index";
import { purchaseApiError } from "./purchaseDetailUtils";
import { ResolvedProductName } from "@/components/products/ResolvedProductName";

interface PurchaseOrderStockOperationModalProps {
  open: boolean;
  toggle: () => void;
  purchase: Purchase;
  onSaved: () => void;
}

export default function PurchaseOrderStockOperationModal({ open, toggle, purchase, onSaved }: PurchaseOrderStockOperationModalProps) {
  const [quantities, setQuantities] = React.useState<Record<string, number>>({});
  const [fulfillPurchase, { isLoading: fulfilling }] = useFulfillPurchaseMutation();
  const productImage = (product: typeof purchase.lineItems[number]["productId"]) =>
    typeof product === "string" ? undefined : product.media?.[0]?.url;
  const lines = React.useMemo(
    () =>
      purchase.lineItems.filter((line) => {
        const type = typeof line.productId === "string" ? line.productType : line.productId.type || line.productType;
        if (type === "BUNDLE") return false;
        return Number(line.quantity) - Number(line.fulfilledQuantity || 0) > 0;
      }),
    [purchase.lineItems],
  );

  React.useEffect(() => {
    if (open) {
      setQuantities(
        Object.fromEntries(
          lines.map((line) => [line.id, Math.max(Number(line.quantity) - Number(line.fulfilledQuantity || 0), 0)]),
        ),
      );
    }
  }, [lines, open]);

  const submit = async () => {
    const items = lines
      .filter((line) => Number(quantities[line.id] || 0) > 0)
      .map((line) => ({
        lineItemId: line.id,
        quantity: quantities[line.id],
      }));

    if (!items.length) {
      message.error("Enter a quantity to fulfill.");
      return;
    }

    try {
      await fulfillPurchase({ id: purchase.id, items }).unwrap();
      message.success("Purchase fulfilled.");
      onSaved();
      toggle();
    } catch (error) {
      message.error(purchaseApiError(error, "Items could not be fulfilled."));
    }
  };

  return (
    <AppModal open={open} toggle={toggle} title="Fulfill Items" onOk={submit} width={640} loading={fulfilling} okText="Fulfill">
      <div className="px-5 py-4">
        <p className="mb-4 text-sm text-gray-500">Fulfill purchase items for {purchase.locationId?.name || "the purchase location"}.</p>
        <div className="space-y-3">
          {lines.map((line) => {
            const max = Number(line.quantity) - Number(line.fulfilledQuantity || 0);
            return (
              <div key={line.id} className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-x-3">
                  <PreviewImage width={32} height={32} src={line.productUrl || productImage(line.productId)} />
                  <div>
                    <ResolvedProductName name={line.productName} product={line.productId} className="text-sm font-medium" />
                    <p className="text-xs text-gray-500">{max.toLocaleString()} available to fulfill</p>
                  </div>
                </div>
                <InputNumber min={0} max={max} controls={false} value={quantities[line.id]} onChange={(value) => setQuantities((current) => ({ ...current, [line.id]: Number(value || 0) }))} />
              </div>
            );
          })}
        </div>
      </div>
    </AppModal>
  );
}
