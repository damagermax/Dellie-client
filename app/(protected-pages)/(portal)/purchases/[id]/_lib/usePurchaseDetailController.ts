"use client";

import { Modal, message } from "antd";
import { useState } from "react";
import { useSelector } from "react-redux";

import useToggle from "@/hooks/UseToggle";
import { usePermissions } from "@/hooks/usePermissions";
import {
  useClosePurchaseMutation,
  useDeletePurchaseFulfillmentMutation,
  useDeletePurchaseLandedCostMutation,
  useDeletePurchaseMutation,
  useDeletePurchaseReturnMutation,
  useDeleteTransactionActionMutation,
  useGetPurchaseQuery,
  useReopenPurchaseMutation,
  useUpdatePurchaseFulfillmentMutation,
  useUpdatePurchaseReturnMutation,
} from "@/lib/redux/services";
import { RootState } from "@/lib/store";
import { PurchaseLandedCost, PurchaseReturnEvent, PurchaseStockEvent } from "@/types/purchase";
import { StorePermission } from "@/types/store-access";
import { Payment, TransactionType } from "@/types/transaction";

import { purchaseApiError, visiblePurchaseDeleteRestrictions } from "@/components/purchase-orders/purchaseDetailUtils";
import { derivePurchaseDetailState } from "./purchaseDetailControllerHelpers";

type EditableItem = { kind: "fulfillment"; item: PurchaseStockEvent } | { kind: "return"; item: PurchaseReturnEvent };

export function usePurchaseDetailController(id: string) {
  const { ready, hasAnyPermission, hasPermission } = usePermissions();
  const [editOpen, toggleEdit] = useToggle();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [fulfillOpen, toggleFulfill] = useToggle();
  const [returnOpen, toggleReturn] = useToggle();
  const [landedCostOpen, toggleLandedCost] = useToggle();
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [paymentType, setPaymentType] = useState(TransactionType.PAYMENT);
  const [selectedPayment, setSelectedPayment] = useState<Payment>();
  const [selectedLandedCost, setSelectedLandedCost] = useState<PurchaseLandedCost>();
  const [editingItem, setEditingItem] = useState<EditableItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<EditableItem | null>(null);

  const canViewPurchase = hasAnyPermission([StorePermission.PURCHASES_VIEW, StorePermission.PURCHASES_MANAGE]);
  const canManagePurchase = hasPermission(StorePermission.PURCHASES_MANAGE);
  const { data: purchase, isLoading, isError, refetch } = useGetPurchaseQuery(id, { skip: !id || !ready || !canViewPurchase, refetchOnMountOrArgChange: true });
  const [cancelPurchase, { isLoading: isCancelling }] = useDeletePurchaseMutation();
  const [reopenPurchase, { isLoading: isReopening }] = useReopenPurchaseMutation();
  const [closePurchase] = useClosePurchaseMutation();
  const [updatePurchaseFulfillment, { isLoading: isUpdatingFulfillment }] = useUpdatePurchaseFulfillmentMutation();
  const [updatePurchaseReturn, { isLoading: isUpdatingReturn }] = useUpdatePurchaseReturnMutation();
  const [deletePurchaseFulfillment, { isLoading: isDeletingFulfillment }] = useDeletePurchaseFulfillmentMutation();
  const [deletePurchaseReturn, { isLoading: isDeletingReturn }] = useDeletePurchaseReturnMutation();
  const [deletePurchaseLandedCost] = useDeletePurchaseLandedCostMutation();
  const [deletePaymentAction] = useDeleteTransactionActionMutation();
  const featureSettings = useSelector((state: RootState) => state.currentUser.storeSettings.features);

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

  const closeCancelConfirm = () => setCancelConfirmOpen(false);
  const closeItemEditor = () => setEditingItem(null);
  const closeDeleteDialog = () => setDeletingItem(null);

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

  const runClose = async () => {
    if (!purchase) return;

    try {
      await closePurchase(purchase.id).unwrap();
      message.success("Purchase closed.");
      refetch();
    } catch (error) {
      message.error(purchaseApiError(error, "Purchase could not be closed."));
      throw error;
    }
  };

  const saveItem = async (values: { quantity: number; date: string; note?: string; restock?: boolean }) => {
    if (!purchase || !editingItem) return;

    try {
      if (editingItem.kind === "fulfillment") {
        await updatePurchaseFulfillment({ id: purchase.id, fulfillmentId: editingItem.item.id, quantity: values.quantity, date: values.date }).unwrap();
      } else {
        await updatePurchaseReturn({
          id: purchase.id,
          returnId: editingItem.item.id,
          quantity: values.quantity,
          date: values.date,
          reason: values.note,
          restock: values.restock,
        }).unwrap();
      }
      message.success("Item updated.");
      closeItemEditor();
      refetch();
    } catch (error) {
      message.error(purchaseApiError(error, "Item could not be updated."));
      throw error;
    }
  };

  const confirmDeleteItem = (item: PurchaseStockEvent) => setDeletingItem({ kind: "fulfillment", item });
  const confirmDeleteReturn = (item: PurchaseReturnEvent) => setDeletingItem({ kind: "return", item });

  const runDeleteItem = async () => {
    if (!purchase || !deletingItem) return;

    try {
      if (deletingItem.kind === "fulfillment") {
        await deletePurchaseFulfillment({ id: purchase.id, fulfillmentId: deletingItem.item.id }).unwrap();
      } else {
        await deletePurchaseReturn({ id: purchase.id, returnId: deletingItem.item.id }).unwrap();
      }
      message.success("Item deleted.");
      closeDeleteDialog();
      refetch();
    } catch (error) {
      message.error(purchaseApiError(error, "Item could not be deleted."));
      throw error;
    }
  };

  const state = purchase ? derivePurchaseDetailState({ purchase, editingItem, deletingItem, featureSettings }) : null;

  return {
    ready,
    canViewPurchase,
    canManagePurchase,
    purchase,
    isLoading,
    isError,
    refetch,
    editOpen,
    toggleEdit,
    paymentOpen,
    paymentType,
    selectedPayment,
    openPaymentModal,
    openEditPaymentModal,
    closePaymentModal,
    fulfillOpen,
    toggleFulfill,
    returnOpen,
    toggleReturn,
    landedCostOpen,
    selectedLandedCost,
    openAddLandedCostModal,
    openEditLandedCostModal,
    closeLandedCostModal,
    deleteLandedCost,
    cancelConfirmOpen,
    closeCancelConfirm,
    confirmCancel,
    runCancel,
    runReopen,
    runClose,
    editingItem,
    setEditingItem,
    deletingItem,
    closeItemEditor,
    closeDeleteDialog,
    saveItem,
    confirmDeleteItem,
    confirmDeleteReturn,
    runDeleteItem,
    deletePayment,
    isCancelling,
    isUpdatingFulfillment,
    isUpdatingReturn,
    isDeletingFulfillment,
    isDeletingReturn,
    state,
  };
}
