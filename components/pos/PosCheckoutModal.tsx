"use client";

import { Button, InputNumber, Modal, Select } from "antd";
import type { PaymentMethod } from "@/types/index";
import CheckoutInfoCard from "./CheckoutInfoCard";
import type { PosPaymentEntry } from "./types";
import { POS_MODAL_OVERLAY_STYLE, formatMoney, parseMoneyInput } from "./utils";

const FULFILLMENT_OPTIONS = [
  { value: "fulfill_now", label: "Fulfill now" },
  { value: "pending", label: "Leave pending" },
] as const;

type PosCheckoutModalProps = {
  open: boolean;
  loading: boolean;
  showSplit: boolean;
  fulfillmentMode?: "fulfill_now" | "pending";
  posSettings: {
    allowFulfillmentChoiceAtCheckout?: boolean;
    fulfillmentDefault?: string;
  };
  selectedCurrencyCode: string;
  totalItems: number;
  subtotal: number;
  discounts: number;
  taxAmount: number;
  taxSummary: Array<{ name: string; amount: number }>;
  grandTotal: number;
  totalPaid: number;
  balance: number;
  change: number;
  payments: PosPaymentEntry[];
  paymentMethods: PaymentMethod[];
  cashPaymentMethodIds: ReadonlySet<string>;
  getPaymentAmountLimit: (entryId: string, paymentMethodId?: string) => number | undefined;
  selectedContactName: string | null;
  selectedPaymentMethodName: string | null;
  onCancel: () => void;
  onFulfillmentModeChange: (value: "fulfill_now" | "pending") => void;
  onSetShowSplit: (value: boolean) => void;
  onOpenSplitPayment: () => void;
  onUpdatePaymentRow: (id: string, patch: Partial<PosPaymentEntry>) => void;
  onRemovePaymentRow: (id: string) => void;
  onSubmitCheckout: () => void;
};

