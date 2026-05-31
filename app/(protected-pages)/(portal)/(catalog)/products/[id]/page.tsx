"use client";

import { GoBack } from "@/components/ui/GoBack";
import { ProductVisibility } from "@/components/products";
import { useGetProductQuery, useUpdateProductMutation } from "@/lib/redux/services";
import { Button, Empty, Form, Segmented, Skeleton, Tabs, Tag } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useEffect, useMemo, useState } from "react";
import { FaBox, FaChartLine, FaLayerGroup, FaTags } from "react-icons/fa";
import { GrHistory } from "react-icons/gr";
import { ImBoxRemove } from "react-icons/im";
import { TbPackageExport, TbPackages } from "react-icons/tb";

dayjs.extend(relativeTime);

const INVENTORY_TYPES = ["STOCK", "PACKAGING"];

type ProductType = "STOCK" | "NON_STOCK" | "SERVICE" | "PACKAGING" | "BUNDLE" | string;

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
  id?: string;
  name?: string;
  type: ProductType;
  sku?: string;
  barcode?: string;
  categoryName?: string;
  description?: string;
  weight?: number;
  sellingPrice?: number;
  costPrice?: number;
  wholesalePrice?: number;
  availableStock?: number;
  media?: Array<{ url?: string }>;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  sourceProductName?: string;
  conversionRule?: string;
  bundleAvailability?: number;
  bundleComponents?: BundleComponent[];
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
  const [productForm] = Form.useForm();
  const [updatedProduct, setUpdatedProduct] = useState<Record<string, unknown>>({});
  const [activeSection, setActiveSection] = useState("overview");
  const { data: rawProduct, error, isLoading, isSuccess } = useGetProductQuery(id, { skip: !id });
  const [updateProduct, { isLoading: updatingProduct }] = useUpdateProductMutation();
  const product = rawProduct as ProductDetail | undefined;

  useEffect(() => {
    if (!product) return;
    const profit = Number(product.sellingPrice || 0) - Number(product.costPrice || 0);
    const profitMargin = product.sellingPrice ? `${((profit / Number(product.sellingPrice)) * 100).toFixed()}%` : "0%";
    productForm.setFieldsValue({ ...product, profit, profitMargin });
  }, [isSuccess, product, productForm]);

  const tabs = useMemo(() => buildTabs(product), [product]);
  const currentTab = tabs.find((tab) => tab.key === activeSection) || tabs[0];

  useEffect(() => {
    if (tabs.length && !tabs.some((tab) => tab.key === activeSection)) {
      setActiveSection(tabs[0].key);
    }
  }, [activeSection, tabs]);

  const handleFormValueChange = (changedValues: Record<string, unknown>) => {
    const key = Object.keys(changedValues)[0];
    if (!key || !product) return;

    if (changedValues[key] !== product[key]) {
      setUpdatedProduct((values) => ({ ...values, ...changedValues }));
    } else {
      setUpdatedProduct((values) => {
        const updated = { ...values };
        delete updated[key];
        return updated;
      });
    }
  };

  const handleUpdate = async () => {
    await updateProduct({ ...updatedProduct, id });
    setUpdatedProduct({});
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Skeleton active paragraph={{ rows: 12 }} />
      </div>
    );
  }

  if (error || !product) {
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
  const hasChanges = Object.keys(updatedProduct).length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]">
        <main className="border-r border-gray-200 bg-white">
          <header className="border-b border-gray-200 px-5 py-5 md:px-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <GoBack />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="pageTittle truncate">{product.name}</h1>
                    <TypeBadge type={product.type} />
                  </div>
                  <AuditFooter createdAt={product.createdAt} updatedAt={product.updatedAt} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="default">Edit</Button>
                <Button type="primary" disabled={!hasChanges} loading={updatingProduct} onClick={handleUpdate}>
                  Save
                </Button>
              </div>
            </div>
          </header>

          <section className="grid gap-6 px-5 py-6 md:grid-cols-[180px_minmax(0,1fr)] md:px-8">
            <div className="aspect-square overflow-hidden rounded-sm border border-gray-200 bg-gray-50">
              {imageUrl ? <img className="h-full w-full object-cover" src={imageUrl} alt={product.name || "Product"} /> : <div className="flex h-full items-center justify-center text-gray-400">No image</div>}
            </div>
            <div className="min-w-0">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard label="Available" value={formatQuantity(product.availableStock)} muted={!INVENTORY_TYPES.includes(product.type)} />
                <SummaryCard label="Selling Price" value={formatMoney(product.sellingPrice)} />
                <SummaryCard label="Cost Price" value={formatMoney(product.costPrice)} />
                <SummaryCard label="Inventory Value" value={formatMoney(product.inventory?.summary?.inventoryValue)} muted={!INVENTORY_TYPES.includes(product.type)} />
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Detail label="SKU" value={product.sku || "-"} />
                <Detail label="Barcode" value={product.barcode || "-"} />
                <Detail label="Category" value={product.categoryName || "Uncategorized"} />
                <Detail label="Weight" value={product.weight ? `${product.weight}` : "-"} />
              </div>
            </div>
          </section>

          <section className="px-5 pb-8 md:px-8">
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
            <ProductVisibility form={productForm} onChange={handleFormValueChange} />
            <QuickActions product={product} />
          </div>
        </aside>
      </div>
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

  if (product.type === "NON_STOCK") {
    tabs.push({
      key: "commerce",
      label: <TabLabel icon={<FaChartLine />} text="Commerce" />,
      children: <Commerce />,
    });
  }

  if (product.type === "SERVICE") {
    tabs.push({
      key: "service",
      label: <TabLabel icon={<FaChartLine />} text="Service" />,
      children: <ServiceInfo product={product} />,
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
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Panel>
        <h2 className="sectionTitle">Product Information</h2>
        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-600">{product.description || "No description has been added for this product."}</p>
      </Panel>
      <Panel>
        <h2 className="sectionTitle">Statistics</h2>
        <div className="mt-4 grid gap-3">
          <Metric label="Total sales" value="0" />
          <Metric label="Revenue generated" value={formatMoney(0)} />
          <Metric label="Quantity sold" value="0" />
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

function Commerce() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <SummaryCard label="Total Purchased" value="0" />
      <SummaryCard label="Total Sold" value="0" />
      <SummaryCard label="Gross Profit" value={formatMoney(0)} />
    </div>
  );
}

function ServiceInfo({ product }: { product: ProductDetail }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel>
        <h2 className="sectionTitle">Service Information</h2>
        <p className="mt-3 text-sm leading-6 text-gray-600">{product.description || "No service description has been added."}</p>
      </Panel>
      <Panel>
        <h2 className="sectionTitle">Financial Summary</h2>
        <div className="mt-4 space-y-3">
          <Metric label="Times sold" value="0" />
          <Metric label="Revenue" value={formatMoney(0)} />
          <Metric label="Refunds" value={formatMoney(0)} />
        </div>
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

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-l border-gray-200 pl-4">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">{label}</p>
      <p className="mt-1 truncate text-sm font-medium text-gray-900">{value}</p>
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

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-sm border border-gray-200 bg-white p-5">{children}</div>;
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
