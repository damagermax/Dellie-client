"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Divider, Form, Input, InputNumber, Modal, Select, message } from "antd";
import { Check, PackageSearch, Search, ShoppingCart, Trash2, UserPlus, X } from "lucide-react";
import Image from "next/image";
import { useSelector } from "react-redux";
import ContactsFormModal from "@/components/contacts/ContactsFormModal";
import { SearchableContactSelect } from "@/components/contacts/SeachableContactSelect";
import { TaxSelector } from "@/components/settings/TaxSelector";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import useToggle from "@/hooks/UseToggle";
import {
  useCreateSaleMutation,
  useCreateTransactionActionMutation,
  useGetCategoriesQuery,
  useGetContactsQuery,
  useGetCurrencyQuery,
  useGetDefaultLocationQuery,
  useGetLocationsQuery,
  useGetPaymentMethodsQuery,
  useGetProductsQuery,
  useGetTaxesQuery,
} from "@/lib/redux/services";
import { getNormalPrice } from "@/lib/products/pricing";
import { RootState } from "@/lib/store";
import { ApplyPaymentInput, CategoryStatus, CategoryType, CreateSaleInput, Location, PaymentMethod, ProductListItem, Sale, Tax, TransactionType } from "@/types/index";
import { DEFAULT_POS_SETTINGS } from "@/types/store-settings";
import SaleShareDocumentModal, { SaleDocumentType } from "@/components/orders/SaleShareDocumentModal";
import CategoryCard from "./CategoryCard";
import ProductCard from "./ProductCard";
import QuantityControl from "./QuantityControl";
import { MdOutlineHistoryToggleOff, MdOutlineShareLocation } from "react-icons/md";
import { ProductVariantSelectorModal } from "@/components/products/ProductVariantSelectorModal";
import { ResolvedProductName, useResolvedProductNameMap } from "@/components/products/ResolvedProductName";

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
  paymentMethodId?: string;
  amount: number;
  reference?: string;
};

const DRAFT_KEY = "dellie-pos-draft";

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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

function isTrackedInventory(type?: string) {
  return ["STOCK", "PACKAGING", "BUNDLE"].includes(String(type || ""));
}

function getProductImage(product: { imageUrl?: string | null; images?: string[] | null; media?: { url?: string | null }[] | null; productUrl?: string | null }) {
  return product.imageUrl || product.media?.[0]?.url || product.images?.[0] || product.productUrl || undefined;
}

function CheckoutInfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">{label}</p>
      <p className="mt-1 truncate text-sm font-medium text-stone-900">{value}</p>
    </div>
  );
}

