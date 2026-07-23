"use client";

import { DatePicker, Form, Input } from "antd";
import { AppModal } from "@/components/ui/AppModal";
import { TransactionReturnLineList, type ReturnLine, type ReturnSubmissionItem } from "./transactionReturnSections";
import { useTransactionReturnController } from "./useTransactionReturnController";

interface TransactionReturnModalProps {
  open: boolean;
  toggle: () => void;
  title: string;
  description: string;
  lines: ReturnLine[];
  showRestock?: boolean;
  loading?: boolean;
  okText?: string;
  onSubmit: (payload: { items: ReturnSubmissionItem[]; returnedAt: string }) => Promise<void> | void;
}

export default function TransactionReturnModal({
  open,
  toggle,
  title,
  description,
  lines,
  showRestock = false,
  loading = false,
  okText = "Return",
  onSubmit,
}: TransactionReturnModalProps) {
  const controller = useTransactionReturnController({ open, lines, showRestock, onSubmit });

  return (
    <AppModal
      open={open}
      toggle={toggle}
      title={title}
      subtitle={description}
      onOk={controller.submit}
      width={840}
      height="auto"
      loading={loading}
      okText={okText}
    >
      <div className="pb-4">
        <Form form={controller.form} layout="vertical" disabled={loading}>
          <TransactionReturnLineList lines={lines} showRestock={showRestock} />
          <div className="p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Form.Item label="Returned at" name="returnedAt" className="!mb-0" rules={[{ required: true, message: "Select a returned date" }]}>
                <DatePicker className="!w-full" style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item label="Reason" name="reason" className="!mb-0" rules={[{ required: true, message: "Enter a reason" }]}>
                <Input placeholder="Enter reason" />
              </Form.Item>
            </div>
          </div>
        </Form>
      </div>
    </AppModal>
  );
}
