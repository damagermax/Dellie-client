"use client";

import { useParams } from "next/navigation";
import { Button, Modal, message } from "antd";
import PaymentFormModal from "@/components/payment/PaymentFormModel";
import SaleDetailContent from "@/components/orders/SaleDetailContent";
import SaleFormModal from "@/components/orders/SaleFormModal";
import SaleSummary from "@/components/orders/SaleSummary";
import SaleShareDocumentModal, { SaleDocumentType } from "@/components/orders/SaleShareDocumentModal";
import SaleStockOperationModal from "@/components/orders/SaleStockOperationModal";
import TransactionItemEditModal from "@/components/transactions/TransactionItemEditModal";
import { saleApiError, saleDocumentNumber, visibleSaleDeleteRestrictions } from "@/components/orders/saleUtils";
import { AccessDeniedView } from "@/components/ui/AccessDeniedView";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import useToggle from "@/hooks/UseToggle";
import { usePermissions } from "@/hooks/usePermissions";
import { useConvertSaleQuoteMutation, useDeleteSaleFulfillmentMutation, useDeleteSaleMutation, useDeleteTransactionActionMutation, useGetSaleQuery, useReopenSaleMutation, useUpdateSaleFulfillmentMutation } from "@/lib/redux/services";
import { TransactionType } from "@/types/transaction";
import { Payment } from "@/types/transaction";
import { PurchaseStockEvent } from "@/types/purchase";
import { StorePermission } from "@/types/store-access";
import { useState } from "react";

