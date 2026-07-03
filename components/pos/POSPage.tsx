"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Form, type MenuProps, message } from "antd";
import { useSelector } from "react-redux";
import ContactsFormModal from "@/components/contacts/ContactsFormModal";
import { useResolvedProductNameMap } from "@/components/products/ResolvedProductName";
import { ProductVariantSelectorModal } from "@/components/products/ProductVariantSelectorModal";
import SaleShareDocumentModal, { SaleDocumentType } from "@/components/orders/SaleShareDocumentModal";
import { TaxSelector } from "@/components/settings/TaxSelector";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { useStoreCurrencyCode } from "@/hooks/useStoreCurrencyCode";
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
  useGetSalesQuery,
  useGetTaxesQuery,
} from "@/lib/redux/services";
import { getNormalPrice } from "@/lib/products/pricing";
import { RootState } from "@/lib/store";
import { CategoryStatus, CategoryType, Location, PaymentMethod, ProductListItem, Sale, Tax } from "@/types/index";
import { Contact, ContactRole } from "@/types/contact";
import { DEFAULT_POS_SETTINGS } from "@/types/store-settings";
import { DropdownItemLabel } from "@/components/ui/ActionDropdown";
import { GrUserExpert } from "react-icons/gr";
import { HiOutlineTrash } from "react-icons/hi2";
import { RiDraftLine } from "react-icons/ri";
import PosCartSidebar from "./PosCartSidebar";
import PosCheckoutModal from "./PosCheckoutModal";
import PosCustomerModal from "./PosCustomerModal";
import PosEditItemModal from "./PosEditItemModal";
import PosHeader from "./PosHeader";
import PosHistoryDrawer from "./PosHistoryDrawer";
import PosLocationModal from "./PosLocationModal";
import PosProductGrid from "./PosProductGrid";
import { usePosCartTotals } from "./hooks/usePosCartTotals";
import { usePosCheckout } from "./hooks/usePosCheckout";
import { usePosSavedCarts } from "./hooks/usePosSavedCarts";
import type { PosCartItem, PosPaymentEntry, SavedPosCart, SelectedPosContact } from "./types";
import { buildTaxBreakdown, formatMoney, getCartItem, getProductImage, getTodayRange, isTrackedInventory, uid } from "./utils";

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
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedContact, setSelectedContact] = useState<SelectedPosContact>(null);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [activeSavedCartId, setActiveSavedCartId] = useState<string | null>(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [showSplit, setShowSplit] = useState(false);
  const [posFulfillmentMode, setPosFulfillmentMode] = useState<"fulfill_now" | "pending" | undefined>(undefined);
  const [pendingCheckoutOpen, setPendingCheckoutOpen] = useState(false);
  const [hasAppliedInitialPosSettings, setHasAppliedInitialPosSettings] = useState(false);
  const currentUser = useSelector((state: RootState) => state.currentUser.user);
  const currentStore = useSelector((state: RootState) => state.currentUser.store);
  const storeSettings = useSelector((state: RootState) => state.currentUser.storeSettings);
  const posSettings = storeSettings?.pos ? { ...DEFAULT_POS_SETTINGS, ...storeSettings.pos } : DEFAULT_POS_SETTINGS;

  const editingItem = useMemo(() => {
    if (!editingCartItemId) return null;
    return cart.find((item) => item.id === editingCartItemId) || null;
  }, [cart, editingCartItemId]);

  const debouncedSearch = useDebouncedValue(searchValue);
  const debouncedCustomerSearch = useDebouncedValue(customerSearch);
  const selectedCurrencyId = Form.useWatch("currencyId", form);
  const historyRange = useMemo(() => getTodayRange(), []);

  const { data: defaultLocation } = useGetDefaultLocationQuery();
  const { data: locations } = useGetLocationsQuery({});
  const { data: contactsData, isLoading: contactsLoading } = useGetContactsQuery({
    role: ContactRole.CUSTOMER,
    search: debouncedCustomerSearch || undefined,
  });
  const { data: paymentMethods } = useGetPaymentMethodsQuery({ status: "active", showInPOS: true });
  const { data: taxes = [] } = useGetTaxesQuery();
  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery({ type: CategoryType.PRODUCT, status: CategoryStatus.ACTIVE });
  const { data: selectedCurrency } = useGetCurrencyQuery(selectedCurrencyId, { skip: !selectedCurrencyId });
  const currentPosLocationId = selectedLocation?.id || normalizeEntityId(form.getFieldValue("locationId")) || defaultLocation?.id;
  const activeLocationId = currentPosLocationId;
  const { data: allProductsData } = useGetProductsQuery({ inPOS: true, locationId: activeLocationId, limit: 100 });
  const { data: filteredProductsData, isLoading: productsLoading } = useGetProductsQuery({
    search: debouncedSearch,
    inPOS: true,
    categoryId,
    locationId: activeLocationId,
    limit: 100,
  });
  const [createSale, { isLoading: creatingSale }] = useCreateSaleMutation();
  const [createPayment, { isLoading: creatingPayment }] = useCreateTransactionActionMutation();
  const storeCurrencyCode = useStoreCurrencyCode();
  const { data: salesHistoryData, isFetching: salesHistoryLoading } = useGetSalesQuery(
    {
      source: "POS",
      createdBy: currentUser?.id,
      dateFrom: historyRange.start,
      dateTo: historyRange.end,
      sortBy: "date",
      sortOrder: "desc",
      limit: 30,
    },
    { skip: !currentUser?.id },
  );

  const categories = useMemo(() => categoriesData?.data || [], [categoriesData]);
  const allProducts = useMemo(() => allProductsData?.data || [], [allProductsData]);
  const rawVisibleProducts = useMemo(() => filteredProductsData?.data || [], [filteredProductsData]);
  const availablePaymentMethods = useMemo(() => (paymentMethods as PaymentMethod[]) || [], [paymentMethods]);
  const selectedCurrencyCode = useMemo(() => {
    const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
    return selectedCurrency?.code || storeCurrencyCode || user?.store?.currency?.code || user?.store?.currencyCode || user?.store?.settings?.currency || "";
  }, [selectedCurrency, storeCurrencyCode]);
  const contacts = useMemo(() => (Array.isArray(contactsData) ? contactsData : contactsData?.data || []), [contactsData]);
  const todaysCompletedSales = useMemo(() => salesHistoryData?.data || [], [salesHistoryData]);
  const currentUserId = currentUser?.id || "";
  const selectedContactName = useMemo(() => {
    if (!selectedContact?.id) return null;
    const found = contacts.find((contact) => contact.id === selectedContact.id);
    return found?.name || selectedContact.name || null;
  }, [contacts, selectedContact]);

  const {
    savedCarts,
    writeSavedCarts,
    removeSavedCart: removeSavedCartFromStorage,
  } = usePosSavedCarts({
    currentUserId,
    dayKey: historyRange.dayKey,
  });

  const visibleProducts = useMemo(() => {
    const search = debouncedSearch.trim().toLowerCase();
    if (!search) return rawVisibleProducts;
    return rawVisibleProducts.filter((product) => product.name.toLowerCase().includes(search));
  }, [debouncedSearch, rawVisibleProducts]);

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

  const { totalItems, subtotal, discounts, taxableSubtotal, taxAmount, grandTotal, totalPaid, balance, change } = usePosCartTotals(cart, payments, selectedTax);
  const taxSummary = useMemo(
    () => buildTaxBreakdown(taxableSubtotal, selectedTax),
    [selectedTax, taxableSubtotal],
  );
  const selectedPaymentMethodName = useMemo(() => {
    const selectedMethodId = payments[0]?.paymentMethodId;
    return availablePaymentMethods.find((method) => method.id === selectedMethodId)?.name || null;
  }, [availablePaymentMethods, payments]);
  const defaultTaxIdForSelectedLocation = currentPosLocationId ? posSettings.defaultTaxByLocationId?.[currentPosLocationId] : undefined;
  const fallbackLocationId = currentPosLocationId;
  const fallbackCurrencyId = normalizeEntityId(form.getFieldValue("currencyId")) || normalizeEntityId(currentStore?.currencyId) || normalizeEntityId(currentUser?.store?.currencyId);
  const stockByProductId = useMemo(() => {
    const map = new Map<string, { availableStock?: number; type?: string; name?: string }>();

    for (const product of allProducts) {
      map.set(product.id, {
        availableStock: isTrackedInventory(product.type) ? product.availableStock : undefined,
        type: product.type,
        name: product.name,
      });

      for (const variant of product.variants || []) {
        map.set(variant.id, {
          availableStock: isTrackedInventory(variant.type) ? variant.availableStock : undefined,
          type: variant.type,
          name: variant.name,
        });
      }
    }

    return map;
  }, [allProducts]);
  const stockIssues = useMemo(
    () =>
      cart.filter((item) => {
        if (!isTrackedInventory(item.type)) {
          return false;
        }

        return item.quantity > Number(item.availableStock || 0);
      }),
    [cart],
  );

  useEffect(() => {
    if (!cart.length || !stockByProductId.size) {
      return;
    }

    setCart((current) =>
      current.map((item) => {
        const stockState = stockByProductId.get(item.productId);
        if (!stockState) {
          return item;
        }

        return {
          ...item,
          availableStock: stockState.availableStock,
          type: stockState.type || item.type,
          name: stockState.name || item.name,
        };
      }),
    );
  }, [cart.length, stockByProductId]);

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
    const storeCurrencyId = normalizeEntityId(user?.store?.currencyId);
    if (storeCurrencyId && !form.getFieldValue("currencyId")) {
      form.setFieldsValue({ currencyId: storeCurrencyId, rate: 1 });
    }
  }, [form]);

  useEffect(() => {
    if (taxes.length === 0) {
      return;
    }

    if (posSettings.applyTaxByDefault && defaultTaxIdForSelectedLocation) {
      const configuredTax = taxes.find((tax) => tax.id === defaultTaxIdForSelectedLocation);
      setSelectedTax(configuredTax);
      return;
    }

    setSelectedTax(undefined);
  }, [defaultTaxIdForSelectedLocation, posSettings.applyTaxByDefault, taxes]);

  const setCartQuantity = useCallback((product: ProductListItem, quantity: number) => {
    setCart((current) => {
      const existing = current.find((item) => item.productId === product.id);
      const nextQuantity = Number(quantity || 0);
      const trackedInventory = isTrackedInventory(product.type);
      const availableStock = Number(product.availableStock || 0);

      if (nextQuantity <= 0) {
        return current.filter((item) => item.productId !== product.id);
      }

      if (trackedInventory && nextQuantity > availableStock) {
        message.warning(`Only ${availableStock} in stock at this location.`);
        return current;
      }

      if (existing) {
        return current.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: nextQuantity,
                availableStock: trackedInventory ? product.availableStock : undefined,
                type: product.type,
              }
            : item,
        );
      }

      return [
        ...current,
        {
          id: uid(),
          productId: product.id,
          name: product.name,
          sku: product.sku,
          imageUrl: getProductImage(product),
          type: product.type,
          unitPrice: getNormalPrice(product),
          quantity: nextQuantity,
          availableStock: trackedInventory ? product.availableStock : undefined,
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
        if (isTrackedInventory(item.type) && nextQuantity > Number(item.availableStock || 0)) {
          message.warning(`Only ${Number(item.availableStock || 0)} in stock at this location.`);
          return [item];
        }

        return [{ ...item, quantity: nextQuantity }];
      }),
    );
  }, []);

  const getCartQuantity = useCallback((productId: string) => getCartItem(cart, productId)?.quantity || 0, [cart]);

  const addQuantity = useCallback(
    (product: ProductListItem) => {
      if (product.hasVariants || product.variants?.length) {
        setVariantParent(product);
        return;
      }
      const current = getCartItem(cart, product.id)?.quantity || 0;
      setCartQuantity(product, current + 1);
    },
    [cart, setCartQuantity],
  );

  const clearSelectedCustomer = useCallback(() => {
    setSelectedContact(null);
    form.setFieldValue("contactId", undefined);
  }, [form]);

  const clearCart = useCallback(() => {
    setCart([]);
    setPayments([{ id: uid(), amount: 0 }]);
    setCategoryId(undefined);
    setSearchValue("");
    if (posSettings.applyTaxByDefault && defaultTaxIdForSelectedLocation) {
      const configuredTax = taxes.find((tax) => tax.id === defaultTaxIdForSelectedLocation);
      setSelectedTax(configuredTax);
    } else {
      setSelectedTax(undefined);
    }
    clearSelectedCustomer();
    setActiveSavedCartId(null);
    message.info("Cart cleared.");
  }, [clearSelectedCustomer, defaultTaxIdForSelectedLocation, posSettings.applyTaxByDefault, taxes]);

  const saveCartDraft = useCallback(() => {
    if (!cart.length) {
      message.error("Add at least one item before saving.");
      return;
    }

    if (!currentUserId) {
      message.error("Unable to save cart for this user.");
      return;
    }

    const draft: SavedPosCart = {
      id: uid(),
      userId: currentUserId,
      dayKey: historyRange.dayKey,
      savedAt: new Date().toISOString(),
      formValues: form.getFieldsValue(),
      cart,
      payments,
      categoryId,
      searchValue,
      selectedTax,
      selectedContact,
    };

    const nextSavedCarts = activeSavedCartId ? savedCarts.filter((entry) => entry.id !== activeSavedCartId) : savedCarts;
    writeSavedCarts([draft, ...nextSavedCarts]);
    clearCart();
    message.success("Cart saved.");
  }, [activeSavedCartId, cart, categoryId, clearCart, currentUserId, form, historyRange.dayKey, payments, savedCarts, searchValue, selectedContact, selectedTax, writeSavedCarts]);

  const cartActionItems = useMemo<NonNullable<MenuProps["items"]>>(
    () => [
      {
        key: "save_cart",
        label: <DropdownItemLabel icon={<RiDraftLine size={15} />} text="Save cart" />,
      },
      ...(selectedContactName
        ? [
            {
              key: "remove_customer",
              label: <DropdownItemLabel icon={<GrUserExpert size={15} />} text="Remove customer" />,
            },
          ]
        : []),
      {
        key: "clear_cart",
        label: <DropdownItemLabel icon={<HiOutlineTrash size={15} />} text="Clear cart" danger />,
        danger: true,
      },
    ],
    [selectedContactName],
  );

  const handleCartActionClick = useCallback<Required<MenuProps>["onClick"]>(
    ({ key }) => {
      if (key === "save_cart") {
        saveCartDraft();
        return;
      }
      if (key === "remove_customer") {
        clearSelectedCustomer();
        message.info("Customer removed from cart.");
        return;
      }
      if (key === "clear_cart") {
        clearCart();
      }
    },
    [clearCart, clearSelectedCustomer, saveCartDraft],
  );

  const restoreSavedCart = useCallback(
    (savedCart: SavedPosCart) => {
      if (savedCart.formValues) {
        form.setFieldsValue(savedCart.formValues);
      }
      setCart(savedCart.cart || []);
      setPayments(savedCart.payments?.length ? savedCart.payments : [{ id: uid(), amount: 0 }]);
      setCategoryId(savedCart.categoryId || undefined);
      setSearchValue(savedCart.searchValue || "");
      setSelectedTax(savedCart.selectedTax);
      setSelectedContact(savedCart.selectedContact || null);
      if (savedCart.selectedContact?.id) {
        form.setFieldValue("contactId", savedCart.selectedContact.id);
      } else {
        form.setFieldValue("contactId", undefined);
      }
      setActiveSavedCartId(savedCart.id);
      setHistoryDrawerOpen(false);
      message.success("Saved cart restored.");
    },
    [form],
  );

  const removeSavedCart = useCallback(
    (savedCartId: string) => {
      removeSavedCartFromStorage(savedCartId);
      if (activeSavedCartId === savedCartId) {
        setActiveSavedCartId(null);
      }
    },
    [activeSavedCartId, removeSavedCartFromStorage],
  );

  const createSaleAction = useCallback((payload: Parameters<typeof createSale>[0]) => createSale(payload).unwrap(), [createSale]);
  const createPaymentAction = useCallback((payload: Parameters<typeof createPayment>[0]) => createPayment(payload).unwrap(), [createPayment]);

  const { cashPaymentMethodIds, getPaymentAmountLimit, updatePaymentRow, removePaymentRow, openSplitPayment, prepareCheckout, submitCheckout } = usePosCheckout({
    payments,
    setPayments,
    availablePaymentMethods,
    grandTotal,
    form,
    posSettings,
    setPosFulfillmentMode,
    submitParams: {
      cart,
      payments,
      form,
      grandTotal,
      posFulfillmentMode,
      posSettings,
      fallbackLocationId,
      fallbackCurrencyId,
      selectedTax,
      createSaleAction,
      createPaymentAction,
      setCompletedSale,
      setCheckoutModalOpen,
      toggleReceiptOpen,
      activeSavedCartId,
      removeSavedCart,
      clearCart,
      setPendingCheckoutOpen,
      setCustomerModalOpen,
    },
  });

  const openCheckout = useCallback(() => {
    if (!cart.length) {
      message.error("Add at least one item before checkout.");
      return;
    }

    if (stockIssues.length) {
      const firstIssue = stockIssues[0];
      message.error(`${firstIssue.name} exceeds stock for this location. Reduce quantity before checkout.`);
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
    setShowSplit(false);
    setCheckoutModalOpen(true);
  }, [cart.length, form, posSettings.customerMode, prepareCheckout, stockIssues]);

  const handleOpenSplitPayment = useCallback(() => {
    openSplitPayment();
    setShowSplit(true);
  }, [openSplitPayment]);

  const continuePendingCheckout = useCallback(() => {
    setPendingCheckoutOpen(false);
    prepareCheckout();
    setShowSplit(false);
    setCheckoutModalOpen(true);
  }, [prepareCheckout]);

  const handleSelectCustomer = useCallback(
    (contact: Contact) => {
      setSelectedContact({ id: contact.id, name: contact.name || contact.displayName || "" });
      form.setFieldsValue({ contactId: contact.id });
      setCustomerModalOpen(false);
      if (pendingCheckoutOpen) {
        continuePendingCheckout();
      }
    },
    [continuePendingCheckout, form, pendingCheckoutOpen],
  );

  const handleWalkInCustomer = useCallback(() => {
    clearSelectedCustomer();
    setCustomerModalOpen(false);
    if (pendingCheckoutOpen) {
      continuePendingCheckout();
    }
  }, [clearSelectedCustomer, continuePendingCheckout, pendingCheckoutOpen]);

  const loading = creatingSale || creatingPayment;

  return (
    <div className="min-h-screen  ">
      <div className="flex h-screen w-full items-start  -bg-[#f7f8fd] ">
        <div className="mx-auto  h-screen overflow-scroll  w-full lg:w-[70%] border-r border-gray-200  bg-[#F5F5F5] ">
          <PosHeader
            counterName={posSettings.counterName}
            selectedLocationName={selectedLocation?.name || defaultLocation?.name}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            onOpenLocation={() => setLocationModalOpen(true)}
            onOpenHistory={() => setHistoryDrawerOpen(true)}
          />
          <PosProductGrid
            categories={categories}
            allProductsCount={allProducts.length}
            categoryId={categoryId}
            categoryCounts={categoryCounts}
            visibleProducts={visibleProducts}
            visibleProductNames={visibleProductNames}
            selectedCurrencyCode={selectedCurrencyCode}
            productsLoading={productsLoading}
            categoriesLoading={categoriesLoading}
            getCartQuantity={getCartQuantity}
            onSelectCategory={setCategoryId}
            onAddProduct={addQuantity}
          />
        </div>

        <PosCartSidebar
          selectedContactName={selectedContactName}
          cartActionItems={cartActionItems}
          onCartActionClick={handleCartActionClick}
          cart={cart}
          stockIssues={stockIssues}
          cartProductNames={cartProductNames}
          selectedCurrencyCode={selectedCurrencyCode}
          subtotal={subtotal}
          discounts={discounts}
          taxableSubtotal={taxableSubtotal}
          taxAmount={taxAmount}
          grandTotal={grandTotal}
          onOpenCustomer={() => setCustomerModalOpen(true)}
          onEditCartItem={setEditingCartItemId}
          onOpenCheckout={openCheckout}
        />
      </div>

      <PosHistoryDrawer
        open={historyDrawerOpen}
        savedCarts={savedCarts}
        activeSavedCartId={activeSavedCartId}
        selectedCurrencyCode={selectedCurrencyCode}
        todaysCompletedSales={todaysCompletedSales}
        salesHistoryLoading={salesHistoryLoading}
        onClose={() => setHistoryDrawerOpen(false)}
        onRestoreSavedCart={restoreSavedCart}
        onRemoveSavedCart={removeSavedCart}
      />

      {customerOpen ? <ContactsFormModal open={customerOpen} toggle={toggleCustomerOpen} hideRoles defaultRoles={[ContactRole.CUSTOMER]} /> : null}
      {openTaxSelector ? (
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
      ) : null}
      {completedSale && receiptOpen ? (
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
      ) : null}

      <ProductVariantSelectorModal
        parent={variantParent}
        onClose={() => setVariantParent(undefined)}
        priceLabel={(price) => formatMoney(selectedCurrencyCode, price)}
        onSelect={(variant) => {
          setCartQuantity(variant, (getCartItem(cart, variant.id)?.quantity || 0) + 1);
          setVariantParent(undefined);
        }}
      />

      <PosCheckoutModal
        open={checkoutModalOpen}
        loading={loading}
        showSplit={showSplit}
        fulfillmentMode={posFulfillmentMode}
        posSettings={posSettings}
        selectedCurrencyCode={selectedCurrencyCode}
        totalItems={totalItems}
        subtotal={subtotal}
        discounts={discounts}
        taxAmount={taxAmount}
        taxSummary={taxSummary}
        grandTotal={grandTotal}
        totalPaid={totalPaid}
        balance={balance}
        change={change}
        payments={payments}
        paymentMethods={availablePaymentMethods}
        cashPaymentMethodIds={cashPaymentMethodIds}
        getPaymentAmountLimit={getPaymentAmountLimit}
        selectedContactName={selectedContactName}
        selectedPaymentMethodName={selectedPaymentMethodName}
        onCancel={() => setCheckoutModalOpen(false)}
        onFulfillmentModeChange={setPosFulfillmentMode}
        onSetShowSplit={setShowSplit}
        onOpenSplitPayment={handleOpenSplitPayment}
        onUpdatePaymentRow={updatePaymentRow}
        onRemovePaymentRow={removePaymentRow}
        onSubmitCheckout={submitCheckout}
      />

      <PosCustomerModal
        open={customerModalOpen}
        customerSearch={customerSearch}
        contactsLoading={contactsLoading}
        contacts={contacts}
        selectedContactId={selectedContact?.id}
        selectedContactName={selectedContactName}
        customerMode={posSettings.customerMode}
        onClose={() => setCustomerModalOpen(false)}
        onCustomerSearchChange={setCustomerSearch}
        onClearSelectedCustomer={clearSelectedCustomer}
        onSelectCustomer={handleSelectCustomer}
        onWalkInCustomer={handleWalkInCustomer}
        onOpenNewCustomer={() => {
          setCustomerModalOpen(false);
          toggleCustomerOpen();
        }}
      />

      <PosLocationModal
        open={locationModalOpen}
        locations={locations}
        activeLocationId={selectedLocation?.id || defaultLocation?.id || form.getFieldValue("locationId")}
        onClose={() => setLocationModalOpen(false)}
        onSelectLocation={(location) => {
          setSelectedLocation(location);
          form.setFieldsValue({ locationId: location.id });
          setLocationModalOpen(false);
        }}
      />

      <PosEditItemModal
        editingItem={editingItem}
        open={!!editingCartItemId}
        selectedCurrencyCode={selectedCurrencyCode}
        onClose={() => setEditingCartItemId(null)}
        onDecrease={() => {
          if (!editingItem) return;
          changeCartItemQuantity(editingItem.id, -1);
        }}
        onIncrease={() => {
          if (!editingItem) return;
          changeCartItemQuantity(editingItem.id, 1);
        }}
        onRemove={() => {
          if (!editingItem) return;
          removeCartItem(editingItem.id);
          setEditingCartItemId(null);
        }}
      />
    </div>
  );
}
