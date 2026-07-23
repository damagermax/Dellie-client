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
  const sourceTone = sale.source === "POS" ? "green" : sale.source === "Online Store" ? "blue" : sale.source === "Sales Order" ? "gold" : "default";
  const isPickup = sale.fulfillmentMethod === "pickup";
  const showSourceTag = (sale.source || "Manual Sale") !== "Manual Sale";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!isCancelled && !isQuote ? <Tag className="!m-0 !rounded-full !px-2 capitalize" color={statusTone}>{saleFulfillmentStatusLabel(fulfillmentStatus)}</Tag> : null}
      {!isCancelled && !isQuote ? <Tag className="!m-0 !rounded-full !px-2 capitalize" color={sale.paymentStatus === "paid" ? "green" : sale.paymentStatus === "partial" ? "orange" : "blue"}>{paymentStatusLabel(sale.paymentStatus)}</Tag> : null}
      {!isCancelled && isQuote ? <Tag className="!m-0 !rounded-full !px-2" color="purple">Estimate</Tag> : null}
      {showSourceTag ? <Tag className="!m-0 !rounded-full !px-2" color={sourceTone}>{sale.source || "Manual Sale"}</Tag> : null}
      {!isCancelled && !isQuote && isPickup ? <Tag className="!m-0 !rounded-full !px-2" color="cyan">Pickup</Tag> : null}
      {isCancelled ? <Tag className="!m-0 !rounded-full !px-2" color="red">Cancelled</Tag> : null}
    </div>
  );
}
