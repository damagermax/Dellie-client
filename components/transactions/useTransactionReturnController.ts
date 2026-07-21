"use client";

import { useCallback, useEffect } from "react";
import { Form, message } from "antd";

import { buildDefaultReturnFormValues, buildReturnItems, ReturnFormValues, ReturnLine } from "./transactionReturnSections";

interface UseTransactionReturnControllerArgs {
  open: boolean;
  lines: ReturnLine[];
  onSubmit: (items: { lineItemId: string; quantity: number; reason?: string }[]) => Promise<void> | void;
}

export function useTransactionReturnController({ open, lines, onSubmit }: UseTransactionReturnControllerArgs) {
  const [form] = Form.useForm<ReturnFormValues>();

  useEffect(() => {
    if (open) {
      form.setFieldsValue(buildDefaultReturnFormValues(lines));
    }
  }, [form, lines, open]);

  const submit = useCallback(async () => {
    const values = await form.validateFields();
    const items = buildReturnItems(values, lines);

    if (!items.length) {
      message.error("Enter a quantity to return.");
      return;
    }

    await onSubmit(items);
  }, [form, lines, onSubmit]);

  return {
    form,
    submit,
  };
}
