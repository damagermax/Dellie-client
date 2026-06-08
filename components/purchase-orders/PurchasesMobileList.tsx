"use client";

import { MenuProps, Tag } from "antd";
import Link from "next/link";
import { ActionDropdown } from "@/components/ui/ActionDropdown";
import { formatDate } from "@/lib/dateUtils";
import { Purchase } from "@/types/purchase";

interface PurchasesMobileListProps {
  purchases: Purchase[];
  getActions: (purchase: Purchase) => MenuProps["items"];
}

const statusColor = (status?: string) => {
  if (status === "paid" || status === "received") return "green";
  if (status === "partial" || status === "partially_received") return "gold";
  return "blue";
};

export default function PurchasesMobileList({ purchases, getActions }: PurchasesMobileListProps) {
  return (
    <div className="md:hidden">
      {purchases.map((purchase) => {
        const supplier = purchase.contactId?.displayName || purchase.contactId?.name || "-";
        const currency = purchase.currencyId?.code || "";

        return (
          <div key={purchase.id} className="flex items-start gap-3 border-b border-gray-100 px-4 py-4">
            <Link href={`/purchases/${purchase.id}`} className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-gray-900">{purchase.purchaseNumber}</p>
                  <p className="mt-1 truncate text-sm text-gray-500">{supplier}</p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-gray-900">
                  {currency} {Number(purchase.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span>{formatDate(purchase.date)}</span>
                <Tag className="!m-0 !rounded-full !px-2 capitalize" color={statusColor(purchase.paymentStatus)}>
                  {purchase.paymentStatus}
                </Tag>
                <Tag className="!m-0 !rounded-full !px-2 capitalize" color={statusColor(purchase.receiptStatus)}>
                  {purchase.receiptStatus?.replaceAll("_", " ")}
                </Tag>
              </div>
            </Link>
            <ActionDropdown menu={{ items: getActions(purchase) }} />
          </div>
        );
      })}
    </div>
  );
}
