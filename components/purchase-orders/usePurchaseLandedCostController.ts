"use client";

import type { Key } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Form, message } from "antd";
import dayjs from "dayjs";

import { useAddPurchaseLandedCostMutation, useGetCurrencyQuery, useUpdatePurchaseLandedCostMutation } from "@/lib/redux/services";
import { Purchase, PurchaseLandedCost, PurchaseLandedCostAllocation, PurchaseLandedCostScope, PurchaseLineItem } from "@/types/index";

import { purchaseApiError } from "./purchaseDetailUtils";

interface UsePurchaseLandedCostControllerArgs {
  open: boolean;
  purchase: Purchase;
  onSaved: () => void;
  toggle: () => void;
  initialValues?: PurchaseLandedCost;
}

export function usePurchaseLandedCostController({ open, purchase, onSaved, toggle, initialValues }: UsePurchaseLandedCostControllerArgs) {
  const [form] = Form.useForm();
  const [addLandedCost, { isLoading }] = useAddPurchaseLandedCostMutation();
  const [updateLandedCost, { isLoading: isUpdating }] = useUpdatePurchaseLandedCostMutation();
  const appliesTo = Form.useWatch("appliesTo", form) as PurchaseLandedCostScope | undefined;
  const allocationMethod = Form.useWatch("allocationMethod", form) as PurchaseLandedCostAllocation | undefined;
  const selectedCurrencyId = Form.useWatch("currencyId", form) as string | undefined;
  const [selectedLineItemIds, setSelectedLineItemIds] = useState<Key[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [selectionError, setSelectionError] = useState(false);
  const [editableLineItems, setEditableLineItems] = useState<PurchaseLineItem[]>(purchase.lineItems);
  const storeCurrencyId = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}")?.store?.currencyId : undefined;
  const { data: selectedCurrency } = useGetCurrencyQuery(selectedCurrencyId as string, { skip: !selectedCurrencyId });

  useEffect(() => {
    setEditableLineItems(purchase.lineItems.map((line) => ({ ...line })));
  }, [purchase.lineItems]);

  const filteredLineItems = useMemo(
    () => editableLineItems.filter((line) => line.productName.toLowerCase().includes(productSearch.trim().toLowerCase())),
    [editableLineItems, productSearch],
  );

  const allocationLines = useMemo(
    () => (appliesTo === "SELECTED_ITEMS" ? editableLineItems.filter((line) => selectedLineItemIds.map(String).includes(line.id)) : editableLineItems),
    [appliesTo, editableLineItems, selectedLineItemIds],
  );

  const hasInvalidWeight = useMemo(
    () => allocationMethod === "WEIGHT" && allocationLines.some((line) => Number(line.weight || 0) <= 0),
    [allocationLines, allocationMethod],
  );

  const amountCurrencyCode = selectedCurrency?.code || initialValues?.currencyCode || purchase.currencyId?.code || "";

  const updateLineWeight = useCallback((lineId: string, weight: number) => {
    setEditableLineItems((current) => current.map((line) => (line.id === lineId ? { ...line, weight } : line)));
  }, []);

  useEffect(() => {
    if (!open) return;

    if (initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
        contactId: initialValues.contactId,
        date: initialValues.date ? dayjs(initialValues.date) : dayjs(purchase.date),
        note: initialValues.note,
        amount: initialValues.amount,
        currencyId: typeof initialValues.currencyId === "string" ? initialValues.currencyId : initialValues.currencyId?.id,
        exchangeRate: Number(initialValues.exchangeRate || 1),
        allocationMethod: initialValues.allocationMethod,
        appliesTo: initialValues.appliesTo || "ALL_ITEMS",
      });
      setSelectedLineItemIds((initialValues.lineItemIds || []).map(String));
      setProductSearch("");
      setSelectionError(false);
      setEditableLineItems(purchase.lineItems.map((line) => ({ ...line })));
      return;
    }

    form.resetFields();
    form.setFieldsValue({
      allocationMethod: "BUY_VALUE",
      appliesTo: "ALL_ITEMS",
      date: dayjs(purchase.date),
      currencyId: storeCurrencyId,
      exchangeRate: 1,
    });
    setSelectedLineItemIds([]);
    setProductSearch("");
    setSelectionError(false);
    setEditableLineItems(purchase.lineItems.map((line) => ({ ...line })));
  }, [form, initialValues, open, purchase.date, purchase.lineItems, storeCurrencyId]);

  const handleAppliesToChange = useCallback((value: PurchaseLandedCostScope) => {
    if (value === "ALL_ITEMS") {
      setSelectedLineItemIds([]);
      setProductSearch("");
      setSelectionError(false);
    }
  }, []);

  const handleSelectionChange = useCallback((keys: Key[]) => {
    setSelectedLineItemIds(keys);
    setSelectionError(false);
  }, []);

  const submit = useCallback(async () => {
    const values = await form.validateFields().catch(() => null);
    if (!values) return;
    if (values.appliesTo === "SELECTED_ITEMS" && !selectedLineItemIds.length) {
      setSelectionError(true);
      return;
    }
    if (values.allocationMethod === "WEIGHT" && hasInvalidWeight) {
      message.error("Every product selected for weight allocation must have a weight greater than 0.");
      return;
    }

    try {
      const payload = {
        id: purchase.id,
        name: values.name,
        date: values.date.format("YYYY-MM-DD"),
        amount: Number(values.amount),
        allocationMethod: values.allocationMethod as PurchaseLandedCostAllocation,
        appliesTo: values.appliesTo as PurchaseLandedCostScope,
        contactId: values.contactId,
        note: values.note,
        paymentMethodId: values.paymentMethodId,
        ...(values.appliesTo === "SELECTED_ITEMS" ? { lineItemIds: selectedLineItemIds.map(String) } : {}),
        currencyId: values.currencyId,
        exchangeRate: Number(values.exchangeRate),
      };

      if (initialValues) {
        await updateLandedCost({ ...payload, landedCostId: initialValues.id }).unwrap();
        message.success("Landed cost updated.");
      } else {
        await addLandedCost(payload).unwrap();
        message.success("Landed cost added.");
      }
      onSaved();
      toggle();
    } catch (error) {
      message.error(purchaseApiError(error, initialValues ? "Landed cost could not be updated." : "Landed cost could not be added."));
    }
  }, [addLandedCost, form, hasInvalidWeight, initialValues, onSaved, purchase.id, selectedLineItemIds, toggle, updateLandedCost]);

  return {
    form,
    isSaving: isLoading || isUpdating,
    appliesTo,
    allocationMethod,
    filteredLineItems,
    selectedLineItemIds,
    productSearch,
    selectionError,
    hasInvalidWeight,
    amountCurrencyCode,
    updateLineWeight,
    setProductSearch,
    handleSelectionChange,
    handleAppliesToChange,
    submit,
  };
}
