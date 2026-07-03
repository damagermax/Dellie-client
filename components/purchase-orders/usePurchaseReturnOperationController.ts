"use client";

import { useCallback } from "react";
import { message } from "antd";

import { useReturnPurchaseMutation } from "@/lib/redux/services";
import { Purchase } from "@/types/index";

import { purchaseApiError } from "./purchaseDetailUtils";
import { usePurchaseReturnLines } from "./purchaseReturnOperationSections";

interface UsePurchaseReturnOperationControllerArgs {
  purchase: Purchase;
  onSaved: () => void;
  toggle: () => void;
}

export function usePurchaseReturnOperationController({ purchase, onSaved, toggle }: UsePurchaseReturnOperationControllerArgs) {
  const [returnPurchase, { isLoading }] = useReturnPurchaseMutation();
  const lines = usePurchaseReturnLines(purchase);

  const submit = useCallback(
    async (items: { lineItemId: string; quantity: number; reason?: string }[]) => {
      try {
        await returnPurchase({ id: purchase.id, items }).unwrap();
        message.success("Return recorded.");
        onSaved();
        toggle();
      } catch (error) {
        message.error(purchaseApiError(error, "Return could not be recorded."));
      }
    },
    [onSaved, purchase.id, returnPurchase, toggle],
  );

  return {
    lines,
    isLoading,
    submit,
  };
}
