"use client";

import { Divider, Tag } from "antd";
import { Sale } from "@/types/index";

interface SaleSummaryProps {
  sale: Sale;
}

export default function SaleSummary({ sale }: SaleSummaryProps) {
  const currency = sale.currencyId?.code || "";
  const paid = Math.max(Number(sale.amount) - Number(sale.balance), 0);
  const discountedSubtotal = Math.max(Number(sale.subTotal) - Number(sale.discountAmount || 0), 0);
  const taxSummary = Object.entries(
    (sale.taxes || []).reduce<Record<string, number>>((summary, tax) => {
      const name = sale.taxId ? `${tax.name} @${tax.value}%` : tax.name;
      summary[name] = (summary[name] || 0) + Number(tax.amount || 0);
      return summary;
    }, {}),
  ).map(([name, amount]) => ({ name, amount }));

  return (
    <aside className="w-full bg-gray-50 px-7 pb-8 pt-6 lg:w-[30%]">
      <div className="border-b border-gray-200 pb-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-medium text-gray-900">Sale Summary</h2>
          <Tag className="px-3 !rounded-full capitalize" color={sale.paymentStatus === "paid" ? "green" : sale.paymentStatus === "partial" ? "orange" : "blue"}>
            {sale.paymentStatus}
          </Tag>
        </div>
        <Summary label="Items Total" value={`${currency} ${Number(sale.subTotal).toFixed(2)}`} />
        <Summary label="Discount" value={`- ${currency} ${Number(sale.discountAmount || 0).toFixed(2)}`} />
        <Summary label="Subtotal" value={`${currency} ${discountedSubtotal.toFixed(2)}`} />
        {taxSummary.length
          ? taxSummary.map((tax) => <Summary key={tax.name} label={tax.name} value={`${currency} ${tax.amount.toFixed(2)}`} />)
          : Number(sale.taxAmount || 0) > 0 && <Summary label="Taxes" value={`${currency} ${Number(sale.taxAmount).toFixed(2)}`} />}
        <Divider className="my-3" />
        <Summary label="Total" value={`${currency} ${Number(sale.amount).toFixed(2)}`} strong />
        <Divider className="my-3" />
        <Summary label="Paid" value={`${currency} ${paid.toFixed(2)}`} />
        <Summary label="Balance" value={`${currency} ${Number(sale.balance).toFixed(2)}`} strong />
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
