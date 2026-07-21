"use client";

import { useGetPaymentTermsQuery } from "@/lib/redux/services";
import { Purchase } from "@/types/index";
import PurchaseOrderDetailTables from "./PurchaseOrderDetailTables";
import { Payment } from "@/types/transaction";
import { PurchaseLandedCost, PurchaseReturnEvent, PurchaseStockEvent } from "@/types/purchase";
import { PurchaseDetailHeader, PurchaseOverviewSection } from "./PurchaseOrderDetailSections";

interface PurchaseOrderDetailContentProps {
  purchase: Purchase;
  currency: string;
  canManage?: boolean;
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
  onEdit: () => void;
  onDelete: () => void;
  onReopen: () => void;
  onClose: () => void;
  onReceive: () => void;
  onReturn: () => void;
  onAddLandedCost: () => void;
  onRecordPayment: () => void;
  onRefund: () => void;
  onIssueCredit: () => void;
  onWriteOff: () => void;
  onEditFulfillment: (event: PurchaseStockEvent) => void;
  onDeleteFulfillment: (event: PurchaseStockEvent) => void;
  onEditReturn: (event: PurchaseReturnEvent) => void;
  onDeleteReturn: (event: PurchaseReturnEvent) => void;
  onEditPayment: (payment: Payment) => void;
  onDeletePayment: (payment: Payment) => void;
  onEditLandedCost: (landedCost: PurchaseLandedCost) => void;
  onDeleteLandedCost: (landedCost: PurchaseLandedCost) => void;
}

export default function PurchaseOrderDetailContent({
  purchase,
  currency,
  canManage = false,
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
  onEditFulfillment,
  onDeleteFulfillment,
  onEditReturn,
  onDeleteReturn,
  onEditPayment,
  onDeletePayment,
  onEditLandedCost,
  onDeleteLandedCost,
}: PurchaseOrderDetailContentProps) {
  const { data: paymentTerms } = useGetPaymentTermsQuery();
  const isClosed = Boolean(purchase.locked && !isCancelled);

  return (
    <section className="min-w-0 flex-1 border-r border-gray-200 bg-white lg:w-[70%] lg:flex-none">
      <PurchaseDetailHeader
        purchase={purchase}
        canManage={canManage}
        canEdit={canEdit}
        canReceive={canReceive}
        canReturn={canReturn}
        canRecordPayment={canRecordPayment}
        canRefundPayment={canRefundPayment}
        canWriteOffPayment={canWriteOffPayment}
        returnsEnabled={returnsEnabled}
        refundPaymentsEnabled={refundPaymentsEnabled}
        writeOffPaymentsEnabled={writeOffPaymentsEnabled}
        isFullyReceived={isFullyReceived}
        isCancelling={isCancelling}
        isCancelled={isCancelled}
        isClosed={isClosed}
        onEdit={onEdit}
        onDelete={onDelete}
        onReopen={onReopen}
        onClose={onClose}
        onReceive={onReceive}
        onReturn={onReturn}
        onAddLandedCost={onAddLandedCost}
        onRecordPayment={onRecordPayment}
        onRefund={onRefund}
        onWriteOff={onWriteOff}
      />
      <PurchaseOverviewSection purchase={purchase} isCancelled={isCancelled} isClosed={isClosed} paymentTerms={paymentTerms} />
      <div id="purchase-overview" className="scroll-mt-14">
        <div id="purchase-records" className="scroll-mt-14">
          <PurchaseOrderDetailTables
            purchase={purchase}
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
            onEditLandedCost={onEditLandedCost}
            onDeleteLandedCost={onDeleteLandedCost}
          />
        </div>
      </div>
    </section>
  );
}
