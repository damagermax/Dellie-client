"use client";

import { FormInstance, message } from "antd";
import { Dispatch, SetStateAction, useCallback, useMemo } from "react";
import type { ApplyPaymentInput, CreateSaleInput, PaymentMethod, Sale, Tax, TransactionType } from "@/types/index";
import type { PosCartItem, PosPaymentEntry } from "../types";
import { isCashPaymentMethodName, paymentStatus, roundMoney, uid } from "../utils";

const normalizeEntityId = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object") {
    const candidate = value as { id?: unknown; _id?: unknown };
    if (typeof candidate.id === "string") {
      return candidate.id;
    }
    if (typeof candidate._id === "string") {
      return candidate._id;
    }
  }

  return undefined;
};

type SubmitCheckoutParams = {
  cart: PosCartItem[];
  payments: PosPaymentEntry[];
  form: FormInstance;
  grandTotal: number;
  posFulfillmentMode?: 'fulfill_now' | 'pending';
  posSettings: {
    customerMode?: string;
    fulfillmentDefault?: string;
    receiptAutoOpen?: boolean;
  };
  fallbackLocationId?: string;
  fallbackCurrencyId?: string;
  selectedTax?: Tax;
  createSaleAction: (payload: CreateSaleInput) => Promise<Sale>;
  createPaymentAction: (payload: ApplyPaymentInput) => Promise<unknown>;
  setCompletedSale: Dispatch<SetStateAction<Sale | undefined>>;
  setCheckoutModalOpen: Dispatch<SetStateAction<boolean>>;
  toggleReceiptOpen: () => void;
  activeSavedCartId: string | null;
  removeSavedCart: (savedCartId: string) => void;
  clearCart: () => void;
  setPendingCheckoutOpen: Dispatch<SetStateAction<boolean>>;
  setCustomerModalOpen: Dispatch<SetStateAction<boolean>>;
};

type UsePosCheckoutParams = {
  payments: PosPaymentEntry[];
  setPayments: Dispatch<SetStateAction<PosPaymentEntry[]>>;
  availablePaymentMethods: PaymentMethod[];
  grandTotal: number;
  form: FormInstance;
  posSettings: {
    customerMode?: string;
    fulfillmentDefault?: 'fulfill_now' | 'pending';
    receiptAutoOpen?: boolean;
  };
  setPosFulfillmentMode: Dispatch<SetStateAction<'fulfill_now' | 'pending' | undefined>>;
  submitParams: SubmitCheckoutParams;
};

