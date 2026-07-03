"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { message } from "antd";

import { useFulfillPurchaseMutation } from "@/lib/redux/services";
import { Purchase } from "@/types/index";

import { purchaseApiError } from "./purchaseDetailUtils";
import { buildDefaultReceiptQuantities, buildPurchaseReceiptLines } from "./purchaseStockOperationSections";

interface UsePurchaseStockOperationControllerArgs {
  open: boolean;
  purchase: Purchase;
  onSaved: () => void;
  toggle: () => void;
}

export function usePurchaseStockOperationController({ open, purchase, onSaved, toggle }: UsePurchaseStockOperationControllerArgs) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [fulfillPurchase, { isLoading: fulfilling }] = useFulfillPurchaseMutation();
  const lines = useMemo(() => buildPurchaseReceiptLines(purchase), [purchase]);

  useEffect(() => {
    if (open) {
      setQuantities(buildDefaultReceiptQuantities(lines));
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
  }, [fulfillPurchase, lines, onSaved, purchase.id, quantities, toggle]);

  return {
    fulfilling,
    lines,
    quantities,
    setQuantity,
    submit,
  };
}
