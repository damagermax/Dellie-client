"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Form, MenuProps, message } from "antd";
import { useSelector } from "react-redux";

import { useCreatePurchaseMutation, useGetCurrencyQuery, useGetPaymentTermsQuery, useGetProductsQuery, useGetTaxesQuery, useUpdatePurchaseMutation } from "@/lib/redux/services";
import { useGetDefaultLocationQuery } from "@/lib/redux/services/locationsApi";
import { buildPaymentTermOptions } from "@/lib/payment-terms";
import useToggle from "@/hooks/UseToggle";
import { RootState } from "@/lib/store";
import { ProductListItem, Purchase, PurchaseDiscountType, Tax } from "@/types/index";
import { buildDiscountOptions, formatMoneyLabel, getStoredUserStoreCurrency, resolveCurrencyCode, updateDueDateFromPaymentTerm } from "@/components/shared/transactionFormUtils";

import type { ProductLineItem } from "./purchaseFormSections";
import { appendPurchaseLineItem, buildPurchasePayload, buildPurchaseSummary, calculatePurchaseLineTotal, clearPurchaseLineItemTaxes, getDefaultPurchaseFormValues, getPurchaseFormValues, mapPurchaseLineItems, syncPurchaseLineItemTaxes } from "./purchaseFormControllerHelpers";

interface UsePurchaseOrderFormControllerArgs {
  open: boolean;
  toggle: () => void;
  purchase?: Purchase;
  onSaved?: () => void;
}

function getErrorMessage(error: unknown) {
  return (error as { data?: { message?: string } })?.data?.message || "The purchase could not be saved. Please check the details and try again.";
}

