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
  reason?: string;
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
  const [form] = Form.useForm<Record<string, ReturnFormValue>>();

  React.useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [form, open]);

  const submit = async () => {
    const values = await form.validateFields();
    const items = lines
      .map((line) => {
        const lineValues = values[line.id] || {};
        const quantity = Number(lineValues.quantity || 0);

        if (quantity <= 0) {
          return null;
        }

        return {
          lineItemId: line.id,
          quantity,
          reason: lineValues.reason?.trim() || undefined,
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
    <AppModal open={open} toggle={toggle} title={title} onOk={submit} width={720} loading={loading} okText={okText}>
      <div className="px-5 py-4">
        <p className="mb-4 text-sm text-gray-500">{description}</p>
        <Form form={form} layout="vertical" disabled={loading}>
          <div className="space-y-4">
            {lines.map((line) => (
              <div key={line.id} className="rounded-2xl border border-gray-200 px-4 py-4">
                <div className="flex items-start gap-3">
                  <PreviewImage width={40} height={40} src={line.imageUrl} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{line.name}</p>
                    {line.sku ? <p className="mt-1 text-xs text-gray-500">SKU: {line.sku}</p> : null}
                    <p className="mt-1 text-xs text-gray-500">{line.maxQuantity.toLocaleString()} available to return</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)]">
                  <Form.Item
                    label="Quantity"
                    name={[line.id, "quantity"]}
                    className="!mb-0"
                    rules={[{ type: "number", min: 0, max: line.maxQuantity, message: `Enter a value between 0 and ${line.maxQuantity}` }]}
                  >
                    <InputNumber className="w-full" min={0} max={line.maxQuantity} controls={false} placeholder="0" />
                  </Form.Item>

                  <Form.Item label="Reason" name={[line.id, "reason"]} className="!mb-0">
                    <TextArea rows={2} maxLength={240} placeholder="Optional return reason" />
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
