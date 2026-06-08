"use client";

import { AppModal, ModalProps } from "@/components/ui/AppModal";
import { SearchableCategorySelect } from "@/components/categories/SearchableCategorySelect";
import { useUpdateProductMutation, useGetProductsQuery } from "@/lib/redux/services";
import { ProductListItem } from "@/types/index";
import { Checkbox, Divider, Form, Input, InputNumber, Radio, message } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import AppTable from "@/components/ui/AppTable";
import PreviewImage from "@/components/ui/PreviewImage";
import { RiSearchLine } from "react-icons/ri";
import { Trash2 } from "lucide-react";
import { ITEM_TYPE } from "./ProductFormModal";
import { CategoryType } from "@/types/category";

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

const NUMBER_INPUT_CLASS = "!w-full";

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
      width={650}
      height="70vh"
      title={
        <p className="capitalize">
          Edit {itemType?.replace("_", " ")?.toLowerCase()} item
        </p>
      }
      onOk={handleSubmit}
      okText={isLoading ? "Saving.." : "Save"}
      {...modalProps}
    >
      <div>
        <Form disabled={isLoading} className=" " size="small" form={form} layout="vertical">
          <div className="gap-x-12">
            <div className="px-5">
              <Form.Item label="Name" name="name" rules={[{ required: true, message: "Product name is required." }]}>
                <Input placeholder="Enter product name. Eg. Red T-Shirt" />
              </Form.Item>
            </div>

            <div className="px-5">
              {![ITEM_TYPE.BUNDLE, ITEM_TYPE.PACKAGING].includes(itemType) && (
                <>
                    <div className="grid grid-cols-1 gap-x-5 md:grid-cols-3">
                      <Form.Item label="Category" name="categoryId">
                        <SearchableCategorySelect type={CategoryType.PRODUCT} />
                      </Form.Item>

                    <Form.Item label="Cost Price" name="costPrice">
                      <InputNumber className={NUMBER_INPUT_CLASS} min={0} controls={false} placeholder="0.0" />
                    </Form.Item>

                    <Form.Item label="Selling Price" name="sellingPrice">
                      <InputNumber className={NUMBER_INPUT_CLASS} min={0} controls={false} placeholder="0.0" />
                    </Form.Item>
                  </div>

                  {itemType === ITEM_TYPE.STOCK && (
                    <div>
                      <Form.Item label="Weight (Optional)" name="weight">
                        <InputNumber className={NUMBER_INPUT_CLASS} min={0} controls={false} placeholder="0.0" />
                      </Form.Item>
                    </div>
                  )}

                  <Form.Item label="Description (Optional)" name="description">
                    <Input.TextArea rows={4} placeholder="Enter product description" />
                  </Form.Item>
                </>
              )}
            </div>

            {itemType === ITEM_TYPE.PACKAGING && (
              <div>
                <Form.Item name="sourceProductId" rules={[{ required: true, message: "Select source product" }]} className="!mb-0">
                  <Input type="hidden" />
                </Form.Item>

                <Form.Item label="What are you creating from the source product?" name="conversionType" initialValue={REPACK_CONVERSION_TYPE.SOURCE_TO_REPACK} className="!px-5" rules={[{ required: true, message: "Select conversion type" }]}>
                  <Radio.Group className="w-full">
                    <div className="grid grid-cols-2 gap-3">
                      <Radio.Button className="!h-auto !p-3 !text-left" value={REPACK_CONVERSION_TYPE.SOURCE_TO_REPACK}>
                        <p className="font-medium">Smaller unit from a larger product</p>
                        <p className="text-xs text-gray-500">Example: Carton to Bottle</p>
                      </Radio.Button>

                      <Radio.Button className="!h-auto !p-3 !text-left" value={REPACK_CONVERSION_TYPE.REPACK_TO_SOURCE}>
                        <p className="font-medium">Larger unit from smaller products</p>
                        <p className="text-xs text-gray-500">Example: Bottle to Carton</p>
                      </Radio.Button>
                    </div>
                  </Radio.Group>
                </Form.Item>

                <div className="mt-4">
                  <div className="px-5 pb-3">
                    <h3 className="text-sm font-medium text-gray-700">Source Product</h3>
                  </div>
                  {selectedRepackSourceProduct ? <AppTable columns={repackSourceColumns} dataSource={[selectedRepackSourceProduct]} rowKey={(record: ProductListItem) => record.id} pagination={false} /> : searchRepackSourceProduct}
                </div>

                <div className="grid grid-cols-2 gap-x-5 px-5 mt-4">
                  <Form.Item label={conversionType === REPACK_CONVERSION_TYPE.SOURCE_TO_REPACK ? "1 source unit makes how many units?" : "How many source units make 1 unit?"} name="conversionQuantity" rules={[{ required: true, message: "Enter conversion quantity" }]}>
                    <InputNumber className={NUMBER_INPUT_CLASS} min={0} controls={false} placeholder="24" />
                  </Form.Item>

                  <Form.Item label="Selling Price" name="sellingPrice">
                    <InputNumber className={NUMBER_INPUT_CLASS} min={0} controls={false} placeholder="0.0" />
                  </Form.Item>
                </div>

                {selectedRepackSourceProduct && conversionQuantity > 0 && (
                  <div className="mx-5 mt-4 rounded-sm border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
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
              </div>
            )}

            {itemType === ITEM_TYPE.BUNDLE && (
              <>
                <Divider />
                <div className="px-5 pb-3">
                  <h3 className="text-base font-medium text-gray-700">Bundle Items</h3>
                  {bundleItemsError && <p className="mt-2 text-xs text-red-500">{bundleItemsError}</p>}
                </div>
                <AppTable columns={bundleColumns} dataSource={bundleItems || []} rowKey={(record: BundleItemInput) => record.productId} pagination={false} />
                {searchBundleProduct}
                <div className="px-5 pt-5 pb-2 grid grid-cols-2 gap-x-5">
                  <div>
                    <p className="text-sm text-gray-500">Items Total</p>
                    <p className="mt-1 font-medium text-gray-800">GHS {bundleItemsTotal.toFixed(2)}</p>
                  </div>
                  <Form.Item label="Bundle Selling Price" name="sellingPrice">
                    <InputNumber className={NUMBER_INPUT_CLASS} min={0} prefix="GHS" controls={false} placeholder="0.00" onChange={() => setBundleSellingPriceEdited(true)} />
                  </Form.Item>
                </div>
              </>
            )}

            {[ITEM_TYPE.NON_STOCK, ITEM_TYPE.STOCK].includes(itemType) && (
              <>
                <Divider />
                <div className="px-5 flex items-center justify-between">
                  <h3 className="text-base font-medium text-gray-700">Inventory Controls</h3>
                </div>
                <div className="px-5 mt-4 grid gap-y-3">
                  <Form.Item label="Low Stock Alert" name="lowStockThreshold">
                    <InputNumber className={NUMBER_INPUT_CLASS} min={0} controls={false} placeholder="0" />
                  </Form.Item>
                  <Form.Item name="allowOversell" valuePropName="checked">
                    <Checkbox>Continue selling when out of stock</Checkbox>
                  </Form.Item>
                </div>
              </>
            )}

            {product.hasVariants && (
              <>
                <Divider />
                <div className="px-5 text-sm text-amber-800">
                  <p className="font-medium">Variant product</p>
                  <p className="mt-1">Variant structure is preserved here. Use variant management for variant-specific data.</p>
                </div>
              </>
            )}

            <Divider />
            <div className="grid px-5 my-5 gap-y-2 items-center">
              <Form.Item name="showInStorefront" className="!mb-0" valuePropName="checked">
                <Checkbox>Show in Storefront</Checkbox>
              </Form.Item>

              <Form.Item name="showInPOS" className="!mb-0" valuePropName="checked">
                <Checkbox>Show in POS</Checkbox>
              </Form.Item>
            </div>
          </div>
        </Form>
      </div>
    </AppModal>
  );
}

function cleanPayload(values: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined && value !== null));
}
