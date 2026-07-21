"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Form, MenuProps, message } from "antd";
import { useSelector } from "react-redux";

import useToggle from "@/hooks/UseToggle";
import { RootState } from "@/lib/store";
import { useCreateSaleMutation, useGetCurrencyQuery, useGetPaymentTermsQuery, useGetProductsQuery, useGetTaxesQuery, useUpdateSaleMutation } from "@/lib/redux/services";
import { buildPaymentTermOptions } from "@/lib/payment-terms";
import { getNormalPrice } from "@/lib/products/pricing";
import { ProductListItem, PurchaseDiscountType, Sale, Tax } from "@/types/index";
import { buildDiscountOptions, formatMoneyLabel, getStoredUserStoreCurrency, resolveCurrencyCode, updateDueDateFromPaymentTerm } from "@/components/shared/transactionFormUtils";

import type { SaleFormLineItem } from "./saleFormSections";
import { saleApiError } from "./saleUtils";
import { buildSalePayload, buildSaleSummary, calculateSaleLineTotal, clearSaleLineItemTaxes, getDefaultSaleFormValues, getSaleFormValues, mapSaleLineItems, syncSaleLineItemTaxes } from "./saleFormControllerHelpers";

interface UseSaleFormControllerArgs {
  open: boolean;
  sale?: Sale;
  onSaved?: () => void;
  toggle: () => void;
}

