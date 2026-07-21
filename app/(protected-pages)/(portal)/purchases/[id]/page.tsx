"use client";

import React from "react";
import { Button, Modal } from "antd";
import PurchaseOrderDetailContent from "@/components/purchase-orders/PurchaseOrderDetailContent";
import PurchaseOrderFormModal from "@/components/purchase-orders/PurchaseOrderFormModal";
import PurchaseOrderLandedCostModal from "@/components/purchase-orders/PurchaseOrderLandedCostModal";
import PurchaseReturnOperationModal from "@/components/purchase-orders/PurchaseReturnOperationModal";
import PurchaseOrderStockOperationModal from "@/components/purchase-orders/PurchaseOrderStockOperationModal";
import EntityAuditTimeline from "@/components/audit/EntityAuditTimeline";
import TransactionItemEditModal from "@/components/transactions/TransactionItemEditModal";
import PaymentFormModal from "@/components/payment/PaymentFormModel";
import { AccessDeniedView } from "@/components/ui/AccessDeniedView";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import { TransactionType } from "@/types/transaction";
import { usePurchaseDetailController } from "./_lib/usePurchaseDetailController";

export default function PurchaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const controller = usePurchaseDetailController(id);

  if (!controller.ready || controller.isLoading) return <AppViewLoader loading />;
  if (!controller.canViewPurchase) return <AccessDeniedView title="Purchases" description="You do not have permission to view this purchase." />;
  if (controller.isError || !controller.purchase || !controller.state) return <p className="px-8 py-10 text-sm text-red-600">This purchase could not be loaded.</p>;

  const { purchase, state } = controller;

  return (
    <div className="min-h-screen">
      <div className="flex md:min-h-screen min-h-hull flex-col bg-gray-50 lg:flex-row">
        <PurchaseOrderDetailContent
          purchase={purchase}
          currency={state.currency}
          canManage={controller.canManagePurchase}
          canEdit={state.canEdit}
          canReceive={state.canReceive}
          canReturn={state.canReturn && state.canUseReturns}
          canRecordPayment={state.canRecordPayment}
          canRefundPayment={state.canRefundPayment && state.canUseRefunds}
          canWriteOffPayment={state.canUseWriteOffs && Number(purchase.balance || 0) > 0}
          returnsEnabled={state.canUseReturns}
          refundPaymentsEnabled={state.canUseRefunds}
          writeOffPaymentsEnabled={state.canUseWriteOffs}
          isFullyReceived={state.isFullyReceived}
          isCancelling={controller.isCancelling}
          isCancelled={state.isCancelled}
          onEdit={controller.toggleEdit}
          onDelete={controller.confirmCancel}
          onReopen={controller.runReopen}
          onClose={controller.runClose}
          onReceive={controller.toggleFulfill}
          onReturn={controller.toggleReturn}
          onAddLandedCost={controller.openAddLandedCostModal}
          onRecordPayment={() => controller.openPaymentModal(TransactionType.PAYMENT)}
          onRefund={() => controller.openPaymentModal(TransactionType.REFUND)}
          onIssueCredit={() => controller.openPaymentModal(TransactionType.ISSUE_CREDIT)}
          onWriteOff={() => controller.openPaymentModal(TransactionType.WRITE_OFF)}
          onEditPayment={controller.openEditPaymentModal}
          onDeletePayment={controller.deletePayment}
          onEditLandedCost={controller.openEditLandedCostModal}
          onDeleteLandedCost={controller.deleteLandedCost}
          onEditFulfillment={(event) => controller.setEditingItem({ kind: "fulfillment", item: event })}
          onDeleteFulfillment={controller.confirmDeleteItem}
          onEditReturn={(event) => controller.setEditingItem({ kind: "return", item: event })}
          onDeleteReturn={controller.confirmDeleteReturn}
        />
        <aside className="hidden w-full border-t border-gray-200 bg-gray-50 lg:block lg:w-[30%] lg:border-l lg:border-t-0">
          <div className="px-5 pb-8 pt-6 lg:px-7">
            <EntityAuditTimeline entityType="purchase" entityId={purchase.id} />
          </div>
        </aside>
      </div>

      {controller.editOpen && <PurchaseOrderFormModal open={controller.editOpen} toggle={controller.toggleEdit} purchase={purchase} onSaved={controller.refetch} />}
      {controller.fulfillOpen && <PurchaseOrderStockOperationModal open={controller.fulfillOpen} toggle={controller.toggleFulfill} purchase={purchase} onSaved={controller.refetch} />}
      {controller.returnOpen && state.canReturn && state.canUseReturns && <PurchaseReturnOperationModal open={controller.returnOpen} toggle={controller.toggleReturn} purchase={purchase} onSaved={controller.refetch} />}
      {controller.landedCostOpen && <PurchaseOrderLandedCostModal open={controller.landedCostOpen} toggle={controller.closeLandedCostModal} purchase={purchase} onSaved={controller.refetch} initialValues={controller.selectedLandedCost} />}
      {controller.paymentOpen && <PaymentFormModal type={controller.paymentType} open={controller.paymentOpen} toggle={controller.closePaymentModal} linkTransaction={{ id: purchase.id, rate: purchase.rate || 1, currencyId: purchase.currencyId?.id || "", type: TransactionType.PURCHASE }} initialValues={controller.selectedPayment} purchase={purchase} />}
      {controller.editingItem && (
        <TransactionItemEditModal
          open={Boolean(controller.editingItem)}
          toggle={controller.closeItemEditor}
          title={controller.editingItem.kind === "fulfillment" ? "Edit Fulfillment" : "Edit Return"}
          description={state.editingItemName}
          quantity={Number(controller.editingItem.item.quantity || 0)}
          imageUrl={
            "productUrl" in controller.editingItem.item && typeof controller.editingItem.item.productUrl === "string"
              ? controller.editingItem.item.productUrl
              : typeof controller.editingItem.item.productId === "string"
                ? undefined
                : typeof controller.editingItem.item.productId.media?.[0]?.url === "string"
                  ? controller.editingItem.item.productId.media[0].url
                  : undefined
          }
          sku={
            "productSku" in controller.editingItem.item && typeof controller.editingItem.item.productSku === "string"
              ? controller.editingItem.item.productSku
              : typeof controller.editingItem.item.productId === "string"
                ? undefined
                : typeof controller.editingItem.item.productId.sku === "string"
                  ? controller.editingItem.item.productId.sku
                  : undefined
          }
          dateLabel={controller.editingItem.kind === "fulfillment" ? "Received at" : "Returned at"}
          initialDate={controller.editingItem.kind === "fulfillment" ? controller.editingItem.item.fulfilledAt : controller.editingItem.item.returnedAt}
          showNote={controller.editingItem.kind === "return"}
          initialNote={controller.editingItem.kind === "return" ? controller.editingItem.item.reason : undefined}
          showRestock={controller.editingItem.kind === "return"}
          initialRestock={controller.editingItem.kind === "return" ? controller.editingItem.item.restock !== false : undefined}
          loading={controller.isUpdatingFulfillment || controller.isUpdatingReturn || controller.isDeletingFulfillment || controller.isDeletingReturn}
          onSubmit={controller.saveItem}
        />
      )}
      <Modal open={controller.cancelConfirmOpen} onCancel={controller.closeCancelConfirm} footer={null} title={`Cancel ${purchase.purchaseNumber}?`}>
        <div className="px-5 py-4">
          <p className="text-sm text-gray-600">All related transactions will be reversed. This action cannot be undone.</p>
          <div className="mt-5 flex items-center justify-end gap-3">
            <Button onClick={controller.closeCancelConfirm}>Back</Button>
            <Button danger type="primary" loading={controller.isCancelling} onClick={controller.runCancel}>
              Cancel Purchase
            </Button>
          </div>
        </div>
      </Modal>
      
      {controller.deletingItem && (
        <Modal open onCancel={controller.closeDeleteDialog} footer={null} title={controller.deletingItem.kind === "fulfillment" ? "Delete this fulfillment?" : "Delete this return?"}>
          <div className="px-5 py-4">
            <p className="text-sm text-gray-600">
              {controller.deletingItem.kind === "return"
                ? "This will remove the return record and put the related quantity back into the received state. Inventory quantities will be updated accordingly. This action cannot be undone."
                : state.deletingItemAffectsStock
                  ? "This will reverse the stock changes made by this fulfillment. Inventory quantities will be updated accordingly. This action cannot be undone."
                  : "This will remove the fulfillment record. No inventory will be affected. This action cannot be undone."}
            </p>
            <p className="mt-2 text-xs text-gray-500">{state.deletingItemName}</p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <Button onClick={controller.closeDeleteDialog}>Cancel</Button>
              <Button danger type="primary" loading={controller.isDeletingFulfillment || controller.isDeletingReturn} onClick={controller.runDeleteItem}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