export default function POSPage() {
  const [form] = Form.useForm();
  const [searchValue, setSearchValue] = useState("");
  const [categoryId, setCategoryId] = useState<string>();
  const [cart, setCart] = useState<PosCartItem[]>([]);
  const [variantParent, setVariantParent] = useState<ProductListItem>();
  const [payments, setPayments] = useState<PosPaymentEntry[]>([{ id: uid(), amount: 0 }]);
  const [selectedTax, setSelectedTax] = useState<Tax>();
  const [customerOpen, toggleCustomerOpen] = useToggle();
  const [receiptOpen, toggleReceiptOpen] = useToggle();
  const [openTaxSelector, toggleTaxSelector] = useToggle();
  const [completedSale, setCompletedSale] = useState<Sale>();
  const [editingCartItemId, setEditingCartItemId] = useState<string | null>(null);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<{ id: string; name: string } | null>(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [showSplit, setShowSplit] = useState(false);
  const [pendingCheckoutOpen, setPendingCheckoutOpen] = useState(false);
  const [hasAppliedInitialPosSettings, setHasAppliedInitialPosSettings] = useState(false);
  const storeSettings = useSelector((state: RootState) => state.currentUser.storeSettings);
  const posSettings = storeSettings?.pos ? { ...DEFAULT_POS_SETTINGS, ...storeSettings.pos } : DEFAULT_POS_SETTINGS;

  const editingItem = useMemo(() => {
    if (!editingCartItemId) return null;
    return cart.find((item) => item.id === editingCartItemId) || null;
  }, [cart, editingCartItemId]);

  const debouncedSearch = useDebouncedValue(searchValue);
  const selectedCurrencyId = Form.useWatch("currencyId", form);

  const { data: defaultLocation } = useGetDefaultLocationQuery();
  const { data: locations } = useGetLocationsQuery({});
  const { data: contactsData } = useGetContactsQuery({});
  const { data: paymentMethods } = useGetPaymentMethodsQuery();
  const { data: taxes = [] } = useGetTaxesQuery();
  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery({ type: CategoryType.PRODUCT, status: CategoryStatus.ACTIVE });
  const { data: selectedCurrency } = useGetCurrencyQuery(selectedCurrencyId, { skip: !selectedCurrencyId });
  const { data: allProductsData } = useGetProductsQuery({ inPOS: true, limit: 100 });
  const { data: filteredProductsData, isLoading: productsLoading } = useGetProductsQuery({
    search: debouncedSearch,
    inPOS: true,
    categoryId,
    limit: 100,
  });
  const [createSale, { isLoading: creatingSale }] = useCreateSaleMutation();
  const [createPayment, { isLoading: creatingPayment }] = useCreateTransactionActionMutation();

  const loading = creatingSale || creatingPayment;
  const categories = useMemo(() => categoriesData?.data || [], [categoriesData]);
  const allProducts = useMemo(() => allProductsData?.data || [], [allProductsData]);
  const rawVisibleProducts = useMemo(() => filteredProductsData?.data || [], [filteredProductsData]);
  const selectedCurrencyCode = useMemo(() => {
    const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
    return selectedCurrency?.code || user?.store?.currency?.code || user?.store?.currencyCode || "";
  }, [selectedCurrency]);

  const contacts = useMemo(() => (Array.isArray(contactsData) ? contactsData : contactsData?.data || []), [contactsData]);

  const selectedContactName = useMemo(() => {
    if (!selectedContact?.id) return null;
    const found = contacts.find((c) => c.id === selectedContact.id);
    return found?.name || null;
  }, [selectedContact, contacts]);

  const visibleProducts = useMemo(() => {
    const search = debouncedSearch.trim().toLowerCase();
    if (!search) return rawVisibleProducts;
    return rawVisibleProducts.filter((product) => product.name.toLowerCase().includes(search));
  }, [rawVisibleProducts, debouncedSearch]);
  const visibleProductNames = useResolvedProductNameMap(
    visibleProducts.map((product) => ({
      id: product.id,
      name: product.name,
    })),
  );
  const cartProductNames = useResolvedProductNameMap(
    cart.map((item) => ({
      id: item.productId,
      name: item.name,
    })),
  );

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
    if (hasAppliedInitialPosSettings) {
      return;
    }

    const configuredLocationId = posSettings.defaultLocationId;
    const configuredLocation = configuredLocationId ? locations?.find((location) => location.id === configuredLocationId) : undefined;

    if (configuredLocation && !selectedLocation) {
      setSelectedLocation(configuredLocation);
      form.setFieldsValue({ locationId: configuredLocation.id });
      setHasAppliedInitialPosSettings(true);
      return;
    }

    if (defaultLocation?.id && !form.getFieldValue("locationId") && !selectedLocation) {
      form.setFieldsValue({ locationId: defaultLocation.id });
      setHasAppliedInitialPosSettings(true);
    }
  }, [defaultLocation, form, hasAppliedInitialPosSettings, locations, posSettings.defaultLocationId, selectedLocation]);

  useEffect(() => {
    const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
    const storeCurrencyId = user?.store?.currencyId;
    if (storeCurrencyId && !form.getFieldValue("currencyId")) {
      form.setFieldsValue({ currencyId: storeCurrencyId, rate: 1 });
    }
  }, [form]);

  useEffect(() => {
    if (taxes.length === 0) {
      return;
    }

    if (posSettings.applyTaxByDefault && posSettings.defaultTaxId) {
      const configuredTax = taxes.find((tax) => tax.id === posSettings.defaultTaxId);
      setSelectedTax(configuredTax);
      return;
    }

    setSelectedTax(undefined);
  }, [posSettings.applyTaxByDefault, posSettings.defaultTaxId, taxes]);

  const getCartItem = useCallback((productId: string) => cart.find((item) => item.productId === productId), [cart]);

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
          imageUrl: getProductImage(product),
          unitPrice: getNormalPrice(product),
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
      if (product.hasVariants || product.variants?.length) {
        setVariantParent(product);
        return;
      }
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
    setPayments((current) => [...current, { id: uid(), amount: 0, paymentMethodId: (paymentMethods as PaymentMethod[])?.[0]?.id || undefined }]);
  };

  const updatePaymentRow = (id: string, patch: Partial<PosPaymentEntry>) => {
    setPayments((current) => current.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));
  };

  const removePaymentRow = (id: string) => {
    setPayments((current) => (current.length > 1 ? current.filter((entry) => entry.id !== id) : [{ id: uid(), amount: 0 }]));
  };

  const clearCart = () => {
    setCart([]);
    setPayments([{ id: uid(), amount: 0 }]);
    if (posSettings.applyTaxByDefault && posSettings.defaultTaxId) {
      const configuredTax = taxes.find((tax) => tax.id === posSettings.defaultTaxId);
      setSelectedTax(configuredTax);
    } else {
      setSelectedTax(undefined);
    }
    setSelectedContact(null);
    form.setFieldValue("contactId", undefined);
    message.info("Cart cleared.");
  };

  const prepareCheckout = useCallback(() => {
    const methods = (paymentMethods as PaymentMethod[]) || [];
    const cashMethod = methods.find((m) => m.name.toLowerCase() === "cash") || methods[0];
    setPayments([{ id: uid(), amount: grandTotal, paymentMethodId: cashMethod?.id || undefined }]);
    setShowSplit(false);
    form.setFieldValue("posFulfillmentMode", posSettings.fulfillmentDefault);
  }, [form, grandTotal, paymentMethods, posSettings.fulfillmentDefault]);

  const openCheckout = useCallback(() => {
    if (!cart.length) {
      message.error("Add at least one item before checkout.");
      return;
    }

    const customerMode = posSettings.customerMode || "walk_in_default";

    if (customerMode === "require_customer" && !form.getFieldValue("contactId")) {
      setPendingCheckoutOpen(true);
      setCustomerModalOpen(true);
      message.error("Select a customer before checkout.");
      return;
    }

    if (customerMode === "prompt_before_checkout" && !form.getFieldValue("contactId")) {
      setPendingCheckoutOpen(true);
      setCustomerModalOpen(true);
      return;
    }

    prepareCheckout();
    setCheckoutModalOpen(true);
  }, [cart.length, form, posSettings.customerMode, prepareCheckout]);

  const submitCheckout = async () => {
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

      const validPayments = payments.filter((payment) => Number(payment.amount || 0) > 0);
      if (validPayments.some((payment) => !payment.paymentMethodId)) {
        message.error("Select a payment method for every payment entry.");
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
        posFulfillmentMode: form.getFieldValue("posFulfillmentMode") || posSettings.fulfillmentDefault,
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
          paymentMethodId: payment.paymentMethodId,
          rate: Number(values.rate || 1),
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
      setCheckoutModalOpen(false);
      if (posSettings.receiptAutoOpen) {
        toggleReceiptOpen();
      }
      clearCart();
      message.success(`Sale ${sale.saleNumber} completed.`);
    } catch {
      message.error("Checkout failed. Please check the payment details and stock availability.");
    }
  };

  return (
    <div className="min-h-screen  ">
      <div className="flex h-screen w-full items-start  -bg-[#f7f8fd] ">
        <div className="mx-auto  h-screen overflow-scroll  w-full lg:w-[70%] border-r border-gray-200  bg-[#F5F5F5] ">
          <div className="sticky top-0 z-10 ">
            <div className="border-b bg-gray-50 border-[#ece8f2] px-3 py-3 ">
              <div className="flex  flex-col gap-3 md:flex-row lg:items-center lg:justify-between">
                <div className="px-3 cursor-pointer" onClick={() => setLocationModalOpen(true)}>
                  {posSettings.counterName ? <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">{posSettings.counterName}</p> : null}
                  <p className="font-medium text-xs flex items-center gap-1 text-gray-700">
                    <MdOutlineShareLocation /> <span> POS Location</span>
                  </p>
                  <p className=" text-green-700 font-semibold">{selectedLocation?.name || defaultLocation?.name || "No location set"}</p>
                </div>

                <Input
                  size="middle"
                  allowClear
                  prefix={<Search size={18} className="text-gray-500" />}
                  placeholder="Search item here..."
                  className=" !w-[40%] !rounded-lg !border-[#dad6e2] !bg-gray-200 !px-4 !text-[16px] lg:!max-w-[360px]"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                />

                <div className=" text-lg font-semibold bg-gray-200/50 px-3 py-0.5 rounded-sm flex items-center gap-1 text-gray-700">
                  <MdOutlineHistoryToggleOff />
                  <p>History</p>
                </div>

                {/* <Button className="!h-14 !rounded-full !border-0 !bg-gradient-to-b !from-[#8f5ae0] !to-[#6e38c6] !px-8 !text-[16px] !font-semibold !text-white !shadow-[0_14px_28px_rgba(111,56,197,0.32)]" onClick={() => setOrderDrawerOpen(true)}>
                New Order
              </Button> */}
              </div>
            </div>

            <div className=" px-3 bg-[#F5F5F5] py-4 md:px-4">
              <div className="flex gap-4 overflow-x-auto ">
                <CategoryCard title="All Menu" count={allProducts.length} active={!categoryId} onClick={() => setCategoryId(undefined)} />
                {categories.map((category) => (
                  <CategoryCard key={category.id} title={category.name} count={categoryCounts.get(category.id) || 0} active={categoryId === category.id} onClick={() => setCategoryId(category.id)} />
                ))}
              </div>
            </div>
          </div>

          <div className="px-3  md:px-4 ">
            <AppViewLoader loading={productsLoading || categoriesLoading} />

            <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 ">
              {visibleProducts.map((product) => {
                const quantity = getCartItem(product.id)?.quantity || 0;
                const trackedInventory = isTrackedInventory(product.type);
                const unavailable = trackedInventory && Number(product.availableStock || 0) <= 0;

                return (
                  <ProductCard
                    key={product.id}
                    name={visibleProductNames[product.id] || product.name}
                    imageUrl={getProductImage(product)}
                    price={product.hasVariants ? "Select variant" : formatMoney(selectedCurrencyCode, getNormalPrice(product))}
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
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">Try a different search term or switch category. Products matching the current system data will appear here.</p>
              </div>
            )}
          </div>
        </div>

        <div className=" lg:flex flex-col justify-between  hidden lg:h-full  lg:w-[30%]">
          <div>
            <div className="p-[15.5px] border-b border-gray-200  flex justify-between items-center">
              <p className="text-xl font-medium">Cart</p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCustomerModalOpen(true)}
                  className="flex items-center gap-2 rounded-lg border border-stone-200/80 bg-stone-50 px-3 py-1.5 text-sm font-medium text-stone-700 transition-all duration-200 hover:border-stone-300 hover:bg-white active:scale-[0.97]"
                  aria-label="Select customer"
                >
                  {selectedContactName ? (
                    <>
                      <span className="truncate max-w-[120px]">{selectedContactName}</span>
                      <UserPlus size={16} strokeWidth={1.5} className="text-stone-400" />
                    </>
                  ) : (
                    <UserPlus size={16} strokeWidth={1.5} />
                  )}
                </button>
                {cart.length > 0 && (
                  <button type="button" onClick={clearCart} className="text-xs font-medium text-red-400 hover:text-red-600 transition-colors">
                    Clear
                  </button>
                )}
              </div>
            </div>
            <div className="">
              <div className=" max-h-[50vh] overflow-y-scroll">
                {cart.length ? (
                  cart.map((item) => (
                    <div key={item.id} className=" cursor-pointer border-b border-gray-200 bg-[linear-gradient(180deg,#ffffff_0%,#f9fafb_100%)] p-2 px-3 " onClick={() => setEditingCartItemId(item.id)}>
                      <div className="flex gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <ResolvedProductName name={cartProductNames[item.productId] || item.name} productId={item.productId} className="truncate text-sm  font-medium text-gray-950" />
                            </div>
                            {/* <button type="button" className="mt-0.5 rounded-full p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500" onClick={() => removeCartItem(item.id)}>
                              <X size={16} />
                            </button> */}
                          </div>

                          <div className=" flex justify-between items-center w-full">
                            <p className="text-xs    font-normal text-gray-600">
                              {"("} GHS {item.unitPrice || "-"} <span className=" text-[10px]">x</span>
                              {item.quantity}
                              {")"}
                            </p>

                            <p className="text-green-900 font-semibold"> GHS {item.quantity * item.unitPrice || "-"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className=" bg-gradient-to-br from-gray-50 to-white px-4 py-10 text-center">
                    <ShoppingCart className="mx-auto text-gray-300" size={44} />
                    <p className="mt-3 text-sm font-medium text-gray-700">Your cart is empty</p>
                    <p className="mt-1 text-xs text-gray-500">Use the product grid to build the order.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className=" flex  border-2 mx-4 mb-3 rounded-sm overflow-clip  border-[#2d837d]">
            <button className=" py-2 w-full  text-[#2d837d] cursor-pointer font-medium text-base ">Save Cart</button>
            <button onClick={openCheckout} className=" py-2 w-full  text-white cursor-pointer font-medium text-base  bg-[#2d837d]">
              Checkout
            </button>
          </div>
        </div>
      </div>

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
          paperSize={posSettings.receiptPaperSize}
        />
      )}

      <ProductVariantSelectorModal
        parent={variantParent}
        onClose={() => setVariantParent(undefined)}
        priceLabel={(price) => formatMoney(selectedCurrencyCode, price)}
        onSelect={(variant) => {
          setCartQuantity(variant, (getCartItem(variant.id)?.quantity || 0) + 1);
          setVariantParent(undefined);
        }}
      />

      <Modal
        title={
          <div className="pr-8">
            <p className="text-lg font-semibold text-stone-950">Complete Sale</p>
            <p className="mt-1 text-sm text-stone-500">Review totals, capture payment, and finish checkout.</p>
          </div>
        }
        open={checkoutModalOpen}
        onCancel={() => setCheckoutModalOpen(false)}
        footer={null}
        width={560}
        centered
        destroyOnHidden
        styles={{ body: { padding: 0 }, header: { padding: "18px 18px 0" } }}
      >
        <div className="max-h-[85vh] overflow-y-auto px-4 pb-4 pt-3 sm:px-5">
          <div className="space-y-4">
            <section className="overflow-hidden rounded-[28px] bg-stone-950 text-white">
              <div className="bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.16),_transparent_42%),linear-gradient(135deg,#1c1917_0%,#0f766e_100%)] px-4 py-4 sm:px-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">Amount Due</p>
                    <p className="mt-2 text-3xl font-semibold leading-none">{formatMoney(selectedCurrencyCode, grandTotal)}</p>
                  </div>
                  <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/80">{totalItems} item{totalItems === 1 ? "" : "s"}</div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-2xl bg-white/10 px-3 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/55">Subtotal</p>
                    <p className="mt-1 text-sm font-medium text-white">{formatMoney(selectedCurrencyCode, subtotal)}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 px-3 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/55">Tax</p>
                    <p className="mt-1 text-sm font-medium text-white">{formatMoney(selectedCurrencyCode, taxAmount)}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 px-3 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/55">Change</p>
                    <p className="mt-1 text-sm font-medium text-white">{formatMoney(selectedCurrencyCode, change)}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[24px] border border-stone-200 bg-white p-3 sm:p-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowSplit(false)}
                  className={`flex h-11 items-center justify-center rounded-2xl text-sm font-medium transition-all ${
                    !showSplit ? "bg-stone-950 text-white shadow-[0_10px_24px_rgba(28,25,23,0.16)]" : "bg-stone-100 text-stone-500"
                  }`}
                >
                  Single payment
                </button>
                <button
                  type="button"
                  onClick={() => setShowSplit(true)}
                  className={`flex h-11 items-center justify-center rounded-2xl text-sm font-medium transition-all ${
                    showSplit ? "bg-stone-950 text-white shadow-[0_10px_24px_rgba(28,25,23,0.16)]" : "bg-stone-100 text-stone-500"
                  }`}
                >
                  Split payment
                </button>
              </div>

              {posSettings.allowFulfillmentChoiceAtCheckout ? (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Fulfillment</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "fulfill_now", label: "Fulfill now" },
                      { value: "pending", label: "Leave pending" },
                    ].map((option) => {
                      const isSelected = (form.getFieldValue("posFulfillmentMode") || posSettings.fulfillmentDefault) === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => form.setFieldValue("posFulfillmentMode", option.value)}
                          className={`rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                            isSelected ? "border border-[#2d837d] bg-[#2d837d] text-white" : "border border-stone-200 bg-stone-50 text-stone-700"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {showSplit ? (
                <div className="mt-4 space-y-3">
                  {(payments as PosPaymentEntry[]).map((payment, index) => (
                    <div key={payment.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold text-stone-900">Payment {index + 1}</p>
                        <button
                          type="button"
                          onClick={() => removePaymentRow(payment.id)}
                          className="flex size-8 items-center justify-center rounded-full text-stone-300 transition-colors hover:bg-red-50 hover:text-red-500"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Select
                          size="large"
                          className="!w-full"
                          placeholder="Choose payment method"
                          value={payment.paymentMethodId}
                          onChange={(value) => updatePaymentRow(payment.id, { paymentMethodId: value })}
                          options={(paymentMethods as PaymentMethod[])?.map((m) => ({ value: m.id, label: m.name }))}
                        />
                        <InputNumber
                          size="large"
                          className="!w-full"
                          placeholder="0.00"
                          value={payment.amount}
                          min={0}
                          precision={2}
                          onChange={(value) => updatePaymentRow(payment.id, { amount: Number(value || 0) })}
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addPaymentRow}
                    className="flex h-11 w-full items-center justify-center rounded-2xl border border-dashed border-[#2d837d]/35 bg-[#2d837d]/5 text-sm font-medium text-[#2d837d] transition-colors hover:bg-[#2d837d]/10"
                  >
                    + Add payment row
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <CheckoutInfoCard label="Paid" value={formatMoney(selectedCurrencyCode, totalPaid)} />
                    <CheckoutInfoCard label="Due" value={formatMoney(selectedCurrencyCode, balance)} />
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Payment Method</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(paymentMethods as PaymentMethod[])?.map((method) => {
                        const isSelected = payments[0]?.paymentMethodId === method.id;
                        return (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => updatePaymentRow(payments[0]?.id, { paymentMethodId: method.id })}
                            className={`rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                              isSelected
                                ? "border border-[#2d837d] bg-[#2d837d] text-white shadow-[0_10px_24px_rgba(45,131,125,0.24)]"
                                : "border border-stone-200 bg-stone-50 text-stone-700"
                            }`}
                          >
                            {method.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-stone-900">Amount</p>
                      <p className="text-sm font-medium text-stone-500">{formatMoney(selectedCurrencyCode, grandTotal)}</p>
                    </div>
                    <InputNumber
                      size="large"
                      className="!w-full"
                      value={payments[0]?.amount}
                      min={0}
                      max={grandTotal}
                      precision={2}
                      onChange={(value) => updatePaymentRow(payments[0]?.id, { amount: Number(value || 0) })}
                    />
                  </div>
                </div>
              )}
            </section>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <Button size="large" className="!h-12 !rounded-2xl" onClick={() => setCheckoutModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                size="large"
                className="!h-12 !rounded-2xl !border-0 !shadow-none"
                style={{ backgroundColor: "#2d837d" }}
                loading={loading}
                onClick={submitCheckout}
              >
                Complete Sale
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal title="Select Customer" open={customerModalOpen} onCancel={() => setCustomerModalOpen(false)} footer={null} width={480} centered destroyOnHidden>
        <div className="space-y-3">
          <SearchableContactSelect
            value={selectedContact?.id}
            onChange={(contactId) => {
              if (!contactId) return;
              setSelectedContact({ id: contactId as string, name: "" });
              form.setFieldsValue({ contactId });
              setCustomerModalOpen(false);
              if (pendingCheckoutOpen) {
                setPendingCheckoutOpen(false);
                prepareCheckout();
                setCheckoutModalOpen(true);
              }
            }}
            onAddContact={() => {
              setCustomerModalOpen(false);
              toggleCustomerOpen();
            }}
          />
          {posSettings.customerMode !== "require_customer" ? (
            <>
              <Divider className="!my-2 !text-xs !text-stone-300">or</Divider>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    setSelectedContact(null);
                    form.setFieldValue("contactId", undefined);
                    setCustomerModalOpen(false);
                    if (pendingCheckoutOpen) {
                      setPendingCheckoutOpen(false);
                      prepareCheckout();
                      setCheckoutModalOpen(true);
                    }
                  }}
                >
                  Walk-in Customer
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    setCustomerModalOpen(false);
                    toggleCustomerOpen();
                  }}
                >
                  + New Contact
                </Button>
              </div>
            </>
          ) : (
            <Button
              block
              onClick={() => {
                setCustomerModalOpen(false);
                toggleCustomerOpen();
              }}
            >
              + New Contact
            </Button>
          )}
        </div>
      </Modal>

      <Modal title="Select POS Location" className="overflow-clip" open={locationModalOpen} onCancel={() => setLocationModalOpen(false)} footer={null} width={580} centered destroyOnHidden>
        <div className="space-y-1.5  ">
          {locations?.map((location) => {
            const isActive = location.id === (selectedLocation?.id || defaultLocation?.id || form.getFieldValue("locationId"));
            return (
              <div
                key={location.id}
                onClick={() => {
                  setSelectedLocation(location);
                  form.setFieldsValue({ locationId: location.id });
                  setLocationModalOpen(false);
                }}
                className="flex cursor-pointer items-center justify-between  border-b  border-stone-200/70 p-3 px-5 transition-all duration-200 hover:border-stone-300 hover:bg-stone-50"
              >
                <div>
                  <p className="text-sm font-medium text-stone-800">{location.name}</p>
                  {location.address && <p className="mt-0.5 text-xs text-stone-500">{location.address}</p>}
                </div>
                {isActive && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                    <Check size={14} className="text-emerald-600" strokeWidth={3} />
                  </div>
                )}
              </div>
            );
          })}
          {(!locations || locations.length === 0) && <p className="py-8 text-center text-sm text-stone-400">No locations found.</p>}
        </div>
      </Modal>

      <Modal
        title={
          <div>
            <p className="text-lg font-semibold text-stone-950">Edit Item</p>
            <p className="mt-1 text-sm text-stone-500">Adjust quantity or remove this item from the cart.</p>
          </div>
        }
        open={!!editingCartItemId}
        onCancel={() => setEditingCartItemId(null)}
        footer={null}
        width={520}
        destroyOnHidden
        centered
        styles={{ body: { padding: 0 }, header: { padding: "18px 18px 0" } }}
      >
        {editingItem && (
          <div className="px-4 pb-4 pt-3 sm:px-5">
            <div className="space-y-4">
              <section className="overflow-hidden rounded-[26px] border border-stone-200 bg-white">
                <div className="bg-[linear-gradient(135deg,#fafaf9_0%,#f5f5f4_100%)] px-4 py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200">
                      {editingItem?.imageUrl ? (
                        <div className="relative h-full w-full">
                          <Image src={editingItem.imageUrl} alt="" fill className="object-cover" sizes="80px" />
                        </div>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-stone-300">
                          <PackageSearch size={28} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg font-semibold leading-tight text-stone-950">{editingItem?.name}</p>
                      {editingItem?.sku && <p className="mt-1 text-sm text-stone-500">SKU: {editingItem.sku}</p>}
                      <div className="mt-3 inline-flex items-center rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-stone-900 ring-1 ring-stone-200">
                        Unit Price: {formatMoney(selectedCurrencyCode, editingItem.unitPrice)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 px-4 py-4">
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-stone-950">Quantity</p>
                        <p className="mt-1 text-xs text-stone-500">Tap minus or plus to change the number of items.</p>
                      </div>
                      <div className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-stone-900 ring-1 ring-stone-200">{editingItem.quantity}</div>
                    </div>
                    <QuantityControl value={editingItem.quantity} onDecrease={() => changeCartItemQuantity(editingItem.id, -1)} onIncrease={() => changeCartItemQuantity(editingItem.id, 1)} decreaseDisabled={editingItem.quantity <= 1} />
                  </div>

                  <div className="rounded-2xl bg-stone-950 px-4 py-4 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">Line Total</p>
                    <p className="mt-2 text-3xl font-semibold leading-none">{formatMoney(selectedCurrencyCode, editingItem.unitPrice * editingItem.quantity)}</p>
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  danger
                  size="large"
                  icon={<Trash2 size={16} />}
                  className="!h-12 !rounded-2xl"
                  onClick={() => {
                    removeCartItem(editingItem.id);
                    setEditingCartItemId(null);
                  }}
                >
                  Remove
                </Button>
                <Button type="primary" size="large" className="!h-12 !rounded-2xl !border-0 !shadow-none" style={{ backgroundColor: "#2d837d" }} onClick={() => setEditingCartItemId(null)}>
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
