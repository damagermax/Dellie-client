"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Badge, Button, Divider, Drawer, Form, Input, InputNumber, Select, message } from "antd";
import {
  Beef,
  CakeSlice,
  Coffee,
  Drumstick,
  Flame,
  Fish,
  PackageSearch,
  Salad,
  Search,
  ShoppingBag,
  ShoppingCart,
  Sandwich,
  Sparkles,
  UtensilsCrossed,
  WalletCards,
  X,
} from "lucide-react";
import ContactsFormModal from "@/components/contacts/ContactsFormModal";
import { SearchableContactSelect } from "@/components/contacts/SeachableContactSelect";
import { SearchableLocationSelect } from "@/components/location/SearchableLocationSelect";
import { SearchableCurrenciesSelect } from "@/components/system/SearchableCurrencySelect";
import { TaxSelector } from "@/components/settings/TaxSelector";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import useToggle from "@/hooks/UseToggle";
import { useCreateSaleMutation, useCreateTransactionActionMutation, useGetCategoriesQuery, useGetCurrencyQuery, useGetDefaultLocationQuery, useGetPaymentAccountsQuery, useGetProductsQuery } from "@/lib/redux/services";
import { ApplyPaymentInput, CategoryStatus, CategoryType, CreateSaleInput, PaymentAccount, Sale, Tax, TransactionType } from "@/types/index";
import SaleShareDocumentModal, { SaleDocumentType } from "@/components/orders/SaleShareDocumentModal";
import CategoryCard from "./CategoryCard";
import ProductCard from "./ProductCard";
import QuantityControl from "./QuantityControl";

type PosCartItem = {
  id: string;
  productId: string;
  name: string;
  sku: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  availableStock?: number;
  discountValue: number;
  discountType: "fixed" | "percent";
};

type PosPaymentEntry = {
  id: string;
  accountId?: string;
  amount: number;
  reference?: string;
};

