"use client";

import React from "react";
import dayjs from "dayjs";
import { Checkbox, DatePicker, Form, Input, InputNumber } from "antd";
import type { TableProps } from "antd/es/table";
import { AppModal } from "@/components/ui/AppModal";
import AppTable from "@/components/ui/AppTable";
import { ResolvedProductName } from "@/components/products/ResolvedProductName";
import PreviewImage from "@/components/ui/PreviewImage";

interface TransactionItemEditModalProps {
  open: boolean;
  toggle: () => void;
  title: string;
  description: string;
  quantity: number;
  imageUrl?: string;
  sku?: string;
  dateLabel: string;
  initialDate: string;
  showNote?: boolean;
  initialNote?: string;
  showRestock?: boolean;
  initialRestock?: boolean;
  loading?: boolean;
  onSubmit: (values: { quantity: number; date: string; note?: string; restock?: boolean }) => Promise<void> | void;
}

export default function TransactionItemEditModal({
  open,
  toggle,
  title,
  description,
  quantity,
  imageUrl,
  sku,
  dateLabel,
  initialDate,
  showNote = false,
  initialNote,
  showRestock = false,
  initialRestock = true,
  loading = false,
  onSubmit,
}: TransactionItemEditModalProps) {
  const [form] = Form.useForm();
  const summaryRows = [
    {
      id: "current-record",
      name: description,
      sku,
      imageUrl,
      quantity,
      restock: initialRestock,
    },
  ];

  const columns: TableProps<(typeof summaryRows)[number]>["columns"] = [
    {
      title: "Record",
      dataIndex: "name",
      key: "name",
      className: "!pl-8",
      width: showRestock ? "50%" : "55%",
      render: (_: unknown, row) => (
        <div className="flex items-center gap-x-2">
          <PreviewImage width={28} height={28} src={row.imageUrl} />
          <div className="min-w-0">
            <ResolvedProductName name={row.name} className="line-clamp-1" />
            <p className="text-xs text-gray-500">
              {row.sku || "No SKU"} | Current {Number(row.quantity || 0).toLocaleString()}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      key: "quantity",
      width: showRestock ? "15%" : "20%",
      render: (_: unknown) => (
        <Form.Item name="quantity" className="!mb-0" rules={[{ required: true, message: "Enter a quantity" }, { type: "number", min: 0.000001, message: "Quantity must be greater than zero" }]}>
          <InputNumber className="!w-24" variant="underlined" min={0.000001} controls={false} placeholder="Quantity" />
        </Form.Item>
      ),
    },
    ...(showRestock
      ? [
          {
            title: "Restock",
            dataIndex: "restock",
            key: "restock",
            align: "center" as const,
            className: "!pr-8",
            width: "15%",
            render: () => (
              <Form.Item name="restock" valuePropName="checked" className="!mb-0">
                <Checkbox />
              </Form.Item>
            ),
          },
        ]
      : []),
  ];

  React.useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      quantity,
      date: initialDate ? dayjs(initialDate) : undefined,
      note: initialNote,
      restock: initialRestock,
    });
  }, [form, initialDate, initialNote, initialRestock, open, quantity]);

  const handleSubmit = async (values: { quantity: number; date: dayjs.Dayjs; note?: string; restock?: boolean }) => {
    await onSubmit({
      quantity: Number(values.quantity),
      date: values.date.toISOString(),
      note: values.note?.trim() || undefined,
      restock: values.restock,
    });
  };

  return (
    <AppModal
      open={open}
      toggle={toggle}
      title={title}
      subtitle={description}
      width={840}
      okText="Save changes"
      loading={loading}
      onOk={form.submit}
    >
      <div className="pb-5">
        <Form form={form} layout="vertical" disabled={loading} onFinish={handleSubmit}>
          <AppTable columns={columns} dataSource={summaryRows} rowKey="id" pagination={false} scrollX={showRestock ? 760 : 680} />

          <div className="p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Form.Item label={dateLabel} name="date" className="!mb-0" rules={[{ required: true, message: "Select a date" }]}>
                <DatePicker className="!w-full" style={{ width: "100%" }} />
              </Form.Item>

              {showNote ? (
                <Form.Item label="Reason" name="note" className="!mb-0" rules={[{ required: true, message: "Enter a reason" }]}>
                  <Input placeholder="Enter reason" />
                </Form.Item>
              ) : (
                <div />
              )}
            </div>
          </div>
        </Form>
      </div>
    </AppModal>
  );
}
