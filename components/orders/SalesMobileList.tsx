"use client";

import { MenuProps, Tag } from "antd";
import Link from "next/link";
import { ActionDropdown } from "@/components/ui/ActionDropdown";
import { formatDate } from "@/lib/dateUtils";
import { Sale } from "@/types/sale";
import { saleDocumentNumber } from "./saleUtils";

interface SalesMobileListProps {
  sales: Sale[];
  getActions: (sale: Sale) => MenuProps["items"];
}

const statusColor = (status?: string) => {
  if (status === "paid" || status === "received") return "green";
  if (status === "partial" || status === "partially_received") return "gold";
  return "blue";
};

export default function SalesMobileList({ sales, getActions }: SalesMobileListProps) {
  return (
    <div className="md:hidden">
      {sales.map((sale) => {
        const customer = sale.contactId?.displayName || sale.contactId?.name || "Walk-in Customer";
        const currency = sale.currencyId?.code || "";

        return (
          <div key={sale.id} className="flex items-start gap-3 border-b border-gray-100 px-4 py-4">
            <Link href={`/orders/${sale.id}`} className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-gray-900">{saleDocumentNumber(sale)}</p>
                  <p className="mt-1 truncate text-sm text-gray-500">{customer}</p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-gray-900">
                  {currency} {Number(sale.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span>{formatDate(sale.date)}</span>
                {sale.source && <span>{sale.source}</span>}
                <Tag className="!m-0 !rounded-full !px-2 capitalize" color={statusColor(sale.paymentStatus)}>
                  {sale.paymentStatus}
                </Tag>
                <Tag className="!m-0 !rounded-full !px-2 capitalize" color={statusColor(sale.receiptStatus)}>
                  {sale.receiptStatus?.replaceAll("_", " ")}
                </Tag>
              </div>
            </Link>
            <ActionDropdown menu={{ items: getActions(sale) }} />
          </div>
        );
      })}
    </div>
  );
}
