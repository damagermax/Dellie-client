"use client";

import { Form, Input } from "antd";
import { AppModal } from "@/components/ui/AppModal";
import { TransactionReturnLineList, type ReturnLine } from "./transactionReturnSections";
import { useTransactionReturnController } from "./useTransactionReturnController";

const { TextArea } = Input;

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
  const controller = useTransactionReturnController({ open, lines, onSubmit });

  return (
    <AppModal
      open={open}
      toggle={toggle}
      title={title}
      onOk={controller.submit}
      width={720}
      height="auto"
      loading={loading}
      okText={okText}
    >
      <div className="px-5 py-4">
        <p className="mb-4 text-sm leading-5 text-gray-500">{description}</p>
        <Form form={controller.form} layout="vertical" disabled={loading}>
          <Form.Item label="Reason" name="reason" className="!mb-4">
            <TextArea rows={2} maxLength={240} placeholder="Optional return reason" className="!resize-none" />
          </Form.Item>
          <TransactionReturnLineList lines={lines} />
        </Form>
      </div>
    </AppModal>
  );
}
