"use client";

import { GoBack } from "@/components/ui/GoBack";
import type { Purchase } from "@/types/index";

import { buildPurchaseDetailHeaderActions } from "./purchaseDetailHeaderMenu";
import { PurchaseOrderDetailHeaderStatus } from "./PurchaseOrderDetailHeaderStatus";

type PurchaseDetailHeaderProps = {
  purchase: Purchase;
  canManage: boolean;
  canEdit: boolean;
  canReceive: boolean;
  canReturn: boolean;
  canRecordPayment: boolean;
  canRefundPayment: boolean;
  canWriteOffPayment: boolean;
  returnsEnabled: boolean;
  refundPaymentsEnabled: boolean;
  writeOffPaymentsEnabled: boolean;
  isFullyReceived: boolean;
  isCancelling: boolean;
  isCancelled: boolean;
  isClosed: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onReopen: () => void;
  onClose: () => void;
  onReceive: () => void;
  onReturn: () => void;
  onAddLandedCost: () => void;
  onRecordPayment: () => void;
  onRefund: () => void;
  onWriteOff: () => void;
};

export function PurchaseDetailHeader({
  purchase,
  canManage,
  canEdit,
  canReceive,
  canReturn,
  canRecordPayment,
  canRefundPayment,
  canWriteOffPayment,
  returnsEnabled,
  refundPaymentsEnabled,
  writeOffPaymentsEnabled,
  isFullyReceived,
  isCancelling,
  isCancelled,
  isClosed,
  onEdit,
  onDelete,
  onReopen,
  onClose,
  onReceive,
  onReturn,
  onAddLandedCost,
  onRecordPayment,
  onRefund,
  onWriteOff,
}: PurchaseDetailHeaderProps) {
  const { dropdownButton, actionButtons } = buildPurchaseDetailHeaderActions({
    purchase,
    canManage,
    canEdit,
    canReceive,
    canReturn,
    canRecordPayment,
    canRefundPayment,
    canWriteOffPayment,
    returnsEnabled,
    refundPaymentsEnabled,
    writeOffPaymentsEnabled,
    isFullyReceived,
    isCancelling,
    isCancelled,
    isClosed,
    onEdit,
    onDelete,
    onReopen,
    onClose,
    onReceive,
    onReturn,
    onAddLandedCost,
    onRecordPayment,
    onRefund,
    onWriteOff,
  });

  return (
    <div className="border-b border-gray-200 bg-gradient-to-b from-white to-gray-50/70 px-4 pb-7 pt-5 md:px-8">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="flex w-full items-start justify-between gap-x-4 md:w-fit md:justify-start">
          <GoBack />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-normal text-gray-950 md:text-2xl">{purchase.purchaseNumber}</h1>
              <PurchaseOrderDetailHeaderStatus purchase={purchase} isCancelled={isCancelled} />
            </div>
          </div>
          <div className="md:hidden">{dropdownButton}</div>
        </div>
        <div>{actionButtons}</div>
      </div>
    </div>
  );
}
