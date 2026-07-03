"use client";

import { AppModal, ModalProps } from "@/components/ui/AppModal";
import { SearchableCategorySelect } from "@/components/categories/SearchableCategorySelect";
import { useUpdateProductMutation, useGetProductsQuery } from "@/lib/redux/services";
import { ProductListItem } from "@/types/index";
import { Checkbox, Divider, Form, Input, InputNumber, message } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import AppTable from "@/components/ui/AppTable";
import PreviewImage from "@/components/ui/PreviewImage";
import { RiSearchLine } from "react-icons/ri";
import { Trash2 } from "lucide-react";
import { ITEM_TYPE } from "./ProductFormModal";
import { CategoryType } from "@/types/category";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { NORMAL_PRICE_TIER_NAME, ProductPriceTier, TRADE_PRICE_TIER_NAME, defaultPriceTiers, getNormalPrice, normalPriceTier } from "@/lib/products/pricing";
import { getProductTypeLabel } from "@/lib/products/type-label";
import { useStoreCurrencyCode } from "@/hooks/useStoreCurrencyCode";

type BundleItemInput = {
  productId: string;
  name: string;
  sku?: string;
  imageUrl?: string;
  normalPrice: number;
  quantity: number;
};

type ProductEditModalProduct = {
  id: string;
  name: string;
  type: ITEM_TYPE;
  description?: string;
  categoryId?: string;
  sku?: string;
  barcode?: string;
  costPrice?: number;
  sellingPrice?: number;
  priceTiers?: ProductPriceTier[];
  weight?: number;
  showInStorefront?: boolean;
  showInPOS?: boolean;
  lowStockThreshold?: number;
  minOrderLevel?: number;
  allowOversell?: boolean;
  sourceProductId?: string;
  sourceProductName?: string;
  sourceQuantity?: number;
  conversionType?: string;
  conversionQuantity?: number;
  repackUnitName?: string;
  bundleItems?: Array<{
    productId?: { id?: string; name?: string; sku?: string; media?: { url?: string }[]; priceTiers?: ProductPriceTier[]; normalPrice?: number } | string;
    quantity?: number;
  }>;
  hasVariants?: boolean;
};

interface ProductEditModalProps extends ModalProps {
  product: ProductEditModalProduct;
  onSaved?: () => void;
}

const NUMBER_INPUT_CLASS = "!w-full";

