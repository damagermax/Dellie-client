"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge, Button, Divider, Drawer, Form, Input, InputNumber, Select, message } from "antd";
import { PackageSearch, Search, ShoppingCart, Sparkles, WalletCards, X } from "lucide-react";
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
import { MdOutlineHistoryToggleOff, MdOutlineShareLocation } from "react-icons/md";

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

function isTrackedInventory(type?: string) {
  return ["STOCK", "PACKAGING", "BUNDLE"].includes(String(type || ""));
}

function getProductImage(product: { imageUrl?: string | null; images?: string[] | null; media?: { url?: string | null }[] | null; productUrl?: string | null }) {
  return product.imageUrl || product.media?.[0]?.url || product.images?.[0] || product.productUrl || undefined;
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
    <div className="min-h-screen  ">
      <div className="flex h-screen w-full items-start  -bg-[#f7f8fd] ">
        <div className="mx-auto  h-screen overflow-scroll  w-full lg:w-[70%] border-r border-gray-200  bg-[#F5F5F5] ">
          <div className="sticky top-0 z-10 ">
            <div className="border-b bg-gray-50 border-[#ece8f2] px-3 py-3 ">
              <div className="flex  flex-col gap-3 md:flex-row lg:items-center lg:justify-between">
                <div className=" px-3">
                  <p className="font-medium text-xs flex items-center gap-1 text-gray-700">
                    <MdOutlineShareLocation /> <span> POS Location</span>
                  </p>
                  <p className=" text-green-700 font-semibold">{defaultLocation?.name || "No location set"}</p>
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
                    name={product.name}
                    imageUrl={getProductImage(product)}
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
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">Try a different search term or switch category. Products matching the current system data will appear here.</p>
              </div>
            )}
          </div>
        </div>

        <div className=" lg:flex flex-col justify-between  hidden lg:h-full  lg:w-[30%]">
          <div>
            <div className="p-[15.5px] border-b border-gray-200  flex justify-between">
              <p className="text-xl font-medium">Cart</p>

              <p className="text-sm flex items-center font-medium px-2 rounded-md bg-red-50 text-red-500">Clear Items</p>
            </div>
            <div className="">
              <div className=" max-h-[50vh] overflow-y-scroll">
                {cart.length ? (
                  cart.map((item) => (
                    <div key={item.id} className=" cursor-pointer border-b border-gray-200 bg-[linear-gradient(180deg,#ffffff_0%,#f9fafb_100%)] p-2 px-3 ">
                      <div className="flex gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm  font-medium text-gray-950">{item.name}</p>
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
            <button className=" py-2 w-full  text-white cursor-pointer font-medium text-base  bg-[#2d837d]">Checkout</button>
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
        />
      )}
    </div>
  );
}
