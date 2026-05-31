"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Modal, message } from "antd";
import PurchaseOrderDetailContent from "@/components/purchase-orders/PurchaseOrderDetailContent";
import PurchaseOrderFormModal from "@/components/purchase-orders/PurchaseOrderFormModal";
import PurchaseOrderLandedCostModal from "@/components/purchase-orders/PurchaseOrderLandedCostModal";
import PurchaseOrderStockOperationModal from "@/components/purchase-orders/PurchaseOrderStockOperationModal";
import PurchaseOrderSummary from "@/components/purchase-orders/PurchaseOrderSummary";
import { purchaseApiError, visiblePurchaseDeleteRestrictions } from "@/components/purchase-orders/purchaseDetailUtils";
import PaymentFormModal from "@/components/payment/PaymentFormModel";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import useToggle from "@/hooks/UseToggle";
import { useDeletePurchaseMutation, useGetPurchaseQuery } from "@/lib/redux/services";
import { TransactionType } from "@/types/transaction";

export default function PurchaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const [editOpen, toggleEdit] = useToggle();
  const [paymentOpen, togglePayment] = useToggle();
  const [fulfillOpen, toggleFulfill] = useToggle();
  const [returnOpen, toggleReturn] = useToggle();
  const [landedCostOpen, toggleLandedCost] = useToggle();
  const { data: purchase, isLoading, isError, refetch } = useGetPurchaseQuery(id, { refetchOnMountOrArgChange: true });
  const [deletePurchase, { isLoading: isDeleting }] = useDeletePurchaseMutation();

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
  const stockLines = purchase.lineItems.filter((line) => typeof line.productId !== "string" && line.productId.type === "STOCK");
  const canReceive = !purchase.locked && stockLines.some((line) => Number(line.quantity) > Number(line.fulfilledQuantity || 0));
  const canReturn = !purchase.locked && stockLines.some((line) => Number(line.fulfilledQuantity || 0) > Number(line.returnedQuantity || 0));
  const currency = purchase.currencyId?.code || "";

  return (
    <div className="min-h-screen">
      <div className="flex min-h-hull flex-col bg-gray-50 lg:flex-row">
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
    </div>
  );
}
