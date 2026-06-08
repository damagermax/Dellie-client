"use client";

import React from "react";
import { Button, Modal, message } from "antd";
import PurchaseOrderDetailContent from "@/components/purchase-orders/PurchaseOrderDetailContent";
import PurchaseOrderFormModal from "@/components/purchase-orders/PurchaseOrderFormModal";
import PurchaseOrderLandedCostModal from "@/components/purchase-orders/PurchaseOrderLandedCostModal";
import PurchaseOrderStockOperationModal from "@/components/purchase-orders/PurchaseOrderStockOperationModal";
import TransactionItemEditModal from "@/components/transactions/TransactionItemEditModal";
import PurchaseOrderSummary from "@/components/purchase-orders/PurchaseOrderSummary";
import { purchaseApiError, visiblePurchaseDeleteRestrictions } from "@/components/purchase-orders/purchaseDetailUtils";
import PaymentFormModal from "@/components/payment/PaymentFormModel";
import { AccessDeniedView } from "@/components/ui/AccessDeniedView";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import useToggle from "@/hooks/UseToggle";
import { usePermissions } from "@/hooks/usePermissions";
import { useDeletePurchaseFulfillmentMutation, useDeletePurchaseLandedCostMutation, useDeletePurchaseMutation, useDeleteTransactionActionMutation, useGetPurchaseQuery, useReopenPurchaseMutation, useUpdatePurchaseFulfillmentMutation } from "@/lib/redux/services";
import { TransactionType } from "@/types/transaction";
import { Payment } from "@/types/transaction";
import { PurchaseLandedCost, PurchaseStockEvent } from "@/types/purchase";
import { StorePermission } from "@/types/store-access";
import { useState } from "react";

