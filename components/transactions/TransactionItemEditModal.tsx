"use client";

import React from "react";
import dayjs from "dayjs";
import { Form, InputNumber } from "antd";
import { AppModal } from "@/components/ui/AppModal";
import { DatePickerFormItem } from "@/components/ui/AppFormItems";

interface TransactionItemEditModalProps {
  open: boolean;
  toggle: () => void;
  title: string;
  description: string;
  quantityLabel: string;
  quantity: number;
  dateLabel: string;
  initialDate: string;
  loading?: boolean;
  onSubmit: (values: { quantity: number; date: string }) => Promise<void> | void;
}

export default function TransactionItemEditModal({ open, toggle, title, description, quantityLabel, quantity, dateLabel, initialDate, loading = false, onSubmit }: TransactionItemEditModalProps) {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      quantity,
      date: initialDate ? dayjs(initialDate) : undefined,
    });
  }, [form, initialDate, open, quantity]);

  const handleSubmit = async (values: { quantity: number; date: dayjs.Dayjs }) => {
    await onSubmit({
      quantity: Number(values.quantity),
      date: values.date.toISOString(),
    });
  };

  return (
    <AppModal
      open={open}
      toggle={toggle}
      title={title}
      width={560}
      okText="Save changes"
      loading={loading}
      onOk={form.submit}
    >
      <div className="px-5 py-4">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
          <p className="text-sm font-medium text-gray-900">{description}</p>
          <p className="mt-1 text-sm text-gray-500">{quantityLabel}</p>
        </div>

        <Form form={form} layout="vertical" className="mt-5" disabled={loading} onFinish={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Form.Item
              label="Quantity"
              name="quantity"
              rules={[
                { required: true, message: "Enter a quantity" },
                { type: "number", min: 0.000001, message: "Quantity must be greater than zero" },
              ]}
            >
              <InputNumber className="w-full" min={0.000001} controls={false} placeholder="Quantity" />
            </Form.Item>

            <DatePickerFormItem label={dateLabel} name="date" />
          </div>
        </Form>
      </div>
    </AppModal>
  );
}
