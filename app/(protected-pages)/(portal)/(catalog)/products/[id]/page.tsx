"use client";

import { GoBack } from "@/components/ui/GoBack";
import { ProductEditModal } from "@/components/products/ProductEditModal";
import { ProductMediaManagerModal } from "@/components/products/ProductMediaManagerModal";
import { ITEM_TYPE } from "@/components/products/ProductFormModal";
import { useAdjustBatchMutation, useGetLocationsQuery, useGetProductQuery, useRestockProductMutation, useTransferBatchByBatchIdMutation } from "@/lib/redux/services";
import { AccessDeniedView } from "@/components/ui/AccessDeniedView";
import ProductImagePlaceholder from "@/components/ui/ProductImagePlaceholder";
import { usePermissions } from "@/hooks/usePermissions";
import { ActionDropdown, DropdownItemLabel } from "@/components/ui/ActionDropdown";
import { AppModal } from "@/components/ui/AppModal";
import { StorePermission } from "@/types/store-access";
import useToggle from "@/hooks/UseToggle";
import { AdjustBatchInput, Location, RestockProductInput, TransferBatchInput } from "@/types";
import { Button, DatePicker, Empty, Form, Input, InputNumber, Segmented, Select, Skeleton, Tabs, Tag, message } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ArrowRightLeft, Check, ChevronDown, Pencil, SlidersHorizontal, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { FaBox, FaLayerGroup } from "react-icons/fa";
import { GrHistory } from "react-icons/gr";
import { ImBoxRemove } from "react-icons/im";
import { TbPackageExport } from "react-icons/tb";

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
  locationName?: string;
  available?: number;
  committed?: number;
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
  sku?: string;
  barcode?: string;
  categoryId?: string;
  categoryName?: string;
  description?: string;
  weight?: number;
  sellingPrice?: number;
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
          sellingPrice?: number;
        }
      | string;
    quantity?: number;
  }>;
  hasVariants?: boolean;
  inventory?: {
    summary?: InventorySummary;
    locations?: InventoryLocation[];
    batches?: InventoryBatch[];
  };
  sourceInventory?: {
    summary?: InventorySummary;
  };
};

type DetailTab = {
  key: string;
  label: React.ReactNode;
  children: React.ReactNode;
};

