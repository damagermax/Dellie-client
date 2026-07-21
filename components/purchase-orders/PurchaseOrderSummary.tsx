"use client";

import { Purchase } from "@/types/index";
import { CostBreakdownModal as PurchaseCostBreakdownModal, PurchaseSummaryPanel } from "./purchaseSummarySections";

interface PurchaseOrderSummaryProps {
  purchase: Purchase;
  canManage?: boolean;
  canReceive?: boolean;
  onReceive?: () => void;
  onAddLandedCost?: () => void;
  onRecordPayment?: () => void;
}

export default function PurchaseOrderSummary({ purchase }: PurchaseOrderSummaryProps) {
  return <PurchaseSummaryPanel purchase={purchase} />;
}

export function CostBreakdownModal({ open, onClose, purchase, currency }: { open: boolean; onClose: () => void; purchase: Purchase; currency: string }) {
  return <PurchaseCostBreakdownModal open={open} onClose={onClose} purchase={purchase} currency={currency} />;
}
