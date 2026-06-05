"use client";

import { GoBack } from "@/components/ui/GoBack";
import { ProductEditModal } from "@/components/products/ProductEditModal";
import { ProductMediaManagerModal } from "@/components/products/ProductMediaManagerModal";
import { ITEM_TYPE } from "@/components/products/ProductFormModal";
import { useGetProductQuery } from "@/lib/redux/services";
import useToggle from "@/hooks/UseToggle";
import { Button, Empty, Segmented, Skeleton, Tabs, Tag } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useEffect, useMemo, useState } from "react";
import { FaBox, FaLayerGroup, FaTags } from "react-icons/fa";
import { GrHistory } from "react-icons/gr";
import { ImBoxRemove } from "react-icons/im";
import { TbPackageExport, TbPackages } from "react-icons/tb";

dayjs.extend(relativeTime);

const INVENTORY_TYPES = ["STOCK", "PACKAGING"];

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
  locationName?: string;
  quantity?: number;
  remainingQuantity?: number;
  unitCost?: number;
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
    productId?: { id?: string; name?: string; sku?: string; media?: { url?: string }[]; sellingPrice?: number } | string;
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

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [editOpen, toggleEdit] = useToggle();
  const [mediaOpen, toggleMedia] = useToggle();
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const { data: rawProduct, isLoading, refetch } = useGetProductQuery(id, { skip: !id });
  const product = rawProduct as ProductDetail | undefined;

  const tabs = useMemo(() => buildTabs(product), [product]);
  const currentTab = tabs.find((tab) => tab.key === activeSection) || tabs[0];

  useEffect(() => {
    if (tabs.length && !tabs.some((tab) => tab.key === activeSection)) {
      setActiveSection(tabs[0].key);
    }
  }, [activeSection, tabs]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Skeleton active paragraph={{ rows: 12 }} />
      </div>
    );
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
  const imageUrl = product.media?.[0]?.url || product.imageUrl;
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
                <Button type="default" onClick={toggleEdit}>
                  Edit
                </Button>
              </div>
            </div>
          </header>

          <section className="grid sm:gap-6 md:px-5 md:py-6 lg:grid-cols-[200px_minmax(0,1fr)]  cursor-pointer ">
            <button
              type="button"
              onClick={toggleMedia}
              className="group w-[20%] lg:w-full cursor-pointer relative aspect-square overflow-hidden rounded-sm border  border-[#2d837d] sm:border-gray-300 hover:border-[#2d837d] text-left outline-none transition  focus-visible:ring-2 focus-visible:ring-gray-950"
            >
              {imageUrl ? <img className="h-full  w-full hover:p-1 object-cover" src={imageUrl} alt={product.name || "Product"} /> : <div className="flex h-full items-center justify-center text-gray-400">No image</div>}
              <span className="absolute inset-x-0 bottom-0 bg-[#2d837d] px-3 py-2 text-center text-xs font-medium text-white sm:opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">Manage media</span>
            </button>

            <div className="min-w-0">
              <DetailGrid
                items={[
                  { label: "SKU", value: product.sku || "-" },
                  { label: "Barcode", value: product.barcode || "-" },
                  { label: "Category", value: product.categoryName || "Uncategorized" },
                  { label: "Weight", value: product.weight ? `${product.weight}` : "-" },
                  // { label: "Visibility", value: getVisibilityLabel(product) },
                  {
                    label: INVENTORY_TYPES.includes(product.type) ? "Available" : "Inventory",
                    value: INVENTORY_TYPES.includes(product.type) ? formatQuantity(product.availableStock) : "Not tracked",
                  },
                  { label: "Selling Price", value: formatMoney(product.sellingPrice) },
                  { label: "Cost Price", value: formatMoney(product.costPrice) },
                  {
                    label: "Inventory Value",
                    value: INVENTORY_TYPES.includes(product.type) ? formatMoney(product.inventory?.summary?.inventoryValue) : "Not tracked",
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

          <section className=" pb-8 md:px-8">
            <div className="mb-6 hidden overflow-x-auto pb-1 md:block">
              <div className="flex w-max min-w-full justify-center">
                <Segmented
                  shape="round"
                  options={tabs.map((tab) => ({ label: tab.label, value: tab.key }))}
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
          <div className="sticky top-4 space-y-5">
            <QuickActions product={product} />
          </div>
        </aside>
      </div>

      {editOpen && product && <ProductEditModal open={editOpen} toggle={toggleEdit} product={product} onSaved={refetch} />}
      {mediaOpen && product && <ProductMediaManagerModal open={mediaOpen} toggle={toggleMedia} productId={product.id} productName={product.name} media={product.media || []} onChanged={refetch} />}
    </div>
  );
}

function buildTabs(product?: ProductDetail): DetailTab[] {
  if (!product) return [];

  const tabs: DetailTab[] = [
    {
      key: "overview",
      label: <TabLabel icon={<FaBox />} text="Overview" />,
      children: <Overview product={product} />,
    },
    {
      key: "pricing",
      label: <TabLabel icon={<FaTags />} text="Pricing" />,
      children: <Pricing product={product} />,
    },
  ];

  if (product.type === "STOCK") {
    tabs.push(
      {
        key: "inventory",
        label: <TabLabel icon={<TbPackages />} text="Inventory" />,
        children: <Inventory product={product} />,
      },
      {
        key: "batches",
        label: <TabLabel icon={<ImBoxRemove />} text="Batches" />,
        children: <BatchTable batches={product.inventory?.batches || []} />,
      },
    );
  }

  if (product.type === "PACKAGING") {
    tabs.push(
      {
        key: "packaging",
        label: <TabLabel icon={<TbPackageExport />} text="Repack" />,
        children: <Packaging product={product} />,
      },
      {
        key: "inventory",
        label: <TabLabel icon={<TbPackages />} text="Inventory" />,
        children: <Inventory product={product} />,
      },
      {
        key: "batches",
        label: <TabLabel icon={<ImBoxRemove />} text="Batches" />,
        children: <BatchTable batches={product.inventory?.batches || []} />,
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
    key: "activity",
    label: <TabLabel icon={<GrHistory />} text="Activity" />,
    children: <Activity product={product} />,
  });

  return tabs;
}

function Overview({ product }: { product: ProductDetail }) {
  return (
    <div className="grid gap-5">
      <Panel className="border-gray-200 bg-white shadow-[0_1px_0_rgba(15,23,42,0.03)]">
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-400">Performance</p>
            <h2 className="mt-1 text-lg font-semibold text-gray-950">Statistics</h2>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-md border border-gray-200">
          <MetricRow label="Total sales" value="0" />
          <MetricRow label="Revenue generated" value={formatMoney(0)} />
          <MetricRow label="Quantity sold" value="0" />
        </div>
      </Panel>
    </div>
  );
}

function Pricing({ product }: { product: ProductDetail }) {
  const profit = Number(product.sellingPrice || 0) - Number(product.costPrice || 0);
  const margin = product.sellingPrice ? `${((profit / Number(product.sellingPrice)) * 100).toFixed()}%` : "0%";
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard label="Cost Price" value={formatMoney(product.costPrice)} />
      <SummaryCard label="Selling Price" value={formatMoney(product.sellingPrice)} />
      <SummaryCard label="Wholesale Price" value={formatMoney(product.wholesalePrice)} muted={!product.wholesalePrice} />
      <SummaryCard label="Margin" value={margin} />
    </div>
  );
}

function Inventory({ product }: { product: ProductDetail }) {
  const summary = product.inventory?.summary || {};
  const locations = product.inventory?.locations || [];
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Available" value={formatQuantity(summary.availableQuantity ?? product.availableStock)} />
        <SummaryCard label="FIFO Value" value={formatMoney(summary.inventoryValue)} />
        <SummaryCard label="Average Cost" value={formatMoney(summary.averageCost)} />
        <SummaryCard label="Active Batches" value={formatQuantity(summary.activeBatches)} />
        <SummaryCard label="Expired Qty" value={formatQuantity(summary.expiredQuantity)} muted={!summary.expiredQuantity} />
        <SummaryCard label="Expiring Soon" value={formatQuantity(summary.expiringSoonQuantity)} muted={!summary.expiringSoonQuantity} />
      </div>

      <Panel>
        <h2 className="sectionTitle">Location Breakdown</h2>
        {locations.length ? (
          <div className="mt-4 divide-y divide-gray-100">
            {locations.map((location) => (
              <div key={location.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{location.locationName || "Location"}</p>
                  <p className="text-xs text-gray-500">{formatQuantity(location.committed)} committed</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">{formatQuantity(location.available)} available</p>
              </div>
            ))}
          </div>
        ) : (
          <Empty className="py-6" description="No inventory has been received yet." />
        )}
      </Panel>
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

function BatchTable({ batches }: { batches: InventoryBatch[] }) {
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
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Remaining</th>
              <th className="px-4 py-3">Unit Cost</th>
              <th className="px-4 py-3">Expiry</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {batches.map((batch) => (
              <tr key={batch.id}>
                <td className="px-4 py-3 font-medium text-gray-900">{batch.batchNumber}</td>
                <td className="px-4 py-3 text-gray-600">{batch.locationName || "-"}</td>
                <td className="px-4 py-3 text-gray-600">{formatQuantity(batch.quantity)}</td>
                <td className="px-4 py-3 text-gray-600">{formatQuantity(batch.remainingQuantity)}</td>
                <td className="px-4 py-3 text-gray-600">{formatMoney(batch.unitCost)}</td>
                <td className="px-4 py-3 text-gray-600">{formatDate(batch.expiryDate)}</td>
                <td className="px-4 py-3">
                  <StatusTag status={batch.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function QuickActions({ product }: { product: ProductDetail }) {
  const actions =
    product.type === "STOCK" ? ["Receive Stock", "Adjust Stock"] : product.type === "PACKAGING" ? ["Repack Product", "Adjust Stock"] : product.type === "BUNDLE" ? ["Edit Components"] : product.type === "SERVICE" ? ["Create Service Sale"] : ["Create Sale"];

  return (
    <Panel>
      <h2 className="sectionTitle">Quick Actions</h2>
      <div className="mt-4 grid gap-2">
        {actions.map((action) => (
          <Button key={action} block>
            {action}
          </Button>
        ))}
      </div>
    </Panel>
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

function MetricRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 bg-white px-4 py-3 last:border-b-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-950">{value}</span>
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

function StatusTag({ status }: { status?: string }) {
  const displayStatus = status || "-";
  const colors: Record<string, string> = {
    ACTIVE: "green",
    DEPLETED: "default",
    EXPIRED: "red",
  };
  return <Tag color={colors[displayStatus] || "default"}>{displayStatus}</Tag>;
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

function getVisibilityLabel(product: ProductDetail) {
  if (product.showInPOS && product.showInStorefront) return "POS and Storefront";
  if (product.showInPOS) return "POS only";
  if (product.showInStorefront) return "Storefront only";
  return "Hidden";
}

function formatMoney(value: unknown) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", maximumFractionDigits: 2 }).format(amount);
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
