"use client";

import { Form, InputNumber, type FormItemProps as AntFormItemProps } from "antd";
import { useEffect, useMemo } from "react";
import { useGetCurrencyQuery } from "@/lib/redux/services";

interface ExchangeRateFormItemProps {
  name: string;
  label?: string;
  className?: string;
  currencyFieldName?: string;
  rules?: AntFormItemProps["rules"];
  min?: number;
}

export function ExchangeRateFormItem({
  name,
  label = "Exchange Rate",
  className,
  currencyFieldName = "currencyId",
  rules,
  min = 0.000001,
}: ExchangeRateFormItemProps) {
  const form = Form.useFormInstance();
  const selectedCurrencyId = Form.useWatch(currencyFieldName, form) as string | undefined;
  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : {};

  const storeCurrencyId = user?.store?.currencyId as string | undefined;
  const fallbackStoreCurrencyCode = user?.store?.currency?.code || user?.store?.currencyCode || "";
  const { data: selectedCurrency } = useGetCurrencyQuery(selectedCurrencyId as string, { skip: !selectedCurrencyId });
  const { data: storeCurrency } = useGetCurrencyQuery(storeCurrencyId as string, { skip: !storeCurrencyId || Boolean(fallbackStoreCurrencyCode) });

  const storeCurrencyCode = fallbackStoreCurrencyCode || storeCurrency?.code || "";
  const selectedCurrencyCode = useMemo(() => {
    if (selectedCurrencyId && storeCurrencyId && selectedCurrencyId === storeCurrencyId) {
      return storeCurrencyCode;
    }

    return selectedCurrency?.code || storeCurrencyCode;
  }, [selectedCurrency?.code, selectedCurrencyId, storeCurrencyCode, storeCurrencyId]);

  const isStoreCurrency = !selectedCurrencyId || !storeCurrencyId || selectedCurrencyId === storeCurrencyId;

  useEffect(() => {
    if (!isStoreCurrency) return;
    if (form.getFieldValue(name) === 1) return;
    form.setFieldValue(name, 1);
  }, [form, isStoreCurrency, name]);

  return (
    <Form.Item label={label} className={className} name={name} rules={rules}>
      <InputNumber
        className="!w-full"
        min={min}
        controls={false}
        disabled={isStoreCurrency}
        prefix={`1 ${selectedCurrencyCode || storeCurrencyCode} =`}
        suffix={storeCurrencyCode || selectedCurrencyCode}
        placeholder="1"
      />
    </Form.Item>
  );
}
