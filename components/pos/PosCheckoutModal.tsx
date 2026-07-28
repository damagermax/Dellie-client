"use client";

import { useState } from "react";
import { Button, Input, InputNumber, Modal, Select } from "antd";
import { HiCheckCircle, HiChevronRight, HiOutlineBolt, HiOutlineShoppingBag, HiOutlineTruck, HiOutlineUserGroup } from "react-icons/hi2";
import type { PaymentMethod } from "@/types/index";
import CheckoutInfoCard from "./CheckoutInfoCard";
import { PAY_LATER_PAYMENT_METHOD_ID, type PosOrderMethod, type PosPaymentEntry } from "./types";
import { POS_MODAL_OVERLAY_STYLE, formatMoney, parseMoneyInput } from "./utils";

const FULFILLMENT_OPTIONS = [
  { value: "now", label: "Fulfill now", description: "Reduce stock when sale completes", icon: HiOutlineBolt, accent: "from-amber-100 to-yellow-50", accentBorder: "border-amber-200", accentText: "text-amber-900", accentIcon: "bg-amber-500 text-white" },
  { value: "pickup", label: "Pickup later", description: "Hold the order and fulfill it later", icon: HiOutlineShoppingBag, accent: "from-sky-100 to-cyan-50", accentBorder: "border-sky-200", accentText: "text-sky-900", accentIcon: "bg-sky-500 text-white" },
  { value: "delivery", label: "Delivery", description: "Create a delivery order for later fulfillment", icon: HiOutlineTruck, accent: "from-emerald-100 to-teal-50", accentBorder: "border-emerald-200", accentText: "text-emerald-900", accentIcon: "bg-emerald-500 text-white" },
  { value: "dine_in", label: "Dine in", description: "Serve this order in-house", icon: HiOutlineUserGroup, accent: "from-fuchsia-100 to-rose-50", accentBorder: "border-fuchsia-200", accentText: "text-fuchsia-900", accentIcon: "bg-fuchsia-500 text-white" },
] as const;

type PosCheckoutModalProps = {
  open: boolean;
  loading: boolean;
  showSplit: boolean;
  orderMethod: PosOrderMethod;
  availableOrderMethods: PosOrderMethod[];
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
  deliveryFee: number;
  deliveryAddress: string;
  remainingAmount: number;
  payments: PosPaymentEntry[];
  paymentMethods: PaymentMethod[];
  cashPaymentMethodIds: ReadonlySet<string>;
  getPaymentAmountLimit: (entryId: string, paymentMethodId?: string) => number | undefined;
  selectedContactName: string | null;
  selectedPaymentMethodName: string | null;
  note: string;
  onCancel: () => void;
  onOrderMethodChange: (value: PosOrderMethod) => void;
  onDeliveryAddressChange: (value: string) => void;
  onDeliveryFeeChange: (value: string) => void;
  onSetShowSplit: (value: boolean) => void;
  onOpenSplitPayment: () => void;
  onUpdatePaymentRow: (id: string, patch: Partial<PosPaymentEntry>) => void;
  onRemovePaymentRow: (id: string) => void;
  onNoteChange: (value: string) => void;
  onSaveCart: () => void;
  onSubmitCheckout: () => void;
};

