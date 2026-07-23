"use client";

import { Tag } from "antd";

import type { Purchase } from "@/types/index";
import { paymentStatusLabel } from "@/components/shared/paymentStatusLabel";

type PurchaseOrderDetailHeaderStatusProps = {
  purchase: Purchase;
  isCancelled: boolean;
};

export function PurchaseOrderDetailHeaderStatus({ purchase, isCancelled }: PurchaseOrderDetailHeaderStatusProps) {
  const receiptTone = purchase.receiptStatus === "received" ? "green" : purchase.receiptStatus === "partially_received" ? "gold" : "blue";

  return (
    <>
      {!isCancelled ? <Tag className="!m-0 !rounded-full !px-2 capitalize" color={receiptTone}>{purchase.receiptStatus.replaceAll("_", " ")}</Tag> : null}
      {!isCancelled ? <Tag className="!m-0 !rounded-full !px-2 capitalize" color={purchase.paymentStatus === "paid" ? "green" : purchase.paymentStatus === "partial" ? "orange" : "blue"}>{paymentStatusLabel(purchase.paymentStatus)}</Tag> : null}
      {isCancelled ? <Tag className="!m-0 !rounded-full !px-2" color="red">Cancelled</Tag> : null}
    </>
  );
}
