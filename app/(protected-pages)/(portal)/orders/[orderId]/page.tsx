"use client";

import { useParams, useRouter } from "next/navigation";
import { Modal, message } from "antd";
import PaymentFormModal from "@/components/payment/PaymentFormModel";
import SaleDetailContent from "@/components/orders/SaleDetailContent";
import SaleFormModal from "@/components/orders/SaleFormModal";
import SaleSummary from "@/components/orders/SaleSummary";
import SaleShareDocumentModal, { SaleDocumentType } from "@/components/orders/SaleShareDocumentModal";
import SaleStockOperationModal from "@/components/orders/SaleStockOperationModal";
import TransactionItemEditModal from "@/components/transactions/TransactionItemEditModal";
import { saleApiError, visibleSaleDeleteRestrictions } from "@/components/orders/saleUtils";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import useToggle from "@/hooks/UseToggle";
import { useDeleteSaleFulfillmentMutation, useDeleteSaleMutation, useDeleteSaleReturnMutation, useGetSaleQuery, useUpdateSaleFulfillmentMutation, useUpdateSaleReturnMutation } from "@/lib/redux/services";
import { TransactionType } from "@/types/transaction";
import { PurchaseReturnEvent, PurchaseStockEvent } from "@/types/purchase";
import { useState } from "react";

export default function SaleDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const [editOpen, toggleEdit] = useToggle();
  const [paymentOpen, togglePayment] = useToggle();
  const [fulfillOpen, toggleFulfill] = useToggle();
  const [returnOpen, toggleReturn] = useToggle();
  const [shareDocumentType, setShareDocumentType] = useState<SaleDocumentType>();
  const [editingItem, setEditingItem] = useState<{ kind: "fulfillment"; item: PurchaseStockEvent } | { kind: "return"; item: PurchaseReturnEvent } | null>(null);
  const { data: sale, isLoading, isError, refetch } = useGetSaleQuery(orderId, { refetchOnMountOrArgChange: true });
  const [deleteSale, { isLoading: isDeleting }] = useDeleteSaleMutation();
  const [updateSaleFulfillment, { isLoading: isUpdatingFulfillment }] = useUpdateSaleFulfillmentMutation();
  const [deleteSaleFulfillment, { isLoading: isDeletingFulfillment }] = useDeleteSaleFulfillmentMutation();
  const [updateSaleReturn, { isLoading: isUpdatingReturn }] = useUpdateSaleReturnMutation();
  const [deleteSaleReturn, { isLoading: isDeletingReturn }] = useDeleteSaleReturnMutation();

  const confirmDelete = () => {
    if (!sale || isDeleting) return;
    const restrictions = visibleSaleDeleteRestrictions(sale);
    if (restrictions.length) {
      Modal.warning({
        title: `${sale.saleNumber} cannot be deleted`,
        content: `This sale cannot be deleted because ${restrictions.join(", ")}.`,
      });
      return;
    }

    Modal.confirm({
      title: `Delete ${sale.saleNumber}?`,
      content: "Stock deducted by this sale will be restored. This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteSale(sale.id).unwrap();
          message.success("Sale deleted and stock restored.");
          router.replace("/orders");
        } catch (error) {
          message.error(saleApiError(error, "Sale could not be deleted."));
          throw error;
        }
      },
    });
  };

  if (isLoading) return <AppViewLoader loading />;
  if (isError || !sale) return <p className="px-8 py-10 text-sm text-red-600">This sale could not be loaded.</p>;

  const canEdit = !sale.locked && sale.receiptStatus !== "received" && !sale.returnedItems?.length;
  const canFulfill = !sale.locked && sale.lineItems.some((line) => Number(line.quantity) > Number(line.fulfilledQuantity || 0));
  const canReturn = !sale.locked && sale.lineItems.some((line) => Number(line.fulfilledQuantity || 0) > Number(line.returnedQuantity || 0));
  const editingItemName = editingItem ? (typeof editingItem.item.productId === "string" ? "Selected item" : editingItem.item.productId.name || "Selected item") : "";
  const closeItemEditor = () => setEditingItem(null);
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

  const confirmDeleteItem = (kind: "fulfillment" | "return", item: PurchaseStockEvent | PurchaseReturnEvent) => {
    if (!sale) return;

    Modal.confirm({
      title: `Delete ${kind === "fulfillment" ? "fulfillment" : "return"}?`,
      content: "This action will update stock and cannot be undone.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          if (kind === "fulfillment") {
            await deleteSaleFulfillment({ id: sale.id, fulfillmentId: item.id }).unwrap();
          } else {
            await deleteSaleReturn({ id: sale.id, returnId: item.id }).unwrap();
          }
          message.success("Item deleted.");
          refetch();
        } catch (error) {
          message.error(saleApiError(error, "Item could not be deleted."));
          throw error;
        }
      },
    });
  };

  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen flex-col bg-gray-50 lg:flex-row">
        <SaleDetailContent
          sale={sale}
          currency={sale.currencyId?.code || ""}
          canEdit={canEdit}
          canFulfill={canFulfill}
          canReturn={canReturn}
          isDeleting={isDeleting}
          onEdit={toggleEdit}
          onDelete={confirmDelete}
          onFulfill={toggleFulfill}
          onReturn={toggleReturn}
          onRecordPayment={togglePayment}
          onShare={setShareDocumentType}
          onEditFulfillment={(event) => setEditingItem({ kind: "fulfillment", item: event })}
          onDeleteFulfillment={(event) => confirmDeleteItem("fulfillment", event)}
          onEditReturn={(event) => setEditingItem({ kind: "return", item: event })}
          onDeleteReturn={(event) => confirmDeleteItem("return", event)}
        />
        <SaleSummary sale={sale} />
      </div>

      {editOpen && <SaleFormModal open={editOpen} toggle={toggleEdit} sale={sale} onSaved={refetch} />}
      {fulfillOpen && <SaleStockOperationModal mode="fulfill" open={fulfillOpen} toggle={toggleFulfill} sale={sale} onSaved={refetch} />}
      {returnOpen && <SaleStockOperationModal mode="return" open={returnOpen} toggle={toggleReturn} sale={sale} onSaved={refetch} />}
      {shareDocumentType && (
        <SaleShareDocumentModal
          open={Boolean(shareDocumentType)}
          toggle={() => setShareDocumentType(undefined)}
          sale={sale}
          type={shareDocumentType}
        />
      )}
      {paymentOpen && (
        <PaymentFormModal
          type={TransactionType.PAYMENT}
          open={paymentOpen}
          toggle={() => {
            togglePayment();
            refetch();
          }}
          linkTransaction={{ id: sale.id, rate: sale.rate || 1, currencyId: sale.currencyId?.id || "" }}
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
          dateLabel={editingItem.kind === "fulfillment" ? "Fulfilled at" : "Returned at"}
          initialDate={editingItem.kind === "fulfillment" ? editingItem.item.fulfilledAt : editingItem.item.returnedAt}
          loading={isUpdatingFulfillment || isDeletingFulfillment || isUpdatingReturn || isDeletingReturn}
          onSubmit={saveItem}
        />
      )}
    </div>
  );
}
