"use client";

import { Divider, Tag } from "antd";
import { Sale } from "@/types/index";

interface SaleSummaryProps {
  sale: Sale;
}

export default function SaleSummary({ sale }: SaleSummaryProps) {
  const isCancelled = Boolean(sale.isDeleted);
  const isQuote = sale.status === "draft" && !isCancelled;
  const currency = sale.currencyId?.code || "";
  const paid = Number(sale.amount) - Number(sale.balance);
  const discountedSubtotal = Math.max(Number(sale.subTotal) - Number(sale.discountAmount || 0), 0);
  const taxSummary = Object.entries(
    (sale.taxes || []).reduce<Record<string, number>>((summary, tax) => {
      const name = sale.taxId ? `${tax.name} @${tax.value}%` : tax.name;
      summary[name] = (summary[name] || 0) + Number(tax.amount || 0);
      return summary;
    }, {}),
  ).map(([name, amount]) => ({ name, amount }));

  return (
    <aside id="sale-summary" className="w-full scroll-mt-14 border-t border-gray-200 bg-gray-50 px-5 pb-8 pt-6 lg:w-[30%] lg:border-l lg:border-t-0 lg:px-7">
      <div className="border-b border-gray-200 pb-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-medium text-gray-900">Sale Summary</h2>
          <div className="flex items-center gap-2">
            {!isCancelled && !isQuote && (
              <Tag className="px-3 !rounded-full capitalize" color={sale.paymentStatus === "paid" ? "green" : sale.paymentStatus === "partial" ? "orange" : "blue"}>
                {sale.paymentStatus}
              </Tag>
            )}
            {!isCancelled && isQuote && (
              <Tag className="px-3 !rounded-full" color="purple">
                Estimate
              </Tag>
            )}
            <Tag className="px-3 !rounded-full" color={sale.source === "POS" ? "green" : sale.source === "Online Store" ? "blue" : sale.source === "Sales Order" ? "gold" : "default"}>
              {sale.source || "Manual Sale"}
            </Tag>
          </div>
        </div>
        <Summary label="Items Total" value={money(currency, Number(sale.subTotal))} />
        <Summary label="Discount" value={`- ${money(currency, Number(sale.discountAmount || 0))}`} />
        <Summary label="Subtotal" value={money(currency, discountedSubtotal)} />
        {taxSummary.length
          ? taxSummary.map((tax) => <Summary key={tax.name} label={tax.name} value={money(currency, tax.amount)} />)
          : Number(sale.taxAmount || 0) > 0 && <Summary label="Taxes" value={money(currency, Number(sale.taxAmount))} />}
        <Divider className="my-3" />
        <Summary label="Total" value={money(currency, Number(sale.amount))} strong />
        <Divider className="my-3" />
        <Summary label="Paid" value={money(currency, paid)} />
        <Summary label="Balance" value={money(currency, Number(sale.balance))} strong />
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
