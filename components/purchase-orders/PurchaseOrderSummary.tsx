"use client";

import { useState } from "react";
import { Button, Divider, Modal, Table, Tag } from "antd";
import type { TableProps } from "antd/es/table";
import { Calculator, Package } from "lucide-react";
import { useGetCurrencyQuery, useGetStoreSettingsQuery } from "@/lib/redux/services";
import { Purchase, PurchaseLineItem } from "@/types/index";
import PreviewImage from "@/components/ui/PreviewImage";

interface PurchaseOrderSummaryProps {
  purchase: Purchase;
  canReceive?: boolean;
  onReceive?: () => void;
  onAddLandedCost?: () => void;
  onRecordPayment?: () => void;
}

export default function PurchaseOrderSummary({ purchase }: PurchaseOrderSummaryProps) {
  const [costOpen, setCostOpen] = useState(false);
  const isCancelled = Boolean(purchase.isDeleted);
  const currency = purchase.currencyId?.code || "";
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
  const { data: storeSettings } = useGetStoreSettingsQuery();
  const fallbackStoreCurrencyId = user?.store?.currencyId;
  const baseCurrencyId = storeSettings?.businessProfile?.currencyId || fallbackStoreCurrencyId;
  const { data: baseCurrencyRecord } = useGetCurrencyQuery(baseCurrencyId, { skip: !baseCurrencyId });
  const baseCurrency = baseCurrencyRecord?.code || user?.store?.currency?.code || user?.store?.currencyCode || user?.store?.settings?.currency || "";
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
    <aside className="w-full bg-gray-50 px-7 pb-8  pt-6 lg:w-[30%]">
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
        {Number(purchase.landedCostTotal || 0) > 0 && <Summary label="Landed Costs" value={money(currency, purchase.landedCostTotal)} />}
        <Divider className="my-3" />
        <Summary label="Balance" value={money(currency, purchase.balance)} strong />
      </div>
      <Button block icon={<Calculator size={16} />} className="mt-5 !h-11 !rounded-full !border-gray-300 !bg-white !font-medium !text-gray-900 !shadow-none" onClick={() => setCostOpen(true)}>
        View Cost Breakdown
      </Button>
      <CostBreakdownModal open={costOpen} onClose={() => setCostOpen(false)} purchase={purchase} currency={baseCurrency} />
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

function CostBreakdownModal({ open, onClose, purchase, currency }: { open: boolean; onClose: () => void; purchase: Purchase; currency: string }) {
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
            <p className="line-clamp-1 font-medium text-gray-950">{line.productName}</p>
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
        <div className="grid grid-cols-3 pb-5 gap-2">
          <CostStat label="Purchase Cost" value={money(currency, totalPurchaseCost)} />
          <CostStat label="Landed Cost" value={money(currency, totalLandedCost)} />
          <CostStat label="Final Cost" value={money(currency, finalInventoryCost)} strong />
        </div>

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
