"use client";

import { AppNotFoundView } from "@/components/ui/AppNotFoundView";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import { ActionDropdown } from "@/components/ui/ActionDropdown";
import { useDeletePaymentMethodMutation, useGetPaymentMethodsQuery } from "@/lib/redux/services";
import { PaymentMethod } from "@/types/payment-method";

interface PaymentMethodsListProps {
  onSelect: (paymentMethod: PaymentMethod) => void;
}

export default function PaymentMethodsList({ onSelect }: PaymentMethodsListProps) {
  const { data: paymentMethods, isLoading } = useGetPaymentMethodsQuery();
  const [deletePaymentMethod] = useDeletePaymentMethodMutation();

  const handleDelete = async (paymentMethodId: string) => {
    if (!window.confirm("Delete this payment method?")) return;
    await deletePaymentMethod(paymentMethodId).unwrap();
  };

  return (
    <div className="pb-32">
      <AppViewLoader loading={isLoading} />
      <AppNotFoundView dataLength={paymentMethods?.length || 0} loading={isLoading} query={{}} entity="Payment Method" />

      <div className="px-5">
        {paymentMethods?.map((paymentMethod, index) => (
          <div key={paymentMethod.id} className={`flex items-center justify-between gap-4 py-4 border-b border-blue-100 ${index !== paymentMethods.length - 1 ? "" : ""}`}>
            <button type="button" className="flex min-w-0 flex-1 flex-col items-start text-left" onClick={() => onSelect(paymentMethod)}>
              <h3 className="truncate font-medium text-gray-800">{paymentMethod.name}</h3>
            </button>

            <ActionDropdown openEditModal={() => onSelect(paymentMethod)} onDelete={() => handleDelete(paymentMethod.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}
