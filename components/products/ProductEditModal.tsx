"use client";

import { AppModal, ModalProps } from "@/components/ui/AppModal";
import { SearchableCategorySelect } from "@/components/categories/SearchableCategorySelect";
import { useUpdateProductMutation, useGetProductsQuery } from "@/lib/redux/services";
import { ProductListItem } from "@/types";
import { Checkbox, Form, Input, InputNumber, Radio, message } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import AppTable from "@/components/ui/AppTable";
import PreviewImage from "@/components/ui/PreviewImage";
import { RiSearchLine } from "react-icons/ri";
import { Trash2 } from "lucide-react";
import { ITEM_TYPE } from "./ProductFormModal";

type BundleItemInput = {
  productId: string;
  name: string;
  sku?: string;
  imageUrl?: string;
  sellingPrice: number;
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
    productId?: { id?: string; name?: string; sku?: string; media?: { url?: string }[]; sellingPrice?: number } | string;
    quantity?: number;
  }>;
  hasVariants?: boolean;
};

interface ProductEditModalProps extends ModalProps {
  product: ProductEditModalProduct;
  onSaved?: () => void;
}

const REPACK_CONVERSION_TYPE = {
  SOURCE_TO_REPACK: "source_to_repack",
  REPACK_TO_SOURCE: "repack_to_source",
} as const;

