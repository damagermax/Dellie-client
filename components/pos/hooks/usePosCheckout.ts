"use client";

import { FormInstance, message } from "antd";
import { Dispatch, SetStateAction, useCallback, useMemo } from "react";
import type { ApplyPaymentInput, CreateSaleInput, PaymentMethod, Sale, Tax, TransactionType } from "@/types/index";
import type { PosCartItem, PosPaymentEntry } from "../types";
import { isCashPaymentMethodName, paymentStatus, uid } from "../utils";

type SubmitCheckoutParams = {
  cart: PosCartItem[];
  payments: PosPaymentEntry[];
  form: FormInstance;
  grandTotal: number;
  posSettings: {
    customerMode?: string;
    fulfillmentDefault?: string;
    receiptAutoOpen?: boolean;
  };
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
    fulfillmentDefault?: string;
    receiptAutoOpen?: boolean;
  };
  submitParams: SubmitCheckoutParams;
};

export function usePosCheckout({ payments, setPayments, availablePaymentMethods, grandTotal, form, posSettings, submitParams }: UsePosCheckoutParams) {
  const cashPaymentMethodIds = useMemo(() => new Set(availablePaymentMethods.filter((method) => isCashPaymentMethodName(method.name)).map((method) => method.id)), [availablePaymentMethods]);

  const addPaymentRow = useCallback(() => {
    setPayments((current) => [...current, { id: uid(), amount: 0, paymentMethodId: availablePaymentMethods[0]?.id || undefined }]);
  }, [availablePaymentMethods, setPayments]);

  const updatePaymentRow = useCallback(
    (id: string, patch: Partial<PosPaymentEntry>) => {
      setPayments((current) => current.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));
    },
    [setPayments],
  );

  const removePaymentRow = useCallback(
    (id: string) => {
      setPayments((current) => (current.length > 1 ? current.filter((entry) => entry.id !== id) : [{ id: uid(), amount: 0 }]));
    },
    [setPayments],
  );

  const openSplitPayment = useCallback(() => {
    const primaryMethodId = payments[0]?.paymentMethodId || availablePaymentMethods[0]?.id;
    const secondaryMethodId = availablePaymentMethods.find((method) => method.id !== primaryMethodId)?.id;

    setPayments((current) => {
      if (current.length >= 2) {
        return current;
      }

      const firstPayment = current[0] || { id: uid(), amount: grandTotal, paymentMethodId: primaryMethodId };

      return [
        { ...firstPayment, amount: Number(firstPayment.amount || grandTotal) },
        { id: uid(), amount: 0, paymentMethodId: secondaryMethodId || primaryMethodId },
      ];
    });
  }, [availablePaymentMethods, grandTotal, payments, setPayments]);

  const prepareCheckout = useCallback(() => {
    const cashMethod = availablePaymentMethods.find((method) => isCashPaymentMethodName(method.name)) || availablePaymentMethods[0];
    setPayments([{ id: uid(), amount: grandTotal, paymentMethodId: cashMethod?.id || undefined }]);
    form.setFieldValue("posFulfillmentMode", posSettings.fulfillmentDefault);
  }, [availablePaymentMethods, form, grandTotal, posSettings.fulfillmentDefault, setPayments]);

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

      const validPayments = checkoutPayments.filter((payment) => Number(payment.amount || 0) > 0);
      if (validPayments.some((payment) => !payment.paymentMethodId)) {
        message.error("Select a payment method for every payment entry.");
        return;
      }

      const paymentTotal = validPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
      const cashPayments = validPayments.filter((payment) => payment.paymentMethodId && cashPaymentMethodIds.has(payment.paymentMethodId));
      const cashPaymentTotal = cashPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
      const changeAmount = Math.max(paymentTotal - grandTotal, 0);
      const nonCashPaymentTotal = paymentTotal - cashPaymentTotal;

      if (changeAmount > 0.005 && cashPayments.length === 0) {
        message.error("Only cash payments can exceed the sale total.");
        return;
      }

      if (changeAmount > cashPaymentTotal + 0.005 || nonCashPaymentTotal > grandTotal + 0.005) {
        message.error("Only the cash portion can exceed the sale total for change.");
        return;
      }

      const payload: CreateSaleInput = {
        contactId: values.contactId,
        date: new Date().toISOString(),
        deliveryDate: values.deliveryDate?.toISOString?.(),
        locationId: values.locationId,
        currencyId: values.currencyId,
        rate: Number(values.rate || 1),
        paymentTerms: values.paymentTerm,
        dueDate: values.dueDate?.toISOString?.(),
        source: "POS",
        posFulfillmentMode: form.getFieldValue("posFulfillmentMode") || posSettings.fulfillmentDefault,
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
          amount: Number(payment.amount),
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

      const netPaid = Math.max(paymentTotal - changeAmount, 0);
      const finalSale = {
        ...sale,
        paid: netPaid,
        balance: Math.max(Number(sale.amount || 0) - netPaid, 0),
        paymentStatus: paymentStatus(Number(sale.amount || 0), netPaid),
        source: "POS",
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
    } catch {
      message.error("Checkout failed. Please check the payment details and stock availability.");
    }
  }, [cashPaymentMethodIds, form, grandTotal, posSettings, submitParams]);

  return {
    cashPaymentMethodIds,
    addPaymentRow,
    updatePaymentRow,
    removePaymentRow,
    openSplitPayment,
    prepareCheckout,
    submitCheckout,
  };
}
