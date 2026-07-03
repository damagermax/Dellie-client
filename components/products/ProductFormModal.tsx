"use client";
import { AppModal, ModalProps } from "@/components/ui/AppModal";
import { Checkbox, Divider, Form, FormInstance, Input, InputNumber, Switch, message } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { InputFormItem, TextAreaFormItem } from "../ui/AppFormItems";
import { SearchableCategorySelect } from "../categories/SearchableCategorySelect";
import ImageUpload from "../ui/ImageUploader";
import { MdOutlineArrowBackIos } from "react-icons/md";
import { useCreateProductMutation, useGetDefaultLocationQuery, useGetProductsQuery } from "@/lib/redux/services";
import { BaseButton } from "../ui/AppButtons";
import AppTable from "../ui/AppTable";
import { LocationSelector } from "../location/LocationSelector";
import useToggle from "@/hooks/UseToggle";
import { Location } from "@/types/location";
import { VariantFormModal } from "./VariantFormModal";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { ProductListItem } from "@/types/index";
import { RiSearchLine } from "react-icons/ri";
import PreviewImage from "../ui/PreviewImage";
import { Trash2 } from "lucide-react";
import { CategoryType } from "@/types/category";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { getNormalPrice } from "@/lib/products/pricing";
import type { TableProps } from "antd";
import { useStoreCurrencyCode } from "@/hooks/useStoreCurrencyCode";

interface BundleItemInput {
  productId: string;
  name: string;
  sku?: string;
  imageUrl?: string;
  sellingPrice: number;
  quantity: number;
}

interface LocationQuantityInput {
  locationId: string;
  name: string;
  quantity: number;
}

const getLocationId = (location: Partial<Location> & { _id?: string; value?: string }) => {
  const rawId = location.id || location._id || location.value;
  return typeof rawId === "string" ? rawId : "";
};

interface ProductFormValues {
  name: string;
  description?: string;
  costPrice?: number;
  sellingPrice?: number;
  showInStorefront?: boolean;
  showInPOS?: boolean;
  categoryId?: string;
  sku?: string;
  barcode?: string;
  weight?: number;
  containsOtherProducts?: boolean;
  lowStockThreshold?: number;
  expiryDate?: string;
}

export interface VariantCombination {
  key: string;
  name: string;
  image?: File | null;
  barcode?: string;
  costPrice: number;
  sellingPrice: number;
  weight: number;
  lowStockThreshold?: number;
  expiryDate?: string | null;

  stock: { locationId: string; quantity: number }[] | null;
  optionValues: { option: string; value: string }[];
}

interface ProductFormModalProps extends ModalProps {
  formRef?: React.RefObject<FormInstance>;
}

export enum ITEM_TYPE {
  STOCK = "STOCK",
  NON_STOCK = "NON_STOCK",
  SERVICE = "SERVICE",
  BUNDLE = "BUNDLE",
  PACKAGING = "PACKAGING",
}

const ItemType = [
  {
    title: "Stock Product",
    description: "Physical item kept in stock with quantity tracking for sales and usage (e.g. Bottle of Water, Bag of Rice)",
    key: ITEM_TYPE.STOCK,
  },
  {
    title: "Non-Stock Product ",
    description: "Products or services without inventory tracking(e.g. Prepared Food,  Haircut, Consultation)",
    examples: "",

    key: ITEM_TYPE.NON_STOCK,
  },
];