export default function PosCheckoutModal({
  open,
  loading,
  showSplit,
  orderMethod,
  availableOrderMethods,
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
  deliveryFee,
  deliveryAddress,
  remainingAmount,
  payments,
  paymentMethods,
  cashPaymentMethodIds,
  getPaymentAmountLimit,
  selectedContactName,
  selectedPaymentMethodName,
  note,
  onCancel,
  onOrderMethodChange,
  onDeliveryAddressChange,
  onDeliveryFeeChange,
  onSetShowSplit,
  onOpenSplitPayment,
  onUpdatePaymentRow,
  onRemovePaymentRow,
  onNoteChange,
  onSaveCart,
  onSubmitCheckout,
}: PosCheckoutModalProps) {
  const [fulfillmentPickerOpen, setFulfillmentPickerOpen] = useState(false);
  const isPayLater = payments[0]?.paymentMethodId === PAY_LATER_PAYMENT_METHOD_ID;
  const fulfillmentOptions = FULFILLMENT_OPTIONS.filter((option) => availableOrderMethods.includes(option.value));
  const selectedFulfillmentOption = fulfillmentOptions.find((option) => option.value === orderMethod) || fulfillmentOptions[0];

  return (
    <Modal
      title={
        <div className="pr-8">
          <p className="text-xl font-semibold text-stone-950">Checkout</p>
          <p className="mt-1 text-sm text-stone-500">{isPayLater ? "Place order and collect payment later." : "Take payment and complete the sale."}</p>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={1080}
      destroyOnClose
      style={{ top: 16 }}
      styles={{ mask: POS_MODAL_OVERLAY_STYLE, body: { padding: 0 }, header: { padding: "20px 20px 0" } }}
    >
      <div className="max-h-[calc(100vh-140px)] overflow-y-auto px-5 pb-5 pt-4">
        <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
          <section className="rounded-xl bg-stone-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Amount due</p>
            <p className="mt-3 text-4xl font-semibold leading-none text-stone-950">{formatMoney(selectedCurrencyCode, grandTotal)}</p>
            {change > 0 ? <div className="mt-3 inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Change to return: {formatMoney(selectedCurrencyCode, change)}</div> : null}

            <div className="mt-4 rounded-lg bg-white p-4">
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

              <div className="mt-4 space-y-2.5 border-t border-stone-100 pt-4">
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
                {orderMethod === "delivery" && deliveryFee > 0 ? (
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-stone-500">Delivery fee</span>
                    <span className="font-medium text-stone-950">{formatMoney(selectedCurrencyCode, deliveryFee)}</span>
                  </div>
                ) : null}
                {discounts > 0 ? (
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-stone-500">Discounts</span>
                    <span className="font-medium text-stone-950">-{formatMoney(selectedCurrencyCode, discounts)}</span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-3 grid gap-2">
              <CheckoutInfoCard label="Paid" value={formatMoney(selectedCurrencyCode, totalPaid)} />
              <CheckoutInfoCard label={change > 0 ? "Change" : "Remaining"} value={formatMoney(selectedCurrencyCode, change > 0 ? change : balance)} />
            </div>
          </section>

          <section className="flex max-h-[calc(100vh-172px)] flex-col overflow-hidden bg-white px-4 sm:px-5">
            <div className="flex-1 overflow-y-auto pr-1">
              {selectedFulfillmentOption ? (
                <div className="mb-4 pb-4">
                  {fulfillmentOptions.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => setFulfillmentPickerOpen(true)}
                      className="flex w-full items-center justify-between rounded-lg border border-stone-200 bg-white px-4 py-3 text-left transition-colors hover:border-stone-300 hover:bg-stone-50"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${selectedFulfillmentOption.accentIcon}`}>
                          <selectedFulfillmentOption.icon className="size-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-stone-950">{selectedFulfillmentOption.label}</span>
                          <span className="mt-1 block truncate text-xs text-stone-500">{selectedFulfillmentOption.description}</span>
                        </span>
                      </div>
                      <HiChevronRight className="size-4 shrink-0 text-stone-400" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3">
                      <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${selectedFulfillmentOption.accentIcon}`}>
                        <selectedFulfillmentOption.icon className="size-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-stone-950">{selectedFulfillmentOption.label}</span>
                        <span className="mt-1 block truncate text-xs text-stone-500">{selectedFulfillmentOption.description}</span>
                      </span>
                    </div>
                  )}
                  {orderMethod === "delivery" ? (
                    <div className="mt-3 space-y-3">
                      <div>
                        <p className="mb-2 text-sm font-semibold text-stone-900">Delivery address</p>
                        <Input
                          size="large"
                          value={deliveryAddress}
                          onChange={(event) => onDeliveryAddressChange(event.target.value)}
                          placeholder="Delivery address (optional)"
                          className="!rounded-lg"
                        />
                      </div>
                      <div className="pt-1">
                        <div className="mb-2 flex items-baseline justify-between gap-3">
                          <p className="text-sm font-semibold text-stone-900">Delivery fee</p>
                          <p className="text-xs text-stone-500">Optional</p>
                        </div>
                        <InputNumber
                          size="large"
                          className="!w-full"
                          placeholder={selectedCurrencyCode ? `${selectedCurrencyCode} 0.00` : "0.00"}
                          prefix={selectedCurrencyCode || undefined}
                          value={deliveryFee}
                          min={0}
                          precision={2}
                          parser={parseMoneyInput}
                          onChange={(value) => onDeliveryFeeChange(String(value ?? ""))}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {showSplit ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-stone-950">Split across multiple payments</p>
                      <p className="mt-1 text-xs text-stone-500">Add payment lines until the full amount is covered.</p>
                    </div>
                    <button type="button" onClick={() => onSetShowSplit(false)} className="rounded-lg bg-stone-100 px-3 py-1 cursor-pointer text-xs font-medium text-stone-700 transition-colors hover:bg-stone-200">
                      Single payment
                    </button>
                  </div>
                  {payments.map((payment, index) => (
                    <div key={payment.id} className="rounded-xl border border-stone-200 bg-white p-3">
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
                      {!payment.paymentMethodId || cashPaymentMethodIds.has(payment.paymentMethodId) ? null : <p className="mt-2 text-xs text-stone-500">Non-cash payments cannot exceed the remaining balance.</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border border-stone-200 bg-stone-50/40 p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="font-semibold uppercase tracking-[0.14em] text-stone-400">Payment</p>

	                      {!isPayLater ? <button className=" rounded-lg cursor-pointer bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-200" onClick={onOpenSplitPayment}>
	                        Split payment
	                      </button> : null}
	                    </div>
	                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
		                      <button
		                        type="button"
		                        onClick={() => onUpdatePaymentRow(payments[0]?.id, { paymentMethodId: PAY_LATER_PAYMENT_METHOD_ID, amount: 0 })}
		                        className={`min-h-11 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${isPayLater ? "border-2 border-[#2d837d] bg-green-100 text-green-800" : "border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50"}`}
		                      >
		                        Pay later
		                      </button>
	                      {paymentMethods.map((method) => {
	                        const isSelected = payments[0]?.paymentMethodId === method.id;
                        return (
                          <button
                            key={method.id}
                            type="button"
	                            onClick={() => onUpdatePaymentRow(payments[0]?.id, { paymentMethodId: method.id, amount: grandTotal })}
                            className={`min-h-11 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${isSelected ? "border-2 border-[#2d837d] bg-green-100 text-green-800" : "border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50"}`}
                          >
                            {method.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

	                  {!isPayLater ? (
	                    <div className="rounded-lg border border-stone-200 bg-white p-4">
	                      <div className="flex items-start justify-between gap-3">
	                        <div>
	                          <p className="text-sm font-semibold text-stone-900">Amount received</p>
	                          <p className="mt-1 text-xs text-stone-500">Use exact amount or enter cash received.</p>
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
	                  ) : (
	                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
	                      This order will be saved as unpaid with the full amount remaining.
	                    </div>
	                  )}
                </div>
              )}

              <div className="mt-4">
                <p className="mb-2 text-sm font-semibold text-stone-900">Sale note</p>
                <Input.TextArea
                  value={note}
                  onChange={(event) => onNoteChange(event.target.value)}
                  rows={4}
                  placeholder="Add an optional note for this sale"
                  className="!rounded-xl"
                />
              </div>
            </div>

            <div className="mt-4 space-y-3 border-t border-stone-200 bg-white pb-1 pt-3">
	              {remainingAmount > 0 && !isPayLater ? <p className="text-sm text-amber-700">Remaining payment required: {formatMoney(selectedCurrencyCode, remainingAmount)}</p> : null}
              <div className="grid grid-cols-3 gap-3">
              <Button size="large" className="!h-12 !rounded-lg !border !border-stone-200 !bg-transparent !text-stone-700 !shadow-none hover:!border-stone-300 hover:!bg-stone-50" onClick={onCancel}>
                Cancel
              </Button>
              <Button size="large" className="!h-12 !rounded-lg !border !border-stone-200 !bg-white !text-stone-700 !shadow-none hover:!border-stone-300 hover:!bg-stone-50" onClick={onSaveCart}>
                Save cart
              </Button>
              <Button
                type="primary"
                size="large"
                className="!h-12 !rounded-lg !border-0 !shadow-none"
                style={{ backgroundColor: "#2d837d" }}
                loading={loading}
	                disabled={!isPayLater && remainingAmount > 0.005}
	                onClick={onSubmitCheckout}
	              >
	                {isPayLater ? "Place Order" : "Complete Sale"}
	              </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Modal
        title="Select fulfillment"
        open={fulfillmentPickerOpen}
        onCancel={() => setFulfillmentPickerOpen(false)}
        footer={null}
        width={520}
        destroyOnClose={false}
        styles={{ mask: POS_MODAL_OVERLAY_STYLE, body: { padding: 0 } }}
      >
        <div className="overflow-hidden rounded-b-lg">
          {fulfillmentOptions.map((option, index) => {
            const Icon = option.icon;
            const isSelected = option.value === orderMethod;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onOrderMethodChange(option.value);
                  setFulfillmentPickerOpen(false);
                }}
                className={`flex w-full items-start justify-between gap-3 px-5 py-4 text-left transition-colors ${
                  index !== fulfillmentOptions.length - 1 ? "border-b border-stone-200" : ""
                } ${isSelected ? "bg-stone-50" : "bg-white hover:bg-stone-50"}`}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg ${option.accentIcon}`}>
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-stone-950">{option.label}</span>
                    <span className="mt-1 block text-xs text-stone-500">{option.description}</span>
                  </span>
                </div>
                {isSelected ? <HiCheckCircle className="mt-1 size-5 shrink-0 text-emerald-600" /> : null}
              </button>
            );
          })}
        </div>
      </Modal>
    </Modal>
  );
}
