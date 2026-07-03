"use client";

import { Dropdown, InputNumber, type MenuProps } from "antd";

import type { PurchaseDiscountType } from "@/types/index";

type SaleSummaryPanelProps = {
  currency?: string;
  deliveryFee: number;
  differentProductTax: boolean;
  discount: { discountValue: number; discountType: PurchaseDiscountType };
  discountOptions: MenuProps["items"];
  formatMoney: (amount: number) => string;
  fulfillmentMethod: "delivery" | "pickup";
  onChangeDeliveryFee: (value: number) => void;
  onChangeDiscountType: (value: PurchaseDiscountType) => void;
  onChangeDiscountValue: (value: number) => void;
  onOpenTaxSelector: () => void;
  rate: number;
  storeCurrencyCode: string;
  summary: {
    itemsTotal: number;
    discountAmount: number;
    subtotal: number;
    taxSummary: Array<{ name: string; amount: number }>;
    appliedDeliveryFee: number;
    total: number;
    baseTotal: number;
  };
};

export function SaleSummaryPanel({
  currency,
  deliveryFee,
  differentProductTax,
  discount,
  discountOptions,
  formatMoney,
  fulfillmentMethod,
  onChangeDeliveryFee,
  onChangeDiscountType,
  onChangeDiscountValue,
  onOpenTaxSelector,
  rate,
  storeCurrencyCode,
  summary,
}: SaleSummaryPanelProps) {
  return (
    <div className="mt-8 grid w-full grid-cols-1 gap-4 px-5 pb-4 xl:grid-cols-3">
      <div className="space-y-2 bg-gray-50 p-5 text-right xl:col-start-3 xl:col-end-4">
        <SummaryLine label="Items Total" value={formatMoney(summary.itemsTotal)} />
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2">Discount</span>
            <InputNumber min={0} controls={false} className="!w-[60px]" variant="underlined" value={discount.discountValue} onChange={(value) => onChangeDiscountValue(Number(value || 0))} />
            <Dropdown menu={{ items: discountOptions, onClick: ({ key }) => onChangeDiscountType(key as PurchaseDiscountType) }}>
              <p className="cursor-pointer">{discount.discountType === "percent" ? "%" : currency || storeCurrencyCode || "Amount"}</p>
            </Dropdown>
          </div>
          <p>{formatMoney(summary.discountAmount)}</p>
        </div>
        <SummaryLine label="Subtotal" value={formatMoney(summary.subtotal)} />
        {!differentProductTax ? (
          <div className="flex justify-between">
            <span>Tax</span>
            <button type="button" className="text-blue-500 hover:underline" onClick={onOpenTaxSelector}>
              Add Tax
            </button>
          </div>
        ) : null}
        {summary.taxSummary.map((tax) => (
          <SummaryLine key={tax.name} label={tax.name} value={formatMoney(tax.amount)} />
        ))}
        {fulfillmentMethod !== "pickup" ? (
          <div className="flex items-start justify-between gap-4">
            <span>Delivery Fee</span>
            <div className="flex items-center gap-2">
              {currency ? <span className="text-sm text-gray-500">{currency}</span> : null}
              <InputNumber min={0} controls={false} className="!w-[92px]" variant="underlined" value={deliveryFee} onChange={(value) => onChangeDeliveryFee(Number(value || 0))} />
            </div>
          </div>
        ) : null}
        <div className="flex justify-between border-y border-gray-300 py-2 font-medium">
          <span>Total</span>
          <span>{formatMoney(summary.total)}</span>
        </div>
        {rate !== 1 ? <SummaryLine label="Base Total" value={`${storeCurrencyCode ? `${storeCurrencyCode} ` : ""}${summary.baseTotal.toFixed(2)}`.trim()} /> : null}
      </div>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-6">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
