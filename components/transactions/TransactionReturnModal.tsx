"use client";

import React from "react";
import { Form, Input, InputNumber, message } from "antd";
import { AppModal } from "@/components/ui/AppModal";
import PreviewImage from "@/components/ui/PreviewImage";

const { TextArea } = Input;

type ReturnLine = {
  id: string;
  name: string;
  sku?: string;
  imageUrl?: string;
  maxQuantity: number;
};

type ReturnFormValue = {
  quantity?: number;
};

type ReturnFormValues = {
  reason?: string;
  lines?: Record<string, ReturnFormValue>;
};

interface TransactionReturnModalProps {
  open: boolean;
  toggle: () => void;
  title: string;
  description: string;
  lines: ReturnLine[];
  loading?: boolean;
  okText?: string;
  onSubmit: (items: { lineItemId: string; quantity: number; reason?: string }[]) => Promise<void> | void;
}

export default function TransactionReturnModal({
  open,
  toggle,
  title,
  description,
  lines,
  loading = false,
  okText = "Return",
  onSubmit,
}: TransactionReturnModalProps) {
  const [form] = Form.useForm<ReturnFormValues>();

  React.useEffect(() => {
    if (open) {
      form.setFieldsValue({
        reason: undefined,
        lines: Object.fromEntries(lines.map((line) => [line.id, { quantity: line.maxQuantity }])),
      });
    }
  }, [form, lines, open]);

  const submit = async () => {
    const values = await form.validateFields();
    const reason = values.reason?.trim() || undefined;
    const items = lines
      .map((line) => {
        const lineValues = values.lines?.[line.id] || {};
        const quantity = Number(lineValues.quantity || 0);

        if (quantity <= 0) {
          return null;
        }

        return {
          lineItemId: line.id,
          quantity,
          reason,
        };
      })
      .filter(Boolean) as { lineItemId: string; quantity: number; reason?: string }[];

    if (!items.length) {
      message.error("Enter a quantity to return.");
      return;
    }

    await onSubmit(items);
  };

  return (
    <AppModal
      open={open}
      toggle={toggle}
      title={title}
      onOk={submit}
      width={720}
      height="auto"
      loading={loading}
      okText={okText}
    >
      <div className="px-5 py-4">
        <p className="mb-4 text-sm leading-5 text-gray-500">{description}</p>
        <Form form={form} layout="vertical" disabled={loading}>
          <Form.Item label="Reason" name="reason" className="!mb-4">
            <TextArea rows={2} maxLength={240} placeholder="Optional return reason" className="!resize-none" />
          </Form.Item>

          <div className="space-y-3">
            {lines.map((line) => (
              <div key={line.id} className="rounded-lg border border-gray-200 bg-white px-4 py-3">
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px] sm:items-center">
                  <div className="flex min-w-0 items-center gap-3">
                    <PreviewImage width={44} height={44} src={line.imageUrl} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">{line.name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                        {line.sku ? <span>SKU: {line.sku}</span> : null}
                        <span>{line.maxQuantity.toLocaleString()} available</span>
                      </div>
                    </div>
                  </div>

                  <Form.Item
                    label="Return qty"
                    name={["lines", line.id, "quantity"]}
                    className="!mb-0"
                    rules={[{ type: "number", min: 0, max: line.maxQuantity, message: `Enter a value between 0 and ${line.maxQuantity}` }]}
                  >
                    <InputNumber className="!w-full" min={0} max={line.maxQuantity} controls={false} placeholder="0" />
                  </Form.Item>
                </div>
              </div>
            ))}
          </div>

        </Form>
      </div>
    </AppModal>
  );
}
