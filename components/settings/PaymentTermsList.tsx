"use client";

import { AppNotFoundView } from "@/components/ui/AppNotFoundView";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import { ActionDropdown } from "@/components/ui/ActionDropdown";
import { useDeletePaymentTermMutation, useGetPaymentTermsQuery } from "@/lib/redux/services";
import { PaymentTerm } from "@/types/payment-term";

interface PaymentTermsListProps {
  onSelect: (paymentTerm: PaymentTerm) => void;
}

export default function PaymentTermsList({ onSelect }: PaymentTermsListProps) {
  const { data: paymentTerms, isLoading } = useGetPaymentTermsQuery();
  const [deletePaymentTerm] = useDeletePaymentTermMutation();

  const handleDelete = async (paymentTermId: string) => {
    if (!window.confirm("Delete this payment term?")) return;
    await deletePaymentTerm(paymentTermId).unwrap();
  };

  return (
    <div className="pb-32">
      <AppViewLoader loading={isLoading} />
      <AppNotFoundView dataLength={paymentTerms?.length || 0} loading={isLoading} query={{}} entity="Payment Term" />

      <div className="px-5">
        {paymentTerms?.map((paymentTerm, index) => (
          <div key={paymentTerm.id} className={`flex items-center justify-between gap-4 py-5 border-b border-blue-100 ${index !== paymentTerms.length - 1 ? "" : ""}`}>
            <button type="button" className="flex min-w-0 flex-1 flex-col items-start text-left" onClick={() => onSelect(paymentTerm)}>
              <h3 className="truncate font-medium text-gray-800">{paymentTerm.name}</h3>
              <p className="mt-1 text-xs text-gray-500">{paymentTerm.days === 0 ? "Due on receipt" : `${paymentTerm.days} days`}</p>
            </button>

            <ActionDropdown openEditModal={() => onSelect(paymentTerm)} onDelete={() => handleDelete(paymentTerm.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}
