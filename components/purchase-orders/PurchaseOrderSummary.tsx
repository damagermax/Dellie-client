"use client";

import { Divider, Modal, Table, Tag } from "antd";
import type { TableProps } from "antd/es/table";
import { Package } from "lucide-react";
import PreviewImage from "@/components/ui/PreviewImage";
import { Purchase, PurchaseLineItem } from "@/types/index";
import { ResolvedProductName } from "@/components/products/ResolvedProductName";

interface PurchaseOrderSummaryProps {
  purchase: Purchase;
  canManage?: boolean;
  canReceive?: boolean;
  onReceive?: () => void;
  onAddLandedCost?: () => void;
  onRecordPayment?: () => void;
}

export default function PurchaseOrderSummary({ purchase }: PurchaseOrderSummaryProps) {
  const isCancelled = Boolean(purchase.isDeleted);
  const currency = purchase.currencyId?.code || "";
  const paid = Number(purchase.amount) - Number(purchase.balance);
  const discountedSubtotal = Math.max(Number(purchase.subTotal) - Number(purchase.discountAmount || 0), 0);
  const taxSummary = Object.entries(
    (purchase.taxes || []).reduce<Record<string, number>>((summary, tax) => {
      const name = purchase.taxId ? `${tax.name} @${tax.value}%` : tax.name;
      summary[name] = (summary[name] || 0) + Number(tax.amount || 0);
      return summary;
    }, {}),
  ).map(([name, amount]) => ({ name, amount }));

  return (
    <aside id="purchase-summary" className="w-full scroll-mt-14 border-t border-gray-200 bg-gray-50 px-5 pb-8 pt-6 lg:w-[30%] lg:border-l lg:border-t-0 lg:px-7">
      <div className="border-b border-gray-200 ">
        <div className="mb-5 flex justify-between items-center">
          <h2 className=" text-base font-medium text-gray-900">Purchase Summary</h2>

          {!isCancelled && (
            <Tag className=" px-3 !rounded-full capitalize" color={purchase.paymentStatus === "paid" ? "green" : purchase.paymentStatus === "partial" ? "orange" : "blue"}>
              {purchase.paymentStatus}
            </Tag>
          )}
        </div>
        <Summary label="Items Total" value={money(currency, purchase.subTotal)} />
        <Summary label="Discount" value={`- ${money(currency, Number(purchase.discountAmount || 0))}`} />
        <Summary label="Subtotal" value={money(currency, discountedSubtotal)} />
        {taxSummary.length ? taxSummary.map((tax) => <Summary key={tax.name} label={tax.name} value={money(currency, tax.amount)} />) : Number(purchase.taxAmount || 0) > 0 && <Summary label="Taxes" value={money(currency, Number(purchase.taxAmount))} />}
        <Divider className="my-3" />
        <Summary label="Total" value={money(currency, purchase.amount)} strong />
        <Summary label="Paid" value={money(currency, paid)} />
        <Divider className="my-3" />
        <Summary label="Balance" value={money(currency, purchase.balance)} strong />
      </div>
    </aside>
  );
}

function money(currency: string, value: number | undefined) {
  const amount = Number(value || 0);
  const prefix = amount < 0 ? "-" : "";
  return `${prefix}${currency} ${Math.abs(amount).toFixed(2)}`;
}

function Summary({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`mb-3 flex justify-between text-sm ${strong ? "font-semibold" : ""}`}>
      <span className="text-gray-600">{label}</span>
      <span>{value}</span>
    </div>
  );
}

