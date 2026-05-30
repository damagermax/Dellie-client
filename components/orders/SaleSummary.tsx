"use client";

import { Button, Divider, Tag } from "antd";
import { CreditCard, FileText, PackageCheck, ReceiptText, RotateCcw } from "lucide-react";
import { BaseButton } from "@/components/ui/AppButtons";
import { Sale } from "@/types/index";
import { SaleDocumentType } from "./SaleShareDocumentModal";

interface SaleSummaryProps {
  sale: Sale;
  canFulfill: boolean;
  canReturn: boolean;
  onFulfill: () => void;
  onReturn: () => void;
  onRecordPayment: () => void;
  onShare: (type: SaleDocumentType) => void;
}

export default function SaleSummary({ sale, canFulfill, canReturn, onFulfill, onReturn, onRecordPayment, onShare }: SaleSummaryProps) {
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
        <h2 className="mb-5 text-base font-medium text-gray-900">Sale Summary</h2>
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
        <Tag className="mt-3 capitalize" color={sale.paymentStatus === "paid" ? "green" : sale.paymentStatus === "partial" ? "orange" : "blue"}>
          {sale.paymentStatus}
        </Tag>
      </div>
      <div className="pt-6">
        <h2 className="mb-4 text-base font-medium text-gray-900">Actions</h2>
        <div className="grid gap-3">
          <Button icon={<FileText size={15} />} onClick={() => onShare("invoice")}>
            Share Invoice
          </Button>
          <Button icon={<ReceiptText size={15} />} onClick={() => onShare("receipt")}>
            Share Receipt
          </Button>
          <Button icon={<PackageCheck size={15} />} disabled={!canFulfill} onClick={onFulfill}>
            Fulfill Sale
          </Button>
          <Button icon={<RotateCcw size={15} />} disabled={!canReturn} onClick={onReturn}>
            Return Stock
          </Button>
          <BaseButton icon={<CreditCard size={15} />} label="Record Payment" size="middle" onClick={onRecordPayment} />
        </div>
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
