"use client";

import { Divider, Tag } from "antd";
import { Purchase } from "@/types/index";

interface PurchaseOrderSummaryProps {
  purchase: Purchase;
  canReceive?: boolean;
  onReceive?: () => void;
  onAddLandedCost?: () => void;
  onRecordPayment?: () => void;
}

export default function PurchaseOrderSummary({ purchase }: PurchaseOrderSummaryProps) {
  const isCancelled = Boolean(purchase.isDeleted);
  const currency = purchase.currencyId?.code || "";
  const paid = Math.max(Number(purchase.amount) - Number(purchase.balance), 0);
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
        <Summary label="Items Total" value={`${currency} ${purchase.subTotal.toFixed(2)}`} />
        <Summary label="Discount" value={`- ${currency} ${Number(purchase.discountAmount || 0).toFixed(2)}`} />
        <Summary label="Subtotal" value={`${currency} ${discountedSubtotal.toFixed(2)}`} />
        {taxSummary.length
          ? taxSummary.map((tax) => <Summary key={tax.name} label={tax.name} value={`${currency} ${tax.amount.toFixed(2)}`} />)
          : Number(purchase.taxAmount || 0) > 0 && <Summary label="Taxes" value={`${currency} ${Number(purchase.taxAmount).toFixed(2)}`} />}
        <Divider className="my-3" />
        <Summary label="Total" value={`${currency} ${purchase.amount.toFixed(2)}`} strong />
        <Summary label="Paid" value={`${currency} ${paid.toFixed(2)}`} />

        {/* <Summary label="Landed Costs" value={`${currency} ${Number(purchase.landedCostTotal || 0).toFixed(2)}`} /> */}
        <Divider className="my-3" />
        <Summary label="Balance" value={`${currency} ${purchase.balance.toFixed(2)}`} strong />
      </div>
    </aside>
  );
}

function Summary({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`mb-3 flex justify-between text-sm ${strong ? "font-semibold" : ""}`}>
      <span className="text-gray-600">{label}</span>
      <span>{value}</span>
    </div>
  );
}
