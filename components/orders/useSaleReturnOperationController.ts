"use client";

import { useCallback } from "react";
import { message } from "antd";

import { useReturnSaleMutation } from "@/lib/redux/services";
import { Sale } from "@/types/index";

import { useSaleReturnLines } from "./saleReturnOperationSections";
import { saleApiError } from "./saleUtils";

interface UseSaleReturnOperationControllerArgs {
  sale: Sale;
  onSaved: () => void;
  toggle: () => void;
}

export function useSaleReturnOperationController({ sale, onSaved, toggle }: UseSaleReturnOperationControllerArgs) {
  const [returnSale, { isLoading }] = useReturnSaleMutation();
  const lines = useSaleReturnLines(sale);

  const submit = useCallback(
    async (items: { lineItemId: string; quantity: number; reason?: string }[]) => {
      try {
        await returnSale({ id: sale.id, items }).unwrap();
        message.success("Return recorded.");
        onSaved();
        toggle();
      } catch (error) {
        message.error(saleApiError(error, "Return could not be recorded."));
      }
    },
    [onSaved, returnSale, sale.id, toggle],
  );

  return {
    lines,
    isLoading,
    submit,
  };
}
