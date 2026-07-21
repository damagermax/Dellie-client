import React, { useState } from "react";
import PaymentTable from "./PaymentTable";
import { Payment } from "@/types/transaction";
import useToggle from "@/hooks/UseToggle";
import PaymentFormModal from "./PaymentFormModel";
import { useDeleteTransactionActionMutation } from "@/lib/redux/services";
import { ActionDropdown } from "../ui/ActionDropdown";
import { formatDate } from "@/lib/dateUtils";
import { Empty } from "antd";
import { canMutatePayment } from "@/lib/paymentMutationWindow";

export interface PaymentViewItemAction {
  openEditModal: (contact: Payment) => void;
  onDelete: (id: string) => void;
}

interface PaymentsViewProps {
  payments?: Payment[];
  canManage?: boolean;
}

const PaymentView = ({ payments, canManage = true }: PaymentsViewProps) => {
  const [deletePayment] = useDeleteTransactionActionMutation();

  const [selectedPayment, setSelectedPayment] = useState<Payment>();
  const [openPaymentModal, togglePaymentModal] = useToggle();

  const openEditPaymentModal = (payment: Payment) => {
    setSelectedPayment(payment);
    togglePaymentModal();
  };

  const handleDeletePayment = (id: string) => {
    deletePayment(id);
  };

  return (
    <div>
      {openPaymentModal && <PaymentFormModal initialValues={selectedPayment} open={openPaymentModal} toggle={togglePaymentModal} />}
      {payments?.length ? (
        <div className="divide-y divide-gray-200 border-y border-gray-200 md:hidden">
          {payments.map((payment) => (
            <div key={payment.id} className="flex items-start justify-between gap-4 px-4 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium capitalize text-gray-950">{payment.type?.replace(/_/g, " ") || "Payment"}</p>
                  <p className="shrink-0 font-semibold text-gray-950">
                    {payment.currency?.code} {Number(payment.amount || 0).toLocaleString()}
                  </p>
                </div>
                <p className="mt-1 text-sm text-gray-500">{formatDate(payment.date)}{payment.paymentMethod?.name ? ` · ${payment.paymentMethod.name}` : ""}</p>
              </div>
              {canManage && canMutatePayment(payment) ? <ActionDropdown openEditModal={() => openEditPaymentModal(payment)} onDelete={() => handleDeletePayment(payment.id)} /> : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="border-y border-gray-200 py-10 md:hidden"><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No transactions recorded" /></div>
      )}
      <div className="hidden md:block">
        <PaymentTable payments={payments || []} canManage={canManage} onDelete={handleDeletePayment} openEditModal={openEditPaymentModal} />
      </div>
    </div>
  );
};

export default PaymentView;
