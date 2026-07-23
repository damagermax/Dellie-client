"use client";

import { useCallback } from "react";
import { message } from "antd";

import { useReturnSaleMutation } from "@/lib/redux/services";
import { Sale } from "@/types/index";
import { ReturnSubmissionItem } from "@/components/transactions/transactionReturnSections";

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
    async ({ items, returnedAt }: { items: ReturnSubmissionItem[]; returnedAt: string }) => {
      try {
        await returnSale({ id: sale.id, items, returnedAt }).unwrap();
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
