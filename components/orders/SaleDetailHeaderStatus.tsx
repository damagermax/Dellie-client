"use client";

import { Tag } from "antd";
import { Globe, Store } from "lucide-react";

import type { Sale } from "@/types/index";
import { paymentStatusLabel } from "@/components/shared/paymentStatusLabel";
import { saleDetailFulfillmentStatusLabel } from "@/components/orders/saleUtils";

type SaleDetailHeaderStatusProps = {
  sale: Sale;
  isCancelled: boolean;
  isQuote: boolean;
};

function SaleSourceIcon({ source }: { source?: string }) {
  if (source === "POS") {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500" title="POS">
        <Store size={14} />
      </span>
    );
  }

  if (source === "Online Store") {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-600" title="Website">
        <Globe size={14} />
      </span>
    );
  }

  return null;
}

export function SaleDetailHeaderStatus({ sale, isCancelled, isQuote }: SaleDetailHeaderStatusProps) {
  const fulfillmentStatus = sale.receiptStatus || "pending";
  const statusTone = fulfillmentStatus === "received" ? "green" : fulfillmentStatus === "partially_received" ? "gold" : "blue";
  const sourceLabel = sale.source === "POS" || sale.source === "Online Store" ? sale.source : undefined;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!isCancelled && !isQuote ? <Tag className="!m-0 !rounded-full !px-2" color={statusTone}>{saleDetailFulfillmentStatusLabel(sale)}</Tag> : null}
      {!isCancelled && !isQuote ? <Tag className="!m-0 !rounded-full !px-2 capitalize" color={sale.paymentStatus === "paid" ? "green" : sale.paymentStatus === "partial" ? "orange" : "blue"}>{paymentStatusLabel(sale.paymentStatus)}</Tag> : null}
      {!isCancelled && isQuote ? <Tag className="!m-0 !rounded-full !px-2" color="purple">Quote</Tag> : null}
      {sourceLabel ? <SaleSourceIcon source={sourceLabel} /> : null}
      {isCancelled ? <Tag className="!m-0 !rounded-full !px-2" color="red">Cancelled</Tag> : null}
    </div>
  );
}
