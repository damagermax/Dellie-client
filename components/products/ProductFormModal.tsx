"use client";
import { AppModal, ModalProps } from "@/components/ui/AppModal";
import { Checkbox, Divider, Form, FormInstance, Input, InputNumber, Radio } from "antd";
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
import { VariantAttribute, VariantFormModal } from "./VariantFormModal";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { ProductListItem } from "@/types/index";
import { RiSearchLine } from "react-icons/ri";
import PreviewImage from "../ui/PreviewImage";
import { Trash2 } from "lucide-react";
import { CategoryType } from "@/types/category";

interface BundleItemInput {
  productId: string;
  name: string;
  sku?: string;
  imageUrl?: string;
  sellingPrice: number;
  quantity: number;
}

export interface VariantCombination {
  key: string;
  name: string;
  image?: File | null;
  costPrice: number;
  sellingPrice: number;

  stock: { locationId: string; quantity: number }[] | null;
  optionValues: any;
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
    description: "Physical item kept in stock with quantity tracking for sales and usage.",
    key: ITEM_TYPE.STOCK,
  },
  {
    title: "Non-Stock Product",
    description: "Physical item sold without inventory tracking.",
    key: ITEM_TYPE.NON_STOCK,
  },
  {
    title: "Service",
    description: "Non-physical offering like work or time-based service.",
    key: ITEM_TYPE.SERVICE,
  },
  // {
  //   title: "Bundle",
  //   description: "Group of items or services sold together as one package.",
  //   key: ITEM_TYPE.BUNDLE,
  // },

  {
    title: "Packaging",
    description: "Sell this product as packs, cartons, or cases using stock from a stock product.",
    key: ITEM_TYPE.PACKAGING,
  },
];

const REPACK_CONVERSION_TYPE = {
  SOURCE_TO_REPACK: "source_to_repack",
  REPACK_TO_SOURCE: "repack_to_source",
} as const;

