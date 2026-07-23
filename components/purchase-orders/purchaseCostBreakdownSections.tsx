"use client";

import { Modal, Table } from "antd";
import type { TableProps } from "antd/es/table";

import { Purchase, PurchaseLineItem } from "@/types/index";

import { buildCostBreakdownTotals, CostMetric, CostStat, money, PurchaseLineCostBreakdown } from "./purchaseSummaryShared";

export function CostBreakdownModal({ open, onClose, purchase, currency }: { open: boolean; onClose: () => void; purchase: Purchase; currency: string }) {
  const totals = buildCostBreakdownTotals(purchase);
  const columns = buildCostBreakdownColumns(currency);

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={1250} title="Cost Breakdown" className="purchase-cost-breakdown-modal">
      <div className="space-y-4 p-5">
        <p className="text-sm text-gray-500">All amounts shown in {currency} base currency.</p>
        <div className="grid grid-cols-1 gap-2 pb-5 sm:grid-cols-3">
          <CostStat label="Purchase Cost" value={money(currency, totals.totalPurchaseCost)} />
          <CostStat label="Landed Cost" value={money(currency, totals.totalLandedCost)} />
          <CostStat label="Final Cost" value={money(currency, totals.finalInventoryCost)} strong />
        </div>

        <MobileCostBreakdownList purchase={purchase} currency={currency} />

        <div className="hidden md:block">
          <Table<PurchaseLineItem>
            rowKey="id"
            size="small"
            columns={columns}
            dataSource={purchase.lineItems}
            pagination={false}
            tableLayout="fixed"
            scroll={{ x: 1180 }}
            expandable={{
              rowExpandable: (line) => Boolean(line.landedCostBreakdown?.length),
              expandedRowRender: (line) => <LineCostBreakdownTable line={line} currency={currency} />,
            }}
          />
        </div>
      </div>
    </Modal>
  );
}

function buildCostBreakdownColumns(currency: string): TableProps<PurchaseLineItem>["columns"] {
  return [
    {
      title: "Item",
      key: "item",
      width: 200,
      fixed: "left",
      render: (_, line) => <PurchaseLineCostBreakdown line={line} />,
    },
    { title: "Qty", dataIndex: "quantity", key: "quantity", width: 80, render: (value) => Number(value || 0).toLocaleString() },
    { title: "Purchase Unit", key: "unitPrice", width: 130, align: "right", render: (_, line) => money(currency, Number(line.baseUnitPrice || line.unitPrice || 0)) },
    { title: "Purchase Total", key: "purchaseTotal", width: 140, align: "right", render: (_, line) => money(currency, Number(line.baseTotal || line.total || 0)) },
    { title: "Landed Cost", key: "landedCost", width: 130, align: "right", render: (_, line) => money(currency, Number(line.allocatedLandedCost ?? line.landedCost ?? 0)) },
    { title: "Final Unit", key: "finalUnit", width: 120, align: "right", render: (_, line) => money(currency, Number(line.finalUnitCost || line.baseUnitPrice || line.unitPrice || 0)) },
    { title: "Final Total", key: "finalTotal", width: 130, align: "right", fixed: "right", render: (_, line) => <span className="font-semibold text-gray-950">{money(currency, Number(line.finalLineCost || line.baseTotal || line.total || 0))}</span> },
  ];
}

function MobileCostBreakdownList({ purchase, currency }: { purchase: Purchase; currency: string }) {
  return (
    <div className="divide-y divide-gray-200 border-y border-gray-200 md:hidden">
      {purchase.lineItems.map((line) => (
        <div key={line.id} className="py-4">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <PurchaseLineCostBreakdown line={line} />
            </div>
            <p className="font-semibold text-gray-950">{money(currency, Number(line.finalLineCost || line.baseTotal || line.total || 0))}</p>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
            <CostMetric label="Qty" value={Number(line.quantity || 0).toLocaleString()} />
            <CostMetric label="Purchase" value={money(currency, Number(line.baseUnitPrice || line.unitPrice || 0))} />
            <CostMetric label="Final unit" value={money(currency, Number(line.finalUnitCost || line.baseUnitPrice || line.unitPrice || 0))} />
          </div>
          {line.landedCostBreakdown?.length ? (
            <div className="mt-3 border-t border-gray-100 pt-3">
              {line.landedCostBreakdown.map((cost, index) => (
                <div key={`${line.id}-${cost.landedCostId || cost.name || index}`} className="flex justify-between gap-3 py-1 text-sm">
                  <span className="text-gray-500">{cost.name || "Landed cost"}</span>
                  <span className="font-medium text-gray-900">{money(currency, Number(cost.baseAllocatedAmount || 0))}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function LineCostBreakdownTable({ line, currency }: { line: PurchaseLineItem; currency: string }) {
  const rows = line.landedCostBreakdown || [];

  return (
    <div className="rounded-md bg-gray-50 p-3">
      <Table
        rowKey={(row, index) => `${line.id}-${row.landedCostId || row.name || index}`}
        size="small"
        pagination={false}
        dataSource={rows}
        columns={[
          { title: "Landed Cost", dataIndex: "name", key: "name", render: (value) => value || "Landed cost" },
          { title: "Method", dataIndex: "allocationMethod", key: "allocationMethod", render: (value) => value?.replaceAll("_", " ").toLowerCase() || "allocated" },
          { title: " Allocated cost", key: "baseAllocatedAmount", align: "right", render: (_, row) => money(currency, Number(row.baseAllocatedAmount || 0)) },
          { title: "Unit Cost", key: "baseAllocatedPerUnit", align: "right", render: (_, row) => money(currency, Number(row.baseAllocatedPerUnit || 0)) },
        ]}
      />
    </div>
  );
}
