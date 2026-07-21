"use client";

import { useParams } from "next/navigation";
import { Modal, message } from "antd";
import { useState } from "react";
import { useSelector } from "react-redux";

import useToggle from "@/hooks/UseToggle";
import { usePermissions } from "@/hooks/usePermissions";
import {
  useCloseSaleMutation,
  useConvertSaleQuoteMutation,
  useDeleteSaleFulfillmentMutation,
  useDeleteSaleMutation,
  useDeleteSaleReturnMutation,
  useDeleteTransactionActionMutation,
  useGetSaleQuery,
  useReopenSaleMutation,
  useUpdateSaleFulfillmentMutation,
  useUpdateSaleReturnMutation,
} from "@/lib/redux/services";
import { RootState } from "@/lib/store";
import { PurchaseReturnEvent, PurchaseStockEvent } from "@/types/purchase";
import { StorePermission } from "@/types/store-access";
import { Payment, TransactionType } from "@/types/transaction";

import { saleApiError, saleDocumentNumber, visibleSaleDeleteRestrictions } from "@/components/orders/saleUtils";
import type { SaleDocumentType } from "@/components/orders/SaleShareDocumentModal";
import { deriveSaleDetailState } from "./saleDetailControllerHelpers";

type EditableItem = { kind: "fulfillment"; item: PurchaseStockEvent } | { kind: "return"; item: PurchaseReturnEvent };

export function useSaleDetailController() {
  const { orderId } = useParams<{ orderId: string }>();
  const { ready, hasAnyPermission, hasPermission } = usePermissions();
  const [editOpen, toggleEdit] = useToggle();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [fulfillOpen, toggleFulfill] = useToggle();
  const [returnOpen, toggleReturn] = useToggle();
  const [shareDocumentType, setShareDocumentType] = useState<SaleDocumentType>();
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [paymentType, setPaymentType] = useState(TransactionType.PAYMENT);
  const [selectedPayment, setSelectedPayment] = useState<Payment>();
  const [editingItem, setEditingItem] = useState<EditableItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<EditableItem | null>(null);

  const canViewSale = hasAnyPermission([StorePermission.SALES_VIEW, StorePermission.SALES_MANAGE]);
  const canManageSale = hasPermission(StorePermission.SALES_MANAGE);
  const { data: sale, isLoading, isError, refetch } = useGetSaleQuery(orderId, { skip: !orderId || !ready || !canViewSale, refetchOnMountOrArgChange: true });
  const [cancelSale, { isLoading: isCancelling }] = useDeleteSaleMutation();
  const [reopenSale, { isLoading: isReopening }] = useReopenSaleMutation();
  const [closeSale] = useCloseSaleMutation();
  const [convertSaleQuote, { isLoading: isConverting }] = useConvertSaleQuoteMutation();
  const [updateSaleFulfillment, { isLoading: isUpdatingFulfillment }] = useUpdateSaleFulfillmentMutation();
  const [updateSaleReturn, { isLoading: isUpdatingReturn }] = useUpdateSaleReturnMutation();
  const [deleteSaleFulfillment, { isLoading: isDeletingFulfillment }] = useDeleteSaleFulfillmentMutation();
  const [deleteSaleReturn, { isLoading: isDeletingReturn }] = useDeleteSaleReturnMutation();
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

  const closeCancelConfirm = () => setCancelConfirmOpen(false);
  const closeItemEditor = () => setEditingItem(null);
  const closeDeleteDialog = () => setDeletingItem(null);

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

  const runClose = async () => {
    if (!sale) return;

    try {
      await closeSale(sale.id).unwrap();
      message.success("Sale closed.");
      refetch();
    } catch (error) {
      message.error(saleApiError(error, "Sale could not be closed."));
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

  const saveItem = async (values: { quantity: number; date: string }) => {
    if (!sale || !editingItem) return;

    try {
      if (editingItem.kind === "fulfillment") {
        await updateSaleFulfillment({ id: sale.id, fulfillmentId: editingItem.item.id, ...values }).unwrap();
      } else {
        await updateSaleReturn({ id: sale.id, returnId: editingItem.item.id, ...values }).unwrap();
      }
      message.success("Item updated.");
      closeItemEditor();
      refetch();
    } catch (error) {
      message.error(saleApiError(error, "Item could not be updated."));
      throw error;
    }
  };

  const confirmDeleteItem = (item: PurchaseStockEvent) => setDeletingItem({ kind: "fulfillment", item });
  const confirmDeleteReturn = (item: PurchaseReturnEvent) => setDeletingItem({ kind: "return", item });

  const runDeleteItem = async () => {
    if (!sale || !deletingItem) return;

    try {
      if (deletingItem.kind === "fulfillment") {
        await deleteSaleFulfillment({ id: sale.id, fulfillmentId: deletingItem.item.id }).unwrap();
      } else {
        await deleteSaleReturn({ id: sale.id, returnId: deletingItem.item.id }).unwrap();
      }
      message.success("Item deleted.");
      closeDeleteDialog();
      refetch();
    } catch (error) {
      message.error(saleApiError(error, "Item could not be deleted."));
      throw error;
    }
  };

  const state = sale ? deriveSaleDetailState({ sale, editingItem, deletingItem, featureSettings }) : null;

  return {
    ready,
    canViewSale,
    canManageSale,
    sale,
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
    shareDocumentType,
    setShareDocumentType,
    cancelConfirmOpen,
    closeCancelConfirm,
    confirmCancel,
    runCancel,
    runReopen,
    runClose,
    runConvert,
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
    isConverting,
    isUpdatingFulfillment,
    isUpdatingReturn,
    isDeletingFulfillment,
    isDeletingReturn,
    state,
  };
}
