import React, { useState } from "react";
import PaymentTable from "./PaymentTable";
import { Payment } from "@/types/transaction";
import useToggle from "@/hooks/UseToggle";
import PaymentFormModal from "./PaymentFormModel";
import { useDeleteTransactionActionMutation } from "@/lib/redux/services";

export interface PaymentViewItemAction {
  openEditModal: (contact: Payment) => void;
  onDelete: (id: string) => void;
}

interface PaymentsViewProps {
  query?: any;
  payments?: Payment[];
}

const PaymentView = ({ payments }: PaymentsViewProps) => {
  const [deletePayment, { isLoading }] = useDeleteTransactionActionMutation();

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
      <PaymentTable payments={payments!!} onDelete={handleDeletePayment} openEditModal={openEditPaymentModal} />
    </div>
  );
};

export default PaymentView;