export default function ProductFormModal({ open, toggle }: ProductFormModalProps) {
  const [openLocationModal, toggleLocationModal] = useToggle();
  const [openVariantModal, toggleVariantModal] = useToggle();
  const [media, setMedia] = useState<File[]>([]);
  const [itemType, setItemType] = useState<ITEM_TYPE | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [bundleItems, setBundleItems] = useState<BundleItemInput[]>([]);
  const [bundleItemsError, setBundleItemsError] = useState("");

  const [productForm] = Form.useForm();
  const containsOtherProducts = Boolean(Form.useWatch("containsOtherProducts", productForm));

  const [variantCombinations, setVariantCombinations] = useState<VariantCombination[]>([]);
  const [locationQuantities, setLocationQuantities] = useState<LocationQuantityInput[]>([]);
  const enabledModules = useSelector((state: RootState) => state.currentUser.storeSettings.enabledModules);
  const featureSettings = useSelector((state: RootState) => state.currentUser.storeSettings.features);
  const currencyCode = useStoreCurrencyCode();
  const expiryEnabled = featureSettings?.expiryEnabled !== false;
  const stockBundleEnabled = featureSettings?.stockBundleEnabled !== false;
  const nonStockBundleEnabled = featureSettings?.nonStockBundleEnabled !== false;
  const bundleFeatureEnabled = itemType === ITEM_TYPE.STOCK ? stockBundleEnabled : itemType === ITEM_TYPE.NON_STOCK ? nonStockBundleEnabled : false;

  const { data: defaultLocation } = useGetDefaultLocationQuery();
  const debouncedProductSearch = useDebouncedValue(productSearch);
  const { data: products } = useGetProductsQuery({
    search: debouncedProductSearch,
    limit: 20,
  });

  const [createProduct, { isLoading, isSuccess }] = useCreateProductMutation();

  const toggleSelect = (location: Location) => {
    const locationId = getLocationId(location);
    if (!locationId) return;

    setLocationQuantities((prev) => {
      const exists = prev.find((item) => item.locationId === locationId);

      if (exists) {
        return prev.filter((item) => item.locationId !== locationId);
      }

      return [
        ...prev,
        {
          locationId,
          name: location.name,
          quantity: 0,
        },
      ];
    });
  };

  const ensureLocationSelected = useCallback((location: Location) => {
    const locationId = getLocationId(location);
    if (!locationId) return;

    setLocationQuantities((prev) => {
      const exists = prev.find((item) => item.locationId === locationId);
      if (exists) return prev;

      return [
        ...prev,
        {
          locationId,
          name: location.name,
          quantity: 0,
        },
      ];
    });
  }, []);

  const onFinish = async (values: ProductFormValues) => {
    if (isLoading) return;

    const formData = new FormData();
    const normalizedStock = locationQuantities
      .map((location) => ({
        locationId: location.locationId,
        quantity: Number(location.quantity || 0),
      }))
      .filter((location) => location.locationId);

    formData.append("name", values.name);
    formData.append("description", values.description || "");
    formData.append("costPrice", String(values.costPrice || 0));
    formData.append("sellingPrice", String(values.sellingPrice || 0));
    formData.append("showInStorefront", String(enabledModules.storefront && Boolean(values.showInStorefront)));
    formData.append("showInPOS", String(enabledModules.pos && Boolean(values.showInPOS)));
    formData.append("type", String(itemType));

    if (values.categoryId) formData.append("categoryId", String(values.categoryId));
    if (values.sku) formData.append("sku", String(values.sku));
    if (itemType === ITEM_TYPE.STOCK && !variantCombinations.length && values.barcode) formData.append("barcode", String(values.barcode));
    if (itemType === ITEM_TYPE.STOCK && values.weight !== undefined) formData.append("weight", String(values.weight));
    if (itemType === ITEM_TYPE.STOCK && !variantCombinations.length && values.lowStockThreshold !== undefined) formData.append("lowStockThreshold", String(values.lowStockThreshold));
    if (itemType === ITEM_TYPE.STOCK && !variantCombinations.length && values.expiryDate) formData.append("expiryDate", String(values.expiryDate));

    for (const file of media) {
      formData.append("media", file as Blob);
    }

    if ((values.containsOtherProducts || !variantCombinations?.length) && normalizedStock.length) {
      formData.append("stock", JSON.stringify(normalizedStock));
    }

    if (!values.containsOtherProducts && variantCombinations?.length) {
      formData.append("variants", JSON.stringify(variantCombinations || []));

      for (const variant of variantCombinations) {
        if (variant.image) {
          formData.append("variantImages", variant.image as Blob, variant.key);
        }
      }
    }

    if (values.containsOtherProducts) {
      if (!bundleItems.length) {
        setBundleItemsError("Add at least one product");
        return;
      }

      formData.append(
        "bundleItems",
        JSON.stringify(
          bundleItems.map(({ productId, quantity }) => ({
            productId,
            quantity,
          })),
        ),
      );
    }

    try {
      await createProduct(formData).unwrap();
      message.success("Product created successfully.");
    } catch {
      message.error("The product could not be created. Check the form and try again.");
    }
  };

  const addBundleItem = useCallback((product: ProductListItem) => {
    setBundleItemsError("");
    setBundleItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);

      if (existing) {
        return prev.map((item) => (item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      }

      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          imageUrl: product.imageUrl,
          sellingPrice: getNormalPrice(product),
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

  const bundleItemsTotal = useMemo(() => {
    return bundleItems.reduce((total, item) => total + item.sellingPrice * item.quantity, 0);
  }, [bundleItems]);

  const updateVariantCombinations = (combinations: VariantCombination[]) => {
    const { costPrice = 0, sellingPrice = 0, weight = 0, barcode, lowStockThreshold, expiryDate } = productForm.getFieldsValue(["costPrice", "sellingPrice", "weight", "barcode", "lowStockThreshold", "expiryDate"]);
    const existingByKey = new Map(variantCombinations.map((combination) => [combination.key, combination]));

    setVariantCombinations(
      combinations?.map((combination) => ({
        ...combination,
        barcode: existingByKey.get(combination.key)?.barcode ?? barcode,
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
        weight: Number(weight),
        lowStockThreshold: existingByKey.get(combination.key)?.lowStockThreshold ?? Number(lowStockThreshold || 0),
        expiryDate: existingByKey.get(combination.key)?.expiryDate ?? expiryDate ?? null,
        stock: locationQuantities?.map((location) => ({
          locationId: location?.locationId,
          quantity: existingByKey.get(combination.key)?.stock?.find((item) => item.locationId === location.locationId)?.quantity || 0,
        })),
      })),
    );
  };

  const handleCombinationChange = (key: string, field: keyof Omit<VariantCombination, "stock">, value: VariantCombination[keyof Omit<VariantCombination, "stock">]) => {
    setVariantCombinations((prev: VariantCombination[]) => prev.map((item: VariantCombination) => (item.key === key ? { ...item, [field]: value } : item)));
  };

  const handleStockChange = (variantKey: string, locationId: string, quantity: number) => {
    setVariantCombinations((prev) =>
      prev.map((variant) => {
        if (variant.key !== variantKey) return variant;

        const existingStock = variant.stock || [];

        const stockExists = existingStock.some((item) => item.locationId === locationId);

        return {
          ...variant,
          stock: stockExists
            ? existingStock.map((item) => (item.locationId === locationId ? { ...item, quantity } : item))
            : [
                ...existingStock,
                {
                  locationId,
                  quantity,
                },
              ],
        };
      }),
    );
  };

  const handleImageChange = (key: string, image: File) => {
    handleCombinationChange(key, "image", image);
  };

  const handleOk = async () => {
    try {
      const values = await productForm.validateFields();
      onFinish(values);
    } catch {}
  };

  useEffect(() => {
    if (isSuccess) {
      productForm.resetFields();
      toggle();
      setMedia([]);
      setVariantCombinations([]);
      setLocationQuantities([]);
      setBundleItems([]);
      setBundleItemsError("");
      setProductSearch("");
    }
  }, [isSuccess, productForm, toggle]);

  useEffect(() => {
    if (containsOtherProducts && variantCombinations.length) {
      setVariantCombinations([]);
    }
  }, [containsOtherProducts, variantCombinations.length]);

  useEffect(() => {
    if (!containsOtherProducts) {
      setBundleItems([]);
      setBundleItemsError("");
      setProductSearch("");
    }
  }, [containsOtherProducts]);

  useEffect(() => {
    if (bundleFeatureEnabled) return;
    productForm.setFieldValue("containsOtherProducts", false);
    setBundleItems([]);
    setBundleItemsError("");
    setProductSearch("");
  }, [bundleFeatureEnabled, productForm]);

  // Table columns for variant combinations
  const variantColumns: TableProps<VariantCombination>["columns"] = [
    {
      title: "Variant",
      dataIndex: "name",
      key: "name",
      width: 220,
      fixed: "left",
      render: (text: string, record: VariantCombination) => (
        <div className=" flex items-center gap-x-2">
          <div className="flex items-center justify-center">
            <ImageUpload maxCount={1} width={50} height={50} onChange={(images) => handleImageChange(record.key, images?.[0])} />
          </div>
          <p className="font-medium">{text}</p>,
        </div>
      ),
    },

    {
      title: "Cost Price",
      dataIndex: "costPrice",
      key: "costPrice",
      width: 100,
      render: (_: unknown, record: VariantCombination) => (
        <InputNumber className="!w-[100px]" controls={false} min={0} prefix={currencyCode || undefined} value={record.costPrice} onChange={(e) => handleCombinationChange(record.key, "costPrice", Number(e))} size="middle" />
      ),
    },

    {
      title: "Selling Price",
      dataIndex: "sellingPrice",
      key: "sellingPrice",
      width: 100,
      render: (_: unknown, record: VariantCombination) => (
        <InputNumber className="!w-[100px]" controls={false} min={0} prefix={currencyCode || undefined} value={record.sellingPrice} onChange={(e) => handleCombinationChange(record.key, "sellingPrice", Number(e))} size="middle" />
      ),
    },

    {
      title: "Weight",
      dataIndex: "weight",
      key: "weight",
      width: 100,
      render: (_: unknown, record: VariantCombination) => <InputNumber className="!w-[90px]" controls={false} min={0} suffix="kg" value={record.weight} onChange={(value) => handleCombinationChange(record.key, "weight", Number(value))} size="middle" />,
    },

    ...(itemType === ITEM_TYPE.STOCK
      ? [
          {
            title: "Barcode",
            dataIndex: "barcode",
            key: "barcode",
            width: 150,
            render: (_: unknown, record: VariantCombination) => <Input size="middle" value={record.barcode} onChange={(event) => handleCombinationChange(record.key, "barcode", event.target.value)} />,
          },
          {
            title: "Stock Alert",
            dataIndex: "lowStockThreshold",
            key: "lowStockThreshold",
            width: 120,
            render: (_: unknown, record: VariantCombination) => (
              <InputNumber className="!w-[110px]" controls={false} min={0} value={record.lowStockThreshold} onChange={(value) => handleCombinationChange(record.key, "lowStockThreshold", Number(value || 0))} size="middle" />
            ),
          },
          {
            title: "Expiry Date",
            dataIndex: "expiryDate",
            key: "expiryDate",
            width: 150,
            render: (_: unknown, record: VariantCombination) => <Input type="date" size="middle" value={record.expiryDate || ""} onChange={(event) => handleCombinationChange(record.key, "expiryDate", event.target.value || null)} />,
          },
        ]
      : []),

    ...(itemType == ITEM_TYPE.STOCK && locationQuantities?.length
      ? locationQuantities.map((location) => ({
          title: location?.name,
          width: 120,
          render: (_: unknown, record: VariantCombination) => <InputNumber controls={false} min={0} onChange={(e) => handleStockChange(record.key, location?.locationId, e || 0)} size="middle" className="w-full" placeholder="0" />,
        }))
      : []),
  ];

  const bundleColumns = useMemo<TableProps<BundleItemInput>["columns"]>(
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
        align: "right",
        render: (productId: string) => (
          <div className="pl-5 text-gray-500 cursor-pointer hover:text-red-400" onClick={() => removeBundleItem(productId)}>
            <Trash2 size={15} className="cursor-pointer" />
          </div>
        ),
      },
    ],
    [removeBundleItem, updateBundleItemQuantity],
  );

  const searchBundleProduct = (
    <div className="px-5 bg-gray-100">
      <div className="sticky inset-0 z-50 py-4">
        <Input prefix={<RiSearchLine />} placeholder="Search for product" className="rounded-full!" value={productSearch} onChange={({ target: { value } }) => setProductSearch(value)} />
      </div>
      <div className="shadow-xl bg-white">
        {productSearch &&
          products?.data?.map((product: ProductListItem) => (
            <div key={product.id} className="cursor-pointer flex items-center justify-between border-t border-gray-200 px-5 py-2" onClick={() => addBundleItem(product)}>
              <div className="flex gap-x-2 items-center">
                <PreviewImage width={28} height={28} src={product.imageUrl} />
                <div>
                  <p>{product.name}</p>
                  {product.sku && product.sku !== "undefined" && <p className="text-gray-500">{product.sku}</p>}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  return (
    <AppModal
      loading={isLoading}
      footer={itemType ? undefined : null}
      width={750}
      height={"70vh"}
      title={
        itemType ? (
          <p className=" capitalize flex items-center cursor-pointer" onClick={() => setItemType(null)}>
            <MdOutlineArrowBackIos className="mr-2" /> {itemType?.replace("_", " ")?.toLowerCase()}
          </p>
        ) : (
          ""
        )
      }
      open={open}
      toggle={toggle}
      onOk={handleOk}
      okText={isLoading ? "Saving.." : "Save"}
    >
      {!itemType && (
        <div className="px-5">
          <h2 className="text-lg font-semibold text-gray-800">Choose Item Type</h2>
          <p className="text-sm text-gray-500 mb-5  ">Select how this item will be managed in your system.</p>

          <div className=" grid  gap-4 mb-8 mt-5">
            {ItemType?.map((type) => (
              <div
                key={type.key}
                className="  cursor-pointer hover:border-gray-500 border-gray-200 rounded-md border p-5 border-solid"
                onClick={() => {
                  setVariantCombinations([]);
                  productForm.setFieldValue("containsOtherProducts", false);
                  if ([ITEM_TYPE.NON_STOCK, ITEM_TYPE.STOCK]?.includes(type.key)) {
                    if (defaultLocation) {
                      ensureLocationSelected(defaultLocation);
                    }
                  } else {
                    setLocationQuantities([]);
                  }
                  setItemType(type.key);
                }}
              >
                <p className=" font-medium  text-gray-800">{type?.title}</p>
                <p className=" text-xs text-gray-500 mt-1">{type?.description}</p>
              </div>
            ))}
          </div>

          <div className="pb-5 flex justify-end " onClick={toggle}>
            <BaseButton size="middle" type="default" label="Cancel" />
          </div>
        </div>
      )}

      {itemType && (
        <div>
          <Form disabled={isLoading} className=" " size="small" form={productForm} layout={"vertical"} onFinish={onFinish}>
            <div className="    gap-x-12 ">
              <div className=" px-5 ">
                <InputFormItem label="Name" name="name" placeholder="Enter product name. Eg. Red T-Shirt" rules={[{ required: true, whitespace: true, message: "Product name is required" }]} />
              </div>

              <div className=" px-5">
                <div className=" grid md:grid-cols-5 md:gap-x-5">
                  <Form.Item label="Category" className=" w-full md:col-span-2" name="categoryId">
                    <SearchableCategorySelect type={CategoryType.PRODUCT} />
                  </Form.Item>

                  <div className=" grid  md:col-span-3 grid-cols-3   gap-x-3">
                    <InputFormItem className=" " type="number" label="Weight " name="weight" placeholder="0.0" afterText="kg" />

                    <InputFormItem type="number" label="Cost Price" name="costPrice" placeholder="0.0" prefix={currencyCode || undefined} />
                    <InputFormItem type="number" label="Selling Price" name="sellingPrice" placeholder="0.0" prefix={currencyCode || undefined} />
                  </div>
                </div>

                <TextAreaFormItem label="Description (Optional)" name="description" placeholder="Enter product description" />

                <Form.Item label="Media (images and videos)">
                  <div className=" min-h-fit p-1 flex items-center  bg-gray-100  rounded-md border  border-gray-200">
                    <ImageUpload width={75} height={75} onChange={(e) => setMedia(e)} />
                  </div>
                </Form.Item>
              </div>
            </div>

            {[ITEM_TYPE.NON_STOCK, ITEM_TYPE.STOCK]?.includes(itemType) && bundleFeatureEnabled && (
              <>
                <Divider />

                <div className="px-5  ">
                  <div className=" flex justify-between items-center">
                    <h3 className="text-base font-medium text-gray-700">Contains Other Products?</h3>
                    <Form.Item name="containsOtherProducts" valuePropName="checked" className="!mb-0">
                      <Switch />
                    </Form.Item>
                  </div>
                  <p className="text-xs text-gray-500">This product is made up of other products or ingredients.</p>
                </div>

                {containsOtherProducts && (
                  <div className="">
                    <div className="px-5 pb-3">{bundleItemsError && <p className="mt-2 text-xs text-red-500">{bundleItemsError}</p>}</div>
                    <AppTable columns={bundleColumns} dataSource={bundleItems || []} rowKey={(record: BundleItemInput) => record.productId} pagination={false} />
                    {searchBundleProduct}
                    <div className="px-5 pt-5 pb-2">
                      <p className="text-sm text-gray-500">Selected Products Total</p>
                      <p className="mt-1 font-medium text-gray-800">GHS {bundleItemsTotal.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ---------- Inventory Section ---------- */}

            {[ITEM_TYPE.NON_STOCK, ITEM_TYPE.STOCK]?.includes(itemType) && (
              <>
                <Divider />
                <div className="px-5  flex items-center justify-between">
                  <h3 className="   text-base font-medium text-gray-700"> {itemType == ITEM_TYPE.STOCK ? "Inventory Location" : "Available Location"} </h3>
                  <p className=" pl-5 cursor-pointer text-blue-500" onClick={toggleLocationModal}>
                    Manage
                  </p>
                </div>
                <Divider />

                <div className=" px-5  mt-6 ">
                  <div className="mt-6">
                    <div className="bg-gray-100 border-t border-x border-gray-200 rounded-sm  mb-4">
                      <div className=" w-full">
                        {!variantCombinations?.length &&
                          itemType == ITEM_TYPE.STOCK &&
                          locationQuantities?.map((location) => (
                            <div key={location?.locationId} className="flex  px-2 py-2   border-b border-gray-200  justify-between items-center gap-4">
                              <div>
                                <span className="text-sm font-normal text-gray-600">{location?.name}</span>
                              </div>
                              <Input
                                type="number"
                                step="any"
                                min={0}
                                value={location?.quantity || 0}
                                onChange={(e) =>
                                  setLocationQuantities((prev) =>
                                    prev.map((item) =>
                                      item.locationId === location.locationId
                                        ? {
                                            ...item,
                                            ...location,
                                            quantity: Number.parseFloat(e.target.value) || 0,
                                          }
                                        : item,
                                    ),
                                  )
                                }
                                className="!w-[100px] !md:w-[180px]"
                                size="small"
                                placeholder="Quantity"
                              />
                            </div>
                          ))}

                        {(variantCombinations?.length || itemType == ITEM_TYPE.NON_STOCK) && (
                          <div className="flex flex-wrap gap-2 p-2 ">
                            {locationQuantities?.map((location) => (
                              <p key={location.locationId}>
                                {location?.name}
                                {locationQuantities?.length > 1 && ","}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {itemType === ITEM_TYPE.STOCK && !variantCombinations.length && (
                      <div className={`${expiryEnabled ? "grid-cols-3" : "  grid-cols-2"}  grid col-span-3 gap-x-3`}>
                        <div className={`${expiryEnabled ? " col-span-2 md:col-span-1" : "  "}`}>
                          <InputFormItem label="Barcode" name="barcode" placeholder="Barcode" />
                        </div>
                        <InputFormItem type="number" label="Stock Alert Qty" name="lowStockThreshold" placeholder="0.0" />
                        {expiryEnabled ? <InputFormItem type="date" label="Expiry Date" name="expiryDate" placeholder="Expiry Date" /> : <div />}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ---------- Variants Section ---------- */}

            {[ITEM_TYPE.NON_STOCK, ITEM_TYPE.STOCK]?.includes(itemType) && !containsOtherProducts && (
              <>
                <Divider className="" />
                {/* Variant Toggles */}
                <div className="px-5 flex justify-between items-center">
                  <h3 className="text-base font-medium text-gray-700">Variants Options</h3>
                  <p className="  cursor-pointer  text-blue-500" onClick={toggleVariantModal}>
                    Manage
                  </p>
                </div>

                {/* Variant Combinations Table */}
                {variantCombinations.length > 0 && (
                  <div className="px-5 mt-5 ">
                    <div className=" ">
                      <AppTable scrollX="max-content" dataSource={variantCombinations} pagination={false} className="custom-table editable" rowKey="key" size="small" bordered columns={variantColumns} />
                    </div>
                  </div>
                )}
              </>
            )}

            {itemType != ITEM_TYPE.SERVICE && (enabledModules.storefront || enabledModules.pos) && (
              <>
                <Divider className="" />

                <div className=" grid px-5  my-5 gap-y-2 items-center  ">
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
          </Form>
        </div>
      )}

      {openLocationModal && <LocationSelector toggleSelect={toggleSelect} selected={locationQuantities} toggle={toggleLocationModal} open={openLocationModal} />}

      {<VariantFormModal updateVariantCombinations={updateVariantCombinations} toggle={toggleVariantModal} open={openVariantModal} />}
    </AppModal>
  );
}