const DRAFT_KEY = "dellie-pos-draft";

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatPosPrice(value: number) {
  return `Rp ${Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatMoney(currency: string, value: number) {
  const amount = Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency ? `${currency} ${amount}` : amount;
}

function lineDiscountAmount(item: PosCartItem) {
  const subtotal = item.unitPrice * item.quantity;
  return item.discountType === "percent" ? (subtotal * item.discountValue) / 100 : item.discountValue;
}

function paymentStatus(total: number, paid: number) {
  if (paid <= 0) return "unpaid";
  if (paid >= total) return "paid";
  return "partial";
}

function getCategoryIcon(name: string): ReactNode {
  const value = name.toLowerCase();
  if (value.includes("fish") || value.includes("sea")) return <Fish size={21} strokeWidth={2.1} />;
  if (value.includes("chicken") || value.includes("poultry")) return <Drumstick size={21} strokeWidth={2.1} />;
  if (value.includes("steak") || value.includes("beef")) return <Beef size={21} strokeWidth={2.1} />;
  if (value.includes("salad") || value.includes("veggie") || value.includes("veget")) return <Salad size={21} strokeWidth={2.1} />;
  if (value.includes("dessert") || value.includes("cake") || value.includes("sweet")) return <CakeSlice size={21} strokeWidth={2.1} />;
  if (value.includes("drink") || value.includes("beverage") || value.includes("cocktail") || value.includes("coffee")) return <Coffee size={21} strokeWidth={2.1} />;
  if (value.includes("spicy") || value.includes("hot")) return <Flame size={21} strokeWidth={2.1} />;
  if (value.includes("appetizer") || value.includes("starter") || value.includes("snack")) return <Sandwich size={21} strokeWidth={2.1} />;
  return <UtensilsCrossed size={21} strokeWidth={2.1} />;
}

function isTrackedInventory(type?: string) {
  return ["STOCK", "PACKAGING", "BUNDLE"].includes(String(type || ""));
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`mb-2 flex items-center justify-between text-sm ${strong ? "font-semibold text-gray-950" : "text-gray-600"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export default function POSPage() {
  const [form] = Form.useForm();
  const [searchValue, setSearchValue] = useState("");
  const [categoryId, setCategoryId] = useState<string>();
  const [cart, setCart] = useState<PosCartItem[]>([]);
  const [payments, setPayments] = useState<PosPaymentEntry[]>([{ id: uid(), amount: 0 }]);
  const [selectedTax, setSelectedTax] = useState<Tax>();
  const [orderDrawerOpen, setOrderDrawerOpen] = useState(false);
  const [customerOpen, toggleCustomerOpen] = useToggle();
  const [receiptOpen, toggleReceiptOpen] = useToggle();
  const [openTaxSelector, toggleTaxSelector] = useToggle();
  const [completedSale, setCompletedSale] = useState<Sale>();

  const debouncedSearch = useDebouncedValue(searchValue);
  const selectedCurrencyId = Form.useWatch("currencyId", form);

  const { data: defaultLocation } = useGetDefaultLocationQuery();
  const { data: accounts } = useGetPaymentAccountsQuery({});
  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery({ type: CategoryType.PRODUCT, status: CategoryStatus.ACTIVE });
  const { data: selectedCurrency } = useGetCurrencyQuery(selectedCurrencyId, { skip: !selectedCurrencyId });
  const { data: allProductsData } = useGetProductsQuery({ inPOS: true, limit: 500 });
  const { data: filteredProductsData, isLoading: productsLoading } = useGetProductsQuery({
    search: debouncedSearch,
    inPOS: true,
    categoryId,
    limit: 200,
  });
  const [createSale, { isLoading: creatingSale }] = useCreateSaleMutation();
  const [createPayment, { isLoading: creatingPayment }] = useCreateTransactionActionMutation();

  const loading = creatingSale || creatingPayment;
  const categories = useMemo(() => categoriesData?.data || [], [categoriesData]);
  const allProducts = useMemo(() => allProductsData?.data || [], [allProductsData]);
  const rawVisibleProducts = useMemo(() => filteredProductsData?.data || [], [filteredProductsData]);
  const paymentAccounts = (accounts?.data || []) as PaymentAccount[];

  const selectedCurrencyCode = useMemo(() => {
    const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
    return selectedCurrency?.code || user?.store?.currency?.code || user?.store?.currencyCode || "";
  }, [selectedCurrency]);

  const visibleProducts = useMemo(() => {
    const search = debouncedSearch.trim().toLowerCase();
    if (!search) return rawVisibleProducts;
    return rawVisibleProducts.filter((product) => product.name.toLowerCase().includes(search));
  }, [rawVisibleProducts, debouncedSearch]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of allProducts) {
      const key = product.categoryId || product.categoryName || product.category;
      if (!key) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return counts;
  }, [allProducts]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discounts = cart.reduce((sum, item) => sum + lineDiscountAmount(item), 0);
  const taxableSubtotal = Math.max(subtotal - discounts, 0);
  const taxAmount = useMemo(() => {
    if (!selectedTax) return 0;
    return selectedTax.items.reduce((sum, tax) => sum + taxableSubtotal * (Number(tax.value) / 100), 0);
  }, [selectedTax, taxableSubtotal]);
  const grandTotal = Math.max(taxableSubtotal + taxAmount, 0);
  const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const balance = Math.max(grandTotal - totalPaid, 0);
  const change = Math.max(totalPaid - grandTotal, 0);

  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (!draft) return;

    try {
      const parsed = JSON.parse(draft);
      if (parsed.formValues) form.setFieldsValue(parsed.formValues);
      if (parsed.cart?.length) setCart(parsed.cart);
      if (parsed.payments?.length) setPayments(parsed.payments);
      if (parsed.categoryId) setCategoryId(parsed.categoryId);
      if (parsed.searchValue) setSearchValue(parsed.searchValue);
      if (parsed.selectedTax) setSelectedTax(parsed.selectedTax);
      localStorage.removeItem(DRAFT_KEY);
      message.success("Draft sale restored.");
    } catch {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, [form]);

  useEffect(() => {
    if (defaultLocation?.id && !form.getFieldValue("locationId")) {
      form.setFieldsValue({ locationId: defaultLocation.id });
    }
  }, [defaultLocation, form]);

  useEffect(() => {
    const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
    const storeCurrencyId = user?.store?.currencyId;
    if (storeCurrencyId && !form.getFieldValue("currencyId")) {
      form.setFieldsValue({ currencyId: storeCurrencyId, rate: 1 });
    }
  }, [form]);

  const getCartItem = useCallback(
    (productId: string) => cart.find((item) => item.productId === productId),
    [cart],
  );

  const setCartQuantity = useCallback((product: (typeof visibleProducts)[number], quantity: number) => {
    setCart((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (quantity <= 0) {
        return current.filter((item) => item.productId !== product.id);
      }

      if (existing) {
        return current.map((item) => (item.productId === product.id ? { ...item, quantity } : item));
      }

      return [
        ...current,
        {
          id: uid(),
          productId: product.id,
          name: product.name,
          sku: product.sku,
          imageUrl: product.imageUrl || undefined,
          unitPrice: Number(product.sellingPrice || 0),
          quantity,
          availableStock: product.availableStock,
          discountValue: 0,
          discountType: "fixed",
        },
      ];
    });
  }, []);

  const removeCartItem = useCallback((cartItemId: string) => {
    setCart((current) => current.filter((item) => item.id !== cartItemId));
  }, []);

  const changeCartItemQuantity = useCallback((cartItemId: string, delta: number) => {
    setCart((current) =>
      current.flatMap((item) => {
        if (item.id !== cartItemId) return [item];

        const nextQuantity = item.quantity + delta;
        if (nextQuantity <= 0) return [];

        return [{ ...item, quantity: nextQuantity }];
      }),
    );
  }, []);

  const addQuantity = useCallback(
    (product: (typeof visibleProducts)[number]) => {
      const current = getCartItem(product.id)?.quantity || 0;
      setCartQuantity(product, current + 1);
    },
    [getCartItem, setCartQuantity],
  );

  const subtractQuantity = useCallback(
    (product: (typeof visibleProducts)[number]) => {
      const current = getCartItem(product.id)?.quantity || 0;
      setCartQuantity(product, Math.max(current - 1, 0));
    },
    [getCartItem, setCartQuantity],
  );

  const addPaymentRow = () => {
    setPayments((current) => [...current, { id: uid(), amount: 0, accountId: paymentAccounts[0]?.id }]);
  };

  const updatePaymentRow = (id: string, patch: Partial<PosPaymentEntry>) => {
    setPayments((current) => current.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));
  };

  const removePaymentRow = (id: string) => {
    setPayments((current) => (current.length > 1 ? current.filter((entry) => entry.id !== id) : [{ id: uid(), amount: 0 }]));
  };

  const saveDraft = () => {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        formValues: form.getFieldsValue(),
        cart,
        payments,
        categoryId,
        searchValue,
        selectedTax,
      }),
    );
    message.success("Sale placed on hold.");
    setCart([]);
    setPayments([{ id: uid(), amount: 0 }]);
    setSelectedTax(undefined);
    setOrderDrawerOpen(false);
  };

  const clearCart = () => {
    setCart([]);
    setPayments([{ id: uid(), amount: 0 }]);
    setSelectedTax(undefined);
    form.setFieldValue("contactId", undefined);
    message.info("Cart cleared.");
  };

  const submitCheckout = async () => {
    try {
      const values = await form.validateFields();
      if (!cart.length) {
        message.error("Add at least one item before checkout.");
        return;
      }

      const validPayments = payments.filter((payment) => Number(payment.amount || 0) > 0);
      if (validPayments.some((payment) => !payment.accountId)) {
        message.error("Select a payment account for every payment entry.");
        return;
      }
      const paymentTotal = validPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
      if (paymentTotal > grandTotal + 0.005) {
        message.error("Payment total cannot exceed the sale total.");
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
        discountValue: 0,
        discountType: "fixed" as const,
        taxId: selectedTax?.id,
        lineItems: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountValue: item.discountValue,
          discountType: item.discountType,
        })),
      };

      const sale = await createSale(payload).unwrap();

      for (const payment of validPayments) {
        const paymentPayload: ApplyPaymentInput = {
          linkTransactionId: sale.id,
          type: TransactionType.PAYMENT,
          date: new Date(),
          amount: Number(payment.amount),
          accountId: payment.accountId,
          rate: Number(values.rate || 1),
          reference: payment.reference,
        };
        await createPayment(paymentPayload).unwrap();
      }

      const finalSale = {
        ...sale,
        paid: paymentTotal,
        balance: Math.max(Number(sale.amount || 0) - paymentTotal, 0),
        paymentStatus: paymentStatus(Number(sale.amount || 0), paymentTotal),
        source: "POS",
      } as Sale;

      setCompletedSale(finalSale);
      toggleReceiptOpen();
      clearCart();
      setOrderDrawerOpen(false);
      message.success(`Sale ${sale.saleNumber} completed.`);
    } catch {
      message.error("Checkout failed. Please check the payment details and stock availability.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f5fb] p-3 md:p-4">
      <div className="mx-auto max-w-[1760px] rounded-[28px] border border-[#e7e3ee] bg-white shadow-[0_22px_70px_rgba(15,23,42,0.09)]">
        <div className="border-b border-[#ece8f2] px-3 py-3 md:px-4 md:py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <Input
              size="large"
              allowClear
              prefix={<Search size={18} className="text-[#7a39cc]" />}
              placeholder="Search menu here..."
              className="!h-14 !w-full !rounded-full !border-[#dad6e2] !bg-white !px-4 !text-[16px] lg:!max-w-[560px]"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />

            <Button
              size="large"
              className="!h-14 !rounded-full !border-0 !bg-gradient-to-b !from-[#8f5ae0] !to-[#6e38c6] !px-8 !text-[16px] !font-semibold !text-white !shadow-[0_14px_28px_rgba(111,56,197,0.32)]"
              onClick={() => setOrderDrawerOpen(true)}
            >
              New Order
            </Button>
          </div>
        </div>

        <div className="border-b border-[#ece8f2] px-3 py-4 md:px-4">
          <div className="flex gap-4 overflow-x-auto pb-1">
            <CategoryCard
              title="All Menu"
              count={allProducts.length}
              active={!categoryId}
              onClick={() => setCategoryId(undefined)}
              icon={<ShoppingBag size={21} strokeWidth={2.1} />}
            />
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                title={category.name}
                count={categoryCounts.get(category.id) || 0}
                active={categoryId === category.id}
                onClick={() => setCategoryId(category.id)}
                icon={getCategoryIcon(category.name)}
              />
            ))}
          </div>
        </div>

        <div className="px-3 py-4 md:px-4 md:py-5">
          <AppViewLoader loading={productsLoading || categoriesLoading} />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
            {visibleProducts.map((product) => {
              const quantity = getCartItem(product.id)?.quantity || 0;
              const trackedInventory = isTrackedInventory(product.type);
              const unavailable = trackedInventory && Number(product.availableStock || 0) <= 0;

              return (
                <ProductCard
                  key={product.id}
                  name={product.name}
                  imageUrl={product.imageUrl || undefined}
                  price={formatPosPrice(Number(product.sellingPrice || 0))}
                  quantity={quantity}
                  available={!unavailable}
                  onDecrease={() => subtractQuantity(product)}
                  onIncrease={() => addQuantity(product)}
                />
              );
            })}
          </div>

          {!visibleProducts.length && !productsLoading && (
            <div className="mt-5 rounded-[26px] border border-dashed border-[#dbd6e2] bg-[#fafafa] px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f2e9ff] text-[#7a39cc]">
                <PackageSearch size={30} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-950">No products found</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Try a different search term or switch category. Products matching the current system data will appear here.
              </p>
            </div>
          )}
        </div>
      </div>

      <Drawer
        title="Current Order"
        open={orderDrawerOpen}
        onClose={() => setOrderDrawerOpen(false)}
        width={520}
        destroyOnClose
        styles={{ body: { padding: 0, background: "#f7f8fd" } }}
      >
        <div className="space-y-4 p-4">
          <div className="overflow-hidden rounded-[28px] border border-gray-200/80 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <div className="border-b border-gray-100 bg-gradient-to-r from-indigo-50 via-white to-violet-50 px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-950">Customer</h2>
                  <p className="text-xs text-gray-500">Attach a customer or continue as walk-in.</p>
                </div>
                <Button type="text" className="!h-9 !rounded-full !border !border-gray-200 !bg-white/90 !px-3" icon={<ShoppingCart size={16} />} onClick={toggleCustomerOpen}>
                  Add
                </Button>
              </div>
            </div>
            <div className="p-4">
              <Form form={form} layout="vertical" initialValues={{ rate: 1 }}>
                <Form.Item name="contactId" label="Walk-in or customer">
                  <SearchableContactSelect onAddContact={toggleCustomerOpen} />
                </Form.Item>
                <div className="grid grid-cols-2 gap-3">
                  <Form.Item name="locationId" label="Location" className="!mb-0" rules={[{ required: true, message: "Select location" }]}>
                    <SearchableLocationSelect />
                  </Form.Item>
                  <Form.Item name="currencyId" label="Currency" className="!mb-0" rules={[{ required: true, message: "Select currency" }]}>
                    <SearchableCurrenciesSelect />
                  </Form.Item>
                </div>
                <Form.Item name="rate" label="Exchange rate" className="!mb-0 mt-3" rules={[{ required: true, message: "Enter exchange rate" }]}>
                  <InputNumber className="!w-full" min={0.000001} controls={false} placeholder="1" />
                </Form.Item>
              </Form>
            </div>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-gray-200/80 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <div className="border-b border-gray-100 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 px-4 py-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold">Cart</h2>
                  <p className="text-xs text-white/70">
                    {totalItems} item{totalItems === 1 ? "" : "s"}
                  </p>
                </div>
                <Badge count={cart.length} className="!text-white" />
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {cart.length ? (
                  cart.map((item) => (
                    <div key={item.id} className="rounded-[24px] border border-gray-200 bg-[linear-gradient(180deg,#ffffff_0%,#f9fafb_100%)] p-3 shadow-sm">
                      <div className="flex gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-gray-950">{item.name}</p>
                              <p className="text-[11px] uppercase tracking-[0.16em] text-gray-400">{item.sku || "-"}</p>
                            </div>
                            <button type="button" className="mt-0.5 rounded-full p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500" onClick={() => removeCartItem(item.id)}>
                              <X size={16} />
                            </button>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-900">{formatMoney(selectedCurrencyCode, item.unitPrice)}</p>
                            <p className="text-xs text-gray-500">{typeof item.availableStock === "number" ? `${Number(item.availableStock || 0)} left` : "No stock tracking"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <QuantityControl value={item.quantity} onDecrease={() => changeCartItemQuantity(item.id, -1)} onIncrease={() => changeCartItemQuantity(item.id, 1)} decreaseDisabled={item.quantity <= 0} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-white px-4 py-10 text-center">
                    <ShoppingCart className="mx-auto text-gray-300" size={44} />
                    <p className="mt-3 text-sm font-medium text-gray-700">Your cart is empty</p>
                    <p className="mt-1 text-xs text-gray-500">Use the product grid to build the order.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-gray-200/80 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <div className="border-b border-gray-100 bg-gradient-to-r from-white to-slate-50 px-4 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-950">Payments</h2>
                <Button type="text" icon={<WalletCards size={16} />} onClick={addPaymentRow}>
                  Add payment
                </Button>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {payments.map((payment, index) => (
                  <div key={payment.id} className="rounded-[24px] border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-3 shadow-sm">
                    <div className="grid grid-cols-[1fr_auto] gap-2">
                      <Select
                        placeholder="Payment method"
                        value={payment.accountId}
                        onChange={(value) => updatePaymentRow(payment.id, { accountId: value })}
                        options={paymentAccounts.map((account) => ({
                          value: account.id,
                          label: (
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-semibold uppercase text-gray-500">{account.type.charAt(0)}</span>
                              <span>{account.name}</span>
                            </div>
                          ),
                        }))}
                      />
                      <Button danger icon={<X size={14} />} onClick={() => removePaymentRow(payment.id)} />
                    </div>
                    <InputNumber
                      min={0}
                      controls={false}
                      className="mt-2 !w-full"
                      placeholder="Amount"
                      value={payment.amount}
                      onChange={(value) => updatePaymentRow(payment.id, { amount: Number(value || 0) })}
                    />
                    <Input
                      className="mt-2"
                      placeholder="Reference"
                      value={payment.reference}
                      onChange={(event) => updatePaymentRow(payment.id, { reference: event.target.value })}
                    />
                    <p className="mt-2 text-xs text-gray-400">Payment {index + 1}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-gray-200/80 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <div className="border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-950">Totals</h2>
                  <p className="text-xs text-gray-500">A quick glance at the sale.</p>
                </div>
                <Button type="text" icon={<Sparkles size={16} />} onClick={toggleTaxSelector}>
                  Tax
                </Button>
              </div>
            </div>
            <div className="p-4">
              <SummaryRow label="Subtotal" value={formatMoney(selectedCurrencyCode, subtotal)} />
              <SummaryRow label="Discounts" value={`- ${formatMoney(selectedCurrencyCode, discounts)}`} />
              {selectedTax ? (
                selectedTax.items.map((tax) => (
                  <SummaryRow key={`${tax.name}-${tax.value}`} label={`${tax.name} ${tax.value}%`} value={formatMoney(selectedCurrencyCode, taxableSubtotal * (Number(tax.value) / 100))} />
                ))
              ) : (
                <SummaryRow label="Taxes" value={formatMoney(selectedCurrencyCode, taxAmount)} />
              )}
              <div className="mt-4 rounded-[24px] bg-gradient-to-br from-slate-950 to-indigo-950 px-4 py-4 text-white shadow-[0_16px_40px_rgba(15,23,42,0.14)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">Grand Total</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight">{formatMoney(selectedCurrencyCode, grandTotal)}</p>
                <p className="mt-1 text-sm text-white/65">Ready to collect from the customer.</p>
              </div>
              <Divider className="!my-3" />
              <SummaryRow label="Total Paid" value={formatMoney(selectedCurrencyCode, totalPaid)} />
              <SummaryRow label="Remaining Balance" value={formatMoney(selectedCurrencyCode, balance)} strong />
              {change > 0 && <SummaryRow label="Change" value={formatMoney(selectedCurrencyCode, change)} />}

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button size="large" className="!h-11 !rounded-2xl" onClick={saveDraft}>
                  Hold Sale
                </Button>
                <Button size="large" className="!h-11 !rounded-2xl" onClick={clearCart}>
                  Clear Cart
                </Button>
              </div>
              <Button size="large" type="primary" block className="mt-3 !h-12 !rounded-2xl !border-0 !bg-gradient-to-r !from-indigo-600 !to-violet-600 !shadow-lg !shadow-indigo-200" loading={loading} onClick={submitCheckout} disabled={!cart.length}>
                Complete Sale
              </Button>
            </div>
          </div>
        </div>
      </Drawer>

      {customerOpen && <ContactsFormModal open={customerOpen} toggle={toggleCustomerOpen} />}
      {openTaxSelector && (
        <TaxSelector
          handleTaxSelect={(tax) => {
            setSelectedTax(tax);
            toggleTaxSelector();
          }}
          isDeferentProductTax={false}
          toggleDeferentProductTax={() => undefined}
          open={openTaxSelector}
          toggle={toggleTaxSelector}
        />
      )}
      {completedSale && receiptOpen && (
        <SaleShareDocumentModal
          open={receiptOpen}
          toggle={() => {
            toggleReceiptOpen();
            setCompletedSale(undefined);
          }}
          sale={completedSale}
          type={"receipt" as SaleDocumentType}
        />
      )}
    </div>
  );
}
