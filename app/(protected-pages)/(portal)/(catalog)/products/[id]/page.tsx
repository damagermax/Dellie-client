"use client";

import Link from "next/link";
import type { TableProps } from "antd/es/table";
import { GoBack } from "@/components/ui/GoBack";
import { ProductEditModal } from "@/components/products/ProductEditModal";
import { ProductMediaManagerModal } from "@/components/products/ProductMediaManagerModal";
import { ProductVariantsTable, type ProductVariantRow } from "@/components/products/ProductVariantsTable";
import { ProductDetailShimmer } from "@/components/products/ProductDetailShimmer";
import { ProductVariantEditModal } from "@/components/products/ProductVariantEditModal";
import AppTable from "@/components/ui/AppTable";
import { ITEM_TYPE } from "@/components/products/ProductFormModal";
import {
  useAdjustBatchMutation,
  useDeleteProductMutation,
  useDisassembleBatchByBatchIdMutation,
  useGetLocationsQuery,
  useGetProductQuery,
  useRestockProductMutation,
  useRestoreProductMutation,
  useTransferBatchByBatchIdMutation,
} from "@/lib/redux/services";
import { AccessDeniedView } from "@/components/ui/AccessDeniedView";
import ProductImagePlaceholder from "@/components/ui/ProductImagePlaceholder";
import { usePermissions } from "@/hooks/usePermissions";
import { ActionDropdown, DropdownItemLabel } from "@/components/ui/ActionDropdown";
import { AppModal } from "@/components/ui/AppModal";
import { StorePermission } from "@/types/store-access";
import useToggle from "@/hooks/UseToggle";
import { AdjustBatchInput, DisassembleBatchInput, Location, RestockProductInput, TransferBatchInput } from "../../../../../../types";
import { Button, DatePicker, Drawer, Empty, Form, Input, InputNumber, Popconfirm, Segmented, Select, Tabs, Tag, message } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ArrowRightLeft, PackageOpen, Pencil, SlidersHorizontal } from "lucide-react";
import { NORMAL_PRICE_TIER_NAME, ProductPriceTier, TRADE_PRICE_TIER_NAME, defaultPriceTiers } from "@/lib/products/pricing";
import { getProductTypeLabel, hasBundleComponents } from "@/lib/products/type-label";
import React, { useEffect, useMemo, useState } from "react";
import { FaBox, FaLayerGroup } from "react-icons/fa";
import { GrHistory } from "react-icons/gr";
import { ImBoxRemove } from "react-icons/im";
import { TbPackageExport } from "react-icons/tb";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useRouter } from "next/navigation";

dayjs.extend(relativeTime);

type InventorySummary = {
  availableQuantity?: number;
  inventoryValue?: number;
  activeBatches?: number;
  expiredQuantity?: number;
  expiringSoonQuantity?: number;
  averageCost?: number;
};

type InventoryLocation = {
  id?: string;
  locationId?: string;
  locationName?: string;
  onHand?: number;
  available?: number;
  unavailable?: number;
  reserved?: number;
  incoming?: number;
  committed?: number;
};

type AvailableLocation = {
  id?: string;
  locationId?: string;
  locationName?: string;
};

type InventoryBatch = {
  id?: string;
  batchNumber?: string;
  locationId?: string;
  locationName?: string;
  quantity?: number;
  remainingQuantity?: number;
  unitCost?: number;
  source?: string;
  sourceDate?: string;
  expiryDate?: string;
  status?: string;
};

type ProductOrderHistoryItem = {
  id: string;
  type: "sale" | "purchase";
  status?: "open" | "closed" | "draft";
  receiptStatus?: "pending" | "partially_received" | "received";
  isDeleted?: boolean;
  source?: string;
  saleNumber?: string;
  quoteNumber?: string;
  purchaseNumber?: string;
  documentNumber?: string;
  contactId?: { id?: string; name?: string; displayName?: string };
  locationId?: { id?: string; name?: string };
  currencyId?: { id?: string; code?: string; name?: string };
  date?: string;
  amount?: number;
  balance?: number;
  formattedTotal?: string;
  formattedBalance?: string;
  quantity?: number;
  fulfilledQuantity?: number;
  returnedQuantity?: number;
};

type BundleComponent = {
  productId?: string;
  productName?: string;
  sku?: string;
  type?: string;
  imageUrl?: string | null;
  quantityRequired?: number;
  availableQuantity?: number;
  availableBundles?: number;
};

type ProductDetail = Record<string, unknown> & {
  id: string;
  name: string;
  type: ITEM_TYPE;
  status?: "active" | "archived";
  sku?: string;
  barcode?: string;
  categoryId?: string;
  categoryName?: string;
  description?: string;
  weight?: number;
  priceTiers?: ProductPriceTier[];
  costPrice?: number;
  wholesalePrice?: number;
  availableStock?: number;
  lowStockThreshold?: number;
  minOrderLevel?: number;
  allowOversell?: boolean;
  showInStorefront?: boolean;
  showInPOS?: boolean;
  sourceProductId?: string;
  sourceQuantity?: number;
  conversionType?: string;
  conversionQuantity?: number;
  repackUnitName?: string;
  media?: Array<{ url?: string; key?: string; type?: string }>;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  sourceProductName?: string;
  parentProductName?: string;
  conversionRule?: string;
  bundleAvailability?: number;
  bundleComponents?: BundleComponent[];
  bundleItems?: Array<{
    productId?:
      | {
          id?: string;
          name?: string;
          sku?: string;
          media?: { url?: string }[];
          priceTiers?: ProductPriceTier[];
        }
      | string;
    quantity?: number;
  }>;
  hasVariants?: boolean;
  isAvailable?: boolean;
  variants?: ProductVariantRow[];
  inventory?: {
    summary?: InventorySummary;
    locations?: InventoryLocation[];
    batches?: InventoryBatch[];
  };
  availableLocations?: AvailableLocation[];
  orderHistory?: ProductOrderHistoryItem[];
  sourceInventory?: {
    summary?: InventorySummary;
  };
};