export default function ProductFormModal({ open, toggle }: ProductFormModalProps) {
  const [openLocationModal, toggleLocationModal] = useToggle();
  const [openVariantModal, toggleVariantModal] = useToggle();
  const [media, setMedia] = useState<File[]>([]);
  const [itemType, setItemType] = useState<ITEM_TYPE | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [repackSourceSearch, setRepackSourceSearch] = useState("");
  const [selectedRepackSourceProduct, setSelectedRepackSourceProduct] = useState<ProductListItem | null>(null);
  const [bundleItems, setBundleItems] = useState<BundleItemInput[]>([]);
  const [bundleItemsError, setBundleItemsError] = useState("");
  const [bundleSellingPriceEdited, setBundleSellingPriceEdited] = useState(false);

  const [productForm] = Form.useForm();
  const repackConversionType = Form.useWatch("conversionType", productForm) || REPACK_CONVERSION_TYPE.SOURCE_TO_REPACK;
  const repackConversionQuantity = Number(Form.useWatch("conversionQuantity", productForm) || 0);
  const repackProductName = Form.useWatch("name", productForm) || "repack product";

  const [variantCombinations, setVariantCombinations] = useState<VariantCombination[]>([]);
  const [locationQuantities, setLocationQuantities] = useState<any[]>([]);

  const { data: defaultLocation, isLoading: defaultLocationsLoading } = useGetDefaultLocationQuery();
  const debouncedProductSearch = useDebouncedValue(productSearch);
  const debouncedRepackSourceSearch = useDebouncedValue(repackSourceSearch);
  const { data: products } = useGetProductsQuery({
    search: debouncedProductSearch,
    limit: 20,
  });
  const { data: sourceProducts } = useGetProductsQuery({
    search: debouncedRepackSourceSearch,
    type: "STOCK",
    limit: 20,
  });

  const [createProduct, { isLoading, error, isSuccess }] = useCreateProductMutation();

  const toggleSelect = (location: Location) => {
    setLocationQuantities((prev) => {
      const exists = prev.find((item) => item.locationId === location.id);

      if (exists) {
        return prev.filter((item) => item.locationId !== location.id);
      }

      return [
        ...prev,
        {
          locationId: location.id,
          name: location.name,
          quantity: 0,
        },
      ];
    });
  };

  const onFinish = async (values: any) => {
    if (isLoading) return;

    const formData = new FormData();

    formData.append("name", values.name);
    formData.append("description", values.description || "");
    formData.append("costPrice", String(values.costPrice || 0));
    formData.append("sellingPrice", String(values.sellingPrice || 0));
    formData.append("showInStorefront", String(values.showInStorefront));
    formData.append("showInPOS", String(values.showInPOS));
    formData.append("type", String(itemType));

    if (values.categoryId) formData.append("categoryId", String(values.categoryId));
    if (values.sku) formData.append("sku", String(values.sku));
    if (values.barcode) formData.append("barcode", String(values.barcode));
    if (itemType === ITEM_TYPE.STOCK && values.weight) formData.append("weight", String(values.weight));

    if (itemType === ITEM_TYPE.PACKAGING) {
      formData.append("sourceProductId", String(values.sourceProductId || ""));
      formData.append("conversionType", String(values.conversionType || REPACK_CONVERSION_TYPE.SOURCE_TO_REPACK));
      formData.append("conversionQuantity", String(values.conversionQuantity || 0));
      formData.append("repackUnitName", String(values.name || ""));
    }

    for (const file of media) {
      formData.append("media", file as Blob);
    }

    if (!variantCombinations?.length && locationQuantities?.length) {
      formData.append("stock", JSON.stringify(locationQuantities || []));
    }

    if (variantCombinations?.length) {
      formData.append("variants", JSON.stringify(variantCombinations || []));

      console.log("========combinations", variantCombinations);

      for (const variant of variantCombinations) {
        variant.image && formData.append("variantImages", variant.image as Blob, variant.key);
      }
    }

    if (itemType === ITEM_TYPE.BUNDLE) {
      if (!bundleItems.length) {
        setBundleItemsError("Add at least one item to this bundle");
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

    await createProduct(formData);
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
          sellingPrice: product.sellingPrice || 0,
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
    setVariantCombinations(
      combinations?.map((combination) => ({
        ...combination,
        stock: locationQuantities?.map((location) => ({
          locationId: location?.locationId,
          quantity: 0,
        })),
      })),
    );
  };

  const handleCombinationChange = (key: string, field: keyof Omit<VariantCombination, "stock" | "onHand">, value: any) => {
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
    } catch (error) {}
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
      setBundleSellingPriceEdited(false);
      setProductSearch("");
      setRepackSourceSearch("");
      setSelectedRepackSourceProduct(null);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (itemType === ITEM_TYPE.BUNDLE && !bundleSellingPriceEdited) {
      productForm.setFieldValue("sellingPrice", bundleItemsTotal);
    }
  }, [bundleItemsTotal, bundleSellingPriceEdited, itemType, productForm]);

  useEffect(() => {
    if (itemType !== ITEM_TYPE.PACKAGING) {
      productForm.setFieldsValue({
        sourceProductId: undefined,
        conversionQuantity: undefined,
        conversionType: REPACK_CONVERSION_TYPE.SOURCE_TO_REPACK,
      });
      setSelectedRepackSourceProduct(null);
      setRepackSourceSearch("");
    }
  }, [itemType, productForm]);

  // Table columns for variant combinations
  const variantColumns = [
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
      render: (_: any, record: VariantCombination) => <InputNumber className="!w-[80px]" controls={false} prefix="$" value={record.costPrice} onChange={(e) => handleCombinationChange(record.key, "costPrice", Number(e))} size="middle" />,
    },

    {
      title: "Selling Price",
      dataIndex: "sellingPrice",
      key: "sellingPrice",
      width: 100,
      render: (_: any, record: VariantCombination) => <InputNumber className="!w-[80px] " controls={false} prefix="$" value={record.sellingPrice} onChange={(e) => handleCombinationChange(record.key, "sellingPrice", Number(e))} size="middle" />,
    },

    ...(itemType == ITEM_TYPE.STOCK && locationQuantities?.length
      ? locationQuantities.map((location) => ({
          title: location?.name,
          width: 120,
          render: (_: any, record: VariantCombination) => <InputNumber controls={false} min={0} onChange={(e) => handleStockChange(record.key, location?.locationId, e || 0)} size="middle" className="w-full" placeholder="0" />,
        }))
      : []),
  ];

  const bundleColumns = useMemo(
    () => [
      {
        title: "Product",
        dataIndex: "name",
        key: "name",
        className: "!pl-8",
        width: "70%",
        render: (_: any, record: BundleItemInput) => (
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
        render: (_: any, record: BundleItemInput) => <InputNumber variant="underlined" controls={false} min={1} value={record.quantity} onChange={(value) => updateBundleItemQuantity(record.productId, value)} suffix="units" />,
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

  const addRepackSourceProduct = useCallback(
    (product: ProductListItem) => {
      setSelectedRepackSourceProduct(product);
      setRepackSourceSearch("");
      productForm.setFieldValue("sourceProductId", product.id);
    },
    [productForm],
  );

  const removeRepackSourceProduct = useCallback(() => {
    setSelectedRepackSourceProduct(null);
    setRepackSourceSearch("");
    productForm.setFieldValue("sourceProductId", undefined);
  }, [productForm]);

  const repackSourceColumns = useMemo(
    () => [
      {
        title: "Source Product",
        dataIndex: "name",
        key: "name",
        className: "!pl-5",
        render: (_: any, record: ProductListItem) => (
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

  const searchRepackSourceProduct = (
    <div className="px-5 bg-gray-100">
      <div className="sticky inset-0 z-50 py-4">
        <Input prefix={<RiSearchLine />} placeholder="Search stock product" className="rounded-full!" value={repackSourceSearch} onChange={({ target: { value } }) => setRepackSourceSearch(value)} />
      </div>
      <div className="shadow-xl bg-white">
        {repackSourceSearch &&
          sourceProducts?.data?.map((product: ProductListItem) => (
            <div key={product.id} className="cursor-pointer flex items-center justify-between border-t border-gray-200 px-5 py-2" onClick={() => addRepackSourceProduct(product)}>
              <div className="flex gap-x-2 ">
                <PreviewImage width={28} height={28} src={product.imageUrl} />
                <div>
                  <p className="line-clamp-1">{product.name}</p>
                  {product.sku && product.sku !== "undefined" && <p className="text-gray-700 text-[0.7rem]">{product.sku}</p>}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
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
      width={650}
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

          <div className=" grid grid-cols-2 gap-4 mb-8 mt-5">
            {ItemType?.map((type) => (
              <div
                className="  cursor-pointer hover:border-gray-500 border-gray-200 rounded-md border p-5 border-solid"
                onClick={() => {
                  setVariantCombinations([]);
                  setBundleSellingPriceEdited(false);
                  productForm.setFieldValue("conversionType", REPACK_CONVERSION_TYPE.SOURCE_TO_REPACK);
                  if ([ITEM_TYPE.NON_STOCK, ITEM_TYPE.STOCK]?.includes(type.key)) {
                    defaultLocation && toggleSelect(defaultLocation || []);
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
                <InputFormItem label="Name" name="name" placeholder="Enter product name. Eg. Red T-Shirt" />
              </div>

              <div className=" px-5">
                {![ITEM_TYPE.BUNDLE, ITEM_TYPE.PACKAGING].includes(itemType) && (
                  <>
                    <div className=" grid grid-cols-2 gap-x-5">
                      <Form.Item label="Category" name="categoryId">
                        <SearchableCategorySelect type={CategoryType.PRODUCT} />
                      </Form.Item>

                      <div className=" grid grid-cols-2  gap-x-5">
                        <InputFormItem type="number" label="Cost Price" name="costPrice" placeholder="0.0" />
                        <InputFormItem type="number" label="Selling Price" name="sellingPrice" placeholder="0.0" />
                      </div>
                    </div>
                    {itemType === ITEM_TYPE.STOCK && (
                      <div className="grid grid-cols-2 gap-x-5">
                        <InputFormItem type="number" label="Weight (Optional)" name="weight" placeholder="0.0" />
                      </div>
                    )}
                    <TextAreaFormItem label="Description (Optional)" name="description" placeholder="Enter product description" />
                  </>
                )}

                <Form.Item label="Media (images and videos)">
                  <div className=" min-h-fit p-1 flex items-center  bg-gray-100  rounded-md border  border-gray-200">
                    <ImageUpload width={75} height={75} onChange={(e) => setMedia(e)} />
                  </div>
                </Form.Item>
              </div>

              {itemType === ITEM_TYPE.PACKAGING && (
                <>
                  <div>
                    <Form.Item name="sourceProductId" rules={[{ required: true, message: "Select source product" }]} className="!mb-0">
                      <Input type="hidden" />
                    </Form.Item>

                    <Form.Item label="What are you creating from the source product?" name="conversionType" initialValue={REPACK_CONVERSION_TYPE.SOURCE_TO_REPACK} className="!px-5" rules={[{ required: true, message: "Select conversion type" }]}>
                      <Radio.Group className="w-full">
                        <div className="grid grid-cols-2 -rounded-md gap-3">
                          <Radio.Button className="!h-auto !p-3 !text-left" value={REPACK_CONVERSION_TYPE.SOURCE_TO_REPACK}>
                            <p className="font-medium">Smaller unit from a larger product</p>
                            <p className="text-xs text-gray-500">Example: Carton to Bottle</p>
                          </Radio.Button>

                          <Radio.Button className="!h-auto -rounded-md !p-3 !text-left" value={REPACK_CONVERSION_TYPE.REPACK_TO_SOURCE}>
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

                    <div className="grid grid-cols-2 gap-x-5 px-5  mt-4">
                      <InputFormItem
                        type="number"
                        label={repackConversionType === REPACK_CONVERSION_TYPE.SOURCE_TO_REPACK ? "1 source unit makes how many  units?" : "How many source units make 1 unit?"}
                        name="conversionQuantity"
                        placeholder="24"
                        rules={[{ required: true, message: "Enter conversion quantity" }]}
                      />

                      <InputFormItem type="number" label="Selling Price" name="sellingPrice" placeholder="0.0" />
                    </div>

                    {selectedRepackSourceProduct && repackConversionQuantity > 0 && (
                      <div className="mt-4 rounded-sm border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                        {repackConversionType === REPACK_CONVERSION_TYPE.SOURCE_TO_REPACK ? (
                          <>
                            <p>
                              1 {selectedRepackSourceProduct.name} = {repackConversionQuantity} {repackProductName}
                            </p>
                            <p className="mt-1">
                              Selling 1 {repackProductName} deducts 1/{repackConversionQuantity} {selectedRepackSourceProduct.name}.
                            </p>
                          </>
                        ) : (
                          <>
                            <p>
                              {repackConversionQuantity} {selectedRepackSourceProduct.name} = 1 {repackProductName}
                            </p>
                            <p className="mt-1">
                              Selling 1 {repackProductName} deducts {repackConversionQuantity} {selectedRepackSourceProduct.name}.
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

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
                    <InputNumber className="!w-full" min={0} prefix="GHS" controls={false} placeholder="0.00" onChange={() => setBundleSellingPriceEdited(true)} />
                  </Form.Item>
                </div>
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
                            <div key={location?.locationId} className="flex  px-5 py-2   border-b border-gray-200  justify-between items-center gap-4">
                              <div>
                                <span className="text-sm font-normal text-gray-600">{location?.name}</span>
                              </div>
                              <Input
                                type="number"
                                min={0}
                                value={location?.quantity || 0}
                                onChange={(e) =>
                                  setLocationQuantities((prev) =>
                                    prev.map((item) =>
                                      item.locationId === location.locationId
                                        ? {
                                            ...item,
                                            ...location,
                                            quantity: parseInt(e.target.value) || 0,
                                          }
                                        : item,
                                    ),
                                  )
                                }
                                className="!w-[180px]"
                                size="small"
                                placeholder="Enter quantity"
                                suffix="| unit"
                              />
                            </div>
                          ))}

                        {(variantCombinations?.length || itemType == ITEM_TYPE.NON_STOCK) && (
                          <div className="flex flex-wrap gap-2 p-2 ">
                            {locationQuantities?.map((location) => (
                              <p>
                                {location?.name}
                                {locationQuantities?.length > 1 && ","}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ---------- Variants Section ---------- */}

            {[ITEM_TYPE.NON_STOCK, ITEM_TYPE.STOCK]?.includes(itemType) && (
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

            {itemType != ITEM_TYPE.SERVICE && (
              <>
                <Divider className="" />

                <div className=" grid px-5  my-5 gap-y-2 items-center  ">
                  <Form.Item name="showInStorefront" className="!mb-0" valuePropName="checked">
                    <Checkbox>Show in Storefront</Checkbox>
                  </Form.Item>

                  <Form.Item name="showInPOS" className="!mb-0" valuePropName="checked">
                    <Checkbox>Show in POS</Checkbox>
                  </Form.Item>
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
