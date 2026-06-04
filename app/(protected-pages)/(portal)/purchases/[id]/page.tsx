"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Modal, message } from "antd";
import PurchaseOrderDetailContent from "@/components/purchase-orders/PurchaseOrderDetailContent";
import PurchaseOrderFormModal from "@/components/purchase-orders/PurchaseOrderFormModal";
import PurchaseOrderLandedCostModal from "@/components/purchase-orders/PurchaseOrderLandedCostModal";
import PurchaseOrderStockOperationModal from "@/components/purchase-orders/PurchaseOrderStockOperationModal";
import TransactionItemEditModal from "@/components/transactions/TransactionItemEditModal";
import PurchaseOrderSummary from "@/components/purchase-orders/PurchaseOrderSummary";
import { purchaseApiError, visiblePurchaseDeleteRestrictions } from "@/components/purchase-orders/purchaseDetailUtils";
import PaymentFormModal from "@/components/payment/PaymentFormModel";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import useToggle from "@/hooks/UseToggle";
import { useDeletePurchaseFulfillmentMutation, useDeletePurchaseMutation, useDeletePurchaseReturnMutation, useGetPurchaseQuery, useUpdatePurchaseFulfillmentMutation, useUpdatePurchaseReturnMutation } from "@/lib/redux/services";
import { TransactionType } from "@/types/transaction";
import { PurchaseReturnEvent, PurchaseStockEvent } from "@/types/purchase";
import { useState } from "react";

