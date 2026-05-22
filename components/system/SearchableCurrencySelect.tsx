import useDebouncedValue from "@/hooks/useDebouncedValue";
import { useGetCurrenciesQuery, useGetCurrencyQuery } from "@/lib/redux/services";
import { Currency } from "@/types/system";
import { Select, Spin } from "antd";
import { useMemo, useState } from "react";
import { HiGlobeAmericas } from "react-icons/hi2";

interface Props {
  value?: string;
  onChange?: (value: string) => void;
  variant?: "outlined" | "borderless" | "filled" | "underlined" | undefined;
  disabled?: boolean;
}

export function SearchableCurrenciesSelect({ value, onChange, variant, disabled }: Props) {
  const [currenciesQuery, setCurrenciesQuery] = useState<{ search?: string }>({});

  const debounceCurrenciesQuery = useDebouncedValue(currenciesQuery);

  const { data: currency, isLoading: currencyLoading } = useGetCurrencyQuery(value as string, { skip: !value });
  const { data: currencies, isSuccess, isLoading } = useGetCurrenciesQuery(debounceCurrenciesQuery);

  const loading = currencyLoading || isLoading;

  const options = useMemo(() => {
    const list =
      currencies?.data?.map((c: Currency) => ({
        value: c.id,
        label: (
          <div className="flex items-center gap-x-1">
            <HiGlobeAmericas />
            <p>
              {c.name} ({c.code})
            </p>
          </div>
        ),
      })) ?? [];

    if (currency && value) {
      const exists = list.find((opt) => opt.value === value);

      if (!exists) {
        list.unshift({
          value: currency.id,
          label: (
            <div className="flex items-center gap-x-1">
              <HiGlobeAmericas />
              <p>
                {currency.name} ({currency.code})
              </p>
            </div>
          ),
        });
      }
    }

    return list;
  }, [currencies, currency, value]);

  return (
    <Select
      disabled={disabled}
      variant={variant}
      loading={loading}
      placeholder="Search and select currency"
      showSearch
      labelInValue={false}
      value={value}
      onChange={(newValues) => {
        onChange?.(newValues);
      }}
      className="w-full"
      filterOption={false}
      onSearch={(value) => setCurrenciesQuery({ search: value })}
      notFoundContent={loading ? <Spin size="small" /> : "No results found"}
      options={options}
    />
  );
}
