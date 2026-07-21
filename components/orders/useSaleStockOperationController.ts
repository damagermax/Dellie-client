"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { message } from "antd";

import { useFulfillSaleMutation } from "@/lib/redux/services";
import { Sale } from "@/types/index";

import { saleApiError } from "./saleUtils";
import { buildDefaultFulfillmentQuantities, buildSaleFulfillmentLines } from "./saleStockOperationSections";

interface UseSaleStockOperationControllerArgs {
  open: boolean;
  sale: Sale;
  onSaved: () => void;
  toggle: () => void;
}

export function useSaleStockOperationController({ open, sale, onSaved, toggle }: UseSaleStockOperationControllerArgs) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [fulfillSale, { isLoading: fulfilling }] = useFulfillSaleMutation();
  const isPickup = sale.fulfillmentMethod === "pickup";
  const lines = useMemo(() => buildSaleFulfillmentLines(sale), [sale]);

  useEffect(() => {
    if (open) {
      setQuantities(buildDefaultFulfillmentQuantities(lines));
    }
  }, [lines, open]);

  const setQuantity = useCallback((lineId: string, value: number) => {
    setQuantities((current) => ({ ...current, [lineId]: value }));
  }, []);

  const submit = useCallback(async () => {
    const items = lines
      .filter((line) => Number(quantities[line.id] || 0) > 0)
      .map((line) => ({
        lineItemId: line.id,
        quantity: quantities[line.id],
      }));

    if (!items.length) {
      message.error(isPickup ? "Enter a quantity to mark as picked up." : "Enter a quantity to fulfill.");
      return;
    }

    try {
      await fulfillSale({ id: sale.id, items }).unwrap();
      message.success(isPickup ? "Sale marked as picked up." : "Sale fulfilled.");
      onSaved();
      toggle();
    } catch (error) {
      message.error(saleApiError(error, isPickup ? "Sale could not be marked as picked up." : "Sale could not be fulfilled."));
    }
  }, [fulfillSale, isPickup, lines, onSaved, quantities, sale.id, toggle]);

  return {
    fulfilling,
    isPickup,
    lines,
    quantities,
    setQuantity,
    submit,
  };
}