export default function PurchaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { ready, hasAnyPermission, hasPermission } = usePermissions();
  const [editOpen, toggleEdit] = useToggle();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [fulfillOpen, toggleFulfill] = useToggle();
  const [landedCostOpen, toggleLandedCost] = useToggle();
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [paymentType, setPaymentType] = useState(TransactionType.PAYMENT);
  const [selectedPayment, setSelectedPayment] = useState<Payment>();
  const [selectedLandedCost, setSelectedLandedCost] = useState<PurchaseLandedCost>();
  const [editingItem, setEditingItem] = useState<{ kind: "fulfillment"; item: PurchaseStockEvent } | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ kind: "fulfillment"; item: PurchaseStockEvent } | null>(null);
  const canViewPurchase = hasAnyPermission([StorePermission.PURCHASES_VIEW, StorePermission.PURCHASES_MANAGE]);
  const canManagePurchase = hasPermission(StorePermission.PURCHASES_MANAGE);
  const { data: purchase, isLoading, isError, refetch } = useGetPurchaseQuery(id, { skip: !id || !ready || !canViewPurchase, refetchOnMountOrArgChange: true });
  const [cancelPurchase, { isLoading: isCancelling }] = useDeletePurchaseMutation();
  const [reopenPurchase, { isLoading: isReopening }] = useReopenPurchaseMutation();
  const [updatePurchaseFulfillment, { isLoading: isUpdatingFulfillment }] = useUpdatePurchaseFulfillmentMutation();
  const [deletePurchaseFulfillment, { isLoading: isDeletingFulfillment }] = useDeletePurchaseFulfillmentMutation();
  const [deletePurchaseLandedCost] = useDeletePurchaseLandedCostMutation();
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
      message.error(purchaseApiError(error, "Payment could not be deleted."));
      throw error;
    }
  };

  const openAddLandedCostModal = () => {
    setSelectedLandedCost(undefined);
    toggleLandedCost();
  };

  const openEditLandedCostModal = (landedCost: PurchaseLandedCost) => {
    setSelectedLandedCost(landedCost);
    toggleLandedCost();
  };

  const closeLandedCostModal = () => {
    setSelectedLandedCost(undefined);
    toggleLandedCost();
    refetch();
  };

  const deleteLandedCost = async (landedCost: PurchaseLandedCost) => {
    try {
      await deletePurchaseLandedCost({ id: purchase?.id || id, landedCostId: landedCost.id }).unwrap();
      message.success("Landed cost deleted.");
      refetch();
    } catch (error) {
      message.error(purchaseApiError(error, "Landed cost could not be deleted."));
      throw error;
    }
  };

  const confirmCancel = () => {
    if (!purchase || isCancelling) return;

    const restrictions = visiblePurchaseDeleteRestrictions(purchase);
    if (restrictions.length) {
      Modal.warning({
        title: `${purchase.purchaseNumber} cannot be cancelled`,
        content: `This purchase cannot be cancelled because ${restrictions.join(", ")}.`,
      });
      return;
    }

    setCancelConfirmOpen(true);
  };

  const closeCancelConfirm = () => {
    setCancelConfirmOpen(false);
  };

  const runCancel = async () => {
    if (!purchase || isCancelling) return;

    try {
      await cancelPurchase(purchase.id).unwrap();
      message.success("Purchase cancelled and related transactions reversed.");
      closeCancelConfirm();
      refetch();
    } catch (error) {
      message.error(purchaseApiError(error, "Purchase could not be cancelled."));
      throw error;
    }
  };

  const runReopen = async () => {
    if (!purchase || isReopening) return;

    try {
      await reopenPurchase(purchase.id).unwrap();
      message.success("Purchase reopened.");
      refetch();
    } catch (error) {
      message.error(purchaseApiError(error, "Purchase could not be reopened."));
      throw error;
    }
  };

  if (!ready || isLoading) return <AppViewLoader loading />;
  if (!canViewPurchase) return <AccessDeniedView title="Purchases" description="You do not have permission to view this purchase." />;
  if (isError || !purchase) return <p className="px-8 py-10 text-sm text-red-600">This purchase could not be loaded.</p>;

  const isCancelled = Boolean(purchase.isDeleted);
  const canEdit = !purchase.locked && purchase.receiptStatus !== "received" && !isCancelled;
  const fulfillableLines = purchase.lineItems.filter((line) => {
    const productType = typeof line.productId === "string" ? line.productType : line.productId.type || line.productType;
    return productType !== "BUNDLE";
  });
  const canReceive = !purchase.locked && !isCancelled && fulfillableLines.some((line) => Number(line.quantity) > Number(line.fulfilledQuantity || 0));
  const currency = purchase.currencyId?.code || "";
  const editingItemName = editingItem ? (typeof editingItem.item.productId === "string" ? "Selected item" : editingItem.item.productId.name || "Selected item") : "";
  const deletingItemName = deletingItem ? (typeof deletingItem.item.productId === "string" ? "Selected item" : deletingItem.item.productId.name || "Selected item") : "";
  const deletingItemType = deletingItem ? getProductType(purchase, deletingItem.item) : undefined;
  const deletingItemAffectsStock = deletingItemType ? ["STOCK", "PACKAGING"].includes(deletingItemType) : false;
  const closeItemEditor = () => setEditingItem(null);
  const closeDeleteDialog = () => setDeletingItem(null);
  const saveItem = async (values: { quantity: number; date: string }) => {
    if (!purchase || !editingItem) return;

    try {
      await updatePurchaseFulfillment({ id: purchase.id, fulfillmentId: editingItem.item.id, ...values }).unwrap();
      message.success("Item updated.");
      closeItemEditor();
      refetch();
    } catch (error) {
      message.error(purchaseApiError(error, "Item could not be updated."));
      throw error;
    }
  };

  const confirmDeleteItem = (item: PurchaseStockEvent) => {
    setDeletingItem({ kind: "fulfillment", item });
  };

  function getProductType(currentPurchase: typeof purchase, item: PurchaseStockEvent) {
    if (!currentPurchase) return undefined;
    const lineItem = currentPurchase.lineItems.find((line) => line.id === item.lineItemId);
    if (!lineItem) return undefined;
    return typeof lineItem.productId === "string" ? lineItem.productType : lineItem.productId.type || lineItem.productType;
  }

  const runDeleteItem = async () => {
    if (!purchase || !deletingItem) return;

    try {
      await deletePurchaseFulfillment({ id: purchase.id, fulfillmentId: deletingItem.item.id }).unwrap();
      message.success("Item deleted.");
      closeDeleteDialog();
      refetch();
    } catch (error) {
      message.error(purchaseApiError(error, "Item could not be deleted."));
      throw error;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="flex md:min-h-screen min-h-hull flex-col bg-gray-50 lg:flex-row">
        <PurchaseOrderDetailContent
          purchase={purchase}
          currency={currency}
          canManage={canManagePurchase}
          canEdit={canEdit}
          canReceive={canReceive}
          isCancelling={isCancelling}
          isCancelled={isCancelled}
          onEdit={toggleEdit}
          onDelete={confirmCancel}
          onReopen={runReopen}
          onReceive={toggleFulfill}
          onAddLandedCost={openAddLandedCostModal}
          onRecordPayment={() => openPaymentModal(TransactionType.PAYMENT)}
          onRefund={() => openPaymentModal(TransactionType.REFUND)}
          onIssueCredit={() => openPaymentModal(TransactionType.ISSUE_CREDIT)}
          onWriteOff={() => openPaymentModal(TransactionType.WRITE_OFF)}
          onEditPayment={openEditPaymentModal}
          onDeletePayment={deletePayment}
          onEditLandedCost={openEditLandedCostModal}
          onDeleteLandedCost={deleteLandedCost}
          onEditFulfillment={(event) => setEditingItem({ kind: "fulfillment", item: event })}
          onDeleteFulfillment={confirmDeleteItem}
        />
        <PurchaseOrderSummary purchase={purchase} canReceive={canReceive} onReceive={toggleFulfill} onAddLandedCost={openAddLandedCostModal} onRecordPayment={() => openPaymentModal(TransactionType.PAYMENT)} />
      </div>

      {editOpen && <PurchaseOrderFormModal open={editOpen} toggle={toggleEdit} purchase={purchase} onSaved={refetch} />}
      {fulfillOpen && <PurchaseOrderStockOperationModal open={fulfillOpen} toggle={toggleFulfill} purchase={purchase} onSaved={refetch} />}
      {landedCostOpen && <PurchaseOrderLandedCostModal open={landedCostOpen} toggle={closeLandedCostModal} purchase={purchase} onSaved={refetch} initialValues={selectedLandedCost} />}
      {paymentOpen && <PaymentFormModal type={paymentType} open={paymentOpen} toggle={closePaymentModal} linkTransaction={{ id: purchase.id, rate: purchase.rate || 1, currencyId: purchase.currencyId?.id || "" }} initialValues={selectedPayment} />}
      {editingItem && (
        <TransactionItemEditModal
          open={Boolean(editingItem)}
          toggle={closeItemEditor}
          title="Edit Fulfillment"
          description={editingItemName}
          quantityLabel={`Current quantity: ${Number(editingItem.item.quantity || 0).toLocaleString()}`}
          quantity={Number(editingItem.item.quantity || 0)}
          dateLabel="Received at"
          initialDate={editingItem.item.fulfilledAt}
          loading={isUpdatingFulfillment || isDeletingFulfillment}
          onSubmit={saveItem}
        />
      )}
      <Modal open={cancelConfirmOpen} onCancel={closeCancelConfirm} footer={null} title={`Cancel ${purchase.purchaseNumber}?`}>
        <div className="px-5 py-4">
          <p className="text-sm text-gray-600">All related transactions will be reversed. This action cannot be undone.</p>
          <div className="mt-5 flex items-center justify-end gap-3">
            <Button onClick={closeCancelConfirm}>Back</Button>
            <Button danger type="primary" loading={isCancelling} onClick={runCancel}>
              Cancel Purchase
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
