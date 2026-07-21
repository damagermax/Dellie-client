"use client";

import { Divider, Tag } from "antd";

import { Purchase } from "@/types/index";

import { CostBreakdownModal } from "./purchaseCostBreakdownSections";
import { buildPurchaseSummary, money, SummaryRow } from "./purchaseSummaryShared";

export function PurchaseSummaryPanel({ purchase }: { purchase: Purchase }) {
  const summary = buildPurchaseSummary(purchase);

  return (
    <aside id="purchase-summary" className="w-full scroll-mt-14 border-t border-gray-200 bg-gray-50 px-5 pb-8 pt-6 lg:w-[30%] lg:border-l lg:border-t-0 lg:px-7">
      <div className="border-b border-gray-200">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-medium text-gray-900">Purchase Summary</h2>
          {!summary.isCancelled ? (
            <Tag className="px-3 !rounded-full capitalize" color={purchase.paymentStatus === "paid" ? "green" : purchase.paymentStatus === "partial" ? "orange" : "blue"}>
              {purchase.paymentStatus}
            </Tag>
          ) : null}
        </div>
        <SummaryRow label="Items Total" value={money(summary.currency, purchase.subTotal)} />
        <SummaryRow label="Discount" value={`- ${money(summary.currency, Number(purchase.discountAmount || 0))}`} />
        <SummaryRow label="Subtotal" value={money(summary.currency, summary.discountedSubtotal)} />
        {summary.taxSummary.length
          ? summary.taxSummary.map((tax) => <SummaryRow key={tax.name} label={tax.name} value={money(summary.currency, tax.amount)} />)
          : Number(purchase.taxAmount || 0) > 0
            ? <SummaryRow label="Taxes" value={money(summary.currency, Number(purchase.taxAmount))} />
            : null}
        <Divider className="my-3" />
        <SummaryRow label="Total" value={money(summary.currency, purchase.amount)} strong />
        <SummaryRow label="Paid" value={money(summary.currency, summary.paid)} />
        <Divider className="my-3" />
        <SummaryRow label="Balance" value={money(summary.currency, purchase.balance)} strong />
      </div>
    </aside>
  );
}

export { buildPurchaseSummary, CostBreakdownModal };
