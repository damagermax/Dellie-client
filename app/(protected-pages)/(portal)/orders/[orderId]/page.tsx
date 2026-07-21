"use client";

import { Button, Modal } from "antd";
import PaymentFormModal from "@/components/payment/PaymentFormModel";
import SaleActivitySidebar from "@/components/orders/SaleActivitySidebar";
import SaleDetailContent from "@/components/orders/SaleDetailContent";
import SaleFormModal from "@/components/orders/SaleFormModal";
import SaleShareDocumentModal from "@/components/orders/SaleShareDocumentModal";
import SaleReturnOperationModal from "@/components/orders/SaleReturnOperationModal";
import SaleStockOperationModal from "@/components/orders/SaleStockOperationModal";
import TransactionItemEditModal from "@/components/transactions/TransactionItemEditModal";
import { saleDocumentNumber } from "@/components/orders/saleUtils";
import { AccessDeniedView } from "@/components/ui/AccessDeniedView";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import { TransactionType } from "@/types/transaction";
import { useSaleDetailController } from "./_lib/useSaleDetailController";

export default function SaleDetailPage() {
  const controller = useSaleDetailController();

  if (!controller.ready || controller.isLoading) return <AppViewLoader loading />;
  if (!controller.canViewSale) return <AccessDeniedView title="Sales" description="You do not have permission to view this sale." />;
  if (controller.isError || !controller.sale || !controller.state) return <p className="px-8 py-10 text-sm text-red-600">This sale could not be loaded.</p>;

  const { sale, state } = controller;

  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen flex-col bg-gray-50 lg:flex-row">
        <SaleDetailContent
          sale={sale}
          currency={sale.currencyId?.code || ""}
          canManage={controller.canManageSale}
          canEdit={state.canEdit}
          canFulfill={state.canFulfill}
          canReturn={state.canReturn && state.canUseReturns}
          canRecordPayment={state.canRecordPayment}
          canRefundPayment={state.canRefundPayment && state.canUseRefunds}
          canWriteOffPayment={state.canUseWriteOffs && Number(sale.balance || 0) > 0}
          returnsEnabled={state.canUseReturns}
          refundPaymentsEnabled={state.canUseRefunds}
          writeOffPaymentsEnabled={state.canUseWriteOffs}
          isFullyFulfilled={state.isFullyFulfilled}
          isQuote={state.isQuote}
          isCancelling={controller.isCancelling}
          isConverting={controller.isConverting}
          isCancelled={state.isCancelled}
          onEdit={controller.toggleEdit}
          onDelete={controller.confirmCancel}
          onReopen={controller.runReopen}
          onClose={controller.runClose}
          onConvert={controller.runConvert}
          onFulfill={controller.toggleFulfill}
          onReturn={controller.toggleReturn}
          onRecordPayment={() => controller.openPaymentModal(TransactionType.PAYMENT)}
          onRefund={() => controller.openPaymentModal(TransactionType.REFUND)}
          onIssueCredit={() => controller.openPaymentModal(TransactionType.ISSUE_CREDIT)}
          onWriteOff={() => controller.openPaymentModal(TransactionType.WRITE_OFF)}
          onShare={controller.setShareDocumentType}
          onEditFulfillment={(event) => controller.setEditingItem({ kind: "fulfillment", item: event })}
          onDeleteFulfillment={controller.confirmDeleteItem}
          onEditReturn={(event) => controller.setEditingItem({ kind: "return", item: event })}
          onDeleteReturn={controller.confirmDeleteReturn}
          onEditPayment={controller.openEditPaymentModal}
          onDeletePayment={controller.deletePayment}
        />
        <SaleActivitySidebar sale={sale} />
      </div>

      {controller.editOpen && <SaleFormModal open={controller.editOpen} toggle={controller.toggleEdit} sale={sale} onSaved={controller.refetch} />}
      {controller.fulfillOpen && <SaleStockOperationModal open={controller.fulfillOpen} toggle={controller.toggleFulfill} sale={sale} onSaved={controller.refetch} />}
      {controller.returnOpen && state.canReturn && state.canUseReturns && <SaleReturnOperationModal open={controller.returnOpen} toggle={controller.toggleReturn} sale={sale} onSaved={controller.refetch} />}
      {controller.shareDocumentType && <SaleShareDocumentModal open={Boolean(controller.shareDocumentType)} toggle={() => controller.setShareDocumentType(undefined)} sale={sale} type={controller.shareDocumentType} />}
      {controller.paymentOpen && (
        <PaymentFormModal
          type={controller.paymentType}
          open={controller.paymentOpen}
          toggle={controller.closePaymentModal}
          linkTransaction={{ id: sale.id, rate: sale.rate || 1, currencyId: sale.currencyId?.id || "", type: TransactionType.SALE }}
          initialValues={controller.selectedPayment}
          sale={sale}
        />
      )}
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
          dateLabel={controller.editingItem.kind === "fulfillment" ? "Fulfilled at" : "Returned at"}
          initialDate={controller.editingItem.kind === "fulfillment" ? controller.editingItem.item.fulfilledAt : controller.editingItem.item.returnedAt}
          showNote={controller.editingItem.kind === "return"}
          initialNote={controller.editingItem.kind === "return" ? controller.editingItem.item.reason : undefined}
          showRestock={controller.editingItem.kind === "return"}
          initialRestock={controller.editingItem.kind === "return" ? controller.editingItem.item.restock !== false : undefined}
          loading={controller.isUpdatingFulfillment || controller.isUpdatingReturn || controller.isDeletingFulfillment || controller.isDeletingReturn}
          onSubmit={controller.saveItem}
        />
      )}
      <Modal open={controller.cancelConfirmOpen} onCancel={controller.closeCancelConfirm} footer={null} title={`Cancel ${saleDocumentNumber(sale)}?`}>
        <div className="px-5 py-4">
          <p className="text-sm text-gray-600">All related transactions will be reversed. This action cannot be undone.</p>
          <div className="mt-5 flex items-center justify-end gap-3">
            <Button onClick={controller.closeCancelConfirm}>Back</Button>
            <Button danger type="primary" loading={controller.isCancelling} onClick={controller.runCancel}>
              Cancel Sale
            </Button>
          </div>
        </div>
      </Modal>
      {controller.deletingItem && (
        <Modal open onCancel={controller.closeDeleteDialog} footer={null} title={controller.deletingItem.kind === "fulfillment" ? "Delete this fulfillment?" : "Delete this return?"}>
          <div className="px-5 py-4">
            <p className="text-sm text-gray-600">
              {controller.deletingItem.kind === "return"
                ? "This will remove the return record and put the related quantity back into the fulfilled state. Inventory quantities will be updated accordingly. This action cannot be undone."
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
