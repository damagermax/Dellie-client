"use client";

import { Dropdown, InputNumber, type MenuProps } from "antd";

import type { PurchaseDiscountType } from "@/types/index";

type PurchaseSummaryPanelProps = {
  currency?: string;
  discount: { discountValue: number; discountType: PurchaseDiscountType };
  discountOptions: MenuProps["items"];
  formatMoney: (amount: number) => string;
  isDifferentProductTax: boolean;
  onChangeDiscountType: (value: PurchaseDiscountType) => void;
  onChangeDiscountValue: (value: number) => void;
  onOpenTaxSelector: () => void;
  rate: number;
  storeCurrencyCode: string;
  summary: {
    itemsSubTotal: number;
    globalDiscount: number;
    subTotal: number;
    total: number;
    baseTotal: number;
    taxSummary: Array<{ name: string; amount: number }>;
  };
};

export function PurchaseSummaryPanel({ currency, discount, discountOptions, formatMoney, isDifferentProductTax, onChangeDiscountType, onChangeDiscountValue, onOpenTaxSelector, rate, storeCurrencyCode, summary }: PurchaseSummaryPanelProps) {
  return (
    <div className="mt-8 grid w-full grid-cols-1 gap-4 px-5 pb-4 xl:grid-cols-3">
      <div className="space-y-2 bg-gray-50 p-5 text-right xl:col-start-3 xl:col-end-4">
        <SummaryLine label="Items Total" value={formatMoney(summary.itemsSubTotal)} />
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 inline-block">Discount </span>
            <InputNumber min={0} controls={false} className="!w-[60px]" variant="underlined" value={discount.discountValue} onChange={(value) => onChangeDiscountValue(Number(value || 0))} />
            <Dropdown menu={{ items: discountOptions, onClick: ({ key }) => onChangeDiscountType(key as PurchaseDiscountType) }}>
              <p className="cursor-pointer">{discount.discountType === "percent" ? "%" : currency || storeCurrencyCode || "Amount"}</p>
            </Dropdown>
          </div>
          <p>{formatMoney(summary.globalDiscount)}</p>
        </div>
        <SummaryLine label="Subtotal" value={formatMoney(summary.subTotal)} />
        {!isDifferentProductTax ? (
          <div className="flex justify-between gap-6 ">
            <span>Tax</span>
            <span className="cursor-pointer text-blue-500 hover:underline" onClick={onOpenTaxSelector}>
              Add Tax
            </span>
          </div>
        ) : null}
        {summary.taxSummary.map((tax) => (
          <SummaryLine key={tax.name} label={tax.name} value={formatMoney(tax.amount)} />
        ))}
        <div className="flex justify-between gap-6 border-y border-gray-300 py-2 font-medium">
          <span>Total</span>
          <span>{formatMoney(summary.total)}</span>
        </div>
        {rate !== 1 ? <SummaryLine label="Base Total" value={`${storeCurrencyCode ? `${storeCurrencyCode} ` : ""}${summary.baseTotal.toFixed(2)}`.trim()} subtle /> : null}
      </div>
    </div>
  );
}

function SummaryLine({ label, value, subtle = false }: { label: string; value: string; subtle?: boolean }) {
  return (
    <div className={`flex justify-between gap-6 ${subtle ? "text-xs text-gray-500" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
