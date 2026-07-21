"use client";

import { Sale } from "@/types/index";
import TransactionReturnModal from "@/components/transactions/TransactionReturnModal";
import { useSaleReturnOperationController } from "./useSaleReturnOperationController";

interface SaleReturnOperationModalProps {
  open: boolean;
  toggle: () => void;
  sale: Sale;
  onSaved: () => void;
}

export default function SaleReturnOperationModal({ open, toggle, sale, onSaved }: SaleReturnOperationModalProps) {
  const controller = useSaleReturnOperationController({ sale, onSaved, toggle });

  return (
    <TransactionReturnModal
      open={open}
      toggle={toggle}
      title="Return Items"
      description={`Record returned items from ${sale.locationId?.name || "the sale location"}.`}
      lines={controller.lines}
      loading={controller.isLoading}
      okText="Save return"
      onSubmit={controller.submit}
    />
  );
}
