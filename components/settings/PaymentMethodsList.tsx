"use client";

import { AppNotFoundView } from "@/components/ui/AppNotFoundView";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import { ActionDropdown, DropdownItemLabel } from "@/components/ui/ActionDropdown";
import { useDeletePaymentMethodMutation, useGetPaymentMethodsQuery, useUpdatePaymentMethodMutation } from "@/lib/redux/services";
import { PaymentMethod } from "@/types/payment-method";
import { Tag } from "antd";
import { IoCheckmarkCircleOutline } from "react-icons/io5";

interface PaymentMethodsListProps {
  onSelect: (paymentMethod: PaymentMethod) => void;
}

function isProtectedCashMethod(paymentMethod: PaymentMethod) {
  return Boolean(paymentMethod.isSystem) || paymentMethod.name.trim().toLowerCase() === "cash";
}

export default function PaymentMethodsList({ onSelect }: PaymentMethodsListProps) {
  const { data: paymentMethods, isLoading } = useGetPaymentMethodsQuery();
  const [deletePaymentMethod] = useDeletePaymentMethodMutation();
  const [updatePaymentMethod] = useUpdatePaymentMethodMutation();

  const handleDelete = async (paymentMethodId: string) => {
    if (!window.confirm("Delete this payment method?")) return;
    await deletePaymentMethod(paymentMethodId).unwrap();
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    await updatePaymentMethod({ id: paymentMethodId, isDefault: true }).unwrap();
  };

  const handleActivate = async (paymentMethodId: string) => {
    await updatePaymentMethod({ id: paymentMethodId, status: "active" }).unwrap();
  };

  const handleDeactivate = async (paymentMethodId: string) => {
    await updatePaymentMethod({ id: paymentMethodId, status: "inactive" }).unwrap();
  };

  return (
    <div className="pb-32">
      <AppViewLoader loading={isLoading} />
      <AppNotFoundView dataLength={paymentMethods?.length || 0} loading={isLoading} query={{}} entity="Payment Method" />

      <div className="px-5">
        {paymentMethods?.map((paymentMethod, index) => (
          <div key={paymentMethod.id} className={`flex items-center justify-between gap-4 py-4 border-b border-blue-100 ${index !== paymentMethods.length - 1 ? "" : ""}`}>
            <button type="button" className="flex min-w-0 flex-1 flex-col items-start text-left disabled:cursor-default" onClick={() => (isProtectedCashMethod(paymentMethod) ? undefined : onSelect(paymentMethod))} disabled={isProtectedCashMethod(paymentMethod)}>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="truncate font-medium text-gray-800">{paymentMethod.name}</h3>
                {isProtectedCashMethod(paymentMethod) ? <Tag color="gold" className="!mr-0 !rounded-full !px-1.5 !py-0 !text-[10px] !leading-4">System</Tag> : null}
                {paymentMethod.isDefault ? <Tag color="blue" className="!mr-0 !rounded-full !px-1.5 !py-0 !text-[10px] !leading-4">Default</Tag> : null}
                <Tag color={paymentMethod.status === "active" ? "green" : "red"} className="!mr-0 !rounded-full !px-1.5 !py-0 !text-[10px] !leading-4">
                  {paymentMethod.status}
                </Tag>
              </div>
            </button>

            <ActionDropdown
              openEditModal={isProtectedCashMethod(paymentMethod) ? undefined : () => onSelect(paymentMethod)}
              onDelete={isProtectedCashMethod(paymentMethod) ? undefined : () => handleDelete(paymentMethod.id)}
              onActivate={() => handleActivate(paymentMethod.id)}
              onDeactivate={() => handleDeactivate(paymentMethod.id)}
              status={paymentMethod.status}
              menu={{
                items: paymentMethod.isDefault || isProtectedCashMethod(paymentMethod)
                  ? []
                  : [
                      {
                        key: "set-default",
                        label: <DropdownItemLabel icon={<IoCheckmarkCircleOutline size={15} />} text="Set Default" />,
                        onClick: () => handleSetDefault(paymentMethod.id),
                      },
                    ],
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