export function useSaleFormController({ open, sale, onSaved, toggle }: UseSaleFormControllerArgs) {
  const [form] = Form.useForm();
  const [lineItems, setLineItems] = useState<SaleFormLineItem[]>([]);
  const [selectedTax, setSelectedTax] = useState<Tax>();
  const [selectedTaxProductId, setSelectedTaxProductId] = useState<string>();
  const [searchValue, setSearchValue] = useState("");
  const [differentProductTax, setDifferentProductTax] = useState(false);
  const [variantParent, setVariantParent] = useState<ProductListItem>();
  const [openTaxSelector, toggleTaxSelector] = useToggle();
  const [discount, setDiscount] = useState<{ discountValue: number; discountType: PurchaseDiscountType }>({ discountValue: 0, discountType: "percent" });
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [createSale, { isLoading: creating }] = useCreateSaleMutation();
  const [updateSale, { isLoading: updating }] = useUpdateSaleMutation();
  const { data: paymentTerms } = useGetPaymentTermsQuery();
  const { data: productsData } = useGetProductsQuery({ search: searchValue, limit: 20 });
  const { data: taxes } = useGetTaxesQuery();
  const rate = Form.useWatch("rate", form) || 1;
  const fulfillmentMethod = (Form.useWatch("fulfillmentMethod", form) as "delivery" | "pickup" | undefined) || "delivery";
  const featureSettings = useSelector((state: RootState) => state.currentUser.storeSettings.features);
  const selectedCurrencyId = Form.useWatch("currencyId", form) as string | undefined;
  const { defaultStoreCurrencyId, storeCurrencyId, fallbackStoreCurrencyCode } = getStoredUserStoreCurrency();
  const { data: selectedCurrency } = useGetCurrencyQuery(selectedCurrencyId as string, { skip: !selectedCurrencyId });
  const { data: storeCurrency } = useGetCurrencyQuery(storeCurrencyId as string, { skip: !storeCurrencyId || Boolean(fallbackStoreCurrencyCode) });
  const storeCurrencyCode = fallbackStoreCurrencyCode || storeCurrency?.code || "";
  const pickupEnabled = featureSettings?.pickupEnabled !== false;
  const deliveryEnabled = featureSettings?.deliveryEnabled !== false;
  const multiCurrencyEnabled = featureSettings?.multiCurrencyEnabled !== false;
  const paymentTermsEnabled = featureSettings?.paymentTermsEnabled !== false;
  const currency = useMemo(() => resolveCurrencyCode({ selectedCurrencyId, selectedCurrencyCode: selectedCurrency?.code, storeCurrencyId, storeCurrencyCode }), [selectedCurrency?.code, selectedCurrencyId, storeCurrencyCode, storeCurrencyId]);
  const loading = creating || updating;
  const paymentTermOptions = useMemo(() => buildPaymentTermOptions(paymentTerms || []), [paymentTerms]);
  const isQuote = sale?.status === "draft";

  const formatMoney = useCallback((amount: number) => formatMoneyLabel(currency, amount), [currency]);

  useEffect(() => {
    if (!open) return;
    if (!sale) {
      form.resetFields();
      form.setFieldsValue(getDefaultSaleFormValues({ defaultStoreCurrencyId, deliveryEnabled, pickupEnabled, paymentTermsEnabled }));
      setLineItems([]);
      setDiscount({ discountValue: 0, discountType: "percent" });
      setDeliveryFee(0);
      setSelectedTax(undefined);
      setDifferentProductTax(false);
      return;
    }

    form.setFieldsValue(getSaleFormValues(sale));
    setDiscount({ discountValue: Number(sale.discountValue || 0), discountType: sale.discountType || "fixed" });
    setDeliveryFee(Number(sale.deliveryFee || 0));
    setLineItems(mapSaleLineItems(sale));
  }, [defaultStoreCurrencyId, deliveryEnabled, form, open, paymentTermsEnabled, pickupEnabled, sale]);

  useEffect(() => {
    if (!open) return;

    if (fulfillmentMethod === "pickup" && !pickupEnabled && deliveryEnabled) {
      form.setFieldValue("fulfillmentMethod", "delivery");
      setDeliveryFee(0);
    }

    if (fulfillmentMethod === "delivery" && !deliveryEnabled && pickupEnabled) {
      form.setFieldValue("fulfillmentMethod", "pickup");
    }
  }, [deliveryEnabled, form, fulfillmentMethod, open, pickupEnabled]);

  useEffect(() => {
    if (!open || !sale || !taxes) return;
    const documentTax = taxes.find((tax) => tax.id === sale.taxId);
    const hasLineTax = sale.lineItems.some((line) => Boolean(line.taxId));
    setSelectedTax(documentTax);
    setDifferentProductTax(!documentTax && hasLineTax);
    setLineItems((current) => syncSaleLineItemTaxes({ current, sale, taxes, documentTax }));
  }, [open, sale, taxes]);

  useEffect(() => {
    if (differentProductTax) {
      setSelectedTax(undefined);
      return;
    }

    setLineItems((current) => clearSaleLineItemTaxes(current));
  }, [differentProductTax]);

  useEffect(() => {
    if (!open || paymentTermsEnabled || sale) return;
    form.setFieldsValue({ paymentTerm: undefined, dueDate: undefined });
  }, [form, open, paymentTermsEnabled, sale]);

  const availableProducts = useMemo(() => productsData?.data || [], [productsData]);
  const discountOptions: MenuProps["items"] = buildDiscountOptions(currency, storeCurrencyCode);

  const updateLineItem = useCallback((id: string, patch: Partial<SaleFormLineItem>) => {
    setLineItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);
  const removeLineItem = useCallback((id: string) => {
    setLineItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const handlePaymentTermChange = useCallback(
    (value: string) => updateDueDateFromPaymentTerm({ form, paymentTerms, value }),
    [form, paymentTerms],
  );

  const lineTotal = useCallback((item: SaleFormLineItem) => calculateSaleLineTotal(item), []);

  const addProduct = useCallback((product: ProductListItem) => {
    setLineItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      }

      return [...current, { id: product.id, productName: product.name, productSku: product.sku, productImageUrl: product.imageUrl, quantity: 1, unitPrice: getNormalPrice(product) }];
    });
    setSearchValue("");
  }, []);

  const selectProduct = useCallback(
    (product: ProductListItem) => {
      if (product.hasVariants || product.variants?.length) {
        setVariantParent(product);
        return;
      }

      addProduct(product);
    },
    [addProduct],
  );

  const summary = useMemo(() => buildSaleSummary({ lineItems, discount, selectedTax, deliveryFee, fulfillmentMethod, rate }), [deliveryFee, discount, fulfillmentMethod, lineItems, rate, selectedTax]);

  const submit = useCallback(
    async (mode: "sale" | "quote") => {
      const values = await form.validateFields().catch(() => null);
      if (!values) return;
      if (!lineItems.length) {
        message.error("Add at least one product to this sale.");
        return;
      }
      const payload = buildSalePayload({
        values,
        lineItems,
        discount,
        deliveryFee,
        differentProductTax,
        selectedTaxId: selectedTax?.id,
        mode,
        paymentTermsEnabled,
        multiCurrencyEnabled,
      });

      try {
        if (sale) await updateSale({ id: sale.id, ...payload }).unwrap();
        else await createSale(payload).unwrap();
        message.success(mode === "quote" ? (sale ? "Quote updated." : "Quote saved.") : sale ? "Sale updated." : "Sale created.");
        onSaved?.();
        toggle();
      } catch (error) {
        message.error(saleApiError(error, "The sale could not be saved. Please check stock and try again."));
      }
    },
    [createSale, deliveryFee, differentProductTax, discount, form, lineItems, multiCurrencyEnabled, onSaved, paymentTermsEnabled, sale, selectedTax?.id, toggle, updateSale],
  );

  const handleSelectTax = useCallback(
    (tax: Tax) => {
      if (selectedTaxProductId) {
        setLineItems((current) => current.map((line) => (line.id === selectedTaxProductId ? { ...line, tax } : line)));
      } else {
        setSelectedTax(tax);
      }
      setSelectedTaxProductId(undefined);
      toggleTaxSelector();
    },
    [selectedTaxProductId, toggleTaxSelector],
  );

  const resetSelectedTaxProduct = useCallback(() => setSelectedTaxProductId(undefined), []);
  const closeVariantSelector = useCallback(() => setVariantParent(undefined), []);

  return {
    form,
    sale,
    open,
    loading,
    isQuote,
    currency,
    rate,
    storeCurrencyCode,
    paymentTermOptions,
    lineItems,
    availableProducts,
    searchValue,
    fulfillmentMethod,
    pickupEnabled,
    deliveryEnabled,
    multiCurrencyEnabled,
    paymentTermsEnabled,
    differentProductTax,
    discount,
    discountOptions,
    deliveryFee,
    summary,
    selectedTaxProductId,
    openTaxSelector,
    variantParent,
    formatMoney,
    handlePaymentTermChange,
    lineTotal,
    setSearchValue,
    setDeliveryFee,
    setDiscount,
    setSelectedTaxProductId,
    setDifferentProductTax,
    updateLineItem,
    removeLineItem,
    selectProduct,
    addProduct,
    submit,
    handleSelectTax,
    toggleTaxSelector,
    closeVariantSelector,
    resetSelectedTaxProduct,
  };
}
