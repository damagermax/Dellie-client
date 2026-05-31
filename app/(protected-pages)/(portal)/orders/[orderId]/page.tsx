"use client";

import { useParams, useRouter } from "next/navigation";
import { Modal, message } from "antd";
import PaymentFormModal from "@/components/payment/PaymentFormModel";
import SaleDetailContent from "@/components/orders/SaleDetailContent";
import SaleFormModal from "@/components/orders/SaleFormModal";
import SaleSummary from "@/components/orders/SaleSummary";
import SaleShareDocumentModal, { SaleDocumentType } from "@/components/orders/SaleShareDocumentModal";
import SaleStockOperationModal from "@/components/orders/SaleStockOperationModal";
import { saleApiError, visibleSaleDeleteRestrictions } from "@/components/orders/saleUtils";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import useToggle from "@/hooks/UseToggle";
import { useDeleteSaleMutation, useGetSaleQuery } from "@/lib/redux/services";
import { TransactionType } from "@/types/transaction";
import { useState } from "react";

export default function SaleDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const [editOpen, toggleEdit] = useToggle();
  const [paymentOpen, togglePayment] = useToggle();
  const [fulfillOpen, toggleFulfill] = useToggle();
  const [returnOpen, toggleReturn] = useToggle();
  const [shareDocumentType, setShareDocumentType] = useState<SaleDocumentType>();
  const { data: sale, isLoading, isError, refetch } = useGetSaleQuery(orderId, { refetchOnMountOrArgChange: true });
  const [deleteSale, { isLoading: isDeleting }] = useDeleteSaleMutation();

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
    </div>
  );
}
