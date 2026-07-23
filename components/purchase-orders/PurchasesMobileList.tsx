"use client";

import { Tag } from "antd";
import Link from "next/link";
import { formatDate } from "@/lib/dateUtils";
import { paymentStatusLabel } from "@/components/shared/paymentStatusLabel";
import { Purchase } from "@/types/purchase";

interface PurchasesMobileListProps {
  purchases: Purchase[];
}

const mobileTagClassName = "!m-0 !rounded-full !border-0 !px-1.5 !py-0 !text-[10px] !leading-5";

const statusColor = (status?: string) => {
  if (status === "paid" || status === "received") return "green";
  if (status === "partial" || status === "partially_received") return "gold";
  return "blue";
};

export default function PurchasesMobileList({ purchases }: PurchasesMobileListProps) {
  return (
    <div className="md:hidden">
      {purchases.map((purchase) => {
        const supplier = purchase.contactId?.displayName || purchase.contactId?.name || "-";
        const currency = purchase.currencyId?.code || "";

        return (
          <div key={purchase.id} className=" border-b border-gray-100 px-4 py-4">
            <Link href={`/purchases/${purchase.id}`} className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className=" flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <p className="truncate text-[15px] font-semibold text-gray-900">{purchase.purchaseNumber}</p>

                    <Tag className={`${mobileTagClassName} capitalize`} color={statusColor(purchase.paymentStatus)}>
                      {paymentStatusLabel(purchase.paymentStatus)}
                    </Tag>
                    <Tag className={`${mobileTagClassName} capitalize`} color={statusColor(purchase.receiptStatus)}>
                      {purchase.receiptStatus?.replaceAll("_", " ")}
                    </Tag>
                  </div>

                  {/* <p className="mt-1 truncate text-sm text-gray-500">{location}</p> */}
                </div>
                <p className="shrink-0 text-sm font-semibold text-gray-900">
                  {currency} {Number(purchase.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </Link>

            <div className=" mt-2 flex justify-between">
              <p className=" truncate text-sm text-gray-500">
                {supplier} | <span>{formatDate(purchase.date)}</span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
