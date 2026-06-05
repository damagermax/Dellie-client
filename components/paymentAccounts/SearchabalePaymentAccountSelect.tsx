import useDebouncedValue from "@/hooks/useDebouncedValue";
import { useGetPaymentAccountsQuery } from "@/lib/redux/services";
import { PaymentAccountQueryParams } from "@/types/index";
import { Select } from "antd";
import { useState } from "react";
import { AccountType } from "@/types/payment-account";

import { BsCashCoin } from "react-icons/bs";
import { IoWalletOutline } from "react-icons/io5";
import { RiBankLine } from "react-icons/ri";

interface Props {
  value?: string;
  onChange?: (value?: string) => void;
  onAddPaymentAccount?: () => void;
  allowClear?: boolean;
}

const PaymentAccountIconMap = {
  [AccountType.BANK]: <RiBankLine />,
  [AccountType.DIGITAL_WALLET]: <IoWalletOutline />,
  [AccountType.CASH]: <BsCashCoin />,
};

export function SearchablePaymentAccountSelect({ value, onChange, onAddPaymentAccount, allowClear = false }: Props) {
  const [paymentAccountQuery, setPaymentAccountQuery] = useState<PaymentAccountQueryParams>({});

  const debounceCategoriesQuery = useDebouncedValue(paymentAccountQuery);

  const { data, isLoading } = useGetPaymentAccountsQuery(debounceCategoriesQuery);

  return (
    <Select
      placeholder="Search and select payment accounts"
      showSearch
      labelInValue={false}
      value={value}
      allowClear={allowClear}
      loading={isLoading}
      onChange={(newValues) => {
        onChange?.(newValues);
      }}
      className="w-full"
      filterOption={false}
      onSearch={(value) => setPaymentAccountQuery({ search: value })}
      // notFoundContent={isLoading ? <Spin size="small" /> : <span>No payment accounts found</span>}
      popupRender={(menu) => (
        <>
          {onAddPaymentAccount && (
            <div
              className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-blue-500"
              onMouseDown={(e) => e.preventDefault()} // prevents closing
              onClick={() => {
                onAddPaymentAccount();
              }}
            >
              + Add Payment Account
            </div>
          )}

          {menu}
        </>
      )}
      options={data?.data?.map((account) => ({
        value: account.id,
        label: (
          <div className=" flex items-center gap-x-2">
            <div className="text-lg">{PaymentAccountIconMap[account.type]}</div>
            <p>{account.name}</p>
          </div>
        ),
      }))}
    />
  );
}