export function CostBreakdownModal({ open, onClose, purchase, currency }: { open: boolean; onClose: () => void; purchase: Purchase; currency: string }) {
  const totalPurchaseCost = purchase.lineItems.reduce((sum, line) => sum + Number(line.baseTotal || line.total || 0), 0);
  const totalLandedCost = purchase.lineItems.reduce((sum, line) => sum + Number(line.allocatedLandedCost ?? line.landedCost ?? 0), 0);
  const finalInventoryCost = purchase.lineItems.reduce((sum, line) => sum + Number(line.finalLineCost || line.baseTotal || line.total || 0), 0);
  const columns: TableProps<PurchaseLineItem>["columns"] = [
    {
      title: "Item",
      key: "item",
      width: 200,
      fixed: "left",

      render: (_, line) => (
        <div className="flex items-center gap-3">
          <CostItemImage src={line.productUrl || productImage(line.productId)} />
          <div className="min-w-0">
            <ResolvedProductName name={line.productName} product={line.productId} className="line-clamp-1 font-medium text-gray-950" />
            {line.productSku ? <p className="text-xs text-gray-500">SKU: {line.productSku}</p> : null}
          </div>
        </div>
      ),
    },
    { title: "Qty", dataIndex: "quantity", key: "quantity", width: 80, render: (value) => Number(value || 0).toLocaleString() },
    { title: "Purchase Unit", key: "unitPrice", width: 130, align: "right", render: (_, line) => money(currency, Number(line.baseUnitPrice || line.unitPrice || 0)) },
    { title: "Purchase Total", key: "purchaseTotal", width: 140, align: "right", render: (_, line) => money(currency, Number(line.baseTotal || line.total || 0)) },
    { title: "Landed Cost", key: "landedCost", width: 130, align: "right", render: (_, line) => money(currency, Number(line.allocatedLandedCost ?? line.landedCost ?? 0)) },
    { title: "Final Unit", key: "finalUnit", width: 120, align: "right", render: (_, line) => money(currency, Number(line.finalUnitCost || line.baseUnitPrice || line.unitPrice || 0)) },
    { title: "Final Total", key: "finalTotal", width: 130, align: "right", fixed: "right", render: (_, line) => <span className="font-semibold text-gray-950">{money(currency, Number(line.finalLineCost || line.baseTotal || line.total || 0))}</span> },
  ];

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={1080} title="Cost Breakdown" className="purchase-cost-breakdown-modal">
      <div className="space-y-4 p-5">
        <p className="text-sm text-gray-500">All amounts shown in {currency} base currency.</p>
        <div className="grid grid-cols-1 gap-2 pb-5 sm:grid-cols-3">
          <CostStat label="Purchase Cost" value={money(currency, totalPurchaseCost)} />
          <CostStat label="Landed Cost" value={money(currency, totalLandedCost)} />
          <CostStat label="Final Cost" value={money(currency, finalInventoryCost)} strong />
        </div>

        <div className="divide-y divide-gray-200 border-y border-gray-200 md:hidden">
          {purchase.lineItems.map((line) => (
            <div key={line.id} className="py-4">
              <div className="flex items-center gap-3"><CostItemImage src={line.productUrl || productImage(line.productId)} /><div className="min-w-0 flex-1"><ResolvedProductName name={line.productName} product={line.productId} className="truncate font-medium text-gray-950" /><p className="text-xs text-gray-500">SKU: {line.productSku || "-"}</p></div><p className="font-semibold text-gray-950">{money(currency, Number(line.finalLineCost || line.baseTotal || line.total || 0))}</p></div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-sm"><CostMetric label="Qty" value={Number(line.quantity || 0).toLocaleString()} /><CostMetric label="Purchase" value={money(currency, Number(line.baseUnitPrice || line.unitPrice || 0))} /><CostMetric label="Final unit" value={money(currency, Number(line.finalUnitCost || line.baseUnitPrice || line.unitPrice || 0))} /></div>
              {line.landedCostBreakdown?.length ? <div className="mt-3 border-t border-gray-100 pt-3">{line.landedCostBreakdown.map((cost, index) => <div key={`${line.id}-${cost.landedCostId || cost.name || index}`} className="flex justify-between gap-3 py-1 text-sm"><span className="text-gray-500">{cost.name || "Landed cost"}</span><span className="font-medium text-gray-900">{money(currency, Number(cost.baseAllocatedAmount || 0))}</span></div>)}</div> : null}
            </div>
          ))}
        </div>
        <div className="hidden md:block"><Table<PurchaseLineItem> rowKey="id" size="small" columns={columns} dataSource={purchase.lineItems} pagination={false} tableLayout="fixed" scroll={{ x: 1180 }} expandable={{ rowExpandable: (line) => Boolean(line.landedCostBreakdown?.length), expandedRowRender: (line) => <LineCostBreakdownTable line={line} currency={currency} /> }} /></div>
      </div>
    </Modal>
  );
}

function productImage(product: PurchaseLineItem["productId"]) {
  return typeof product === "string" ? undefined : product.media?.[0]?.url;
}

function CostItemImage({ src }: { src?: string }) {
  if (!src) {
    return (
      <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-400">
        <Package size={16} strokeWidth={2} />
      </div>
    );
  }

  return <PreviewImage width={34} height={34} src={src} />;
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
          // { title: "Actual", key: "allocatedAmount", align: "right", render: (_, row) => money(row.currencyCode, Number(row.allocatedAmount || 0)) },
          { title: " Allocated cost", key: "baseAllocatedAmount", align: "right", render: (_, row) => money(currency, Number(row.baseAllocatedAmount || 0)) },
          //{ title: "Actual / Unit", key: "allocatedPerUnit", align: "right", render: (_, row) => money(row.currencyCode, Number(row.allocatedPerUnit || 0)) },
          { title: "Unit Cost", key: "baseAllocatedPerUnit", align: "right", render: (_, row) => money(currency, Number(row.baseAllocatedPerUnit || 0)) },
        ]}
      />
    </div>
  );
}

function CostStat({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-md bg-gray-100 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-1 text-sm ${strong ? "font-semibold text-gray-950" : "font-medium text-gray-800"}`}>{value}</p>
    </div>
  );
}

function CostMetric({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-gray-500">{label}</p><p className="mt-1 font-medium text-gray-900">{value}</p></div>;
}