export default function PurchaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const [editOpen, toggleEdit] = useToggle();
  const [paymentOpen, togglePayment] = useToggle();
  const [fulfillOpen, toggleFulfill] = useToggle();
  const [returnOpen, toggleReturn] = useToggle();
  const [landedCostOpen, toggleLandedCost] = useToggle();
  const [editingItem, setEditingItem] = useState<{ kind: "fulfillment"; item: PurchaseStockEvent } | { kind: "return"; item: PurchaseReturnEvent } | null>(null);
  const { data: purchase, isLoading, isError, refetch } = useGetPurchaseQuery(id, { refetchOnMountOrArgChange: true });
  const [deletePurchase, { isLoading: isDeleting }] = useDeletePurchaseMutation();
  const [updatePurchaseFulfillment, { isLoading: isUpdatingFulfillment }] = useUpdatePurchaseFulfillmentMutation();
  const [deletePurchaseFulfillment, { isLoading: isDeletingFulfillment }] = useDeletePurchaseFulfillmentMutation();
  const [updatePurchaseReturn, { isLoading: isUpdatingReturn }] = useUpdatePurchaseReturnMutation();
  const [deletePurchaseReturn, { isLoading: isDeletingReturn }] = useDeletePurchaseReturnMutation();

  const confirmDelete = () => {
    if (!purchase || isDeleting) return;

    const restrictions = visiblePurchaseDeleteRestrictions(purchase);
    if (restrictions.length) {
      Modal.warning({
        title: `${purchase.purchaseNumber} cannot be deleted`,
        content: `This purchase cannot be deleted because ${restrictions.join(", ")}.`,
      });
      return;
    }

    Modal.confirm({
      title: `Delete ${purchase.purchaseNumber}?`,
      content: "This purchase will be removed from the list. This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await deletePurchase(purchase.id).unwrap();
          message.success("Purchase deleted.");
          router.replace("/purchases");
        } catch (error) {
          message.error(purchaseApiError(error, "Purchase could not be deleted."));
          throw error;
        }
      },
    });
  };

  if (isLoading) return <AppViewLoader loading />;
  if (isError || !purchase) return <p className="px-8 py-10 text-sm text-red-600">This purchase could not be loaded.</p>;

  const canEdit = !purchase.locked && purchase.receiptStatus !== "received";
  const fulfillableLines = purchase.lineItems.filter((line) => {
    const productType = typeof line.productId === "string" ? line.productType : line.productId.type || line.productType;
    return productType !== "BUNDLE";
  });
  const canReceive = !purchase.locked && fulfillableLines.some((line) => Number(line.quantity) > Number(line.fulfilledQuantity || 0));
  const canReturn = !purchase.locked && fulfillableLines.some((line) => Number(line.fulfilledQuantity || 0) > Number(line.returnedQuantity || 0));
  const currency = purchase.currencyId?.code || "";
  const editingItemName = editingItem ? (typeof editingItem.item.productId === "string" ? "Selected item" : editingItem.item.productId.name || "Selected item") : "";
  const closeItemEditor = () => setEditingItem(null);
  const saveItem = async (values: { quantity: number; date: string }) => {
    if (!purchase || !editingItem) return;

    try {
      if (editingItem.kind === "fulfillment") {
        await updatePurchaseFulfillment({ id: purchase.id, fulfillmentId: editingItem.item.id, ...values }).unwrap();
      } else {
        await updatePurchaseReturn({ id: purchase.id, returnId: editingItem.item.id, ...values }).unwrap();
      }
      message.success("Item updated.");
      closeItemEditor();
      refetch();
    } catch (error) {
      message.error(purchaseApiError(error, "Item could not be updated."));
      throw error;
    }
  };

  const confirmDeleteItem = (kind: "fulfillment" | "return", item: PurchaseStockEvent | PurchaseReturnEvent) => {
    if (!purchase) return;

    Modal.confirm({
      title: `Delete ${kind === "fulfillment" ? "fulfillment" : "return"}?`,
      content: "This action will update stock and cannot be undone.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          if (kind === "fulfillment") {
            await deletePurchaseFulfillment({ id: purchase.id, fulfillmentId: item.id }).unwrap();
          } else {
            await deletePurchaseReturn({ id: purchase.id, returnId: item.id }).unwrap();
          }
          message.success("Item deleted.");
          refetch();
        } catch (error) {
          message.error(purchaseApiError(error, "Item could not be deleted."));
          throw error;
        }
      },
    });
  };

  return (
    <div className="min-h-screen">
      <div className="flex md:min-h-screen min-h-hull flex-col bg-gray-50 lg:flex-row">
        <PurchaseOrderDetailContent
          purchase={purchase}
          currency={currency}
          canEdit={canEdit}
          canReceive={canReceive}
          canReturn={canReturn}
          isDeleting={isDeleting}
          onEdit={toggleEdit}
          onDelete={confirmDelete}
          onReceive={toggleFulfill}
          onReturn={toggleReturn}
          onAddLandedCost={toggleLandedCost}
          onRecordPayment={togglePayment}
          onEditFulfillment={(event) => setEditingItem({ kind: "fulfillment", item: event })}
          onDeleteFulfillment={(event) => confirmDeleteItem("fulfillment", event)}
          onEditReturn={(event) => setEditingItem({ kind: "return", item: event })}
          onDeleteReturn={(event) => confirmDeleteItem("return", event)}
        />
        <PurchaseOrderSummary purchase={purchase} canReceive={canReceive} canReturn={canReturn} onReceive={toggleFulfill} onReturn={toggleReturn} onAddLandedCost={toggleLandedCost} onRecordPayment={togglePayment} />
      </div>

      {editOpen && <PurchaseOrderFormModal open={editOpen} toggle={toggleEdit} purchase={purchase} onSaved={refetch} />}
      {fulfillOpen && <PurchaseOrderStockOperationModal mode="fulfill" open={fulfillOpen} toggle={toggleFulfill} purchase={purchase} onSaved={refetch} />}
      {returnOpen && <PurchaseOrderStockOperationModal mode="return" open={returnOpen} toggle={toggleReturn} purchase={purchase} onSaved={refetch} />}
      {landedCostOpen && <PurchaseOrderLandedCostModal open={landedCostOpen} toggle={toggleLandedCost} purchase={purchase} onSaved={refetch} />}
      {paymentOpen && (
        <PaymentFormModal
          type={TransactionType.PAYMENT}
          open={paymentOpen}
          toggle={() => {
            togglePayment();
            refetch();
          }}
          linkTransaction={{ id: purchase.id, rate: purchase.rate || 1, currencyId: purchase.currencyId?.id || "" }}
        />
      )}
      {editingItem && (
        <TransactionItemEditModal
          open={Boolean(editingItem)}
          toggle={closeItemEditor}
          title={`Edit ${editingItem.kind === "fulfillment" ? "Fulfillment" : "Return"}`}
          description={editingItemName}
          quantityLabel={`Current quantity: ${Number(editingItem.item.quantity || 0).toLocaleString()}`}
          quantity={Number(editingItem.item.quantity || 0)}
          dateLabel={editingItem.kind === "fulfillment" ? "Received at" : "Returned at"}
          initialDate={editingItem.kind === "fulfillment" ? editingItem.item.fulfilledAt : editingItem.item.returnedAt}
          loading={isUpdatingFulfillment || isDeletingFulfillment || isUpdatingReturn || isDeletingReturn}
          onSubmit={saveItem}
        />
      )}
    </div>
  );
}