export function ProductEditModal({ open, toggle, product, onSaved, ...modalProps }: ProductEditModalProps) {
  const [form] = Form.useForm();
  const [updateProduct, { isLoading }] = useUpdateProductMutation();
  const [bundleItems, setBundleItems] = useState<BundleItemInput[]>([]);
  const [bundleItemsError, setBundleItemsError] = useState("");
  const [bundleSellingPriceEdited, setBundleSellingPriceEdited] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const debouncedProductSearch = useDebouncedValue(productSearch);

  const { data: products } = useGetProductsQuery({ search: debouncedProductSearch, limit: 20, purchasable: true });

  const containsOtherProducts = Boolean(Form.useWatch("containsOtherProducts", form));
  const itemType = product.type;
  const isVariantParent = Boolean(product.hasVariants);
  const storeSettings = useSelector((state: RootState) => state.currentUser.storeSettings);
  const enabledModules = storeSettings.enabledModules;
  const enableTradePrice = Boolean(storeSettings.pricing?.enableTradePrice);
  const featureSettings = storeSettings.features;
  const currencyCode = useStoreCurrencyCode();
  const bundleFeatureEnabled = itemType === ITEM_TYPE.STOCK ? featureSettings?.stockBundleEnabled !== false : itemType === ITEM_TYPE.NON_STOCK ? featureSettings?.nonStockBundleEnabled !== false : false;

  useEffect(() => {
    if (!open) return;

    form.resetFields();
    form.setFieldsValue({
      name: product.name,
      description: product.description,
      categoryId: product.categoryId,
      sku: product.sku,
      barcode: product.barcode,
      costPrice: product.costPrice,
      priceTiers: getEditablePriceTiers(product, enableTradePrice),
      weight: product.weight,
      containsOtherProducts: [ITEM_TYPE.STOCK, ITEM_TYPE.NON_STOCK].includes(product.type) && Boolean(product.bundleItems?.length),
      showInStorefront: product.showInStorefront ?? true,
      showInPOS: product.showInPOS ?? true,
      lowStockThreshold: product.lowStockThreshold,
      minOrderLevel: product.minOrderLevel,
      allowOversell: product.allowOversell ?? false,
    });

    setBundleItems(
      (product.bundleItems || []).map((item) => {
        const component = typeof item.productId === "string" ? null : item.productId;
        const productId = typeof item.productId === "string" ? item.productId : item.productId?.id || "";

        return {
          productId,
          name: component?.name || productId,
          sku: component?.sku,
          imageUrl: component?.media?.[0]?.url,
          normalPrice: getNormalPrice(component),
          quantity: Number(item.quantity || 1),
        };
      }),
    );
    setBundleItemsError("");
    setBundleSellingPriceEdited(Boolean(product.priceTiers?.length));
    setProductSearch("");
  }, [enableTradePrice, form, open, product]);

  const bundleItemsTotal = useMemo(() => bundleItems.reduce((total, item) => total + item.normalPrice * item.quantity, 0), [bundleItems]);

  useEffect(() => {
    if ([ITEM_TYPE.STOCK, ITEM_TYPE.NON_STOCK].includes(itemType) && containsOtherProducts && !bundleSellingPriceEdited) {
      form.setFieldValue("priceTiers", getDefaultEditablePriceTiers(bundleItemsTotal, enableTradePrice));
    }
  }, [bundleItemsTotal, bundleSellingPriceEdited, containsOtherProducts, enableTradePrice, form, itemType]);

  useEffect(() => {
    if (!containsOtherProducts) {
      setBundleItemsError("");
      setProductSearch("");
    }
  }, [containsOtherProducts]);

  useEffect(() => {
    if (bundleFeatureEnabled) return;
    form.setFieldValue("containsOtherProducts", false);
    setBundleItems([]);
    setBundleItemsError("");
    setProductSearch("");
  }, [bundleFeatureEnabled, form]);

  const addBundleItem = useCallback((selected: ProductListItem) => {
    setBundleItemsError("");
    setBundleItems((prev) => {
      const existing = prev.find((item) => item.productId === selected.id);

      if (existing) {
        return prev.map((item) => (item.productId === selected.id ? { ...item, quantity: item.quantity + 1 } : item));
      }

      return [
        ...prev,
        {
          productId: selected.id,
          name: selected.name,
          sku: selected.sku,
          imageUrl: selected.imageUrl,
          normalPrice: getNormalPrice(selected),
          quantity: 1,
        },
      ];
    });
    setProductSearch("");
  }, []);

  const updateBundleItemQuantity = useCallback((productId: string, quantity: number | null) => {
    setBundleItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: quantity || 1,
            }
          : item,
      ),
    );
  }, []);

  const removeBundleItem = useCallback((productId: string) => {
    setBundleItems((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const bundleColumns = useMemo(
    () => [
      {
        title: "Product",
        dataIndex: "name",
        key: "name",
        className: "!pl-8",
        width: "70%",
        render: (_: unknown, record: BundleItemInput) => (
          <div className="flex items-center gap-x-2">
            <PreviewImage width={28} height={28} src={record.imageUrl} />
            <div>
              <p>{record.name}</p>
              {record.sku && record.sku !== "undefined" && <p className="text-xs text-gray-500">{record.sku}</p>}
            </div>
          </div>
        ),
      },
      {
        title: "Qty",
        dataIndex: "quantity",
        key: "quantity",
        render: (_: unknown, record: BundleItemInput) => <InputNumber variant="underlined" controls={false} min={1} value={record.quantity} onChange={(value) => updateBundleItemQuantity(record.productId, value)} suffix="units" />,
      },
      {
        title: "",
        dataIndex: "productId",
        key: "productId",
        align: "end" as const,
        render: (productId: string) => (
          <div className="pl-5 text-gray-500 cursor-pointer hover:text-red-400" onClick={() => removeBundleItem(productId)}>
            <Trash2 size={15} className="cursor-pointer" />
          </div>
        ),
      },
    ],
    [removeBundleItem, updateBundleItemQuantity],
  );

  const handleSubmit = async () => {
    const values = await form.validateFields().catch(() => null);
    if (!values) return;

    if (!isVariantParent && [ITEM_TYPE.STOCK, ITEM_TYPE.NON_STOCK].includes(itemType) && containsOtherProducts && !bundleItems.length) {
      setBundleItemsError("Add at least one item to this bundle");
      return;
    }

    const sharedPayload: Record<string, unknown> = {
      name: values.name,
      description: values.description || "",
      categoryId: values.categoryId,
    };

    if (enabledModules.storefront && typeof values.showInStorefront !== "undefined") {
      sharedPayload.showInStorefront = Boolean(values.showInStorefront);
    }

    if (enabledModules.pos && typeof values.showInPOS !== "undefined") {
      sharedPayload.showInPOS = Boolean(values.showInPOS);
    }

    const payload: Record<string, unknown> = isVariantParent
      ? sharedPayload
      : {
          ...sharedPayload,
          sku: values.sku,
          barcode: values.barcode,
          costPrice: values.costPrice,
          priceTiers: normalizePriceTierValues(values.priceTiers, 0, enableTradePrice),
          weight: values.weight,
          lowStockThreshold: values.lowStockThreshold,
          allowOversell: Boolean(values.allowOversell),
        };

    if (!isVariantParent && [ITEM_TYPE.STOCK, ITEM_TYPE.NON_STOCK].includes(itemType) && containsOtherProducts) {
      payload.priceTiers = normalizePriceTierValues(values.priceTiers, bundleItemsTotal, enableTradePrice);
      payload.bundleItems = bundleItems.map(({ productId, quantity }) => ({ productId, quantity }));
    } else if (!isVariantParent && [ITEM_TYPE.STOCK, ITEM_TYPE.NON_STOCK].includes(itemType)) {
      payload.bundleItems = [];
    }

    if (!isVariantParent && itemType === ITEM_TYPE.SERVICE) {
      delete payload.weight;
      delete payload.lowStockThreshold;
      delete payload.allowOversell;
    }

    try {
      await updateProduct({ id: product.id, ...cleanPayload(payload) }).unwrap();
      message.success("Product updated successfully.");
      onSaved?.();
      toggle();
    } catch {
      message.error("The product could not be updated.");
    }
  };

  const searchBundleProduct = (
    <div className="px-5 bg-gray-100">
      <div className="sticky inset-0 z-50 py-4">
        <Input prefix={<RiSearchLine />} placeholder="Search for product" className="rounded-full!" value={productSearch} onChange={({ target: { value } }) => setProductSearch(value)} />
      </div>
      <div className="shadow-xl bg-white">
        {productSearch &&
          products?.data?.map((item: ProductListItem) => (
            <div key={item.id} className="cursor-pointer flex items-center justify-between border-t border-gray-200 px-5 py-2" onClick={() => addBundleItem(item)}>
              <div className="flex gap-x-2 items-center">
                <PreviewImage width={28} height={28} src={item.imageUrl} />
                <div>
                  <p>{item.name}</p>
                  {item.sku && item.sku !== "undefined" && <p className="text-gray-500">{item.sku}</p>}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  return (
    <AppModal
      open={open}
      toggle={toggle}
      loading={isLoading}
      width={650}
      height="70vh"
      title={<p className="capitalize">{isVariantParent ? "Edit variant product" : `Edit ${getProductTypeLabel(product)} item`}</p>}
      onOk={handleSubmit}
      okText={isLoading ? "Saving.." : "Save"}
      {...modalProps}
    >
      <div>
        <Form disabled={isLoading} className=" " form={form} layout="vertical">
          <div className="gap-x-12">
            <div className="px-5">
              <Form.Item label="Name" name="name" rules={[{ required: true, message: "Product name is required." }]}>
                <Input placeholder="Enter product name. Eg. Red T-Shirt" />
              </Form.Item>
            </div>

            <div className="">
              {isVariantParent && (
                <div className="px-5">
                  <Form.Item label="Category" name="categoryId">
                    <SearchableCategorySelect type={CategoryType.PRODUCT} />
                  </Form.Item>

                  <Form.Item label="Description" name="description">
                    <Input.TextArea rows={4} placeholder="Enter product description" />
                  </Form.Item>

                  <div className="rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                    <p className="font-medium">Shared product details</p>
                    <p className="mt-1 text-xs">Cost, selling prices, weight, and inventory are managed on each variant.</p>
                  </div>
                </div>
              )}

              {!isVariantParent && [ITEM_TYPE.STOCK, ITEM_TYPE.NON_STOCK].includes(itemType) && (
                <>
                  <div className="grid grid-cols-2 px-5 gap-x-5 md:grid-cols-4">
                    <div className="col-span-2">
                      <Form.Item label="Category" name="categoryId">
                        <SearchableCategorySelect type={CategoryType.PRODUCT} />
                      </Form.Item>
                    </div>

                    <Form.Item label="Cost Price" name="costPrice" className="col-span-1">
                      <InputNumber className={NUMBER_INPUT_CLASS} min={0} controls={false} prefix={currencyCode || undefined} placeholder="0.0" />
                    </Form.Item>

                    <Form.Item label="Weight (Optional)" name="weight" className="col-span-1">
                      <InputNumber className={NUMBER_INPUT_CLASS} min={0} controls={false} suffix="kg" placeholder="0.0" />
                    </Form.Item>
                  </div>

                  <Form.Item label="Description (Optional)" className="px-5!" name="description">
                    <Input.TextArea rows={4} placeholder="Enter product description" />
                  </Form.Item>

                  {[ITEM_TYPE.STOCK, ITEM_TYPE.NON_STOCK].includes(itemType) && bundleFeatureEnabled && (
                    <div className=" flex items-center bg-gray-100 md:bg-transparent justify-between border-t border-gray-200  px-4 py-3">
                      <div>
                        <h3 className="text-sm font-medium text-gray-800">Contains Other Products?</h3>
                        <p className="mt-1 text-xs text-gray-500">Turn this on when the product is sold as a composite of other products.</p>
                      </div>
                      <Form.Item name="containsOtherProducts" valuePropName="checked" className="!mb-0">
                        <Checkbox />
                      </Form.Item>
                    </div>
                  )}

                  {[ITEM_TYPE.STOCK, ITEM_TYPE.NON_STOCK].includes(itemType) && containsOtherProducts && (
                    <div className="mb-4">
                      <div className="px-5">{bundleItemsError && <p className="mt-1 text-xs text-red-500">{bundleItemsError}</p>}</div>
                      <AppTable columns={bundleColumns} dataSource={bundleItems || []} rowKey={(record: BundleItemInput) => record.productId} pagination={false} />
                      {searchBundleProduct}
                    </div>
                  )}

                  <PriceTiersEditor enableTradePrice={enableTradePrice} currencyCode={currencyCode} />
                </>
              )}
            </div>

            {!isVariantParent && [ITEM_TYPE.STOCK].includes(itemType) && !containsOtherProducts && (
              <>
                {/* <Divider /> */}
                <div className="px-5  mt-3 flex items-center justify-between">
                  <h3 className="text-base font-medium text-gray-700">Inventory</h3>
                </div>
                <div className="px-5 mt-4 grid gap-y-3">
                  <div className="grid grid-cols-2 gap-x-5 ">
                    <Form.Item label="Low Stock Alert" name="lowStockThreshold">
                      <InputNumber className={NUMBER_INPUT_CLASS} min={0} controls={false} placeholder="0" />
                    </Form.Item>

                    <Form.Item label="Barcode" name="barcode">
                      <Input className="!mb-0" placeholder="Enter barcode" />
                    </Form.Item>
                  </div>

                  <Form.Item name="allowOversell" valuePropName="checked">
                    <Checkbox>Continue selling when out of stock</Checkbox>
                  </Form.Item>
                </div>
              </>
            )}

            {itemType != ITEM_TYPE.SERVICE && (enabledModules.storefront || enabledModules.pos) && (
              <>
                <Divider />
                <div className="grid px-5  gap-y-2 items-center">
                  {enabledModules.storefront && (
                    <Form.Item name="showInStorefront" className="!mb-0" valuePropName="checked">
                      <Checkbox>Show in Storefront</Checkbox>
                    </Form.Item>
                  )}

                  {enabledModules.pos && (
                    <Form.Item name="showInPOS" className="!mb-0" valuePropName="checked">
                      <Checkbox>Show in POS</Checkbox>
                    </Form.Item>
                  )}
                </div>
              </>
            )}
          </div>
        </Form>
      </div>
    </AppModal>
  );
}

function cleanPayload(values: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined && value !== null));
}

function getDefaultEditablePriceTiers(price = 0, enableTradePrice = true) {
  return enableTradePrice ? defaultPriceTiers(price) : [normalPriceTier(price)];
}

function getEditablePriceTiers(product: { priceTiers?: ProductPriceTier[]; sellingPrice?: number }, enableTradePrice: boolean) {
  const source = product.priceTiers?.length ? product.priceTiers : getDefaultEditablePriceTiers(product.sellingPrice || 0, enableTradePrice);
  return ensureDefaultPriceTiers(source, enableTradePrice);
}

function normalizePriceTierValues(values?: ProductPriceTier[], fallbackPrice = 0, enableTradePrice = true) {
  const tiers = ensureDefaultPriceTiers(values?.length ? values : getDefaultEditablePriceTiers(fallbackPrice, enableTradePrice), enableTradePrice);
  return tiers.map((tier, index) => ({
    name: index === 0 ? NORMAL_PRICE_TIER_NAME : index === 1 ? TRADE_PRICE_TIER_NAME : String(tier?.name || "").trim(),
    price: Number(tier?.price || 0),
    moq: Math.max(Number(tier?.moq || 1), 1),
    discountPercent: Math.max(Number(tier?.discountPercent || 0), 0),
  }));
}

function ensureDefaultPriceTiers(tiers: ProductPriceTier[], enableTradePrice = true) {
  const normal = tiers[0] || normalPriceTier(0);
  if (!enableTradePrice) {
    return [{ ...normal, name: NORMAL_PRICE_TIER_NAME }, ...tiers.slice(1)];
  }
  const trade = tiers.find((tier) => tier.name === TRADE_PRICE_TIER_NAME) || {
    name: TRADE_PRICE_TIER_NAME,
    price: Number(normal.price || 0),
    moq: 1,
    discountPercent: 0,
  };

  return [{ ...normal, name: NORMAL_PRICE_TIER_NAME }, { ...trade, name: TRADE_PRICE_TIER_NAME }, ...tiers.slice(1).filter((tier) => tier.name !== TRADE_PRICE_TIER_NAME)];
}

function PriceTiersEditor({ enableTradePrice, currencyCode }: { enableTradePrice: boolean; currencyCode: string }) {
  return (
    <div className=" -border -border-gray-200  ">
      {/* <div className="mb-3">
        <p className="text-sm font-medium text-gray-800">Price Tiers</p>
        <p className="text-xs text-gray-500">{enableTradePrice ? "Normal and trade prices are required for every product." : "Normal selling price is active for this store."}</p>
      </div> */}
      <Form.List name="priceTiers">
        {(fields) => (
          <div className="space-y-3">
            {fields.slice(0, enableTradePrice ? 2 : 1).map((field, index) => (
              <article key={field.key} className=" border border-gray-200 bg-white p-3">
                <Form.Item {...field} name={[field.name, "name"]} hidden>
                  <Input />
                </Form.Item>

                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">{index === 0 ? NORMAL_PRICE_TIER_NAME : TRADE_PRICE_TIER_NAME}</h3>
                  <p className="mt-0.5 text-xs text-gray-500">{tierDescription(index === 0 ? NORMAL_PRICE_TIER_NAME : TRADE_PRICE_TIER_NAME, index === 0)}</p>
                </div>

                <div className="grid gap-3 grid-cols-4 md:grid-cols-3">
                  <Form.Item {...field} label="Price" name={[field.name, "price"]} className="!mb-0  col-span-2 md:col-span-1" rules={[{ required: true, message: "Enter price" }]}>
                    <InputNumber className={NUMBER_INPUT_CLASS} min={0} controls={false} prefix={currencyCode || undefined} placeholder="0.00" />
                  </Form.Item>
                  <Form.Item {...field} label="MOQ" name={[field.name, "moq"]} className="!mb-0" rules={[{ required: true, message: "Enter MOQ" }]}>
                    <InputNumber className={NUMBER_INPUT_CLASS} min={1} controls={false} placeholder="1" />
                  </Form.Item>
                  <Form.Item {...field} label="Discount" name={[field.name, "discountPercent"]} className="!mb-0" rules={[{ required: true, message: "Enter discount" }]}>
                    <InputNumber className={NUMBER_INPUT_CLASS} min={0} suffix="%" controls={false} placeholder="0" />
                  </Form.Item>
                </div>

                {/* <Form.Item noStyle shouldUpdate>
                  {({ getFieldValue }) => (
                    <div className="mt-2.5 text-xs text-gray-500">
                      Margin: <span className="font-medium text-gray-700">{formatEditMargin(getFieldValue(["priceTiers", field.name, "price"]), getFieldValue("costPrice"))}</span>
                    </div>
                  )}
                </Form.Item> */}
              </article>
            ))}
          </div>
        )}
      </Form.List>
    </div>
  );
}

function tierDescription(name?: string, isNormal?: boolean) {
  if (isNormal) return "Default customer-facing price";
  if (name === TRADE_PRICE_TIER_NAME) return "Trade and bulk customer price";
  return "Custom product price";
}
