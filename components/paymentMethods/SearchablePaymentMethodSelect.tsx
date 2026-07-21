import useDebouncedValue from "@/hooks/useDebouncedValue";
import { useGetPaymentMethodsQuery } from "@/lib/redux/services";
import { PaymentMethodsQueryParams } from "@/types/payment-method";
import { Select } from "antd";
import { useState } from "react";

interface Props {
  value?: string;
  onChange?: (value?: string) => void;
  allowClear?: boolean;
}

export function SearchablePaymentMethodSelect({ value, onChange, allowClear = false }: Props) {
  const [paymentMethodQuery, setPaymentMethodQuery] = useState<PaymentMethodsQueryParams>({ status: "active" });
  const debouncedQuery = useDebouncedValue(paymentMethodQuery);
  const { data, isLoading } = useGetPaymentMethodsQuery(debouncedQuery);

  return (
    <Select
      placeholder="Search and select payment method"
      showSearch
      labelInValue={false}
      value={value}
      allowClear={allowClear}
      loading={isLoading}
      onChange={(newValue) => {
        onChange?.(newValue);
      }}
      className="w-full"
      filterOption={false}
      onSearch={(value) => setPaymentMethodQuery({ search: value, status: "active" })}
      options={data?.map((method) => ({
        value: method.id,
        label: method.name,
      }))}
    />
  );
}
