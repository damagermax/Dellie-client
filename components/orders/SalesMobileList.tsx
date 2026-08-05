"use client";

import { Tag } from "antd";
import { Globe, Store } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/dateUtils";
import { paymentStatusLabel } from "@/components/shared/paymentStatusLabel";
import { Sale } from "@/types/sale";
import { saleDocumentNumber, saleFulfillmentStatusLabel } from "./saleUtils";

interface SalesMobileListProps {
  sales: Sale[];
}

const mobileTagClassName = "!m-0 !rounded-full !border-0 !px-1.5 !py-0 !text-[10px] !leading-5";

const statusColor = (status?: string) => {
  if (status === "paid" || status === "received") return "green";
  if (status === "partial" || status === "partially_received") return "gold";
  return "blue";
};

function SaleSourceIcon({ source }: { source?: string }) {
  if (source === "POS") {
    return (
      <span className="inline-flex h-[18px] w-[18px] items-center justify-center text-gray-500" title="POS">
        <Store size={13} />
      </span>
    );
  }

  if (source === "Online Store") {
    return (
      <span className="inline-flex h-[18px] w-[18px] items-center justify-center text-blue-600" title="Website">
        <Globe size={13} />
      </span>
    );
  }

  return null;
}

export default function SalesMobileList({ sales }: SalesMobileListProps) {
  return (
    <div className="md:hidden">
      {sales.map((sale) => {
        const customer = sale.contactId?.name || "Walk-in Customer";
        const currency = sale.currencyId?.code || "";
        const sourceLabel = sale.source === "POS" || sale.source === "Online Store" ? sale.source : undefined;

        return (
          <div key={sale.id} className="gap-3 border-b border-gray-100 px-4 py-4">
            <Link href={`/orders/${sale.id}`} className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className=" flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <p className="truncate text-[15px] font-semibold text-gray-900">{saleDocumentNumber(sale)}</p>

                    {sourceLabel ? <SaleSourceIcon source={sourceLabel} /> : null}
                    {sale.fulfillmentMethod === "pickup" && (
                      <Tag className={mobileTagClassName} color="cyan">
                        Pickup
                      </Tag>
                    )}
                    <Tag className={`${mobileTagClassName} capitalize`} color={statusColor(sale.paymentStatus)}>
                      {paymentStatusLabel(sale.paymentStatus)}
                    </Tag>
                    <Tag className={`${mobileTagClassName} capitalize`} color={statusColor(sale.receiptStatus)}>
                      {saleFulfillmentStatusLabel(sale.receiptStatus)}
                    </Tag>
                  </div>
                </div>
                <p className="shrink-0 text-sm font-semibold text-gray-900">
                  {currency} {Number(sale.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </Link>

            <div className=" mt-2 flex items-center justify-between">
              <p className="mt-1 truncate text-sm text-gray-500">
                {customer} | <span>{formatDate(sale.date)}</span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