type DetailTab = {
  key: string;
  label: React.ReactNode;
  children: React.ReactNode;
};

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const { ready, hasAnyPermission, hasPermission } = usePermissions();
  const [editOpen, toggleEdit] = useToggle();
  const [mediaOpen, toggleMedia] = useToggle();
  const [restockOpen, toggleRestock] = useToggle();
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [heroImageFailed, setHeroImageFailed] = useState(false);
  const canViewProduct = hasAnyPermission([StorePermission.PRODUCTS_VIEW, StorePermission.PRODUCTS_MANAGE]);
  const canManageProduct = hasPermission(StorePermission.PRODUCTS_MANAGE);
  const canManageInventory = hasPermission(StorePermission.INVENTORY_MANAGE);
  const enableTradePrice = useSelector((state: RootState) => Boolean(state.currentUser.storeSettings.pricing?.enableTradePrice));
  const { data: rawProduct, isLoading, refetch } = useGetProductQuery(id, { skip: !id || !ready || !canViewProduct });
  const [archiveProduct, { isLoading: archiving }] = useDeleteProductMutation();
  const [restoreProduct, { isLoading: restoring }] = useRestoreProductMutation();
  const product = rawProduct as ProductDetail | undefined;
  const imageUrl = product?.media?.[0]?.url || product?.imageUrl;

  const tabs = useMemo(() => buildTabs(product, { canManageInventory, canManageProduct, onBatchChanged: refetch, onEditProduct: toggleEdit, enableTradePrice }), [canManageInventory, canManageProduct, enableTradePrice, product, refetch, toggleEdit]);
  const currentTab = tabs.find((tab) => tab.key === activeSection) || tabs[0];

  useEffect(() => {
    if (tabs.length && !tabs.some((tab) => tab.key === activeSection)) {
      setActiveSection(tabs[0].key);
    }
  }, [activeSection, tabs]);

  useEffect(() => {
    setHeroImageFailed(false);
  }, [imageUrl]);

  if (!ready || (canViewProduct && isLoading)) {
    return <ProductDetailShimmer />;
  }

  if (!canViewProduct) {
    return <AccessDeniedView title="Products" description="You do not have permission to view this product." />;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <GoBack />
        <div className="mt-8 rounded-sm border border-gray-200 bg-white p-10">
          <Empty description="Product could not be loaded." />
        </div>
      </div>
    );
  }
  const showImagePlaceholder = !imageUrl || heroImageFailed;
  const displayName = product.parentProductName ? `${product.parentProductName} - ${product.name}` : product.name;
  const descriptionText = product.description || "No description has been added for this product.";
  const canToggleDescription = Boolean(product.description && product.description.length > 160);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]">
        <main className="border-r border-gray-200 bg-white">
          <header className="border-b border-gray-200 p-3 sm:px-5  sm:py-5 md:px-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <GoBack />
                <div className="min-w-0 font-semibold">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="truncate text-xl text-gray-700 md:text-2xl">{displayName}</h1>
                    <TypeBadge product={product} />
                  </div>
                  <AuditFooter createdAt={product.createdAt} updatedAt={product.updatedAt} />
                </div>
              </div>
              <div className="flex w-full justify-end gap-2 md:w-auto">
                {canManageProduct && !product.productId && (
                  <Popconfirm
                    title={product.status === "archived" ? "Restore product?" : "Archive product?"}
                    description={product.status === "archived" ? "The product will become available again." : "The product and its variants will be hidden from new transactions."}
                    onConfirm={async () => {
                      try {
                        if (product.status === "archived") {
                          await restoreProduct(product.id).unwrap();
                          await refetch();
                          message.success("Product restored.");
                        } else {
                          await archiveProduct(product.id).unwrap();
                          message.success("Product archived.");
                          router.push("/products");
                        }
                      } catch {
                        message.error("The product status could not be changed.");
                      }
                    }}
                  >
                    <Button danger loading={archiving || restoring}>
                      {product.status === "archived" ? "Restore" : "Archive"}
                    </Button>
                  </Popconfirm>
                )}
                {product.type === ITEM_TYPE.STOCK && !product.hasVariants && canManageInventory && (
                  <Button type="default" onClick={toggleRestock}>
                    {hasBundleComponents(product) ? "Assemble" : "Restock"}
                  </Button>
                )}
                {canManageProduct && (
                  <Button type="default" onClick={toggleEdit}>
                    Edit
                  </Button>
                )}
              </div>
            </div>
          </header>
          <section id="product-overview" className="scroll-mt-14 grid grid-cols-[88px_minmax(0,1fr)] gap-4 px-4 py-5 sm:gap-6 md:px-5 md:py-6 lg:grid-cols-[200px_minmax(0,1fr)] cursor-pointer">
            <button
              type="button"
              onClick={canManageProduct ? toggleMedia : undefined}
              disabled={!canManageProduct}
              className="group relative aspect-square w-full cursor-pointer overflow-hidden rounded-sm border border-[#2d837d] text-left outline-none transition disabled:cursor-default disabled:opacity-100"
            >
              {showImagePlaceholder ? <ProductImagePlaceholder label="Product image" /> : <img className="h-full  w-full hover:p-0 transition  object-cover" src={imageUrl} alt={product.name || "Product"} onError={() => setHeroImageFailed(true)} />}
              {canManageProduct && <span className="absolute inset-x-0 bottom-0 bg-[#2d837d] px-3 py-2 text-center text-xs font-medium text-white  transition  ">Manage media</span>}
            </button>

            <div className="min-w-0">
              <DetailGrid
                items={[
                  { label: "SKU", value: product.sku || "-" },
                  { label: "Barcode", value: product.barcode || "-" },
                  {
                    label: "Category",
                    value: product.categoryName || "Uncategorized",
                  },
                  {
                    label: "Weight",
                    value: product.weight ? `${product.weight}` : "-",
                  },
                ]}
              />

              <div
                className={`border-b border-gray-200 px-4 py-4 ${canToggleDescription ? "cursor-pointer" : "cursor-default"}`}
                role={canToggleDescription ? "button" : undefined}
                tabIndex={canToggleDescription ? 0 : undefined}
                aria-expanded={descriptionExpanded}
                onClick={() => canToggleDescription && setDescriptionExpanded((current) => !current)}
                onKeyDown={(event) => {
                  if (!canToggleDescription) return;
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setDescriptionExpanded((current) => !current);
                  }
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">Description</p>
                  {canToggleDescription && <p className="text-xs font-medium text-gray-500">{descriptionExpanded ? "Show less" : "Read more"}</p>}
                </div>
                <p
                  className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600"
                  style={
                    !descriptionExpanded && canToggleDescription
                      ? {
                          display: "-webkit-box",
                          WebkitLineClamp: 4,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }
                      : undefined
                  }
                >
                  {descriptionText}
                </p>
              </div>
            </div>
          </section>

          <section id="product-activity" className="scroll-mt-14 pb-8">
            {product.hasVariants ? (
              <div className="">{currentTab?.children}</div>
            ) : (
              <>
                <div className="mb-6 hidden overflow-x-auto pb-1 md:block">
                  <div className="flex w-max min-w-full justify-center">
                    <Segmented
                      shape="round"
                      options={tabs.map((tab) => ({
                        label: tab.label,
                        value: tab.key,
                      }))}
                      value={currentTab?.key}
                      onChange={(value) => setActiveSection(String(value))}
                      className="[&_.ant-segmented-item-selected]:!bg-[#2d837d] [&_.ant-segmented-item-selected]:!text-white"
                      style={{ backgroundColor: "#ebebeb", padding: "5px" }}
                    />
                  </div>
                </div>

                <div className="border-y border-gray-200 bg-white px-2 md:hidden">
                  <Tabs
                    activeKey={currentTab?.key}
                    items={tabs}
                    onChange={setActiveSection}
                    tabBarGutter={18}
                    className="purchase-mobile-tabs !mb-0 [&_.ant-tabs-nav]:!mb-0 [&_.ant-tabs-nav:before]:!border-0 [&_.ant-tabs-tab]:!py-4 [&_.ant-tabs-tab-btn]:!text-gray-500 [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:!text-[#2d837d] [&_.ant-tabs-ink-bar]:!bg-[#2d837d]"
                  />
                </div>

                <div className="hidden md:block">{currentTab?.children}</div>
              </>
            )}
          </section>
        </main>

        <aside className="bg-gray-50 px-5 py-5 md:px-8">
          <div className="sticky top-4 space-y-5"></div>
        </aside>
      </div>

      {editOpen && product && (product.productId ? <ProductVariantEditModal open={editOpen} toggle={toggleEdit} product={product} onSaved={refetch} /> : <ProductEditModal open={editOpen} toggle={toggleEdit} product={product} onSaved={refetch} />)}
      {restockOpen && product && <RestockProductModal open={restockOpen} toggle={toggleRestock} product={product} onSaved={refetch} />}
      {mediaOpen && product && <ProductMediaManagerModal open={mediaOpen} toggle={toggleMedia} productId={product.id} productName={product.name} media={product.media || []} onChanged={refetch} />}
    </div>
  );
}