export function ProductEditModal({ open, toggle, product, onSaved, ...modalProps }: ProductEditModalProps) {
  const [form] = Form.useForm();
  const [updateProduct, { isLoading }] = useUpdateProductMutation();
  const [bundleItems, setBundleItems] = useState<BundleItemInput[]>([]);
  const [bundleItemsError, setBundleItemsError] = useState("");
  const [bundleSellingPriceEdited, setBundleSellingPriceEdited] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [repackSourceSearch, setRepackSourceSearch] = useState("");
  const [selectedRepackSourceProduct, setSelectedRepackSourceProduct] = useState<ProductListItem | null>(null);

  const debouncedProductSearch = useDebouncedValue(productSearch);
  const debouncedRepackSourceSearch = useDebouncedValue(repackSourceSearch);

  const { data: products } = useGetProductsQuery({ search: debouncedProductSearch, limit: 20, purchasable: true });
  const { data: sourceProducts } = useGetProductsQuery({ search: debouncedRepackSourceSearch, type: "STOCK", limit: 20 });

  const conversionType = Form.useWatch("conversionType", form) || REPACK_CONVERSION_TYPE.SOURCE_TO_REPACK;
  const conversionQuantity = Number(Form.useWatch("conversionQuantity", form) || 0);
  const productName = Form.useWatch("name", form) || product.name;
  const itemType = product.type;

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
      sellingPrice: product.sellingPrice,
      weight: product.weight,
      showInStorefront: product.showInStorefront ?? true,
      showInPOS: product.showInPOS ?? true,
      lowStockThreshold: product.lowStockThreshold,
      minOrderLevel: product.minOrderLevel,
      allowOversell: product.allowOversell ?? false,
      sourceProductId: product.sourceProductId,
      conversionType: product.conversionType || REPACK_CONVERSION_TYPE.SOURCE_TO_REPACK,
      conversionQuantity: product.conversionQuantity || product.sourceQuantity,
      repackUnitName: product.repackUnitName,
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
          sellingPrice: Number(component?.sellingPrice || 0),
          quantity: Number(item.quantity || 1),
        };
      }),
    );

    const sourceName = product.sourceProductName;
    setSelectedRepackSourceProduct(
      product.sourceProductId && sourceName
        ? {
            id: product.sourceProductId,
            name: sourceName,
            sku: "",
            imageUrl: "",
            sellingPrice: 0,
            channels: 0,
          }
        : null,
    );
    setBundleItemsError("");
    setBundleSellingPriceEdited(Boolean(product.type === ITEM_TYPE.BUNDLE && product.sellingPrice));
    setProductSearch("");
    setRepackSourceSearch("");
  }, [form, open, product]);

  const bundleItemsTotal = useMemo(() => bundleItems.reduce((total, item) => total + item.sellingPrice * item.quantity, 0), [bundleItems]);

  useEffect(() => {
    if (itemType === ITEM_TYPE.BUNDLE && !bundleSellingPriceEdited) {
      form.setFieldValue("sellingPrice", bundleItemsTotal);
    }
  }, [bundleItemsTotal, bundleSellingPriceEdited, form, itemType]);

  useEffect(() => {
    if (itemType !== ITEM_TYPE.PACKAGING) {
      setSelectedRepackSourceProduct(null);
      setRepackSourceSearch("");
    }
  }, [itemType]);

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
          sellingPrice: Number(selected.sellingPrice || 0),
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

  const addRepackSourceProduct = useCallback(
    (selected: ProductListItem) => {
      setSelectedRepackSourceProduct(selected);
      setRepackSourceSearch("");
      form.setFieldValue("sourceProductId", selected.id);
    },
    [form],
  );

  const removeRepackSourceProduct = useCallback(() => {
    setSelectedRepackSourceProduct(null);
    setRepackSourceSearch("");
    form.setFieldValue("sourceProductId", undefined);
  }, [form]);

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
        render: (_: unknown, record: BundleItemInput) => (
          <InputNumber variant="underlined" controls={false} min={1} value={record.quantity} onChange={(value) => updateBundleItemQuantity(record.productId, value)} suffix="units" />
        ),
      },
      {
        title: "",
        dataIndex: "productId",
        key: "productId",
        align: "end",
        render: (productId: string) => (
          <div className="pl-5 text-gray-500 cursor-pointer hover:text-red-400" onClick={() => removeBundleItem(productId)}>
            <Trash2 size={15} className="cursor-pointer" />
          </div>
        ),
      },
    ],
    [removeBundleItem, updateBundleItemQuantity],
  );

  const repackSourceColumns = useMemo(
    () => [
      {
        title: "Source Product",
        dataIndex: "name",
        key: "name",
        className: "!pl-5",
        render: (_: unknown, record: ProductListItem) => (
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
        title: "",
        dataIndex: "id",
        key: "id",
        align: "end",
        render: () => (
          <div className="pl-5 text-gray-500 cursor-pointer hover:text-red-400" onClick={removeRepackSourceProduct}>
            <Trash2 size={15} className="cursor-pointer" />
          </div>
        ),
      },
    ],
    [removeRepackSourceProduct],
  );

  const handleSubmit = async () => {
    const values = await form.validateFields().catch(() => null);
    if (!values) return;

    if (itemType === ITEM_TYPE.BUNDLE && !bundleItems.length) {
      setBundleItemsError("Add at least one item to this bundle");
      return;
    }

    const payload: Record<string, unknown> = {
      name: values.name,
      description: values.description || "",
      categoryId: values.categoryId,
      sku: values.sku,
      barcode: values.barcode,
      costPrice: values.costPrice,
      sellingPrice: values.sellingPrice,
      weight: values.weight,
      showInStorefront: Boolean(values.showInStorefront),
      showInPOS: Boolean(values.showInPOS),
      lowStockThreshold: values.lowStockThreshold,
      allowOversell: Boolean(values.allowOversell),
    };

    if (itemType === ITEM_TYPE.BUNDLE) {
      payload.sellingPrice = values.sellingPrice ?? bundleItemsTotal;
      payload.bundleItems = bundleItems.map(({ productId, quantity }) => ({ productId, quantity }));
    }

    if (itemType === ITEM_TYPE.PACKAGING) {
      payload.sourceProductId = values.sourceProductId;
      payload.conversionType = values.conversionType || REPACK_CONVERSION_TYPE.SOURCE_TO_REPACK;
      payload.conversionQuantity = values.conversionQuantity;
      payload.repackUnitName = values.repackUnitName || values.name;
    }

    if (itemType === ITEM_TYPE.SERVICE) {
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

  const searchRepackSourceProduct = (
    <div className="px-5 bg-gray-100">
      <div className="sticky inset-0 z-50 py-4">
        <Input prefix={<RiSearchLine />} placeholder="Search stock product" className="rounded-full!" value={repackSourceSearch} onChange={({ target: { value } }) => setRepackSourceSearch(value)} />
      </div>
      <div className="shadow-xl bg-white">
        {repackSourceSearch &&
          sourceProducts?.data?.map((item: ProductListItem) => (
            <div key={item.id} className="cursor-pointer flex items-center justify-between border-t border-gray-200 px-5 py-2" onClick={() => addRepackSourceProduct(item)}>
              <div className="flex gap-x-2">
                <PreviewImage width={28} height={28} src={item.imageUrl} />
                <div>
                  <p className="line-clamp-1">{item.name}</p>
                  {item.sku && item.sku !== "undefined" && <p className="text-gray-700 text-[0.7rem]">{item.sku}</p>}
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
      width={1080}
      height="75vh"
      title={
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-gray-900">Edit {product.name}</p>
            <p className="mt-1 text-sm text-gray-500">Update the core product details, pricing, visibility, and type-specific settings.</p>
          </div>
        </div>
      }
      onOk={handleSubmit}
      okText="Save changes"
      {...modalProps}
    >
      <div>
        <Form disabled={isLoading} className="pb-2" size="small" form={form} layout="vertical">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              <SectionCard
                title="Basic details"
                description="Identity and naming fields that show up everywhere."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Form.Item label="Name" name="name" rules={[{ required: true, message: "Product name is required." }]}>
                    <Input placeholder="Enter product name" />
                  </Form.Item>
                  <Form.Item label="Category" name="categoryId">
                    <SearchableCategorySelect />
                  </Form.Item>
                  <Form.Item label="SKU" name="sku">
                    <Input placeholder="Enter SKU" />
                  </Form.Item>
                  <Form.Item label="Barcode" name="barcode">
                    <Input placeholder="Enter barcode" />
                  </Form.Item>
                  {itemType === ITEM_TYPE.STOCK && (
                    <Form.Item label="Weight (Optional)" name="weight">
                      <InputNumber className="w-full" min={0} controls={false} placeholder="0.0" />
                    </Form.Item>
                  )}
                </div>
                <Form.Item label="Description (Optional)" name="description" className="mb-0">
                  <Input.TextArea rows={5} placeholder="Enter product description" />
                </Form.Item>
              </SectionCard>

              {itemType !== ITEM_TYPE.BUNDLE && itemType !== ITEM_TYPE.PACKAGING && (
                <SectionCard title="Pricing" description="Set costs and selling price in one place.">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Form.Item label="Cost Price" name="costPrice" className="mb-0">
                      <InputNumber className="w-full" min={0} controls={false} placeholder="0.0" />
                    </Form.Item>
                    <Form.Item label="Selling Price" name="sellingPrice" className="mb-0">
                      <InputNumber className="w-full" min={0} controls={false} placeholder="0.0" />
                    </Form.Item>
                  </div>
                </SectionCard>
              )}

              {itemType === ITEM_TYPE.PACKAGING && (
                <SectionCard title="Packaging setup" description="Define the source product and conversion rule.">
                  <Form.Item name="sourceProductId" rules={[{ required: true, message: "Select source product" }]} className="!mb-0">
                    <Input type="hidden" />
                  </Form.Item>

                  <Form.Item
                    label="Conversion type"
                    name="conversionType"
                    initialValue={REPACK_CONVERSION_TYPE.SOURCE_TO_REPACK}
                    className="!mb-0"
                    rules={[{ required: true, message: "Select conversion type" }]}
                  >
                    <Radio.Group className="w-full">
                      <div className="grid gap-3 md:grid-cols-2">
                        <Radio.Button className="!h-auto !p-4 !text-left" value={REPACK_CONVERSION_TYPE.SOURCE_TO_REPACK}>
                          <p className="font-medium">Smaller unit from a larger product</p>
                          <p className="mt-1 text-xs text-gray-500">Example: Carton to Bottle</p>
                        </Radio.Button>
                        <Radio.Button className="!h-auto !p-4 !text-left" value={REPACK_CONVERSION_TYPE.REPACK_TO_SOURCE}>
                          <p className="font-medium">Larger unit from smaller products</p>
                          <p className="mt-1 text-xs text-gray-500">Example: Bottle to Carton</p>
                        </Radio.Button>
                      </div>
                    </Radio.Group>
                  </Form.Item>

                  <div className="mt-5">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-800">Source product</h3>
                      {selectedRepackSourceProduct && (
                        <button type="button" className="text-xs font-medium text-slate-500 hover:text-slate-800" onClick={removeRepackSourceProduct}>
                          Clear
                        </button>
                      )}
                    </div>
                    {selectedRepackSourceProduct ? <AppTable columns={repackSourceColumns} dataSource={[selectedRepackSourceProduct]} rowKey={(record: ProductListItem) => record.id} pagination={false} /> : searchRepackSourceProduct}
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <Form.Item
                      label={conversionType === REPACK_CONVERSION_TYPE.SOURCE_TO_REPACK ? "1 source unit makes how many units?" : "How many source units make 1 unit?"}
                      name="conversionQuantity"
                      rules={[{ required: true, message: "Enter conversion quantity" }]}
                    >
                      <InputNumber className="w-full" min={0} controls={false} placeholder="24" />
                    </Form.Item>

                    <Form.Item label="Selling Price" name="sellingPrice" className="mb-0">
                      <InputNumber className="w-full" min={0} controls={false} placeholder="0.0" />
                    </Form.Item>
                  </div>

                  {selectedRepackSourceProduct && conversionQuantity > 0 && (
                    <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                      {conversionType === REPACK_CONVERSION_TYPE.SOURCE_TO_REPACK ? (
                        <>
                          <p>
                            1 {selectedRepackSourceProduct.name} = {conversionQuantity} {productName}
                          </p>
                          <p className="mt-1">
                            Selling 1 {productName} deducts 1/{conversionQuantity} {selectedRepackSourceProduct.name}.
                          </p>
                        </>
                      ) : (
                        <>
                          <p>
                            {conversionQuantity} {selectedRepackSourceProduct.name} = 1 {productName}
                          </p>
                          <p className="mt-1">
                            Selling 1 {productName} deducts {conversionQuantity} {selectedRepackSourceProduct.name}.
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </SectionCard>
              )}

              {itemType === ITEM_TYPE.BUNDLE && (
                <SectionCard title="Bundle items" description="Add the products that make up this bundle.">
                  {bundleItemsError && <p className="mb-3 text-sm font-medium text-red-500">{bundleItemsError}</p>}
                  <AppTable columns={bundleColumns} dataSource={bundleItems || []} rowKey={(record: BundleItemInput) => record.productId} pagination={false} />
                  {searchBundleProduct}
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Items total</p>
                      <p className="mt-2 text-xl font-semibold text-slate-900">GHS {bundleItemsTotal.toFixed(2)}</p>
                    </div>
                    <Form.Item label="Bundle selling price" name="sellingPrice" className="mb-0">
                      <InputNumber className="w-full" min={0} prefix="GHS" controls={false} placeholder="0.00" onChange={() => setBundleSellingPriceEdited(true)} />
                    </Form.Item>
                  </div>
                </SectionCard>
              )}
            </div>

            <div className="space-y-6">
              <SectionCard title="Visibility" description="Where this product should appear.">
                <div className="space-y-3">
                  <Form.Item name="showInStorefront" className="!mb-0" valuePropName="checked">
                    <Checkbox>Show in storefront</Checkbox>
                  </Form.Item>
                  <Form.Item name="showInPOS" className="!mb-0" valuePropName="checked">
                    <Checkbox>Show in POS</Checkbox>
                  </Form.Item>
                </div>
              </SectionCard>

              {(itemType === ITEM_TYPE.STOCK || itemType === ITEM_TYPE.NON_STOCK) && (
                <SectionCard title="Inventory controls" description="Use these fields to manage stock behavior.">
                  <div className="space-y-4">
                    <Form.Item label="Low Stock Alert" name="lowStockThreshold" className="mb-0">
                      <InputNumber className="w-full" min={0} controls={false} placeholder="0" />
                    </Form.Item>
                    <Form.Item name="allowOversell" valuePropName="checked" className="!mb-0">
                      <Checkbox>Continue selling when out of stock</Checkbox>
                    </Form.Item>
                  </div>
                </SectionCard>
              )}

              {itemType === ITEM_TYPE.SERVICE && (
                <SectionCard title="Service note" description="Services do not use inventory tracking.">
                  <p className="text-sm leading-6 text-slate-600">Update description, pricing, and visibility. No stock controls are applied to service products.</p>
                </SectionCard>
              )}

              {product.hasVariants && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <p className="font-medium">Variant product</p>
                  <p className="mt-1 leading-6">Variant structure is preserved here. If you need to change variant-specific data, use the product management flow for variants.</p>
                </div>
              )}
            </div>
          </div>
        </Form>
      </div>
    </AppModal>
  );
}

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_0_rgba(15,23,42,0.02)]">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {description && <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function cleanPayload(values: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined && value !== null));
}
