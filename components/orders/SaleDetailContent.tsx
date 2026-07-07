"use client";

import { useGetLocationsQuery, useGetPaymentTermsQuery } from "@/lib/redux/services";
import { Sale } from "@/types/index";
import { LocationStatus } from "@/types/location";
import SaleDetailTables from "./SaleDetailTables";
import { SaleDocumentType } from "./SaleShareDocumentModal";
import { Payment } from "@/types/transaction";
import { PurchaseReturnEvent, PurchaseStockEvent } from "@/types/purchase";
import { SaleDetailHeader, SaleOverviewSection } from "./SaleDetailSections";

interface SaleDetailContentProps {
  sale: Sale;
  currency: string;
  canManage?: boolean;
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
  onEdit: () => void;
  onDelete: () => void;
  onReopen: () => void;
  onClose: () => void;
  onConvert: () => void;
  onFulfill: () => void;
  onReturn: () => void;
  onRecordPayment: () => void;
  onRefund: () => void;
  onIssueCredit: () => void;
  onWriteOff: () => void;
  onShare: (type: SaleDocumentType) => void;
  onEditFulfillment: (event: PurchaseStockEvent) => void;
  onDeleteFulfillment: (event: PurchaseStockEvent) => void;
  onEditReturn: (event: PurchaseReturnEvent) => void;
  onDeleteReturn: (event: PurchaseReturnEvent) => void;
  onEditPayment: (payment: Payment) => void;
  onDeletePayment: (payment: Payment) => void;
}

export default function SaleDetailContent({
  sale,
  currency,
  canManage = false,
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
  onEditFulfillment,
  onDeleteFulfillment,
  onEditReturn,
  onDeleteReturn,
  onEditPayment,
  onDeletePayment,
}: SaleDetailContentProps) {
  const { data: paymentTerms } = useGetPaymentTermsQuery();

  const isClosed = Boolean(sale.locked && !isCancelled);

  return (
    <section className="min-w-0 flex-1 border-r border-gray-200 bg-white lg:w-[70%] lg:flex-none">
      <SaleDetailHeader
        sale={sale}
        canManage={canManage}
        canEdit={canEdit}
        canFulfill={canFulfill}
        canReturn={canReturn}
        canRecordPayment={canRecordPayment}
        canRefundPayment={canRefundPayment}
        canWriteOffPayment={canWriteOffPayment}
        returnsEnabled={returnsEnabled}
        refundPaymentsEnabled={refundPaymentsEnabled}
        writeOffPaymentsEnabled={writeOffPaymentsEnabled}
        isFullyFulfilled={isFullyFulfilled}
        isQuote={isQuote}
        isCancelling={isCancelling}
        isConverting={isConverting}
        isCancelled={isCancelled}
        isClosed={isClosed}
        onEdit={onEdit}
        onDelete={onDelete}
        onReopen={onReopen}
        onClose={onClose}
        onConvert={onConvert}
        onFulfill={onFulfill}
        onReturn={onReturn}
        onRecordPayment={onRecordPayment}
        onRefund={onRefund}
        onWriteOff={onWriteOff}
        onShare={onShare}
      />
      <SaleOverviewSection sale={sale} canEdit={canEdit} isCancelled={isCancelled} isClosed={isClosed} paymentTerms={paymentTerms}  />
      <div id="sale-overview" className="scroll-mt-14">
        <div id="sale-records" className="scroll-mt-14">
          <SaleDetailTables
            sale={sale}
            currency={currency}
            canManage={canManage}
            isCancelled={isCancelled}
            isReadOnly={isClosed}
            onEditFulfillment={onEditFulfillment}
            onDeleteFulfillment={onDeleteFulfillment}
            onEditReturn={onEditReturn}
            onDeleteReturn={onDeleteReturn}
            onEditPayment={onEditPayment}
            onDeletePayment={onDeletePayment}
          />
        </div>
      </div>
    </section>
  );
}