export default function sPosCheckoutModal({
  open,
  loading,
  showSplit,
  fulfillmentMode,
  posSettings,
  selectedCurrencyCode,
  totalItems,
  subtotal,
  discounts,
  taxAmount,
  taxSummary,
  grandTotal,
  totalPaid,
  balance,
  change,
  payments,
  paymentMethods,
  cashPaymentMethodIds,
  getPaymentAmountLimit,
  selectedContactName,
  selectedPaymentMethodName,
  onCancel,
  onFulfillmentModeChange,
  onSetShowSplit,
  onOpenSplitPayment,
  onUpdatePaymentRow,
  onRemovePaymentRow,
  onSubmitCheckout,
}: PosCheckoutModalProps) {
  const selectedFulfillmentMode = fulfillmentMode || posSettings.fulfillmentDefault;

  return (
    <Modal
      title={
        <div className="pr-8">
          <p className="text-xl font-semibold text-stone-950">Checkout</p>
          <p className="mt-1 text-sm text-stone-500">Take payment and finish the sale.</p>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={1080}
      destroyOnClose
      styles={{ mask: POS_MODAL_OVERLAY_STYLE, body: { padding: 0 }, header: { padding: "20px 20px 0" } }}
    >
      <div className="h-full overflow-y-auto px-5 pb-5 pt-4">
        <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
          <section className="rounded-2xl bg-stone-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Amount due</p>
            <p className="mt-3 text-4xl font-semibold leading-none text-stone-950">{formatMoney(selectedCurrencyCode, grandTotal)}</p>
            {change > 0 ? <div className="mt-3 inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Change to return: {formatMoney(selectedCurrencyCode, change)}</div> : null}

            <div className="mt-5 rounded-xl bg-white p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-stone-500">Items</span>
                  <span className="font-medium text-stone-950">
                    {totalItems} item{totalItems === 1 ? "" : "s"}
                  </span>
                </div>
                {selectedContactName ? (
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-stone-500">Customer</span>
                    <span className="max-w-[150px] truncate font-medium text-stone-950">{selectedContactName}</span>
                  </div>
                ) : null}
                {!showSplit && selectedPaymentMethodName ? (
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-stone-500">Method</span>
                    <span className="font-medium text-stone-950">{selectedPaymentMethodName}</span>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 space-y-3 border-t border-stone-100 pt-4">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-stone-500">Subtotal</span>
                  <span className="font-medium text-stone-950">{formatMoney(selectedCurrencyCode, subtotal)}</span>
                </div>
                {taxSummary.length ? (
                  taxSummary.map((tax) => (
                    <div key={tax.name} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-stone-500">{tax.name}</span>
                      <span className="font-medium text-stone-950">{formatMoney(selectedCurrencyCode, tax.amount)}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-stone-500">Tax</span>
                    <span className="font-medium text-stone-950">{formatMoney(selectedCurrencyCode, taxAmount)}</span>
                  </div>
                )}
                {discounts > 0 ? (
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-stone-500">Discounts</span>
                    <span className="font-medium text-stone-950">-{formatMoney(selectedCurrencyCode, discounts)}</span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-3 grid  gap-2">
              <CheckoutInfoCard label="Paid" value={formatMoney(selectedCurrencyCode, totalPaid)} />
              <CheckoutInfoCard label={change > 0 ? "Change" : "Remaining"} value={formatMoney(selectedCurrencyCode, change > 0 ? change : balance)} />
            </div>
          </section>

          <section className=" flex flex-col justify-between bg-white px-4 sm:px-5">
            <div>
              {posSettings.allowFulfillmentChoiceAtCheckout ? (
                <div className="mb-5 border-b border-stone-200 pb-5">
                  <p className="mb-2  font-semibold uppercase tracking-[0.14em] text-stone-400">Fulfillment</p>
                  <div className="grid grid-cols-2 gap-2">
                    {FULFILLMENT_OPTIONS.map((option) => {
                      const isSelected = selectedFulfillmentMode === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => onFulfillmentModeChange(option.value)}
                          className={`rounded-lg px-4 py-3 text-sm font-medium transition-all ${isSelected ? " border-[#F7C855] border-2  bg-yellow-100  text-yellow-800 font-semibold" : "bg-stone-100 text-stone-700"}`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {showSplit ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-stone-950">Split across multiple payments</p>
                      <p className="mt-1 text-xs text-stone-500">Add each payment line. Only cash can exceed the amount due for change.</p>
                    </div>
                    <button type="button" onClick={() => onSetShowSplit(false)} className="rounded-lg bg-stone-100 px-3 py-1 cursor-pointer text-xs font-medium text-stone-700 transition-colors hover:bg-stone-200">
                      Single payment
                    </button>
                  </div>
                  {payments.map((payment, index) => (
                    <div key={payment.id} className="rounded-xl bg-stone-50 p-3">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold text-stone-900">Payment {index + 1}</p>
                        <button type="button" onClick={() => onRemovePaymentRow(payment.id)} className="flex size-8 items-center justify-center rounded-lg text-stone-300 transition-colors hover:bg-white hover:text-red-500">
                          ×
                        </button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px]">
                        <Select
                          size="large"
                          className="!w-full"
                          placeholder="Choose payment method"
                          value={payment.paymentMethodId}
                          onChange={(value) => onUpdatePaymentRow(payment.id, { paymentMethodId: value })}
                          options={paymentMethods.map((method) => ({ value: method.id, label: method.name }))}
                        />
                        <InputNumber
                          size="large"
                          className="!w-full"
                          placeholder={selectedCurrencyCode ? `${selectedCurrencyCode} 0.00` : "0.00"}
                          prefix={selectedCurrencyCode || undefined}
                          value={payment.amount}
                          min={0}
                          max={getPaymentAmountLimit(payment.id, payment.paymentMethodId)}
                          precision={2}
                          parser={parseMoneyInput}
                          onChange={(value) => onUpdatePaymentRow(payment.id, { amount: Number(value || 0) })}
                        />
                      </div>
                      {!payment.paymentMethodId || cashPaymentMethodIds.has(payment.paymentMethodId) ? null : <p className="mt-2 text-xs text-stone-500">This method is capped at the remaining amount due.</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <div className="my-3 mb-8 flex items-center justify-between gap-3">
                      <p className="font-semibold uppercase tracking-[0.14em] text-stone-400">Payment </p>

                      <button className=" rounded-lg cursor-pointer bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-200" onClick={onOpenSplitPayment}>
                        Split payment
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {paymentMethods.map((method) => {
                        const isSelected = payments[0]?.paymentMethodId === method.id;
                        return (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => onUpdatePaymentRow(payments[0]?.id, { paymentMethodId: method.id })}
                            className={`rounded-lg px-4 py-3 text-sm font-medium transition-all ${isSelected ? "  border-[#2d837d] border-2 border bg-green-100  text-green-800 font-semibold" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`}
                          >
                            {method.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-xl bg-stone-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-stone-900">Amount received</p>
                        <p className="mt-1 text-xs text-stone-500">Use the shortcuts for faster cash entry, or type a custom amount.</p>
                      </div>
                      <div className={`rounded-lg px-3 py-1 text-xs font-semibold ${change > 0 ? "bg-emerald-100 text-emerald-700" : balance > 0 ? "bg-amber-100 text-amber-700" : "bg-stone-200 text-stone-700"}`}>
                        {change > 0 ? `Change ${formatMoney(selectedCurrencyCode, change)}` : `Remaining ${formatMoney(selectedCurrencyCode, balance)}`}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-[minmax(0,1fr)_88px] gap-2">
                      <InputNumber
                        size="large"
                        className="!w-full"
                        placeholder={selectedCurrencyCode ? `${selectedCurrencyCode} 0.00` : "0.00"}
                        prefix={selectedCurrencyCode || undefined}
                        value={payments[0]?.amount}
                        min={0}
                        max={getPaymentAmountLimit(payments[0]?.id || "", payments[0]?.paymentMethodId)}
                        precision={2}
                        parser={parseMoneyInput}
                        onChange={(value) => onUpdatePaymentRow(payments[0]?.id, { amount: Number(value || 0) })}
                      />
                      <button type="button" onClick={() => onUpdatePaymentRow(payments[0]?.id, { amount: grandTotal })} className="rounded-lg bg-white px-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-200">
                        Exact
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 pt-2">
              <Button size="large" className="!h-12 !rounded-lg !border-0 !bg-stone-100 !text-stone-700 !shadow-none hover:!bg-stone-200" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="primary" size="large" className="!h-12 !rounded-lg !border-0 !shadow-none" style={{ backgroundColor: "#2d837d" }} loading={loading} onClick={onSubmitCheckout}>
                Complete Sale
              </Button>
            </div>
          </section>
        </div>
      </div>
    </Modal>
  );
}
