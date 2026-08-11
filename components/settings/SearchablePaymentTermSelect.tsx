"use client";

import useDebouncedValue from "@/hooks/useDebouncedValue";
import { useGetPaymentTermsQuery } from "@/lib/redux/services";
import type { PaymentTerm, PaymentTermsQueryParams } from "@/types/payment-term";
import { Select, Spin } from "antd";
import { useState } from "react";

interface SearchablePaymentTermSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  onAddPaymentTerm?: () => void;
}

export function SearchablePaymentTermSelect({ value, onChange, onAddPaymentTerm }: SearchablePaymentTermSelectProps) {
  const [query, setQuery] = useState<PaymentTermsQueryParams>({});
  const debouncedQuery = useDebouncedValue(query);
  const { data: paymentTerms, isLoading } = useGetPaymentTermsQuery(debouncedQuery);

  return (
    <Select
      placeholder="Payment Term"
      showSearch
      labelInValue={false}
      value={value}
      className="w-full"
      filterOption={false}
      onChange={onChange}
      onSearch={(search) => setQuery({ search })}
      notFoundContent={isLoading ? <Spin size="small" /> : "No payment terms found"}
      dropdownRender={(menu) => (
        <>
          {onAddPaymentTerm ? (
            <div
              className="cursor-pointer px-3 py-2 text-blue-500 hover:bg-gray-100"
              onMouseDown={(e) => e.preventDefault()}
              onClick={onAddPaymentTerm}
            >
              + Add Payment Term
            </div>
          ) : null}
          {menu}
        </>
      )}
      options={(paymentTerms || []).map((paymentTerm: PaymentTerm) => ({
        value: paymentTerm.code,
        label: (
          <div className="flex items-center justify-between gap-3">
            <span>{paymentTerm.name}</span>
            <span className="text-xs text-gray-400">{paymentTerm.days === 0 ? "Due on receipt" : `${paymentTerm.days} days`}</span>
          </div>
        ),
      }))}
    />
  );
}
