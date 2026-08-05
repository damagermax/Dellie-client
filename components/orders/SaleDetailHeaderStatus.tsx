"use client";

import { Tag } from "antd";

import type { Sale } from "@/types/index";
import { paymentStatusLabel } from "@/components/shared/paymentStatusLabel";
import { saleFulfillmentStatusLabel } from "@/components/orders/saleUtils";

type SaleDetailHeaderStatusProps = {
  sale: Sale;
  isCancelled: boolean;
  isQuote: boolean;
};

export function SaleDetailHeaderStatus({ sale, isCancelled, isQuote }: SaleDetailHeaderStatusProps) {
  const fulfillmentStatus = sale.receiptStatus || "pending";
  const statusTone = fulfillmentStatus === "received" ? "green" : fulfillmentStatus === "partially_received" ? "gold" : "blue";
  const sourceLabel = !sale.source || sale.source === "Manual Sale" ? "Manual Sales" : sale.source;
  const sourceTone = sourceLabel === "POS" ? "green" : sourceLabel === "Online Store" ? "blue" : sourceLabel === "Manual Sales" ? "gold" : "default";
  const isPickup = sale.fulfillmentMethod === "pickup";
  const showSourceTag = Boolean(sourceLabel);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!isCancelled && !isQuote ? <Tag className="!m-0 !rounded-full !px-2 capitalize" color={statusTone}>{saleFulfillmentStatusLabel(fulfillmentStatus)}</Tag> : null}
      {!isCancelled && !isQuote ? <Tag className="!m-0 !rounded-full !px-2 capitalize" color={sale.paymentStatus === "paid" ? "green" : sale.paymentStatus === "partial" ? "orange" : "blue"}>{paymentStatusLabel(sale.paymentStatus)}</Tag> : null}
      {!isCancelled && isQuote ? <Tag className="!m-0 !rounded-full !px-2" color="purple">Quote</Tag> : null}
      {showSourceTag ? <Tag className="!m-0 !rounded-full !px-2" color={sourceTone}>{sourceLabel}</Tag> : null}
      {!isCancelled && !isQuote && isPickup ? <Tag className="!m-0 !rounded-full !px-2" color="cyan">Pickup</Tag> : null}
      {isCancelled ? <Tag className="!m-0 !rounded-full !px-2" color="red">Cancelled</Tag> : null}
    </div>
  );
}