function RestockProductModal({ open, toggle, product, onSaved }: { open: boolean; toggle: () => void; product: ProductDetail; onSaved: () => void }) {
  const [form] = Form.useForm<RestockProductFormValues>();
  const [restockProduct, { isLoading }] = useRestockProductMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { data: locations = [], isLoading: locationsLoading } = useGetLocationsQuery({}, { skip: !open });
  const isAssemblyRestock = product.type === ITEM_TYPE.STOCK && hasBundleComponents(product);

  const locationOptions = locations
    .filter((location: Location) => location.status === "active")
    .map((location: Location) => ({
      label: location.name,
      value: location.id,
    }));

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      locationId: undefined,
      quantity: undefined,
      unitCost: product.costPrice,
      receivedDate: dayjs(),
      expiryDate: undefined,
    });
    setSubmitError(null);
  }, [form, isAssemblyRestock, open, product.costPrice, product.id]);

  const handleSubmit = async () => {
    try {
      setSubmitError(null);
      const values = await form.validateFields();
      await restockProduct({
        productId: product.id,
        locationId: values.locationId,
        quantity: values.quantity,
        unitCost: Number(values.unitCost || 0),
        receivedDate: values.receivedDate.toISOString(),
        expiryDate: values.expiryDate?.toISOString(),
      }).unwrap();
      message.success(isAssemblyRestock ? "Bundle assembled." : "Product restocked.");
      toggle();
      onSaved();
    } catch (error) {
      if (isFormValidationError(error)) return;
      setSubmitError(getMutationErrorMessage(error, "Product could not be restocked."));
    }
  };

  return (
    <AppModal
      open={open}
      toggle={toggle}
      title={`${isAssemblyRestock ? "Assemble" : "Restock"} ${product.name}`}
      onOk={handleSubmit}
      loading={isLoading}
      okText={isAssemblyRestock ? "Assemble" : "Restock"}
      width={560}
      height="auto"
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={toggle} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleSubmit} loading={isLoading}>
            {isAssemblyRestock ? "Assemble" : "Restock"}
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" className=" ">
        <BatchContextCard
          items={[
            { label: "Product", value: product.name },
            { label: "SKU", value: product.sku || "-" },
            { label: "Type", value: getProductTypeLabel(product) },
          ]}
        />

        <div className="px-5">
          {submitError && <p className="mb-4 text-sm text-red-600">{submitError}</p>}
          {isAssemblyRestock ? <div className="mb-4 rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">This stock bundle will be assembled from its component inventory at the selected location.</div> : null}
          <Form.Item label="Location" name="locationId" rules={[{ required: true, message: "Select a location" }]}>
            <Select placeholder="Select location" loading={locationsLoading} options={locationOptions} />
          </Form.Item>

          <div className=" grid grid-cols-2 gap-x-5">
            <Form.Item
              label="Quantity"
              name="quantity"
              rules={[
                { required: true, message: "Enter quantity" },
                {
                  validator: (_, value) => {
                    if (value === undefined || value === null) return Promise.resolve();
                    if (Number(value) <= 0) return Promise.reject(new Error("Quantity must be greater than zero"));
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber className="!w-full" min={0.000001} />
            </Form.Item>
            <Form.Item
              label="Unit cost"
              name="unitCost"
              rules={
                isAssemblyRestock
                  ? undefined
                  : [
                      { required: true, message: "Enter unit cost" },
                      {
                        validator: (_, value) => {
                          if (value === undefined || value === null) return Promise.resolve();
                          if (Number(value) < 0) return Promise.reject(new Error("Unit cost cannot be negative"));
                          return Promise.resolve();
                        },
                      },
                    ]
              }
            >
              <InputNumber className="!w-full" min={0} disabled={isAssemblyRestock} />
            </Form.Item>
            <Form.Item label="Received date" name="receivedDate" rules={[{ required: true, message: "Select received date" }]}>
              <DatePicker className="!w-full" />
            </Form.Item>
            <Form.Item label="Expiry date" name="expiryDate">
              <DatePicker className="!w-full" />
            </Form.Item>
          </div>
        </div>
      </Form>
    </AppModal>
  );
}

function buildTabs(product: ProductDetail | undefined, options: { canManageInventory: boolean; canManageProduct: boolean; onBatchChanged: () => void; onEditProduct: () => void; enableTradePrice: boolean }): DetailTab[] {
  if (!product) return [];

  if (product.hasVariants) {
    return [
      {
        key: "variants",
        label: <TabLabel icon={<FaLayerGroup />} text="Variants" />,
        children: <ProductVariantsTable variants={product.variants || []} />,
      },
    ];
  }

  const tabs: DetailTab[] = [
    {
      key: "overview",
      label: <TabLabel icon={<FaBox />} text="Overview" />,
      children: <Overview product={product} canManageProduct={options.canManageProduct} onEditProduct={options.onEditProduct} enableTradePrice={options.enableTradePrice} />,
    },
  ];

  if (product.type === "STOCK") {
    tabs.push({
      key: "batches",
      label: <TabLabel icon={<ImBoxRemove />} text="Batches" />,
      children: <BatchTable product={product} batches={product.inventory?.batches || []} canManageInventory={options.canManageInventory} onBatchChanged={options.onBatchChanged} />,
    });
  }

  if (product.type === "PACKAGING") {
    tabs.push(
      {
        key: "packaging",
        label: <TabLabel icon={<TbPackageExport />} text="Repack" />,
        children: <Packaging product={product} />,
      },

      {
        key: "batches",
        label: <TabLabel icon={<ImBoxRemove />} text="Batches" />,
        children: <BatchTable product={product} batches={product.inventory?.batches || []} canManageInventory={options.canManageInventory} onBatchChanged={options.onBatchChanged} />,
      },
    );
  }

  if (hasBundleComponents(product)) {
    tabs.push({
      key: "components",
      label: <TabLabel icon={<FaLayerGroup />} text="Components" />,
      children: <Bundle product={product} />,
    });
  }

  tabs.push({
    key: "order-history",
    label: <TabLabel icon={<GrHistory />} text="Order History" />,
    children: <OrderHistoryTable orderHistory={product.orderHistory || []} />,
  });

  return tabs;
}

function Overview({ product, canManageProduct, onEditProduct, enableTradePrice }: { product: ProductDetail; canManageProduct: boolean; onEditProduct: () => void; enableTradePrice: boolean }) {
  const stockLocations = product.type === "STOCK" ? product.inventory?.locations || [] : [];
  const totalOnHand = stockLocations.reduce((total, location) => total + numberValue(location.onHand), 0);
  const totalReserved = stockLocations.reduce((total, location) => total + numberValue(location.reserved), 0);
  const totalIncoming = stockLocations.reduce((total, location) => total + numberValue(location.incoming), 0);
  const maxQuantity = Math.max(...stockLocations.map((location) => numberValue(location.onHand) + numberValue(location.incoming)), 1);

  return (
    <div className="space-y-3  px-4 pt-4  md:pt-0">
      <div className="grid rounded-lg overflow-clip xl:grid-cols-2">
        {product.type === "STOCK" ? (
          <InventoryOverviewCard locations={stockLocations} maxQuantity={maxQuantity} totalOnHand={totalOnHand} totalReserved={totalReserved} totalIncoming={totalIncoming} />
        ) : (
          <AvailableLocationsCard locations={product.availableLocations || []} />
        )}
        <PricingCostOverviewCard product={product} canManageProduct={canManageProduct} onEditProduct={onEditProduct} enableTradePrice={enableTradePrice} />
      </div>
    </div>
  );
}

function InventoryOverviewCard({ locations, maxQuantity, totalOnHand, totalReserved, totalIncoming }: { locations: InventoryLocation[]; maxQuantity: number; totalOnHand: number; totalReserved: number; totalIncoming: number }) {
  return (
    <section className=" bg-[#f3f3f3] border-r border-gray-200 px-4 py-5 md:px-5 md:py-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-base text-gray-600">
            <span>Quantity</span>
            <span className="inline-flex items-center gap-1 rounded-md bg-[#b7c3dc] px-2.5 py-0.5 text-sm font-medium text-[#1f365f]">
              on hand
              <span className="text-base leading-none">↵</span>
            </span>
            <span>for all locations</span>
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <span className="text-2xl font-semibold leading-none tracking-normal text-gray-800">{formatQuantity(totalOnHand)}</span>
            <span className="pb-1 text-lg text-gray-600">ea</span>
            {totalReserved > 0 && <span className="mb-0.5 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">{formatQuantity(totalReserved)} reserved</span>}
            {totalIncoming > 0 && <span className="mb-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">{formatQuantity(totalIncoming)} incoming</span>}
          </div>
        </div>
      </div>

      <div className="mt-2 border-t border-gray-200 "></div>

      <div className="mt-5 space-y-2.5">
        {locations.length ? (
          locations.map((location) => <InventoryLocationRow key={location.id || location.locationId || location.locationName} location={location} maxQuantity={maxQuantity} />)
        ) : (
          <div className="rounded-md border border-dashed border-gray-300 bg-white/70 px-4 py-6 text-center text-sm text-gray-500">No inventory has been recorded for this stock product yet.</div>
        )}
      </div>
    </section>
  );
}

function InventoryLocationRow({ location, maxQuantity }: { location: InventoryLocation; maxQuantity: number }) {
  const onHand = numberValue(location.onHand);
  const available = numberValue(location.available);
  const reserved = numberValue(location.reserved);
  const incoming = numberValue(location.incoming);
  const onHandWidth = Math.max((onHand / maxQuantity) * 100, onHand > 0 ? 4 : 0);
  const reservedWidth = onHand > 0 ? Math.min((reserved / onHand) * 100, 100) : 0;
  const incomingWidth = Math.max((incoming / maxQuantity) * 100, incoming > 0 ? 4 : 0);

  return (
    <div className={`rounded-md  py-3`}>
      <div className="flex flex-wrap items-center gap-2.5 text-base">
        <span className="font-medium text-gray-900">{formatQuantity(onHand)}</span>
        <span className="font-semibold text-gray-700">{location.locationName || "-"}</span>
        <span className="text-gray-500">→</span>
        <span className="text-sm text-gray-500">{formatQuantity(available)} available</span>
        {reserved > 0 && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">{formatQuantity(reserved)} reserved</span>}
        {incoming > 0 && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">{formatQuantity(incoming)} incoming</span>}
      </div>
      <div className="mt-3 flex h-7 items-center gap-2">
        <div className="relative h-full rounded-md bg-[#176ebe]" style={{ width: `${onHandWidth}%` }}>
          {reserved > 0 && (
            <div className="group absolute inset-y-1 right-1 rounded-md border-2 border-[#176ebe] bg-[#d8edff]" style={{ width: `${reservedWidth}%` }}>
              <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-3 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-700 px-2.5 py-1.5 text-xs font-medium text-white group-hover:block">
                {formatQuantity(reserved)} reserved
                <span className="absolute bottom-full left-1/2 h-3 w-3 -translate-x-1/2 translate-y-1/2 rotate-45 bg-gray-700" />
              </div>
            </div>
          )}
        </div>
        {incoming > 0 && (
          <div className="group relative h-full rounded-md border border-[#a76a35] bg-[repeating-linear-gradient(135deg,#fff7ed_0,#fff7ed_3px,#b47a42_3px,#b47a42_4px)]" style={{ width: `${incomingWidth}%` }}>
            <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-3 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-700 px-2.5 py-1.5 text-xs font-medium text-white group-hover:block">
              {formatQuantity(incoming)} incoming
              <span className="absolute bottom-full left-1/2 h-3 w-3 -translate-x-1/2 translate-y-1/2 rotate-45 bg-gray-700" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AvailableLocationsCard({ locations }: { locations: AvailableLocation[] }) {
  return (
    <section className="bg-[#f3f3f3] border-r border-gray-200 px-4 py-5 md:px-5 md:py-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base text-gray-600">Available locations</p>
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <span className="text-2xl font-semibold leading-none tracking-normal text-gray-800">{locations.length}</span>
            <span className="pb-1 text-lg text-gray-600">locations available</span>
          </div>
        </div>
      </div>

      <div className="mt-2 border-t border-gray-200" />

      <div className="mt-5 space-y-2.5">
        {locations.length ? (
          locations.map((location) => (
            <div key={location.id || location.locationId || location.locationName} className="rounded-md bg-white/70 px-4 py-3">
              <p className="text-sm font-medium text-gray-900">{location.locationName || "-"}</p>
            </div>
          ))
        ) : (
          <div className="rounded-md border border-dashed border-gray-300 bg-white/70 px-4 py-6 text-center text-sm text-gray-500">This product is not available in any location yet.</div>
        )}
      </div>
    </section>
  );
}

function PricingCostOverviewCard({ product, canManageProduct, onEditProduct, enableTradePrice }: { product: ProductDetail; canManageProduct: boolean; onEditProduct: () => void; enableTradePrice: boolean }) {
  const summary = product.inventory?.summary || {};
  const tiers = getRequiredPriceTiers(product.priceTiers, enableTradePrice);

  return (
    <section className="overflow-hidden  bg-[#f3f3f3]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-5 md:px-5">
        <h2 className="text-lg font-medium tracking-normal text-gray-900">Pricing &amp; Cost</h2>
      </div>
      <div className=" border-t mx-4 border-gray-300 " />
      <div className="grid px-2 py-4 gap-3">
        {tiers.map((tier, index) => (
          <PriceTierCard key={tier.name} tier={tier} costPrice={product.costPrice} isNormal={index === 0} canEdit={canManageProduct} onEdit={onEditProduct} />
        ))}
      </div>
      <div className={`mx-4 py-4 grid gap-2.5 ${product.type === "STOCK" ? "sm:grid-cols-2" : "sm:grid-cols-1"}`}>
        <CostMetric label="Cost" value={formatMoney(product.costPrice)} />
        {product.type === "STOCK" && <CostMetric label="Inventory Value" value={formatMoney(summary.inventoryValue)} />}
      </div>
    </section>
  );
}

function PriceTierCard({ tier, costPrice, isNormal, canEdit, onEdit }: { tier: ProductPriceTier; costPrice?: number; isNormal: boolean; canEdit: boolean; onEdit: () => void }) {
  return (
    <article className="overflow-hidden">
      <div className="flex gap-3 p-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2.5">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-900">{tier.name}</h3>
              <p className="mt-0.5 text-xs text-gray-500">{priceTierDescription(tier.name, isNormal)}</p>
            </div>
            <div className="flex items-start gap-2">
              <p className="text-right text-lg font-medium tracking-normal text-gray-950">{formatMoney(tier.price)}</p>
              {canEdit && (
                <button type="button" aria-label={`Edit ${tier.name}`} onClick={onEdit} className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900">
                  <Pencil size={13} />
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 overflow-hidden rounded-md border border-gray-100 bg-white/60">
            <TierStat label="MOQ" value={formatQuantity(tier.moq)} />
            <TierStat label="Discount" value={`${formatQuantity(tier.discountPercent)}%`} />
            <TierStat label="Margin" value={formatMargin(tier.price, costPrice)} />
          </div>
        </div>
      </div>
    </article>
  );
}

function TierStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-gray-200 px-2.5 py-1.5 last:border-r-0">
      <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function CostMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-white px-3 py-2.5">
      <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function Packaging({ product }: { product: ProductDetail }) {
  const sourceSummary = product.sourceInventory?.summary || {};
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel>
        <h2 className="sectionTitle">Packaging Configuration</h2>
        <div className="mt-4 space-y-3">
          <Metric label="Source product" value={product.sourceProductName || "-"} />
          <Metric label="Conversion rule" value={product.conversionRule || "-"} />
          <Metric label="Available to sell" value={formatQuantity(product.availableStock)} />
        </div>
      </Panel>
      <Panel>
        <h2 className="sectionTitle">Source Inventory</h2>
        <div className="mt-4 space-y-3">
          <Metric label="Source available" value={formatQuantity(sourceSummary.availableQuantity)} />
          <Metric label="Source value" value={formatMoney(sourceSummary.inventoryValue)} />
          <Metric label="Active source batches" value={formatQuantity(sourceSummary.activeBatches)} />
        </div>
      </Panel>
    </div>
  );
}

function Bundle({ product }: { product: ProductDetail }) {
  const components = product.bundleComponents || [];
  const rows = components.map((component) => ({
    id: component.productId || `${component.productName}-${component.sku}`,
    productId: component.productId,
    name: component.productName || "-",
    sku: component.sku || "-",
    type: component.type,
    imageUrl: component.imageUrl || undefined,
    quantityRequired: component.quantityRequired,
    availableQuantity: component.availableQuantity,
  }));

  const columns: TableProps<(typeof rows)[number]>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      className: "!pl-8",
      key: "name",
      width: "40%",
      render: (name, row) => (
        <div className="flex items-center gap-x-3">
          <ProductThumb src={row.imageUrl} name={name} />
          <div className="min-w-0">
            {row.productId ? (
              <Link href={`/products/${row.productId}`} className="font-medium text-gray-700 transition-colors hover:text-indigo-600">
                {name}
              </Link>
            ) : (
              <p className="font-medium text-gray-700">{name}</p>
            )}
            <p className="text-xs text-gray-500">
              {row.sku} | <span className="capitalize">{getProductTypeLabel({ type: row.type })}</span>
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Required Qty",
      key: "quantityRequired",
      render: (_, row) => formatQuantity(row.quantityRequired),
    },
    {
      title: "Available Qty",
      key: "availableQuantity",
      render: (_, row) => (row.type === ITEM_TYPE.NON_STOCK || row.type === ITEM_TYPE.SERVICE ? <span className="text-sm text-gray-500">Not tracked</span> : formatQuantity(row.availableQuantity)),
    },
  ];

  return <div>{components.length ? <><div className="divide-y divide-gray-200 border-y border-gray-200 md:hidden">{rows.map((row) => <div key={row.id} className="px-4 py-4"><div className="flex items-center gap-3"><ProductThumb src={row.imageUrl} name={row.name} /><div className="min-w-0 flex-1"><p className="truncate font-medium text-gray-950">{row.name}</p><p className="mt-1 text-xs text-gray-500">{row.sku} · {getProductTypeLabel({ type: row.type })}</p></div></div><div className="mt-3 flex justify-between text-sm"><span className="text-gray-500">Required {formatQuantity(row.quantityRequired)}</span><span className="font-medium text-gray-900">Available {row.type === ITEM_TYPE.NON_STOCK || row.type === ITEM_TYPE.SERVICE ? "Not tracked" : formatQuantity(row.availableQuantity)}</span></div></div>)}</div><div className="hidden md:block"><AppTable<(typeof rows)[number]> columns={columns} dataSource={rows} rowKey="id" pagination={false} /></div></> : <Empty className="py-10" description="No bundle components have been configured." />}</div>;
}

function OrderHistoryTable({ orderHistory }: { orderHistory: ProductOrderHistoryItem[] }) {
  const columns: TableProps<ProductOrderHistoryItem>["columns"] = [
    {
      title: "# Number",
      key: "documentNumber",
      className: "!pl-8",
      render: (_, order) => (
        <div className="flex items-center gap-2">
          <Link href={order.type === "purchase" ? `/purchases/${order.id}` : `/orders/${order.id}`} className="font-medium !text-gray-700 hover:!text-indigo-600">
            {order.documentNumber || "-"}
          </Link>
          <Tag className="!m-0 !rounded-full !px-2 capitalize" color={order.type === "purchase" ? "gold" : "blue"}>
            {order.type}
          </Tag>
          {order.type === "sale" && order.source ? (
            <Tag className="!m-0 !rounded-full !px-2" color={saleSourceColor(order.source)}>
              {order.source}
            </Tag>
          ) : null}
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, order) =>
        order.isDeleted ? (
          <Tag className="!m-0 !rounded-full !px-2" color="red">
            Cancelled
          </Tag>
        ) : order.type === "sale" && order.status === "draft" ? (
          <Tag className="!m-0 !rounded-full !px-2" color="purple">
            Estimate
          </Tag>
        ) : (
          <Tag className="!m-0 !rounded-full !px-2 capitalize" color={receiptStatusColor(order.receiptStatus)}>
            {(order.receiptStatus || "pending").replaceAll("_", " ")}
          </Tag>
        ),
    },
    {
      title: "Contact",
      key: "contact",
      render: (_, order) => order.contactId?.displayName || order.contactId?.name || (order.type === "sale" ? "Walk-in Customer" : "-"),
    },
    { title: "Date", key: "date", render: (_, order) => formatDate(order.date) },
    { title: "Location", key: "location", render: (_, order) => order.locationId?.name || "-" },
    { title: "Quantity", key: "quantity", render: (_, order) => formatQuantity(order.quantity) },
    { title: "Total Amount", key: "amount", render: (_, order) => order.formattedTotal || formatMoney(order.amount) },
    { title: "Balance", key: "balance", render: (_, order) => order.formattedBalance || formatMoney(order.balance) },
  ];

  const emptyText = "No sales or purchases have been recorded for this product yet.";
  return orderHistory.length ? <><div className="divide-y divide-gray-200 border-y border-gray-200 md:hidden">{orderHistory.map((order) => <Link key={order.id} href={order.type === "purchase" ? `/purchases/${order.id}` : `/orders/${order.id}`} className="block px-4 py-4 active:bg-gray-50"><div className="flex items-start justify-between gap-3"><div><p className="font-medium text-gray-950">{order.documentNumber || "-"}</p><p className="mt-1 text-sm text-gray-500">{order.contactId?.displayName || order.contactId?.name || (order.type === "sale" ? "Walk-in Customer" : "-")}</p></div><p className="font-semibold text-gray-950">{order.formattedTotal || formatMoney(order.amount)}</p></div><div className="mt-3 flex justify-between text-xs text-gray-500"><span className="capitalize">{order.type} · {formatDate(order.date)}</span><span>{formatQuantity(order.quantity)} units</span></div></Link>)}</div><div className="hidden md:block"><AppTable<ProductOrderHistoryItem> columns={columns} dataSource={orderHistory} rowKey="id" pagination={false} /></div></> : <Empty className="py-10" description={emptyText} />;
}

function BatchTable({ product, batches, canManageInventory, onBatchChanged }: { product: ProductDetail; batches: InventoryBatch[]; canManageInventory: boolean; onBatchChanged: () => void }) {
  const [selectedBatch, setSelectedBatch] = useState<InventoryBatch | null>(null);
  const [activeBatchModal, setActiveBatchModal] = useState<"adjust" | "transfer" | "disassemble" | null>(null);
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [stockStateFilter, setStockStateFilter] = useState<string>("all");
  const [expiryFilter, setExpiryFilter] = useState<string>("all");
  const [queryFilter, setQueryFilter] = useState<string>("");
  const [filtersOpen, toggleFiltersOpen] = useToggle();
  const canDisassemble = product.type === ITEM_TYPE.STOCK && hasBundleComponents(product);

  const openAdjustment = (batch: InventoryBatch) => {
    setSelectedBatch(batch);
    setActiveBatchModal("adjust");
  };

  const openTransfer = (batch: InventoryBatch) => {
    setSelectedBatch(batch);
    setActiveBatchModal("transfer");
  };

  const openDisassemble = (batch: InventoryBatch) => {
    setSelectedBatch(batch);
    setActiveBatchModal("disassemble");
  };

  const closeBatchModal = () => {
    setActiveBatchModal(null);
    setSelectedBatch(null);
  };

  const locationOptions = useMemo(
    () =>
      Array.from(
        batches.reduce((map, batch) => {
          const value = batch.locationId || batch.locationName || "unassigned";
          if (!map.has(value)) {
            map.set(value, {
              label: batch.locationName || "No location",
              value,
            });
          }
          return map;
        }, new Map<string, { label: string; value: string }>()),
      )
        .map(([, option]) => option)
        .sort((a, b) => a.label.localeCompare(b.label)),
    [batches],
  );

  const sourceOptions = useMemo(
    () =>
      Array.from(
        batches.reduce((map, batch) => {
          const value = batch.source || "unknown";
          if (!map.has(value)) {
            map.set(value, {
              label: formatBatchSource(value),
              value,
            });
          }
          return map;
        }, new Map<string, { label: string; value: string }>()),
      )
        .map(([, option]) => option)
        .sort((a, b) => a.label.localeCompare(b.label)),
    [batches],
  );

  const filteredBatches = useMemo(() => {
    const normalizedQuery = queryFilter.trim().toLowerCase();
    const nextBatches = batches.filter((batch) => {
      const locationValue = batch.locationId || batch.locationName || "unassigned";
      if (locationFilter !== "all" && locationValue !== locationFilter) return false;
      if (sourceFilter !== "all" && (batch.source || "unknown") !== sourceFilter) return false;

      const remainingQuantity = Number(batch.remainingQuantity || 0);
      const hasExpiry = Boolean(batch.expiryDate);
      const expired = isExpiredBatch(batch);
      const expiringSoon = !expired && isExpiringSoonBatch(batch);

      if (stockStateFilter === "active" && remainingQuantity <= 0) return false;
      if (stockStateFilter === "depleted" && remainingQuantity > 0) return false;

      if (expiryFilter === "expired" && !expired) return false;
      if (expiryFilter === "expiring_soon" && !expiringSoon) return false;
      if (expiryFilter === "fresh" && (expired || expiringSoon || !hasExpiry)) return false;
      if (expiryFilter === "no_expiry" && hasExpiry) return false;

      if (!normalizedQuery) return true;

      const haystack = [batch.batchNumber, batch.locationName, formatBatchSource(batch.source), formatDate(batch.sourceDate), formatDate(batch.expiryDate)]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });

    return [...nextBatches].sort((a, b) => {
      const locationCompare = (a.locationName || "No location").localeCompare(b.locationName || "No location");
      if (locationCompare !== 0) return locationCompare;
      return sortBatchesByPriority(a, b);
    });
  }, [batches, expiryFilter, locationFilter, queryFilter, sourceFilter, stockStateFilter]);

  const batchSummary = useMemo(() => {
    const remainingTotal = filteredBatches.reduce((sum, batch) => sum + Number(batch.remainingQuantity || 0), 0);
    const activeBatches = filteredBatches.filter((batch) => Number(batch.remainingQuantity || 0) > 0).length;
    const expiredBatches = filteredBatches.filter((batch) => isExpiredBatch(batch)).length;
    const expiringSoonBatches = filteredBatches.filter((batch) => !isExpiredBatch(batch) && isExpiringSoonBatch(batch)).length;

    return {
      remainingTotal,
      activeBatches,
      expiredBatches,
      expiringSoonBatches,
    };
  }, [filteredBatches]);

  const activeFilterCount = useMemo(
    () => [locationFilter, sourceFilter, stockStateFilter, expiryFilter].filter((value) => value !== "all").length + (queryFilter.trim() ? 1 : 0),
    [expiryFilter, locationFilter, queryFilter, sourceFilter, stockStateFilter],
  );

  useEffect(() => {
    if (locationFilter === "all") return;
    if (!locationOptions.some((option) => option.value === locationFilter)) {
      setLocationFilter("all");
    }
  }, [locationFilter, locationOptions]);

  useEffect(() => {
    if (sourceFilter === "all") return;
    if (!sourceOptions.some((option) => option.value === sourceFilter)) {
      setSourceFilter("all");
    }
  }, [sourceFilter, sourceOptions]);

  const clearFilters = () => {
    setLocationFilter("all");
    setSourceFilter("all");
    setStockStateFilter("all");
    setExpiryFilter("all");
    setQueryFilter("");
  };

  const columns: TableProps<InventoryBatch>["columns"] = [
    {
      title: "Batch",
      key: "batchNumber",
      className: "!pl-4",
      render: (_, batch) => (
        <div className="font-medium text-gray-900">
          <p>{batch.batchNumber || "-"}</p>
          <p></p>
        </div>
      ),
    },
    { title: "Date", key: "sourceDate", render: (_, batch) => formatDate(batch.sourceDate) },
    { title: "Quantity", key: "quantity", render: (_, batch) => formatQuantity(batch.quantity) },
    { title: "Remaining", key: "remainingQuantity", render: (_, batch) => formatQuantity(batch.remainingQuantity) },
    { title: "Source", key: "source", render: (_, batch) => formatBatchSource(batch.source) },
    { title: "Unit Cost", key: "unitCost", render: (_, batch) => formatMoney(batch.unitCost) },
    { title: "Expiry", key: "expiryDate", render: (_, batch) => formatDate(batch.expiryDate) },
    ...(canManageInventory
      ? [
          {
            title: "Actions",
            key: "actions",
            align: "right" as const,
            className: "!pr-4",
            render: (_: unknown, batch: InventoryBatch) => (
              <div className="flex justify-end">
                <ActionDropdown
                  menu={{
                    items: [
                      {
                        key: "adjust",
                        label: <DropdownItemLabel icon={<SlidersHorizontal size={15} />} text="Inventory adjustment" />,
                        onClick: () => openAdjustment(batch),
                      },
                      {
                        key: "transfer",
                        label: <DropdownItemLabel icon={<ArrowRightLeft size={15} />} text="Location transfer" />,
                        onClick: () => openTransfer(batch),
                      },
                      ...(canDisassemble
                        ? [
                            {
                              key: "disassemble",
                              label: <DropdownItemLabel icon={<PackageOpen size={15} />} text="Disassemble batch" />,
                              onClick: () => openDisassemble(batch),
                            },
                          ]
                        : []),
                    ],
                  }}
                />
              </div>
            ),
          },
        ]
      : []),
  ];

  if (!batches.length) {
    return (
      <Panel>
        <Empty className="py-10" description="No inventory batches have been created yet." />
      </Panel>
    );
  }

  return (
    <div className="overflow-hidden ">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
          <span>{formatQuantity(batchSummary.remainingTotal)} remaining</span>
          <span>{batchSummary.activeBatches} active</span>
          {batchSummary.expiredBatches > 0 ? <span className="text-red-600">{batchSummary.expiredBatches} expired</span> : null}
          {batchSummary.expiringSoonBatches > 0 ? <span className="text-amber-600">{batchSummary.expiringSoonBatches} expiring soon</span> : null}
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 ? (
            <Button type="text" size="small" onClick={clearFilters} className="!px-0 text-gray-500">
              Clear
            </Button>
          ) : null}
          <Button onClick={toggleFiltersOpen} type={activeFilterCount > 0 ? "primary" : "default"} className={activeFilterCount > 0 ? "!border-0 !shadow-none" : undefined}>
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </Button>
        </div>
      </div>
      <div className="divide-y divide-gray-200 md:hidden">
        {filteredBatches.length ? filteredBatches.map((batch) => (
          <div key={batch.id || batch.batchNumber || `${batch.locationId}-${batch.sourceDate}`} className="flex items-start justify-between gap-3 px-4 py-4">
            <div className="min-w-0">
              <p className="font-medium text-gray-950">{batch.batchNumber || "Unnamed batch"}</p>
              <p className="mt-1 text-sm text-gray-500">{batch.locationName || "No location"} · {formatDate(batch.sourceDate)}</p>
              <p className="mt-1 text-xs text-gray-400">
                {formatBatchSource(batch.source)} · Expires {formatDate(batch.expiryDate)}
                {isExpiredBatch(batch) ? <span className="ml-2 text-red-600">Expired</span> : null}
                {!isExpiredBatch(batch) && isExpiringSoonBatch(batch) ? <span className="ml-2 text-amber-600">Expiring soon</span> : null}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-semibold text-gray-950">{formatQuantity(batch.remainingQuantity)} left</p>
              <p className="mt-1 text-xs text-gray-500">of {formatQuantity(batch.quantity)}</p>
              {canManageInventory ? (
                <ActionDropdown
                  menu={{
                    items: [
                      { key: "adjust", label: <DropdownItemLabel icon={<SlidersHorizontal size={15} />} text="Inventory adjustment" />, onClick: () => openAdjustment(batch) },
                      { key: "transfer", label: <DropdownItemLabel icon={<ArrowRightLeft size={15} />} text="Location transfer" />, onClick: () => openTransfer(batch) },
                      ...(canDisassemble ? [{ key: "disassemble", label: <DropdownItemLabel icon={<PackageOpen size={15} />} text="Disassemble batch" />, onClick: () => openDisassemble(batch) }] : []),
                    ],
                  }}
                />
              ) : null}
            </div>
          </div>
        )) : (
          <Empty className="py-10" description="No batches match the selected filters." />
        )}
      </div>
      <div className="hidden md:block">
        <AppTable<InventoryBatch>
          columns={[
            {
              title: "Location",
              key: "locationName",
              render: (_, batch) => batch.locationName || "No location",
            },
            ...columns,
          ]}
          dataSource={filteredBatches}
          rowKey={(batch) => batch.id || batch.batchNumber || `${batch.locationId}-${batch.sourceDate}`}
          pagination={false}
          locale={{ emptyText: <Empty className="py-10" description="No batches match the selected filters." /> }}
        />
      </div>

      <Drawer
        title="Batch filters"
        placement="right"
        open={filtersOpen}
        onClose={toggleFiltersOpen}
        width={360}
        extra={
          activeFilterCount > 0 ? (
            <Button type="text" onClick={clearFilters}>
              Clear
            </Button>
          ) : null
        }
      >
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium text-gray-900">Search</p>
            <Input value={queryFilter} onChange={(event) => setQueryFilter(event.target.value)} placeholder="Batch, location, source, date" allowClear />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-900">Location</p>
            <Select className="!w-full" value={locationFilter} onChange={setLocationFilter} options={[{ label: "All locations", value: "all" }, ...locationOptions]} />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-900">Source</p>
            <Select className="!w-full" value={sourceFilter} onChange={setSourceFilter} options={[{ label: "All sources", value: "all" }, ...sourceOptions]} />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-900">Stock state</p>
            <Select
              className="!w-full"
              value={stockStateFilter}
              onChange={setStockStateFilter}
              options={[
                { label: "All stock states", value: "all" },
                { label: "Active only", value: "active" },
                { label: "Depleted only", value: "depleted" },
              ]}
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-900">Expiry state</p>
            <Select
              className="!w-full"
              value={expiryFilter}
              onChange={setExpiryFilter}
              options={[
                { label: "All expiry states", value: "all" },
                { label: "Expired", value: "expired" },
                { label: "Expiring soon", value: "expiring_soon" },
                { label: "Fresh", value: "fresh" },
                { label: "No expiry", value: "no_expiry" },
              ]}
            />
          </div>
          <div className="pt-2">
            <Button type="primary" block onClick={toggleFiltersOpen} className="!border-0 !shadow-none">
              Show {filteredBatches.length} batch{filteredBatches.length === 1 ? "" : "es"}
            </Button>
          </div>
        </div>
      </Drawer>

      {selectedBatch && (
        <>
          <BatchAdjustmentModal batch={selectedBatch} open={activeBatchModal === "adjust"} toggle={closeBatchModal} onSaved={onBatchChanged} />
          <BatchTransferModal batch={selectedBatch} open={activeBatchModal === "transfer"} toggle={closeBatchModal} onSaved={onBatchChanged} />
          <BatchDisassembleModal batch={selectedBatch} product={product} open={activeBatchModal === "disassemble"} toggle={closeBatchModal} onSaved={onBatchChanged} />
        </>
      )}
    </div>
  );
}

function BatchAdjustmentModal({ batch, open, toggle, onSaved }: { batch: InventoryBatch; open: boolean; toggle: () => void; onSaved: () => void }) {
  const [form] = Form.useForm<AdjustBatchFormValues>();
  const [adjustBatch, { isLoading }] = useAdjustBatchMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        quantityDelta: undefined,
        effectiveDate: dayjs(),
        reason: "",
      });
      setSubmitError(null);
    }
  }, [form, open, batch.id]);

  const handleSubmit = async () => {
    try {
      setSubmitError(null);
      const values = await form.validateFields();
      await adjustBatch({
        id: batch.id || "",
        quantityDelta: values.quantityDelta,
        reason: values.reason?.trim() || undefined,
        effectiveDate: values.effectiveDate?.toISOString(),
      }).unwrap();
      message.success("Batch adjusted.");
      toggle();
      onSaved();
    } catch (error) {
      if (isFormValidationError(error)) return;
      setSubmitError(getMutationErrorMessage(error, "Batch could not be adjusted."));
    }
  };

  return (
    <AppModal
      open={open}
      toggle={toggle}
      title={`Adjust ${batch.batchNumber || "batch"}`}
      onOk={handleSubmit}
      loading={isLoading}
      okText="Save adjustment"
      width={560}
      height="auto"
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={toggle} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleSubmit} loading={isLoading}>
            Save adjustment
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        <BatchContextCard
          items={[
            { label: "Batch", value: batch.batchNumber || "-" },
            { label: "Location", value: batch.locationName || "-" },
            { label: "Remaining", value: formatQuantity(batch.remainingQuantity) },
          ]}
        />
        {submitError && <p className="mb-4 px-5 text-sm text-red-600">{submitError}</p>}

        <div className="px-5">
          <div className=" grid  grid-cols-2 gap-x-5">
            <Form.Item
              label="Quantity delta (-/+)"
              name="quantityDelta"
              rules={[
                { required: true, message: "Enter the quantity change" },
                {
                  validator: (_, value) => {
                    if (value === undefined || value === null) return Promise.resolve();
                    if (Number(value) === 0) return Promise.reject(new Error("Quantity delta cannot be zero"));
                    return Promise.resolve();
                  },
                },
              ]}
              extra=""
            >
              <InputNumber className="!w-full" placeholder="Use -5 / 5 to change stock." />
            </Form.Item>
            <Form.Item label="Effective date" name="effectiveDate" rules={[{ required: true, message: "Select the effective date" }]}>
              <DatePicker className="!w-full" />
            </Form.Item>
          </div>

          <Form.Item label="Reason" name="reason">
            <Input.TextArea rows={3} placeholder="Optional note for this adjustment" />
          </Form.Item>
        </div>
      </Form>
    </AppModal>
  );
}

function BatchTransferModal({ batch, open, toggle, onSaved }: { batch: InventoryBatch; open: boolean; toggle: () => void; onSaved: () => void }) {
  const [form] = Form.useForm<TransferBatchFormValues>();
  const [transferBatch, { isLoading }] = useTransferBatchByBatchIdMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { data: locations = [], isLoading: locationsLoading } = useGetLocationsQuery({}, { skip: !open });

  const locationOptions = useMemo(
    () =>
      locations
        .filter((location: Location) => location.status === "active" && location.id !== batch.locationId)
        .map((location: Location) => ({
          label: location.name,
          value: location.id,
        })),
    [batch.locationId, locations],
  );

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        toLocationId: undefined,
        quantity: undefined,
        effectiveDate: dayjs(),
        reason: "",
      });
      setSubmitError(null);
    }
  }, [form, open, batch.id]);

  const handleSubmit = async () => {
    try {
      setSubmitError(null);
      const values = await form.validateFields();
      await transferBatch({
        id: batch.id || "",
        toLocationId: values.toLocationId,
        quantity: values.quantity,
        reason: values.reason?.trim() || undefined,
        effectiveDate: values.effectiveDate?.toISOString(),
      }).unwrap();
      message.success("Batch transferred.");
      toggle();
      onSaved();
    } catch (error) {
      if (isFormValidationError(error)) return;
      setSubmitError(getMutationErrorMessage(error, "Batch could not be transferred."));
    }
  };

  return (
    <AppModal
      open={open}
      toggle={toggle}
      title={`Transfer ${batch.batchNumber || "batch"}`}
      onOk={handleSubmit}
      loading={isLoading}
      okText="Transfer batch"
      width={560}
      height="auto"
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={toggle} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleSubmit} loading={isLoading}>
            Transfer batch
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        <BatchContextCard
          items={[
            { label: "Batch", value: batch.batchNumber || "-" },
            { label: "From", value: batch.locationName || "-" },
            { label: "Available", value: formatQuantity(batch.remainingQuantity) },
          ]}
        />
        {submitError && <p className="mb-4 px-5 text-sm text-red-600">{submitError}</p>}

        <div className="px-5">
          <Form.Item label="Destination location" name="toLocationId" rules={[{ required: true, message: "Select a destination location" }]}>
            <Select placeholder="Select location" loading={locationsLoading} options={locationOptions} />
          </Form.Item>

          <div className=" grid grid-cols-2 gap-x-5">
            <Form.Item
              label={
                <div className="flex w-full items-center justify-between gap-2">
                  <span>Quantity</span>
                  <Button type="link" className="!h-auto !px-0 !py-0 text-xs" onClick={() => form.setFieldValue("quantity", Number(batch.remainingQuantity || 0))}>
                    Move all
                  </Button>
                </div>
              }
              name="quantity"
              rules={[
                { required: true, message: "Enter a quantity" },
                {
                  validator: (_, value) => {
                    if (value === undefined || value === null) return Promise.resolve();
                    if (Number(value) <= 0) return Promise.reject(new Error("Quantity must be greater than zero"));
                    if (Number(value) > Number(batch.remainingQuantity || 0)) return Promise.reject(new Error("Quantity exceeds remaining stock in this batch"));
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber className="!w-full" min={0.000001} max={Number(batch.remainingQuantity || 0)} />
            </Form.Item>
            <Form.Item label="Effective date" name="effectiveDate" rules={[{ required: true, message: "Select the effective date" }]}>
              <DatePicker className="!w-full" />
            </Form.Item>
          </div>

          <Form.Item label="Reason" name="reason">
            <Input.TextArea rows={3} placeholder="Optional note for this transfer" />
          </Form.Item>
        </div>
      </Form>
    </AppModal>
  );
}

type DisassembleBatchFormValues = Omit<DisassembleBatchInput, "id" | "effectiveDate"> & {
  effectiveDate?: dayjs.Dayjs;
};

function BatchDisassembleModal({ batch, product, open, toggle, onSaved }: { batch: InventoryBatch; product: ProductDetail; open: boolean; toggle: () => void; onSaved: () => void }) {
  const [form] = Form.useForm<DisassembleBatchFormValues>();
  const [disassembleBatch, { isLoading }] = useDisassembleBatchByBatchIdMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const componentSummary = useMemo(
    () =>
      (product.bundleItems || [])
        .map((item) => {
          const productRef = typeof item.productId === "string" ? undefined : item.productId;
          const quantity = Number(item.quantity || 0);
          if (!productRef?.name || quantity <= 0) return null;
          return `${formatQuantity(quantity)} × ${productRef.name}`;
        })
        .filter(Boolean)
        .join(" · "),
    [product.bundleItems],
  );

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        quantity: undefined,
        effectiveDate: dayjs(),
        reason: "",
      });
      setSubmitError(null);
    }
  }, [form, open, batch.id]);

  const handleSubmit = async () => {
    try {
      setSubmitError(null);
      const values = await form.validateFields();
      await disassembleBatch({
        id: batch.id || "",
        quantity: values.quantity,
        reason: values.reason?.trim() || undefined,
        effectiveDate: values.effectiveDate?.toISOString(),
      }).unwrap();
      message.success("Batch disassembled.");
      toggle();
      onSaved();
    } catch (error) {
      if (isFormValidationError(error)) return;
      setSubmitError(getMutationErrorMessage(error, "Batch could not be disassembled."));
    }
  };

  return (
    <AppModal
      open={open}
      toggle={toggle}
      title={`Disassemble ${batch.batchNumber || "batch"}`}
      onOk={handleSubmit}
      loading={isLoading}
      okText="Disassemble batch"
      width={560}
      height="auto"
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={toggle} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleSubmit} loading={isLoading}>
            Disassemble batch
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        <BatchContextCard
          items={[
            { label: "Batch", value: batch.batchNumber || "-" },
            { label: "Location", value: batch.locationName || "-" },
            { label: "Remaining", value: formatQuantity(batch.remainingQuantity) },
          ]}
        />
        {submitError && <p className="mb-4 px-5 text-sm text-red-600">{submitError}</p>}

        <div className="px-5">
          <div className="mb-4 rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            This will remove finished bundle stock from this batch and restore its component quantities back into the same location.
          </div>

          {componentSummary ? <p className="mb-4 text-sm text-gray-500">Per bundle: {componentSummary}</p> : null}

          <div className="grid grid-cols-2 gap-x-5">
            <Form.Item
              label="Quantity"
              name="quantity"
              rules={[
                { required: true, message: "Enter the quantity to disassemble" },
                {
                  validator: (_, value) => {
                    if (value === undefined || value === null) return Promise.resolve();
                    if (Number(value) <= 0) return Promise.reject(new Error("Quantity must be greater than zero"));
                    if (Number(value) > Number(batch.remainingQuantity || 0)) {
                      return Promise.reject(new Error("Quantity exceeds the remaining batch quantity"));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber className="!w-full" min={0.000001} max={Number(batch.remainingQuantity || 0)} />
            </Form.Item>
            <Form.Item label="Effective date" name="effectiveDate" rules={[{ required: true, message: "Select the effective date" }]}>
              <DatePicker className="!w-full" />
            </Form.Item>
          </div>

          <Form.Item label="Reason" name="reason">
            <Input.TextArea rows={3} placeholder="Optional note for this disassembly" />
          </Form.Item>
        </div>
      </Form>
    </AppModal>
  );
}

function BatchContextCard({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  return (
    <div className="mb-4 grid grid-cols-1 gap-3 rounded-sm border border-gray-200 bg-gray-50 py-2 px-5 sm:grid-cols-3">
      {items.map((item) => (
        <div key={String(item.label)} className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400">{item.label}</p>
          <p className="mt-1 truncate text-sm font-medium text-gray-900 capitalize">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function DetailGrid({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  return (
    <div className="grid grid-cols-2  border-y border-gray-200  md:grid-cols-4">
      {items.map((item, index) => (
        <div
          key={`${item.label}-${index}`}
          className={`min-w-0 px-4 py-4 ${index % 2 === 0 ? "border-r" : ""} ${index % 4 !== 3 ? "sm:border-r" : "sm:border-r-0"} ${index < items.length - 2 ? "border-b" : ""} ${index < items.length - 4 ? "sm:border-b" : "sm:border-b-0"} border-gray-200`}
        >
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">{item.label}</p>
          <p className="mt-1 truncate text-sm font-medium text-gray-900">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`border border-gray-200 bg-white  ${className}`}>{children}</div>;
}

function ProductThumb({ src, name }: { src?: string | null; name?: string }) {
  return (
    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-sm border border-gray-200 bg-gray-50">
      {src ? <img className="h-full w-full object-cover" src={src} alt={name || "Product"} /> : <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">-</div>}
    </div>
  );
}

function TabLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      {icon}
      {text}
    </span>
  );
}

function TypeBadge({ product }: { product: Pick<ProductDetail, "type" | "bundleItems"> }) {
  const colors: Record<string, string> = {
    STOCK: "green",
    NON_STOCK: "blue",
    SERVICE: "purple",
    PACKAGING: "gold",
    BUNDLE: "cyan",
  };
  return (
    <Tag color={colors[product.type] || "default"}>
      <span className="capitalize">{getProductTypeLabel(product) || "product"}</span>
    </Tag>
  );
}

function AuditFooter({ createdAt, updatedAt }: { createdAt?: string; updatedAt?: string }) {
  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500">
      <span>Created {formatDate(createdAt)}</span>
      <span>•</span>
      <span>Updated {updatedAt ? dayjs(updatedAt).fromNow() : "-"}</span>
    </div>
  );
}

function saleSourceColor(source?: string) {
  if (source === "POS") return "green";
  if (source === "Online Store") return "blue";
  if (source === "Sales Order") return "gold";
  return "default";
}

function receiptStatusColor(status?: string) {
  if (status === "received") return "green";
  if (status === "partially_received") return "gold";
  return "blue";
}

function formatMoney(value: unknown) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 2,
  }).format(amount);
}

function getRequiredPriceTiers(tiers?: ProductPriceTier[], enableTradePrice = true) {
  const fallback = defaultPriceTiers(0);
  const normal = tiers?.[0] || fallback[0];
  if (!enableTradePrice) {
    return [{ ...normal, name: NORMAL_PRICE_TIER_NAME }];
  }
  const trade = tiers?.find((tier) => tier.name === TRADE_PRICE_TIER_NAME) || fallback[1];
  return [
    { ...normal, name: NORMAL_PRICE_TIER_NAME },
    { ...trade, name: TRADE_PRICE_TIER_NAME },
  ];
}

function priceTierDescription(name: string, isNormal: boolean) {
  if (isNormal) return "Default customer-facing price";
  if (name === TRADE_PRICE_TIER_NAME) return "Trade and bulk customer price";
  return "Custom product price";
}

function formatMargin(priceValue: unknown, costValue: unknown) {
  const price = numberValue(priceValue);
  if (price <= 0) return "0%";
  const margin = ((price - numberValue(costValue)) / price) * 100;
  return `${Math.round(margin)}%`;
}

function numberValue(value: unknown) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? amount : 0;
}

function formatQuantity(value: unknown) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-GH", { maximumFractionDigits: 6 }).format(amount);
}

function formatDate(value?: string | Date | null) {
  if (!value) return "-";
  const date = dayjs(value);
  return date.isValid() ? date.format("DD MMM YYYY") : "-";
}

function formatBatchSource(value?: string | null) {
  if (!value) return "-";
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function isExpiredBatch(batch: InventoryBatch) {
  if (!batch.expiryDate) return false;
  const expiry = dayjs(batch.expiryDate);
  return expiry.isValid() && expiry.endOf("day").isBefore(dayjs());
}

function isExpiringSoonBatch(batch: InventoryBatch) {
  if (!batch.expiryDate) return false;
  const expiry = dayjs(batch.expiryDate);
  if (!expiry.isValid()) return false;
  if (isExpiredBatch(batch)) return false;
  return expiry.endOf("day").diff(dayjs(), "day") <= 30;
}

function sortBatchesByPriority(a: InventoryBatch, b: InventoryBatch) {
  const aExpired = isExpiredBatch(a);
  const bExpired = isExpiredBatch(b);
  if (aExpired !== bExpired) return aExpired ? -1 : 1;

  const aExpiringSoon = isExpiringSoonBatch(a);
  const bExpiringSoon = isExpiringSoonBatch(b);
  if (aExpiringSoon !== bExpiringSoon) return aExpiringSoon ? -1 : 1;

  const aExpiry = a.expiryDate ? dayjs(a.expiryDate) : null;
  const bExpiry = b.expiryDate ? dayjs(b.expiryDate) : null;
  if (aExpiry?.isValid() && bExpiry?.isValid() && !aExpiry.isSame(bExpiry)) {
    return aExpiry.valueOf() - bExpiry.valueOf();
  }
  if (aExpiry?.isValid() && !bExpiry?.isValid()) return -1;
  if (!aExpiry?.isValid() && bExpiry?.isValid()) return 1;

  const aDate = a.sourceDate ? dayjs(a.sourceDate) : null;
  const bDate = b.sourceDate ? dayjs(b.sourceDate) : null;
  if (aDate?.isValid() && bDate?.isValid() && !aDate.isSame(bDate)) {
    return bDate.valueOf() - aDate.valueOf();
  }
  if (aDate?.isValid() && !bDate?.isValid()) return -1;
  if (!aDate?.isValid() && bDate?.isValid()) return 1;

  return (a.batchNumber || "").localeCompare(b.batchNumber || "");
}

function getMutationErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null) {
    const data = (error as { data?: { message?: string | string[] } }).data;
    if (Array.isArray(data?.message)) return data.message[0] || fallback;
    if (typeof data?.message === "string" && data.message.trim()) return data.message;
  }
  return fallback;
}

function isFormValidationError(error: unknown) {
  return typeof error === "object" && error !== null && "errorFields" in error;
}

type AdjustBatchFormValues = Omit<AdjustBatchInput, "id" | "effectiveDate"> & {
  effectiveDate: dayjs.Dayjs;
};

type TransferBatchFormValues = Omit<TransferBatchInput, "id" | "effectiveDate"> & {
  effectiveDate: dayjs.Dayjs;
};

type RestockProductFormValues = Omit<RestockProductInput, "productId" | "receivedDate" | "expiryDate"> & {
  receivedDate: dayjs.Dayjs;
  expiryDate?: dayjs.Dayjs;
};
