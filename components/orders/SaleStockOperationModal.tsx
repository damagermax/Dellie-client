"use client";

import React from "react";
import { InputNumber, message } from "antd";
import { AppModal } from "@/components/ui/AppModal";
import PreviewImage from "@/components/ui/PreviewImage";
import { useFulfillSaleMutation } from "@/lib/redux/services";
import { Sale } from "@/types/index";
import { saleApiError } from "./saleUtils";
import { ResolvedProductName } from "@/components/products/ResolvedProductName";

interface SaleStockOperationModalProps {
  open: boolean;
  toggle: () => void;
  sale: Sale;
  onSaved: () => void;
}

export default function SaleStockOperationModal({ open, toggle, sale, onSaved }: SaleStockOperationModalProps) {
  const [quantities, setQuantities] = React.useState<Record<string, number>>({});
  const [fulfillSale, { isLoading: fulfilling }] = useFulfillSaleMutation();
  const productImage = (product: typeof sale.lineItems[number]["productId"]) =>
    typeof product === "string" ? undefined : product.media?.[0]?.url;
  const productSku = (line: typeof sale.lineItems[number]) =>
    line.productSku || (typeof line.productId === "string" ? undefined : line.productId.sku);
  const lines = React.useMemo(
    () => sale.lineItems.filter((line) => Number(line.quantity) - Number(line.fulfilledQuantity || 0) > 0),
    [sale.lineItems],
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
      await fulfillSale({ id: sale.id, items }).unwrap();
      message.success("Sale fulfilled.");
      onSaved();
      toggle();
    } catch (error) {
      message.error(saleApiError(error, "Sale could not be fulfilled."));
    }
  };

  return (
    <AppModal open={open} toggle={toggle} title="Fulfill Sale" onOk={submit} width={640} loading={fulfilling} okText="Fulfill">
      <div className="px-5 py-4">
        <p className="mb-4 text-sm text-gray-500">Mark items delivered from {sale.locationId?.name || "the sale location"}.</p>
        <div className="space-y-3">
          {lines.map((line) => {
            const max = Number(line.quantity) - Number(line.fulfilledQuantity || 0);
            return (
              <div key={line.id} className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-x-3">
                  <PreviewImage width={32} height={32} src={line.productUrl || productImage(line.productId)} />
                  <div>
                    <ResolvedProductName name={line.productName} product={line.productId} className="text-sm font-medium" />
                    {productSku(line) && <p className="text-xs text-gray-500">SKU: {productSku(line)}</p>}
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