export default function SaleDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { ready, hasAnyPermission, hasPermission } = usePermissions();
  const [editOpen, toggleEdit] = useToggle();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [fulfillOpen, toggleFulfill] = useToggle();
  const [shareDocumentType, setShareDocumentType] = useState<SaleDocumentType>();
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [paymentType, setPaymentType] = useState(TransactionType.PAYMENT);
  const [selectedPayment, setSelectedPayment] = useState<Payment>();
  const [editingItem, setEditingItem] = useState<{ kind: "fulfillment"; item: PurchaseStockEvent } | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ kind: "fulfillment"; item: PurchaseStockEvent } | null>(null);
  const canViewSale = hasAnyPermission([StorePermission.SALES_VIEW, StorePermission.SALES_MANAGE]);
  const canManageSale = hasPermission(StorePermission.SALES_MANAGE);
  const { data: sale, isLoading, isError, refetch } = useGetSaleQuery(orderId, { skip: !orderId || !ready || !canViewSale, refetchOnMountOrArgChange: true });
  const [cancelSale, { isLoading: isCancelling }] = useDeleteSaleMutation();
  const [reopenSale, { isLoading: isReopening }] = useReopenSaleMutation();
  const [convertSaleQuote, { isLoading: isConverting }] = useConvertSaleQuoteMutation();
  const [updateSaleFulfillment, { isLoading: isUpdatingFulfillment }] = useUpdateSaleFulfillmentMutation();
  const [deleteSaleFulfillment, { isLoading: isDeletingFulfillment }] = useDeleteSaleFulfillmentMutation();
  const [deletePaymentAction] = useDeleteTransactionActionMutation();

  const openPaymentModal = (type: TransactionType) => {
    setSelectedPayment(undefined);
    setPaymentType(type);
    setPaymentOpen(true);
  };

  const openEditPaymentModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setPaymentType(payment.type);
    setPaymentOpen(true);
  };

  const closePaymentModal = () => {
    setSelectedPayment(undefined);
    setPaymentOpen(false);
    refetch();
  };

  const deletePayment = async (payment: Payment) => {
    try {
      await deletePaymentAction(payment.id).unwrap();
      message.success("Payment deleted.");
      refetch();
    } catch (error) {
      message.error(saleApiError(error, "Payment could not be deleted."));
      throw error;
    }
  };

  const confirmCancel = () => {
    if (!sale || isCancelling) return;
    const restrictions = visibleSaleDeleteRestrictions(sale);
    if (restrictions.length) {
      Modal.warning({
        title: `${saleDocumentNumber(sale)} cannot be cancelled`,
        content: `This sale cannot be cancelled because ${restrictions.join(", ")}.`,
      });
      return;
    }

    setCancelConfirmOpen(true);
  };

  const closeCancelConfirm = () => {
    setCancelConfirmOpen(false);
  };

  const runCancel = async () => {
    if (!sale || isCancelling) return;

    try {
      await cancelSale(sale.id).unwrap();
      message.success("Sale cancelled and related transactions reversed.");
      closeCancelConfirm();
      refetch();
    } catch (error) {
      message.error(saleApiError(error, "Sale could not be cancelled."));
      throw error;
    }
  };

  const runReopen = async () => {
    if (!sale || isReopening) return;

    try {
      await reopenSale(sale.id).unwrap();
      message.success("Sale reopened.");
      refetch();
    } catch (error) {
      message.error(saleApiError(error, "Sale could not be reopened."));
      throw error;
    }
  };

  const runConvert = async () => {
    if (!sale || isConverting) return;

    try {
      await convertSaleQuote(sale.id).unwrap();
      message.success("Quote converted to sale.");
      refetch();
    } catch (error) {
      message.error(saleApiError(error, "Quote could not be converted."));
      throw error;
    }
  };

  if (!ready || isLoading) return <AppViewLoader loading />;
  if (!canViewSale) return <AccessDeniedView title="Sales" description="You do not have permission to view this sale." />;
  if (isError || !sale) return <p className="px-8 py-10 text-sm text-red-600">This sale could not be loaded.</p>;

  const isCancelled = Boolean(sale.isDeleted);
  const isQuote = sale.status === "draft" && !isCancelled;
  const canEdit = !sale.locked && sale.receiptStatus !== "received" && !isCancelled;
  const canFulfill = !sale.locked && !isCancelled && !isQuote && sale.lineItems.some((line) => Number(line.quantity) > Number(line.fulfilledQuantity || 0));
  const editingItemName = editingItem ? (typeof editingItem.item.productId === "string" ? "Selected item" : editingItem.item.productId.name || "Selected item") : "";
  const deletingItemName = deletingItem ? (typeof deletingItem.item.productId === "string" ? "Selected item" : deletingItem.item.productId.name || "Selected item") : "";
  const deletingItemType = deletingItem ? getProductType(deletingItem.item) : undefined;
  const deletingItemAffectsStock = deletingItemType ? ["STOCK", "PACKAGING"].includes(deletingItemType) : false;
  const closeItemEditor = () => setEditingItem(null);
  const closeDeleteDialog = () => setDeletingItem(null);
  const saveItem = async (values: { quantity: number; date: string }) => {
    if (!sale || !editingItem) return;

    try {
      await updateSaleFulfillment({ id: sale.id, fulfillmentId: editingItem.item.id, ...values }).unwrap();
      message.success("Item updated.");
      closeItemEditor();
      refetch();
    } catch (error) {
      message.error(saleApiError(error, "Item could not be updated."));
      throw error;
    }
  };

  const confirmDeleteItem = (item: PurchaseStockEvent) => {
    setDeletingItem({ kind: "fulfillment", item });
  };

  function getProductType(item: PurchaseStockEvent) {
    return typeof item.productId === "string" ? item.productType : item.productId.type || item.productType;
  }

  const runDeleteItem = async () => {
    if (!sale || !deletingItem) return;

    try {
      await deleteSaleFulfillment({ id: sale.id, fulfillmentId: deletingItem.item.id }).unwrap();
      message.success("Item deleted.");
      closeDeleteDialog();
      refetch();
    } catch (error) {
      message.error(saleApiError(error, "Item could not be deleted."));
      throw error;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen flex-col bg-gray-50 lg:flex-row">
        <SaleDetailContent
          sale={sale}
          currency={sale.currencyId?.code || ""}
          canManage={canManageSale}
          canEdit={canEdit}
          canFulfill={canFulfill}
          isQuote={isQuote}
          isCancelling={isCancelling}
          isConverting={isConverting}
          isCancelled={isCancelled}
          onEdit={toggleEdit}
          onDelete={confirmCancel}
          onReopen={runReopen}
          onConvert={runConvert}
          onFulfill={toggleFulfill}
          onRecordPayment={() => openPaymentModal(TransactionType.PAYMENT)}
          onRefund={() => openPaymentModal(TransactionType.REFUND)}
          onIssueCredit={() => openPaymentModal(TransactionType.ISSUE_CREDIT)}
          onWriteOff={() => openPaymentModal(TransactionType.WRITE_OFF)}
          onShare={setShareDocumentType}
          onEditFulfillment={(event) => setEditingItem({ kind: "fulfillment", item: event })}
          onDeleteFulfillment={confirmDeleteItem}
          onEditPayment={openEditPaymentModal}
          onDeletePayment={deletePayment}
        />
        <SaleSummary sale={sale} />
      </div>

      {editOpen && <SaleFormModal open={editOpen} toggle={toggleEdit} sale={sale} onSaved={refetch} />}
      {fulfillOpen && <SaleStockOperationModal open={fulfillOpen} toggle={toggleFulfill} sale={sale} onSaved={refetch} />}
      {shareDocumentType && (
        <SaleShareDocumentModal open={Boolean(shareDocumentType)} toggle={() => setShareDocumentType(undefined)} sale={sale} type={shareDocumentType} />
      )}
      {paymentOpen && (
        <PaymentFormModal
          type={paymentType}
          open={paymentOpen}
          toggle={closePaymentModal}
          linkTransaction={{ id: sale.id, rate: sale.rate || 1, currencyId: sale.currencyId?.id || "" }}
          initialValues={selectedPayment}
        />
      )}
      {editingItem && (
        <TransactionItemEditModal
          open={Boolean(editingItem)}
          toggle={closeItemEditor}
          title="Edit Fulfillment"
          description={editingItemName}
          quantityLabel={`Current quantity: ${Number(editingItem.item.quantity || 0).toLocaleString()}`}
          quantity={Number(editingItem.item.quantity || 0)}
          dateLabel="Fulfilled at"
          initialDate={editingItem.item.fulfilledAt}
          loading={isUpdatingFulfillment || isDeletingFulfillment}
          onSubmit={saveItem}
        />
      )}
      <Modal open={cancelConfirmOpen} onCancel={closeCancelConfirm} footer={null} title={`Cancel ${saleDocumentNumber(sale)}?`}>
        <div className="px-5 py-4">
          <p className="text-sm text-gray-600">All related transactions will be reversed. This action cannot be undone.</p>
          <div className="mt-5 flex items-center justify-end gap-3">
            <Button onClick={closeCancelConfirm}>Back</Button>
            <Button danger type="primary" loading={isCancelling} onClick={runCancel}>
              Cancel Sale
            </Button>
          </div>
        </div>
      </Modal>
      {deletingItem && (
        <Modal open onCancel={closeDeleteDialog} footer={null} title="Delete this fulfillment?">
          <div className="px-5 py-4">
            <p className="text-sm text-gray-600">
              {deletingItemAffectsStock
                ? "This will reverse the stock changes made by this fulfillment. Inventory quantities will be updated accordingly. This action cannot be undone."
                : "This will remove the fulfillment record. No inventory will be affected. This action cannot be undone."}
            </p>
            <p className="mt-2 text-xs text-gray-500">{deletingItemName}</p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <Button onClick={closeDeleteDialog}>Cancel</Button>
              <Button danger type="primary" loading={isDeletingFulfillment} onClick={runDeleteItem}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