export function usePurchaseOrderFormController({ open, toggle, purchase, onSaved }: UsePurchaseOrderFormControllerArgs) {
  const [form] = Form.useForm();
  const [lineItems, setLineItems] = useState<ProductLineItem[]>([]);
  const [selectedTax, setSelectedTax] = useState<Tax>();
  const [selectedTaxProductId, setSelectedTaxProductId] = useState<string>();
  const [searchValue, setSearchValue] = useState("");
  const [variantParent, setVariantParent] = useState<ProductListItem>();
  const [openTaxSelector, toggleTaxSelector] = useToggle();
  const [isDeferentProductTax, setIsDeferentProductTax] = useState(false);
  const toggleDeferentProductTax = useCallback(() => setIsDeferentProductTax((current) => !current), []);
  const [discount, setDiscount] = useState<{ discountValue: number; discountType: PurchaseDiscountType }>({ discountValue: 0, discountType: "percent" });

  const [createPurchase, { isLoading: creating }] = useCreatePurchaseMutation();
  const [updatePurchase, { isLoading: updating }] = useUpdatePurchaseMutation();
  const { data: paymentTerms } = useGetPaymentTermsQuery();
  const { data: defaultLocation } = useGetDefaultLocationQuery(undefined, { skip: !open });
  const { data: productsData } = useGetProductsQuery({ search: searchValue, limit: 20, purchasable: true });
  const { data: taxes } = useGetTaxesQuery();

  const rate = Form.useWatch("rate", form) || 1;
  const selectedCurrencyId = Form.useWatch("currencyId", form) as string | undefined;
  const featureSettings = useSelector((state: RootState) => state.currentUser.storeSettings.features);
  const { defaultStoreCurrencyId, storeCurrencyId, fallbackStoreCurrencyCode } = getStoredUserStoreCurrency();
  const { data: selectedCurrency } = useGetCurrencyQuery(selectedCurrencyId as string, { skip: !selectedCurrencyId });
  const { data: storeCurrency } = useGetCurrencyQuery(storeCurrencyId as string, { skip: !storeCurrencyId || Boolean(fallbackStoreCurrencyCode) });
  const storeCurrencyCode = fallbackStoreCurrencyCode || storeCurrency?.code || "";
  const multiCurrencyEnabled = featureSettings?.multiCurrencyEnabled !== false;
  const paymentTermsEnabled = featureSettings?.paymentTermsEnabled !== false;
  const currency = useMemo(() => resolveCurrencyCode({ selectedCurrencyId, selectedCurrencyCode: selectedCurrency?.code, storeCurrencyId, storeCurrencyCode }), [selectedCurrency?.code, selectedCurrencyId, storeCurrencyCode, storeCurrencyId]);
  const loading = creating || updating;
  const cannotEdit = Boolean(purchase?.locked || purchase?.receiptStatus === "received");
  const paymentTermOptions = useMemo(() => buildPaymentTermOptions(paymentTerms || []), [paymentTerms]);

  const formatMoney = useCallback((amount: number) => formatMoneyLabel(currency, amount), [currency]);

  useEffect(() => {
    if (!open) return;
    if (purchase) {
      form.setFieldsValue(getPurchaseFormValues(purchase));
      setDiscount({
        discountValue: Number(purchase.discountValue || 0),
        discountType: purchase.discountType || "fixed",
      });
      setLineItems(mapPurchaseLineItems(purchase));
      return;
    }

    form.resetFields();
    form.setFieldsValue(getDefaultPurchaseFormValues({ defaultStoreCurrencyId, defaultLocationId: defaultLocation?.id, paymentTermsEnabled }));
    setDiscount({ discountValue: 0, discountType: "percent" });
    setSelectedTax(undefined);
    setIsDeferentProductTax(false);
    setLineItems([]);
  }, [defaultLocation?.id, defaultStoreCurrencyId, form, open, paymentTermsEnabled, purchase]);

  useEffect(() => {
    if (!open || purchase || !defaultLocation?.id || form.getFieldValue("location")) return;
    form.setFieldValue("location", defaultLocation.id);
  }, [defaultLocation?.id, form, open, purchase]);

  useEffect(() => {
    if (!open || !purchase || !taxes) return;
    const selectedDocumentTax = taxes.find((tax) => tax.id === purchase.taxId);
    const hasLineTax = purchase.lineItems.some((item) => Boolean(item.taxId));
    setSelectedTax(selectedDocumentTax);
    setIsDeferentProductTax(!selectedDocumentTax && hasLineTax);
    setLineItems((current) => syncPurchaseLineItemTaxes({ current, purchase, taxes, documentTax: selectedDocumentTax }));
  }, [open, purchase, taxes]);

  useEffect(() => {
    if (isDeferentProductTax) {
      setSelectedTax(undefined);
      return;
    }

    setLineItems((prev) => clearPurchaseLineItemTaxes(prev));
  }, [isDeferentProductTax]);

  useEffect(() => {
    if (!open || paymentTermsEnabled || purchase) return;
    form.setFieldsValue({ paymentTerm: undefined, dueDate: undefined });
  }, [form, open, paymentTermsEnabled, purchase]);

  const discountOptions: MenuProps["items"] = buildDiscountOptions(currency, storeCurrencyCode);

  const updateLineItem = useCallback((id: string, patch: Partial<ProductLineItem>) => {
    setLineItems((prev) => prev.map((lineItem) => (lineItem.id === id ? { ...lineItem, ...patch } : lineItem)));
  }, []);

  const removeLineItem = useCallback((productId: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const handlePaymentTermChange = useCallback(
    (value: string) => updateDueDateFromPaymentTerm({ form, paymentTerms, value }),
    [form, paymentTerms],
  );

  const calculateLineTotal = useCallback((item: ProductLineItem) => calculatePurchaseLineTotal(item, rate), [rate]);

  const addLineItem = useCallback((product: ProductListItem) => {
    setLineItems((prev) => appendPurchaseLineItem(prev, product));
    setSearchValue("");
  }, []);

  const selectProduct = useCallback(
    (product: ProductListItem) => {
      if (product.hasVariants || product.variants?.length) {
        setVariantParent(product);
        return;
      }
      addLineItem(product);
    },
    [addLineItem],
  );

  const handleTaxSelect = useCallback(
    (tax: Tax | undefined) => {
      if (selectedTaxProductId) {
        updateLineItem(selectedTaxProductId, { tax });
      } else {
        setSelectedTax(tax);
      }
      toggleTaxSelector();
    },
    [selectedTaxProductId, toggleTaxSelector, updateLineItem],
  );

  const handleSubmit = useCallback(async () => {
    const values = await form.validateFields().catch(() => null);
    if (!values) return;
    if (!lineItems.length) {
      message.error("Add at least one product to this purchase.");
      return;
    }

    const payload = buildPurchasePayload({
      values,
      lineItems,
      discount,
      isDifferentProductTax: isDeferentProductTax,
      selectedTaxId: selectedTax?.id,
      paymentTermsEnabled,
      multiCurrencyEnabled,
    });

    try {
      if (purchase) {
        await updatePurchase({ id: purchase.id, ...payload }).unwrap();
        message.success("Purchase updated.");
      } else {
        await createPurchase(payload).unwrap();
        message.success("Purchase created.");
      }
      onSaved?.();
      toggle();
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  }, [createPurchase, discount, form, isDeferentProductTax, lineItems, multiCurrencyEnabled, onSaved, paymentTermsEnabled, purchase, selectedTax?.id, toggle, updatePurchase]);

  const summary = useMemo(() => buildPurchaseSummary({ lineItems, discount, selectedTax, rate }), [discount, lineItems, rate, selectedTax]);

  const closeVariantSelector = useCallback(() => setVariantParent(undefined), []);
  const clearSelectedTaxProduct = useCallback(() => setSelectedTaxProductId(undefined), []);

  return {
    form,
    loading,
    cannotEdit,
    paymentTermOptions,
    currency,
    storeCurrencyCode,
    rate,
    multiCurrencyEnabled,
    paymentTermsEnabled,
    lineItems,
    searchValue,
    setSearchValue,
    variantParent,
    closeVariantSelector,
    addLineItem,
    selectedTaxProductId,
    setSelectedTaxProductId,
    openTaxSelector,
    toggleTaxSelector,
    clearSelectedTaxProduct,
    isDeferentProductTax,
    toggleDeferentProductTax,
    discount,
    setDiscount,
    selectedTax,
    handleTaxSelect,
    discountOptions,
    updateLineItem,
    removeLineItem,
    handlePaymentTermChange,
    calculateLineTotal,
    selectProduct,
    handleSubmit,
    summary,
    formatMoney,
    products: productsData?.data || [],
  };
}
