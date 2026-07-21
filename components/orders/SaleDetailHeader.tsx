"use client";

import { GoBack } from "@/components/ui/GoBack";
import { formatDate } from "@/lib/dateUtils";
import type { Sale } from "@/types/index";

import { SaleDetailHeaderStatus } from "./SaleDetailHeaderStatus";
import { SaleDetailHeaderActions } from "./saleDetailHeaderMenu";
import { saleDocumentNumber } from "./saleUtils";

type SaleDetailHeaderProps = {
  sale: Sale;

  canManage: boolean;
  canEdit: boolean;
  canFulfill: boolean;
  canReturn: boolean;
  canRecordPayment: boolean;
  canRefundPayment: boolean;
  canWriteOffPayment: boolean;
  returnsEnabled: boolean;
  refundPaymentsEnabled: boolean;
  writeOffPaymentsEnabled: boolean;
  isFullyFulfilled: boolean;
  isQuote: boolean;
  isCancelling: boolean;
  isConverting: boolean;
  isCancelled: boolean;
  isClosed: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onReopen: () => void;
  onClose: () => void;
  onConvert: () => void;
  onFulfill: () => void;
  onReturn: () => void;
  onRecordPayment: () => void;
  onRefund: () => void;
  onWriteOff: () => void;
  onShare: (type: "invoice" | "receipt") => void;
};

export function SaleDetailHeader({
  sale,
  canManage,
  canEdit,
  canFulfill,
  canReturn,
  canRecordPayment,
  canRefundPayment,
  canWriteOffPayment,
  returnsEnabled,
  refundPaymentsEnabled,
  writeOffPaymentsEnabled,
  isFullyFulfilled,
  isQuote,
  isCancelling,
  isConverting,
  isCancelled,
  isClosed,
  onEdit,
  onDelete,
  onReopen,
  onClose,
  onConvert,
  onFulfill,
  onReturn,
  onRecordPayment,
  onRefund,
  onWriteOff,
  onShare,
}: SaleDetailHeaderProps) {
  const { dropdownButton, actionButtons } = SaleDetailHeaderActions({
    sale,
    canManage,
    canEdit,
    canFulfill,
    canReturn,
    canRecordPayment,
    canRefundPayment,
    canWriteOffPayment,
    returnsEnabled,
    refundPaymentsEnabled,
    writeOffPaymentsEnabled,
    isFullyFulfilled,
    isQuote,
    isCancelling,
    isConverting,
    isCancelled,
    isClosed,
    onEdit,
    onDelete,
    onReopen,
    onClose,
    onConvert,
    onFulfill,
    onReturn,
    onRecordPayment,
    onRefund,
    onWriteOff,
    onShare,
  });

  return (
    <div className="border-b border-gray-200 bg-gradient-to-b from-white to-gray-50/70 px-3 pb-5 pt-5 md:px-8">
      <div className="flex flex-wrap items-start gap-5 md:justify-between">
        <div className="ju flex w-full items-start justify-between gap-x-2 md:gap-x-4 md:w-fit md:justify-start">
          <GoBack />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <h1 className=" text-lg sm:text-xl font-semibold tracking-normal text-gray-950 md:text-2xl">{saleDocumentNumber(sale)}</h1>
              <SaleDetailHeaderStatus sale={sale} isCancelled={isCancelled} isQuote={isQuote} />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              <span className="font-semibold">{sale.locationId?.name || "Location not set"}</span> on <span className="font-semibold">{formatDate(sale.date)}</span>
            </p>
          </div>
          <div className="md:hidden">{dropdownButton}</div>
        </div>
        <div className="hidden justify-end md:block">{actionButtons}</div>
      </div>
    </div>
  );
}
