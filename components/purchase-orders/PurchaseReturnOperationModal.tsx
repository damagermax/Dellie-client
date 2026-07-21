"use client";

import TransactionReturnModal from "@/components/transactions/TransactionReturnModal";
import { Purchase } from "@/types/index";
import { usePurchaseReturnOperationController } from "./usePurchaseReturnOperationController";

interface PurchaseReturnOperationModalProps {
  open: boolean;
  toggle: () => void;
  purchase: Purchase;
  onSaved: () => void;
}

export default function PurchaseReturnOperationModal({ open, toggle, purchase, onSaved }: PurchaseReturnOperationModalProps) {
  const controller = usePurchaseReturnOperationController({ purchase, onSaved, toggle });

  return (
    <TransactionReturnModal
      open={open}
      toggle={toggle}
      title="Return Items"
      description={`Record returned items from ${purchase.locationId?.name || "the purchase location"}.`}
      lines={controller.lines}
      loading={controller.isLoading}
      okText="Save return"
      onSubmit={controller.submit}
    />
  );
}
