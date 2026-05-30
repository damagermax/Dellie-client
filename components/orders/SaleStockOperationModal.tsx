"use client";

import React from "react";
import { Input, InputNumber, message } from "antd";
import { AppModal } from "@/components/ui/AppModal";
import PreviewImage from "@/components/ui/PreviewImage";
import { useFulfillSaleMutation, useReturnSaleStockMutation } from "@/lib/redux/services";
import { Sale } from "@/types/index";
import { saleApiError } from "./saleUtils";

interface SaleStockOperationModalProps {
  mode: "fulfill" | "return";
  open: boolean;
  toggle: () => void;
  sale: Sale;
  onSaved: () => void;
}

export default function SaleStockOperationModal({ mode, open, toggle, sale, onSaved }: SaleStockOperationModalProps) {
  const [quantities, setQuantities] = React.useState<Record<string, number>>({});
  const [reason, setReason] = React.useState("");
  const [fulfillSale, { isLoading: fulfilling }] = useFulfillSaleMutation();
  const [returnSale, { isLoading: returning }] = useReturnSaleStockMutation();
  const isReturn = mode === "return";
  const productImage = (product: typeof sale.lineItems[number]["productId"]) =>
    typeof product === "string" ? undefined : product.media?.[0]?.url;
  const productSku = (line: typeof sale.lineItems[number]) =>
    line.productSku || (typeof line.productId === "string" ? undefined : line.productId.sku);
  const lines = sale.lineItems.filter((line) => {
    const limit = isReturn
      ? Number(line.fulfilledQuantity || 0) - Number(line.returnedQuantity || 0)
      : Number(line.quantity) - Number(line.fulfilledQuantity || 0);
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
      if (isReturn) await returnSale({ id: sale.id, items }).unwrap();
      else await fulfillSale({ id: sale.id, items }).unwrap();
      message.success(isReturn ? "Sale return recorded." : "Sale fulfilled.");
      onSaved();
      toggle();
    } catch (error) {
      message.error(saleApiError(error, isReturn ? "Items could not be returned." : "Sale could not be fulfilled."));
    }
  };

  return (
    <AppModal open={open} toggle={toggle} title={isReturn ? "Return Sale Items" : "Fulfill Sale"} onOk={submit} width={640} loading={fulfilling || returning} okText={isReturn ? "Record Return" : "Fulfill"}>
      <div className="px-5 py-4">
        <p className="mb-4 text-sm text-gray-500">
          {isReturn
            ? `Return delivered items to ${sale.locationId?.name || "the sale location"}.`
            : `Mark items delivered from ${sale.locationId?.name || "the sale location"}.`}
        </p>
        <div className="space-y-3">
          {lines.map((line) => {
            const max = isReturn
              ? Number(line.fulfilledQuantity || 0) - Number(line.returnedQuantity || 0)
              : Number(line.quantity) - Number(line.fulfilledQuantity || 0);
            return (
              <div key={line.id} className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-x-3">
                  <PreviewImage width={32} height={32} src={line.productUrl || productImage(line.productId)} />
                  <div>
                    <p className="text-sm font-medium">{line.productName}</p>
                    {productSku(line) && <p className="text-xs text-gray-500">SKU: {productSku(line)}</p>}
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
