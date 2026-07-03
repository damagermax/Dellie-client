"use client";

import { Metric, Panel } from "./shared";
import type { ProductDetail } from "./types";
import { formatMoney, formatQuantity } from "./utils";

export function PackagingSection({ product }: { product: ProductDetail }) {
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
