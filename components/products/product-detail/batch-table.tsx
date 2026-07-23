"use client";

import { Button, Drawer, Empty, Input, Select } from "antd";
import type { TableProps } from "antd/es/table";
import { ArrowRightLeft, PackageOpen, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { ActionDropdown, DropdownItemLabel } from "@/components/ui/ActionDropdown";
import AppTable from "@/components/ui/AppTable";
import { ITEM_TYPE } from "@/components/products/ProductFormModal";
import useToggle from "@/hooks/UseToggle";
import { useStoreCurrencyCode } from "@/hooks/useStoreCurrencyCode";
import { RootState } from "@/lib/store";
import { hasBundleComponents } from "@/lib/products/type-label";

import { Panel } from "./shared";
import type { InventoryBatch, ProductDetail } from "./types";
import { formatBatchSource, formatDate, formatMoney, formatQuantity, isExpiredBatch, isExpiringSoonBatch, sortBatchesByPriority } from "./utils";
import { BatchAdjustmentModal, BatchDisassembleModal, BatchTransferModal, ProductionBatchDetailModal } from "./inventory-modals";

export function BatchTable({ product, batches, canManageInventory, onBatchChanged }: { product: ProductDetail; batches: InventoryBatch[]; canManageInventory: boolean; onBatchChanged: () => void }) {
  const [selectedBatch, setSelectedBatch] = useState<InventoryBatch | null>(null);
  const [activeBatchModal, setActiveBatchModal] = useState<"adjust" | "transfer" | "disassemble" | "production" | null>(null);
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [stockStateFilter, setStockStateFilter] = useState<string>("all");
  const [expiryFilter, setExpiryFilter] = useState<string>("all");
  const [queryFilter, setQueryFilter] = useState("");
  const [filtersOpen, toggleFiltersOpen] = useToggle();
  const canDisassemble = product.type === ITEM_TYPE.STOCK && hasBundleComponents(product);
  const canMutateBatches = canManageInventory && product.status !== "archived";
  const expiryEnabled = useSelector((state: RootState) => state.currentUser.storeSettings.features?.expiryEnabled !== false);
  const storeCurrencyCode = useStoreCurrencyCode();

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

      if (expiryEnabled) {
        if (expiryFilter === "expired" && !expired) return false;
        if (expiryFilter === "expiring_soon" && !expiringSoon) return false;
        if (expiryFilter === "fresh" && (expired || expiringSoon || !hasExpiry)) return false;
        if (expiryFilter === "no_expiry" && hasExpiry) return false;
      }

      if (!normalizedQuery) return true;

      const haystack = [batch.batchNumber, batch.locationName, formatBatchSource(batch.source), formatDate(batch.sourceDate), expiryEnabled ? formatDate(batch.expiryDate) : ""].join(" ").toLowerCase();

      return haystack.includes(normalizedQuery);
    });

    return [...nextBatches].sort((a, b) => {
      const locationCompare = (a.locationName || "No location").localeCompare(b.locationName || "No location");
      if (locationCompare !== 0) return locationCompare;
      return sortBatchesByPriority(a, b);
    });
  }, [batches, expiryEnabled, expiryFilter, locationFilter, queryFilter, sourceFilter, stockStateFilter]);

  const batchSummary = useMemo(() => {
    const remainingTotal = filteredBatches.reduce((sum, batch) => sum + Number(batch.remainingQuantity || 0), 0);
    const activeBatches = filteredBatches.filter((batch) => Number(batch.remainingQuantity || 0) > 0).length;
    const expiredBatches = expiryEnabled ? filteredBatches.filter((batch) => isExpiredBatch(batch)).length : 0;
    const expiringSoonBatches = expiryEnabled ? filteredBatches.filter((batch) => !isExpiredBatch(batch) && isExpiringSoonBatch(batch)).length : 0;

    return {
      remainingTotal,
      activeBatches,
      expiredBatches,
      expiringSoonBatches,
    };
  }, [expiryEnabled, filteredBatches]);

  const activeFilterCount = useMemo(
    () => [locationFilter, sourceFilter, stockStateFilter, ...(expiryEnabled ? [expiryFilter] : [])].filter((value) => value !== "all").length + (queryFilter.trim() ? 1 : 0),
    [expiryEnabled, expiryFilter, locationFilter, queryFilter, sourceFilter, stockStateFilter],
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

  useEffect(() => {
    if (expiryEnabled || expiryFilter === "all") return;
    setExpiryFilter("all");
  }, [expiryEnabled, expiryFilter]);

  const clearFilters = () => {
    setLocationFilter("all");
    setSourceFilter("all");
    setStockStateFilter("all");
    if (expiryEnabled) {
      setExpiryFilter("all");
    }
    setQueryFilter("");
  };

  const openBatchModal = (batch: InventoryBatch, type: "adjust" | "transfer" | "disassemble" | "production") => {
    setSelectedBatch(batch);
    setActiveBatchModal(type);
  };

  const closeBatchModal = () => {
    setActiveBatchModal(null);
    setSelectedBatch(null);
  };

  const actionItemsForBatch = (batch: InventoryBatch) => [
    ...(batch.source === "production"
      ? [
          {
            key: "production",
            label: <DropdownItemLabel icon={<PackageOpen size={15} />} text="View production" />,
            onClick: () => openBatchModal(batch, "production"),
          },
        ]
      : []),
    {
      key: "adjust",
      label: <DropdownItemLabel icon={<SlidersHorizontal size={15} />} text="Inventory adjustment" />,
      onClick: () => openBatchModal(batch, "adjust"),
    },
    {
      key: "transfer",
      label: <DropdownItemLabel icon={<ArrowRightLeft size={15} />} text="Location transfer" />,
      onClick: () => openBatchModal(batch, "transfer"),
    },
    ...(canDisassemble
      ? [
          {
            key: "disassemble",
            label: <DropdownItemLabel icon={<PackageOpen size={15} />} text="Disassemble batch" />,
            onClick: () => openBatchModal(batch, "disassemble"),
          },
        ]
      : []),
  ];

  const columns: TableProps<InventoryBatch>["columns"] = [
    {
      title: "Batch",
      key: "batchNumber",
      className: "!pl-4",
      render: (_, batch) => (
        <div className="font-medium text-gray-900">
          <p>{batch.batchNumber || "-"}</p>
        </div>
      ),
    },
    {
      title: "Location",
      key: "locationName",
      render: (_, batch) => batch.locationName || "No location",
    },
    { title: "Date", key: "sourceDate", render: (_, batch) => formatDate(batch.sourceDate) },
    { title: "Quantity", key: "quantity", render: (_, batch) => formatQuantity(batch.quantity) },
    { title: "Remaining", key: "remainingQuantity", render: (_, batch) => formatQuantity(batch.remainingQuantity) },
    { title: "Source", key: "source", render: (_, batch) => formatBatchSource(batch.source) },
    { title: "Unit Cost", key: "unitCost", render: (_, batch) => formatMoney(batch.unitCost, storeCurrencyCode) },
    ...(expiryEnabled ? [{ title: "Expiry", key: "expiryDate", render: (_: unknown, batch: InventoryBatch) => formatDate(batch.expiryDate) }] : []),
    ...(canMutateBatches
      ? [
          {
            title: "Actions",
            key: "actions",
            align: "right" as const,
            className: "!pr-4",
            render: (_: unknown, batch: InventoryBatch) => (
              <div className="flex justify-end" onClick={(event) => event.stopPropagation()}>
                <ActionDropdown menu={{ items: actionItemsForBatch(batch) }} />
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
    <div className="overflow-hidden">
      <div className="my-4 flex flex-wrap items-center justify-between gap-3 px-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
          <span>{formatQuantity(batchSummary.remainingTotal)} remaining</span>
          <span>{batchSummary.activeBatches} active</span>
          {expiryEnabled && batchSummary.expiredBatches > 0 ? <span className="text-red-600">{batchSummary.expiredBatches} expired</span> : null}
          {expiryEnabled && batchSummary.expiringSoonBatches > 0 ? <span className="text-amber-600">{batchSummary.expiringSoonBatches} expiring soon</span> : null}
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 ? (
            <Button type="text" size="small" onClick={clearFilters} className="!px-0 text-gray-500">
              Clear
            </Button>
          ) : null}
          <Button size="small" onClick={toggleFiltersOpen} type={activeFilterCount > 0 ? "primary" : "default"} className={activeFilterCount > 0 ? "!border-0 !text-sm !shadow-none" : "!text-sm"}>
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </Button>
        </div>
      </div>

      <div className="divide-y divide-gray-200 border-t border-gray-200 md:hidden">
        {filteredBatches.length ? (
          filteredBatches.map((batch) => (
            <div
              key={batch.id || batch.batchNumber || `${batch.locationId}-${batch.sourceDate}`}
              className={`px-4 py-4 ${batch.source === "production" ? "cursor-pointer" : ""}`}
              onClick={batch.source === "production" ? () => openBatchModal(batch, "production") : undefined}
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-950">{batch.batchNumber || "Unnamed batch"}</p>
                <div className="flex gap-1">
                  <p className="font-semibold text-gray-950">{formatQuantity(batch.remainingQuantity)} left</p>
                  <p className="mt-1 text-xs text-gray-500">of {formatQuantity(batch.quantity)}</p>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                {batch.locationName || "No location"} · {formatBatchSource(batch.source)}
              </p>

              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">
                    {formatDate(batch.sourceDate)}
                    {expiryEnabled ? (
                      <>
                        {" "}
                        · Expires {formatDate(batch.expiryDate)}
                        {isExpiredBatch(batch) ? <span className="ml-2 text-red-600">Expired</span> : null}
                        {!isExpiredBatch(batch) && isExpiringSoonBatch(batch) ? <span className="ml-2 text-amber-600">Expiring soon</span> : null}
                      </>
                    ) : null}
                  </p>
                  <p className="mt-1 text-xs font-medium text-gray-700">Unit Cost: {formatMoney(batch.unitCost, storeCurrencyCode)}</p>
                </div>
                <div className="shrink-0 text-right" onClick={(event) => event.stopPropagation()}>
                  {canMutateBatches ? <ActionDropdown isTransparent menu={{ items: actionItemsForBatch(batch) }} /> : null}
                </div>
              </div>
            </div>
          ))
        ) : (
          <Empty className="py-10" description="No batches match the selected filters." />
        )}
      </div>

      <div className="hidden md:block">
        <AppTable<InventoryBatch>
          columns={[...columns]}
          dataSource={filteredBatches}
          rowKey={(batch) => batch.id || batch.batchNumber || `${batch.locationId}-${batch.sourceDate}`}
          onRow={(batch) => ({
            onClick: batch.source === "production" ? () => openBatchModal(batch, "production") : undefined,
            className: batch.source === "production" ? "cursor-pointer" : "",
          })}
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
          {expiryEnabled ? (
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
          ) : null}
          <div className="pt-2">
            <Button type="primary" block onClick={toggleFiltersOpen} className="!border-0 !shadow-none">
              Show {filteredBatches.length} batch{filteredBatches.length === 1 ? "" : "es"}
            </Button>
          </div>
        </div>
      </Drawer>

      {selectedBatch ? (
        <>
        <ProductionBatchDetailModal batch={selectedBatch} open={activeBatchModal === "production"} toggle={closeBatchModal} currencyCode={storeCurrencyCode} />
          <BatchAdjustmentModal batch={selectedBatch} open={activeBatchModal === "adjust"} toggle={closeBatchModal} onSaved={onBatchChanged} />
          <BatchTransferModal batch={selectedBatch} open={activeBatchModal === "transfer"} toggle={closeBatchModal} onSaved={onBatchChanged} />
          <BatchDisassembleModal batch={selectedBatch} product={product} open={activeBatchModal === "disassemble"} toggle={closeBatchModal} onSaved={onBatchChanged} />
        </>
      ) : null}
    </div>
  );
}