const MOCK_PRODUCT_OVERVIEW = {
  totalQuantity: 36,
  unit: "ea",
  activeMetric: "on hand",
  locations: [
    {
      id: "eastern-warehouse",
      name: "Eastern Warehouse",
      onHand: 25,
      available: 19,
      reserved: 6,
      incoming: 0,
    },
    {
      id: "western-warehouse",
      name: "Western Warehouse",
      onHand: 11,
      available: 11,
      reserved: 0,
      incoming: 5,
    },
  ],
  baseCost: "GHS 30.00",
  inventoryValue: "GHS 1,080.00",
  priceTiers: [
    {
      name: "Normal Selling Price",
      description: "Default customer-facing price",
      price: "GHS 120.00",
      moq: "1 ea",
      discount: "0%",
      margin: "75%",
      accent: "#176ebe",
    },
    {
      name: "Wholesale",
      description: "Bulk trade price",
      price: "GHS 85.00",
      moq: "12 ea",
      discount: "29%",
      margin: "65%",
      accent: "#2d837d",
    },
  ],
};

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
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
  const { data: rawProduct, isLoading, refetch } = useGetProductQuery(id, { skip: !id || !ready || !canViewProduct });
  const product = rawProduct as ProductDetail | undefined;
  const imageUrl = product?.media?.[0]?.url || product?.imageUrl;

  const tabs = useMemo(() => buildTabs(product, { canManageInventory, onBatchChanged: refetch }), [canManageInventory, product, refetch]);
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
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Skeleton active paragraph={{ rows: 12 }} />
      </div>
    );
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
                <div className="min-w-0 hidden md:block font-semibold">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl   text-gray-700 truncate">{product.name}</h1>
                    <TypeBadge type={product.type} />
                  </div>
                  <AuditFooter createdAt={product.createdAt} updatedAt={product.updatedAt} />
                </div>
              </div>
              <div className="flex gap-2">
                {product.type === ITEM_TYPE.STOCK && canManageInventory && (
                  <Button type="default" onClick={toggleRestock}>
                    Restock
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

          <section className="grid sm:gap-6 md:px-5 md:py-6 lg:grid-cols-[200px_minmax(0,1fr)]  cursor-pointer ">
            <button
              type="button"
              onClick={canManageProduct ? toggleMedia : undefined}
              disabled={!canManageProduct}
              className="group w-[20%] lg:w-full cursor-pointer disabled:cursor-default disabled:opacity-100 relative aspect-square overflow-hidden rounded-sm border    border-[#2d837d] text-left outline-none transition  "
            >
              {showImagePlaceholder ? <ProductImagePlaceholder label="Product image" /> : <img className="h-full  w-full hover:p-0 transition p-1 object-cover" src={imageUrl} alt={product.name || "Product"} onError={() => setHeroImageFailed(true)} />}
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

          <section className=" pb-8 px-4 ">
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
          </section>
        </main>

        <aside className="bg-gray-50 px-5 py-5 md:px-8">
          <div className="sticky top-4 space-y-5"></div>
        </aside>
      </div>

      {editOpen && product && <ProductEditModal open={editOpen} toggle={toggleEdit} product={product} onSaved={refetch} />}
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
  }, [form, open, product.costPrice, product.id]);

  const handleSubmit = async () => {
    try {
      setSubmitError(null);
      const values = await form.validateFields();
      await restockProduct({
        productId: product.id,
        locationId: values.locationId,
        quantity: values.quantity,
        unitCost: values.unitCost,
        receivedDate: values.receivedDate.toISOString(),
        expiryDate: values.expiryDate?.toISOString(),
      }).unwrap();
      message.success("Product restocked.");
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
      title={`Restock ${product.name}`}
      onOk={handleSubmit}
      loading={isLoading}
      okText="Restock"
      width={560}
      height="auto"
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={toggle} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleSubmit} loading={isLoading}>
            Restock
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        <BatchContextCard
          items={[
            { label: "Product", value: product.name },
            { label: "SKU", value: product.sku || "-" },
            { label: "Type", value: product.type },
          ]}
        />
        {submitError && <p className="mb-4 text-sm text-red-600">{submitError}</p>}
        <Form.Item label="Location" name="locationId" rules={[{ required: true, message: "Select a location" }]}>
          <Select placeholder="Select location" loading={locationsLoading} options={locationOptions} />
        </Form.Item>
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
          rules={[
            { required: true, message: "Enter unit cost" },
            {
              validator: (_, value) => {
                if (value === undefined || value === null) return Promise.resolve();
                if (Number(value) < 0) return Promise.reject(new Error("Unit cost cannot be negative"));
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber className="!w-full" min={0} />
        </Form.Item>
        <Form.Item label="Received date" name="receivedDate" rules={[{ required: true, message: "Select received date" }]}>
          <DatePicker className="!w-full" />
        </Form.Item>
        <Form.Item label="Expiry date" name="expiryDate">
          <DatePicker className="!w-full" />
        </Form.Item>
      </Form>
    </AppModal>
  );
}

function buildTabs(product: ProductDetail | undefined, options: { canManageInventory: boolean; onBatchChanged: () => void }): DetailTab[] {
  if (!product) return [];

  const tabs: DetailTab[] = [
    {
      key: "overview",
      label: <TabLabel icon={<FaBox />} text="Overview" />,
      children: <Overview />,
    },
  ];

  if (product.type === "STOCK") {
    tabs.push({
      key: "batches",
      label: <TabLabel icon={<ImBoxRemove />} text="Batches" />,
      children: <BatchTable batches={product.inventory?.batches || []} canManageInventory={options.canManageInventory} onBatchChanged={options.onBatchChanged} />,
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
        children: <BatchTable batches={product.inventory?.batches || []} canManageInventory={options.canManageInventory} onBatchChanged={options.onBatchChanged} />,
      },
    );
  }

  if (product.type === "BUNDLE") {
    tabs.push({
      key: "components",
      label: <TabLabel icon={<FaLayerGroup />} text="Components" />,
      children: <Bundle product={product} />,
    });
  }

  tabs.push({
    key: "Order History",
    label: <TabLabel icon={<GrHistory />} text="Order History" />,
    children: <Activity product={product} />,
  });

  return tabs;
}

function Overview() {
  const [locationSearch, setLocationSearch] = useState("");
  const filteredLocations = MOCK_PRODUCT_OVERVIEW.locations.filter((location) => location.name.toLowerCase().includes(locationSearch.trim().toLowerCase()));
  const maxQuantity = Math.max(...MOCK_PRODUCT_OVERVIEW.locations.map((location) => location.onHand), 1);

  return (
    <div className="space-y-3  px-4 pt-4 md:px-0 md:pt-0">
      <div className="grid rounded-lg overflow-clip xl:grid-cols-2">
        <InventoryOverviewCard locations={filteredLocations} maxQuantity={maxQuantity} search={locationSearch} onSearchChange={setLocationSearch} />
        <PricingCostOverviewCard />
      </div>
    </div>
  );
}

function InventoryOverviewCard({ locations, maxQuantity }: { locations: typeof MOCK_PRODUCT_OVERVIEW.locations; maxQuantity: number; search: string; onSearchChange: (value: string) => void }) {
  return (
    <section className=" bg-[#f3f3f3] border-r border-gray-200 px-4 py-5 md:px-5 md:py-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-base text-gray-600">
            <span>Quantity</span>
            <span className="inline-flex items-center gap-1 rounded-md bg-[#b7c3dc] px-2.5 py-0.5 text-sm font-medium text-[#1f365f]">
              {MOCK_PRODUCT_OVERVIEW.activeMetric}
              <span className="text-base leading-none">↵</span>
            </span>
            <span>for all locations</span>
          </p>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-2xl font-semibold leading-none tracking-normal text-gray-800">{MOCK_PRODUCT_OVERVIEW.totalQuantity}</span>
            <span className="pb-1 text-lg text-gray-600">{MOCK_PRODUCT_OVERVIEW.unit}</span>
          </div>
        </div>
      </div>

      <div className="mt-2 border-t border-gray-200 "></div>

      <div className="mt-5 space-y-2.5">
        {locations.length ? (
          locations.map((location) => <InventoryLocationRow key={location.id} location={location} maxQuantity={maxQuantity} />)
        ) : (
          <div className="rounded-md border border-dashed border-gray-300 bg-white/70 px-4 py-6 text-center text-sm text-gray-500">No matching locations.</div>
        )}
      </div>

      <div className="mt-5 border-t border-gray-200 pt-4 text-center">
        <button type="button" className="inline-flex items-center gap-2 text-sm font-medium text-[#53658a]">
          Show more locations
          <ChevronDown size={15} />
        </button>
      </div>
    </section>
  );
}

function InventoryLocationRow({ location, maxQuantity }: { location: (typeof MOCK_PRODUCT_OVERVIEW.locations)[number]; maxQuantity: number; highlighted?: boolean }) {
  const onHandWidth = Math.max((location.onHand / maxQuantity) * 100, 4);
  const reservedWidth = location.onHand > 0 ? Math.min((location.reserved / location.onHand) * 100, 100) : 0;
  const incomingWidth = Math.max((location.incoming / maxQuantity) * 100, 0);

  return (
    <div className={`rounded-md  py-3`}>
      <div className="flex flex-wrap items-center gap-2.5 text-base">
        <span className="font-medium text-gray-900">{location.onHand}</span>
        <span className="font-semibold text-gray-700">{location.name}</span>
        <span className="text-gray-500">→</span>
      </div>
      <div className="mt-3 flex h-7 items-center gap-2">
        <div className="relative h-full rounded-md bg-[#176ebe]" style={{ width: `${onHandWidth}%` }}>
          {location.reserved > 0 && (
            <div className="group absolute inset-y-1 right-1 rounded-md border-2 border-[#176ebe] bg-[#d8edff]" style={{ width: `${reservedWidth}%` }}>
              <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-3 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-700 px-2.5 py-1.5 text-xs font-medium text-white group-hover:block">
                {location.reserved} reserved
                <span className="absolute bottom-full left-1/2 h-3 w-3 -translate-x-1/2 translate-y-1/2 rotate-45 bg-gray-700" />
              </div>
            </div>
          )}
        </div>
        {location.incoming > 0 && (
          <div className="group relative h-full rounded-md border border-[#a76a35] bg-[repeating-linear-gradient(135deg,#fff7ed_0,#fff7ed_3px,#b47a42_3px,#b47a42_4px)]" style={{ width: `${incomingWidth}%` }}>
            <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-3 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-700 px-2.5 py-1.5 text-xs font-medium text-white group-hover:block">
              {location.incoming} incoming
              <span className="absolute bottom-full left-1/2 h-3 w-3 -translate-x-1/2 translate-y-1/2 rotate-45 bg-gray-700" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PricingCostOverviewCard() {
  const [priceTiers, setPriceTiers] = useState(MOCK_PRODUCT_OVERVIEW.priceTiers);
  const [editingTierName, setEditingTierName] = useState<string | null>(null);
  const [tierDraft, setTierDraft] = useState({ price: "", moq: "", discount: "" });

  const startEditTier = (tier: (typeof MOCK_PRODUCT_OVERVIEW.priceTiers)[number]) => {
    setEditingTierName(tier.name);
    setTierDraft({
      price: tier.price,
      moq: tier.moq,
      discount: tier.discount,
    });
  };

  const cancelEditTier = () => {
    setEditingTierName(null);
    setTierDraft({ price: "", moq: "", discount: "" });
  };

  const saveTier = () => {
    if (!editingTierName) return;
    setPriceTiers((current) =>
      current.map((tier) =>
        tier.name === editingTierName
          ? {
              ...tier,
              price: tierDraft.price.trim() || tier.price,
              moq: tierDraft.moq.trim() || tier.moq,
              discount: tierDraft.discount.trim() || tier.discount,
            }
          : tier,
      ),
    );
    cancelEditTier();
  };

  return (
    <section className="overflow-hidden  bg-[#f3f3f3]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-5 md:px-5">
        <h2 className="text-lg font-medium tracking-normal text-gray-900">Pricing &amp; Cost</h2>
      </div>
      <div className=" border-t mx-4 border-gray-300 " />
      <div className="">
        <div className="grid  px-2 gap-3">
          {priceTiers.map((tier) => (
            <PriceTierCard key={tier.name} tier={tier} editing={editingTierName === tier.name} draft={tierDraft} onDraftChange={setTierDraft} onEdit={() => startEditTier(tier)} onCancel={cancelEditTier} onSave={saveTier} />
          ))}
        </div>

        <div className="mt-4 mx-4  py-3 grid gap-2.5 border-t border-gray-300  sm:grid-cols-2">
          <CostMetric label="Cost" value={MOCK_PRODUCT_OVERVIEW.baseCost} />
          <CostMetric label="Inventory Value" value={MOCK_PRODUCT_OVERVIEW.inventoryValue} />
        </div>
      </div>
    </section>
  );
}

function PriceTierCard({
  tier,
  editing,
  draft,
  onDraftChange,
  onEdit,
  onCancel,
  onSave,
}: {
  tier: (typeof MOCK_PRODUCT_OVERVIEW.priceTiers)[number];
  editing: boolean;
  draft: { price: string; moq: string; discount: string };
  onDraftChange: (draft: { price: string; moq: string; discount: string }) => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <article className="overflow-hidden">
      <div className="flex gap-3 p-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2.5">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-900">{tier.name}</h3>
              <p className="mt-0.5 text-xs text-gray-500">{tier.description}</p>
            </div>
            <div className="flex items-start gap-2">
              <p className="text-right text-lg  font-medium tracking-normal text-gray-950">{tier.price}</p>
              {!editing && (
                <button type="button" aria-label={`Edit ${tier.name}`} onClick={onEdit} className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900">
                  <Pencil size={13} />
                </button>
              )}
            </div>
          </div>

          {editing ? (
            <div className="mt-3 rounded-md border border-gray-200  p-2.5">
              <div className="grid gap-2.5 sm:grid-cols-3">
                <TierEditField label="Price" value={draft.price} onChange={(price) => onDraftChange({ ...draft, price })} />
                <TierEditField label="MOQ" value={draft.moq} onChange={(moq) => onDraftChange({ ...draft, moq })} />
                <TierEditField label="Discount" value={draft.discount} onChange={(discount) => onDraftChange({ ...draft, discount })} />
              </div>
              <div className="mt-2.5 flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100">
                  <X size={13} />
                  Cancel
                </button>
                <button type="button" onClick={onSave} className="inline-flex items-center gap-1 rounded-full bg-[#2d837d] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#256f69]">
                  <Check size={13} />
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-3 overflow-hidden rounded-md border border-gray-100 bg-white/60">
              <TierStat label="MOQ" value={tier.moq} />
              <TierStat label="Discount" value={tier.discount} />
              <TierStat label="Margin" value={tier.margin} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function TierEditField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-9 w-full rounded-md border border-gray-200 bg-white px-2.5 text-sm font-medium text-gray-900 outline-none transition focus:border-[#2d837d] focus:ring-2 focus:ring-[#2d837d]/15"
      />
    </label>
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
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Available Bundles" value={formatQuantity(product.bundleAvailability)} />
        <SummaryCard label="Components" value={formatQuantity(components.length)} />
        <SummaryCard label="Bundle Price" value={formatMoney(product.sellingPrice)} />
      </div>
      <Panel>
        <h2 className="sectionTitle">Component Breakdown</h2>
        {components.length ? (
          <div className="mt-4 divide-y divide-gray-100">
            {components.map((component) => (
              <div key={component.productId} className="flex items-center justify-between gap-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <ProductThumb src={component.imageUrl} name={component.productName} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{component.productName}</p>
                    <p className="text-xs text-gray-500">{component.sku || component.type}</p>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold text-gray-900">{formatQuantity(component.quantityRequired)} needed</p>
                  <p className="text-gray-500">{formatQuantity(component.availableQuantity)} available</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty className="py-6" description="No bundle components have been configured." />
        )}
      </Panel>
    </div>
  );
}

function Activity({ product }: { product: ProductDetail }) {
  const emptyText = product.type === "SERVICE" ? "Service sales and refunds will appear here." : product.type === "BUNDLE" ? "Bundle sales and returns will appear here." : "Purchases, sales, fulfillments, returns, and adjustments will appear here.";
  return (
    <Panel>
      <Empty className="py-10" description={emptyText} />
    </Panel>
  );
}

function BatchTable({ batches, canManageInventory, onBatchChanged }: { batches: InventoryBatch[]; canManageInventory: boolean; onBatchChanged: () => void }) {
  const [selectedBatch, setSelectedBatch] = useState<InventoryBatch | null>(null);
  const [activeBatchModal, setActiveBatchModal] = useState<"adjust" | "transfer" | null>(null);

  const openAdjustment = (batch: InventoryBatch) => {
    setSelectedBatch(batch);
    setActiveBatchModal("adjust");
  };

  const openTransfer = (batch: InventoryBatch) => {
    setSelectedBatch(batch);
    setActiveBatchModal("transfer");
  };

  const closeBatchModal = () => {
    setActiveBatchModal(null);
    setSelectedBatch(null);
  };

  if (!batches.length) {
    return (
      <Panel>
        <Empty className="py-10" description="No inventory batches have been created yet." />
      </Panel>
    );
  }

  return (
    <div className="overflow-hidden rounded-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-[0.12em] text-gray-400">
            <tr>
              <th className="px-4 py-3">Batch</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Remaining</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Unit Cost</th>
              <th className="px-4 py-3">Expiry</th>
              {canManageInventory && <th className="px-4 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {batches.map((batch) => (
              <tr key={batch.id}>
                <td className="px-4 py-3 font-medium text-gray-900">{batch.batchNumber}</td>
                <td className="px-4 py-3 text-gray-600">{formatDate(batch.sourceDate)}</td>
                <td className="px-4 py-3 text-gray-600">{batch.locationName || "-"}</td>
                <td className="px-4 py-3 text-gray-600">{formatQuantity(batch.quantity)}</td>
                <td className="px-4 py-3 text-gray-600">{formatQuantity(batch.remainingQuantity)}</td>
                <td className="px-4 py-3 text-gray-600">{formatBatchSource(batch.source)}</td>
                <td className="px-4 py-3 text-gray-600">{formatMoney(batch.unitCost)}</td>
                <td className="px-4 py-3 text-gray-600">{formatDate(batch.expiryDate)}</td>
                {canManageInventory && (
                  <td className="px-4 py-3">
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
                          ],
                        }}
                      />
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedBatch && (
        <>
          <BatchAdjustmentModal
            batch={selectedBatch}
            open={activeBatchModal === "adjust"}
            toggle={closeBatchModal}
            onSaved={onBatchChanged}
          />
          <BatchTransferModal
            batch={selectedBatch}
            open={activeBatchModal === "transfer"}
            toggle={closeBatchModal}
            onSaved={onBatchChanged}
          />
        </>
      )}
    </div>
  );
}

function BatchAdjustmentModal({ batch, open, toggle, onSaved }: { batch: InventoryBatch; open: boolean; toggle: () => void; onSaved: () => void }) {
  const [form] = Form.useForm<AdjustBatchFormValues>();
  const [adjustBatch, { isLoading }] = useAdjustBatchMutation();
  const [showReason, setShowReason] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        quantityDelta: undefined,
        effectiveDate: dayjs(),
        reason: "",
      });
      setShowReason(false);
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
        {submitError && <p className="mb-4 text-sm text-red-600">{submitError}</p>}
        <Form.Item
          label="Quantity delta"
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
          extra="Use -5 to reduce stock, or 5 to add stock."
        >
          <InputNumber className="!w-full" placeholder="Enter quantity change" />
        </Form.Item>
        <Form.Item label="Effective date" name="effectiveDate" rules={[{ required: true, message: "Select the effective date" }]}>
          <DatePicker className="!w-full" />
        </Form.Item>
        {!showReason ? (
          <Button type="link" className="!px-0" onClick={() => setShowReason(true)}>
            Add note
          </Button>
        ) : (
          <Form.Item label="Reason" name="reason">
            <Input.TextArea rows={3} placeholder="Optional note for this adjustment" />
          </Form.Item>
        )}
      </Form>
    </AppModal>
  );
}

function BatchTransferModal({ batch, open, toggle, onSaved }: { batch: InventoryBatch; open: boolean; toggle: () => void; onSaved: () => void }) {
  const [form] = Form.useForm<TransferBatchFormValues>();
  const [transferBatch, { isLoading }] = useTransferBatchByBatchIdMutation();
  const [showReason, setShowReason] = useState(false);
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
      setShowReason(false);
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
        {submitError && <p className="mb-4 text-sm text-red-600">{submitError}</p>}
        <Form.Item label="Destination location" name="toLocationId" rules={[{ required: true, message: "Select a destination location" }]}>
          <Select placeholder="Select location" loading={locationsLoading} options={locationOptions} />
        </Form.Item>
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
        {!showReason ? (
          <Button type="link" className="!px-0" onClick={() => setShowReason(true)}>
            Add note
          </Button>
        ) : (
          <Form.Item label="Reason" name="reason">
            <Input.TextArea rows={3} placeholder="Optional note for this transfer" />
          </Form.Item>
        )}
      </Form>
    </AppModal>
  );
}

function BatchContextCard({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  return (
    <div className="mb-4 grid grid-cols-1 gap-3 rounded-sm border border-gray-200 bg-gray-50 p-3 sm:grid-cols-3">
      {items.map((item) => (
        <div key={String(item.label)} className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400">{item.label}</p>
          <p className="mt-1 truncate text-sm font-medium text-gray-900">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function SummaryCard({ label, value, muted }: { label: string; value: React.ReactNode; muted?: boolean }) {
  return (
    <div className={`rounded-sm border border-gray-200 bg-white p-4 ${muted ? "opacity-60" : ""}`}>
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-gray-900">{value ?? "-"}</p>
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
  return <div className={`rounded-md border border-gray-200 bg-white p-5 ${className}`}>{children}</div>;
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

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    STOCK: "green",
    NON_STOCK: "blue",
    SERVICE: "purple",
    PACKAGING: "gold",
    BUNDLE: "cyan",
  };
  return <Tag color={colors[type] || "default"}>{type?.replace("_", " ") || "PRODUCT"}</Tag>;
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

function formatMoney(value: unknown) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 2,
  }).format(amount);
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
