"use client";

import { useCallback, useEffect } from "react";
import { Form, message } from "antd";

import { buildDefaultReturnFormValues, buildReturnItems, ReturnFormValues, ReturnLine, ReturnSubmissionItem } from "./transactionReturnSections";

interface UseTransactionReturnControllerArgs {
  open: boolean;
  lines: ReturnLine[];
  showRestock?: boolean;
  onSubmit: (payload: { items: ReturnSubmissionItem[]; returnedAt: string }) => Promise<void> | void;
}

export function useTransactionReturnController({ open, lines, showRestock = false, onSubmit }: UseTransactionReturnControllerArgs) {
  const [form] = Form.useForm<ReturnFormValues>();

  useEffect(() => {
    if (open) {
      form.setFieldsValue(buildDefaultReturnFormValues(lines, { showRestock }));
    }
  }, [form, lines, open, showRestock]);

  const submit = useCallback(async () => {
    const values = await form.validateFields();
    const items = buildReturnItems(values, lines, { showRestock });
    const returnedAt = values.returnedAt?.toISOString();

    if (!items.length) {
      message.error("Enter a quantity to return.");
      return;
    }
    if (!returnedAt) {
      message.error("Select a returned at date.");
      return;
    }

    await onSubmit({ items, returnedAt });
  }, [form, lines, onSubmit, showRestock]);

  return {
    form,
    submit,
  };
}
