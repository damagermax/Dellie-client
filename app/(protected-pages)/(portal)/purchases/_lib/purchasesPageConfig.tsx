"use client";

import Link from "next/link";
import { Tag } from "antd";
import type { TableProps } from "antd/es/table";

import { formatDate } from "@/lib/dateUtils";
import type { Purchase } from "@/types/index";
import { TransactionBalancePill } from "@/components/ui/TransactionBalancePill";

export function buildPurchaseColumns(): TableProps<Purchase>["columns"] {
  return [
    {
      title: "#Number",
      key: "purchaseNumber",
      className: "!pl-8",
      render: (_, purchase) => (
        <Link href={`/purchases/${purchase.id}`} className="font-medium !text-gray-700 hover:!text-indigo-600">
          {purchase.purchaseNumber}
        </Link>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, purchase) =>
        purchase.isDeleted ? (
          <Tag className="!m-0 !rounded-full !px-2" color="red">
            Cancelled
          </Tag>
        ) : (
          <Tag className="!m-0 !rounded-full !px-2 capitalize" color={purchase.receiptStatus === "received" ? "green" : purchase.receiptStatus === "partially_received" ? "gold" : "blue"}>
            {purchase.receiptStatus.replaceAll("_", " ")}
          </Tag>
        ),
    },
    { title: "Supplier", key: "supplier", render: (_, purchase) => purchase.contactId?.name || "-" },
    { title: "Location", key: "location", render: (_, purchase) => purchase.locationId?.name || "-" },
    { title: "Date", key: "date", render: (_, purchase) => formatDate(purchase.date) },
    {
      title: "Total Amount",
      key: "amount",
      render: (_, purchase) => (
        <p>
          {purchase.currencyId?.code || ""} {Number(purchase.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
      ),
    },
    {
      title: "Balance",
      key: "balance",
      render: (_, purchase) => <TransactionBalancePill balance={Number(purchase.balance || 0)} currencyCode={purchase.currencyId?.code || ""} />,
    },
  ];
}