export function usePosCheckout({ payments, setPayments, availablePaymentMethods, grandTotal, form, posSettings, setPosFulfillmentMode, submitParams }: UsePosCheckoutParams) {
  const cashPaymentMethodIds = useMemo(() => new Set(availablePaymentMethods.filter((method) => isCashPaymentMethodName(method.name)).map((method) => method.id)), [availablePaymentMethods]);
  const paymentTotal = useMemo(() => roundMoney(payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0)), [payments]);
  const remainingAmount = useMemo(() => roundMoney(Math.max(grandTotal - paymentTotal, 0)), [grandTotal, paymentTotal]);

  const getPaymentAmountLimit = useCallback(
    (entryId: string, paymentMethodId?: string, entries: PosPaymentEntry[] = payments) => {
      if (!paymentMethodId || cashPaymentMethodIds.has(paymentMethodId)) {
        return undefined;
      }

      const otherPaymentsTotal = entries.reduce((sum, entry) => {
        if (entry.id === entryId) {
          return sum;
        }

        return sum + Number(entry.amount || 0);
      }, 0);

      return roundMoney(Math.max(grandTotal - otherPaymentsTotal, 0));
    },
    [cashPaymentMethodIds, grandTotal, payments],
  );

  const addPaymentRow = useCallback(() => {
    setPayments((current: PosPaymentEntry[]) => [...current, { id: uid(), amount: 0, paymentMethodId: availablePaymentMethods[0]?.id || undefined }]);
  }, [availablePaymentMethods, setPayments]);

  const updatePaymentRow = useCallback(
    (id: string, patch: Partial<PosPaymentEntry>) => {
      setPayments((current: PosPaymentEntry[]) =>
        current.map((entry: PosPaymentEntry) => {
          if (entry.id !== id) {
            return entry;
          }

          const nextEntry = { ...entry, ...patch };
          const roundedEntry = {
            ...nextEntry,
            amount: roundMoney(Number(nextEntry.amount || 0)),
          };
          const amountLimit = getPaymentAmountLimit(id, roundedEntry.paymentMethodId, current);

          if (amountLimit === undefined) {
            return roundedEntry;
          }

          return {
            ...roundedEntry,
            amount: roundMoney(Math.min(Number(roundedEntry.amount || 0), amountLimit)),
          };
        }),
      );
    },
    [getPaymentAmountLimit, setPayments],
  );

  const removePaymentRow = useCallback(
    (id: string) => {
      setPayments((current: PosPaymentEntry[]) => (current.length > 1 ? current.filter((entry: PosPaymentEntry) => entry.id !== id) : [{ id: uid(), amount: 0 }]));
    },
    [setPayments],
  );

  const openSplitPayment = useCallback(() => {
    const primaryMethodId = payments[0]?.paymentMethodId || availablePaymentMethods[0]?.id;
    const secondaryMethodId = availablePaymentMethods.find((method) => method.id !== primaryMethodId)?.id;

    setPayments((current: PosPaymentEntry[]) => {
      if (current.length >= 2) {
        return current;
      }

      const firstPayment = current[0] || { id: uid(), amount: grandTotal, paymentMethodId: primaryMethodId };

      return [
        { ...firstPayment, amount: roundMoney(Number(firstPayment.amount || grandTotal)) },
        { id: uid(), amount: 0, paymentMethodId: secondaryMethodId || primaryMethodId },
      ];
    });
  }, [availablePaymentMethods, grandTotal, payments, setPayments]);

  const prepareCheckout = useCallback(() => {
    const cashMethod = availablePaymentMethods.find((method) => isCashPaymentMethodName(method.name)) || availablePaymentMethods[0];
    setPayments([{ id: uid(), amount: roundMoney(grandTotal), paymentMethodId: cashMethod?.id || undefined }]);
    setPosFulfillmentMode(posSettings.fulfillmentDefault);
  }, [availablePaymentMethods, grandTotal, posSettings.fulfillmentDefault, setPayments, setPosFulfillmentMode]);

  const submitCheckout = useCallback(async () => {
    const {
      cart,
      payments: checkoutPayments,
      setCompletedSale,
      setCheckoutModalOpen,
      toggleReceiptOpen,
      activeSavedCartId,
      removeSavedCart,
      clearCart,
      setPendingCheckoutOpen,
      setCustomerModalOpen,
      createSaleAction,
      createPaymentAction,
      selectedTax,
    } = submitParams;

    try {
      const values = await form.validateFields();
      if (!cart.length) {
        message.error("Add at least one item before checkout.");
        return;
      }

      if ((posSettings.customerMode === "require_customer" || posSettings.customerMode === "prompt_before_checkout") && !values.contactId) {
        setPendingCheckoutOpen(true);
        setCustomerModalOpen(true);
        message.error(posSettings.customerMode === "require_customer" ? "Select a customer before checkout." : "Choose a customer or confirm walk-in before checkout.");
        return;
      }

      const locationId = normalizeEntityId(values.locationId) || submitParams.fallbackLocationId;
      const currencyId = normalizeEntityId(values.currencyId) || submitParams.fallbackCurrencyId;
      const contactId = normalizeEntityId(values.contactId);

      if (!locationId || !currencyId) {
        message.error("Select a valid sale location and currency before checkout.");
        return;
      }

      const validPayments = checkoutPayments
        .map((payment) => ({ ...payment, amount: roundMoney(Number(payment.amount || 0)) }))
        .filter((payment) => payment.amount > 0);
      if (validPayments.some((payment) => !payment.paymentMethodId)) {
        message.error("Select a payment method for every payment entry.");
        return;
      }

      const paymentTotal = roundMoney(validPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0));
      const remainingAmount = roundMoney(Math.max(grandTotal - paymentTotal, 0));
      const cashPayments = validPayments.filter((payment) => payment.paymentMethodId && cashPaymentMethodIds.has(payment.paymentMethodId));
      const cashPaymentTotal = roundMoney(cashPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0));
      const changeAmount = roundMoney(Math.max(paymentTotal - grandTotal, 0));
      const nonCashPaymentTotal = roundMoney(paymentTotal - cashPaymentTotal);

      if (remainingAmount > 0.005) {
        message.error("POS checkout requires full payment before completing the sale.");
        return;
      }

      if (changeAmount > 0.005 && cashPayments.length === 0) {
        message.error("Only cash payments can exceed the sale total.");
        return;
      }

      if (changeAmount > cashPaymentTotal + 0.005 || nonCashPaymentTotal > grandTotal + 0.005) {
        message.error("Only the cash portion can exceed the sale total for change.");
        return;
      }

      const payload: CreateSaleInput = {
        contactId,
        date: new Date().toISOString(),
        deliveryDate: values.deliveryDate?.toISOString?.(),
        locationId,
        currencyId,
        rate: Number(values.rate || 1),
        paymentTerms: values.paymentTerm,
        dueDate: values.dueDate?.toISOString?.(),
        source: "POS",
        posFulfillmentMode: submitParams.posFulfillmentMode || posSettings.fulfillmentDefault,
        discountValue: 0,
        discountType: "fixed",
        taxId: selectedTax?.id,
        lineItems: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountValue: item.discountValue,
          discountType: item.discountType,
        })),
      };

      const sale = await createSaleAction(payload);

      for (const payment of validPayments) {
        const paymentPayload: ApplyPaymentInput = {
          linkTransactionId: sale.id,
          type: "payment" as TransactionType,
          date: new Date(),
          amount: roundMoney(Number(payment.amount)),
          paymentMethodId: payment.paymentMethodId,
          rate: Number(values.rate || 1),
        };
        await createPaymentAction(paymentPayload);
      }

      if (changeAmount > 0.005) {
        const cashPaymentMethodId = cashPayments[0]?.paymentMethodId;
        const changePayload: ApplyPaymentInput = {
          linkTransactionId: sale.id,
          type: "change" as TransactionType,
          date: new Date(),
          amount: Number(changeAmount.toFixed(2)),
          paymentMethodId: cashPaymentMethodId,
          rate: Number(values.rate || 1),
          note: "POS change given",
        };
        await createPaymentAction(changePayload);
      }

      const netPaid = roundMoney(Math.max(paymentTotal - changeAmount, 0));
      const paymentSnapshots = validPayments.map((payment) => ({
        id: payment.id,
        type: "payment",
        date: new Date(),
        status: "completed",
        amount: roundMoney(Number(payment.amount)),
        baseAmount: roundMoney(Number(payment.amount)),
        rate: Number(values.rate || 1),
        currency: { code: sale.currencyId?.code || "", id: sale.currencyId?.id || currencyId },
        paymentMethod: payment.paymentMethodId
          ? {
              id: payment.paymentMethodId,
              name: availablePaymentMethods.find((method) => method.id === payment.paymentMethodId)?.name || "Payment",
            }
          : undefined,
        createdBy: { id: "", name: "POS" },
      }));
      const changeSnapshot =
        changeAmount > 0.005
          ? [
              {
                id: `${sale.id}-change`,
                type: "change",
                date: new Date(),
                status: "completed",
                amount: Number(changeAmount.toFixed(2)),
                baseAmount: Number(changeAmount.toFixed(2)),
                rate: Number(values.rate || 1),
                currency: { code: sale.currencyId?.code || "", id: sale.currencyId?.id || currencyId },
                paymentMethod: cashPayments[0]?.paymentMethodId
                  ? {
                      id: cashPayments[0].paymentMethodId,
                      name: availablePaymentMethods.find((method) => method.id === cashPayments[0].paymentMethodId)?.name || "Cash",
                    }
                  : undefined,
                note: "POS change given",
                createdBy: { id: "", name: "POS" },
              },
            ]
          : [];
      const finalSale = {
        ...sale,
        paid: netPaid,
        balance: roundMoney(Math.max(Number(sale.amount || 0) - netPaid, 0)),
        paymentStatus: paymentStatus(Number(sale.amount || 0), netPaid),
        source: "POS",
        payments: [...paymentSnapshots, ...changeSnapshot],
      } as Sale;

      setCompletedSale(finalSale);
      setCheckoutModalOpen(false);
      if (posSettings.receiptAutoOpen) {
        toggleReceiptOpen();
      }
      if (activeSavedCartId) {
        removeSavedCart(activeSavedCartId);
      }
      clearCart();
      message.success(`Sale ${sale.saleNumber} completed.`);
    } catch (error) {
      const apiMessage = typeof error === "object" && error !== null && "data" in error ? (error as { data?: { message?: string | string[] } }).data?.message : undefined;

      const detail = Array.isArray(apiMessage) ? apiMessage.join(", ") : apiMessage;
      message.error(detail || "Checkout failed. Please check the payment details and stock availability.");
    }
  }, [availablePaymentMethods, cashPaymentMethodIds, form, grandTotal, posSettings, submitParams]);

  return {
    cashPaymentMethodIds,
    getPaymentAmountLimit,
    paymentTotal,
    remainingAmount,
    addPaymentRow,
    updatePaymentRow,
    removePaymentRow,
    openSplitPayment,
    prepareCheckout,
    submitCheckout,
  };
}
