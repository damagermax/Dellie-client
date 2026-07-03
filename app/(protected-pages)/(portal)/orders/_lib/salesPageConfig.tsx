"use client";

import Link from "next/link";
import { Tag } from "antd";
import type { TableProps } from "antd/es/table";
import { formatDate } from "@/lib/dateUtils";
import type { Sale } from "@/types/index";
import { saleDocumentNumber, saleFulfillmentStatusLabel } from "@/components/orders/saleUtils";
import { TransactionBalancePill } from "@/components/ui/TransactionBalancePill";

const saleSourceLabel = (source?: string) => source || "Manual Sale";
const shouldShowSaleSourceTag = (source?: string) => saleSourceLabel(source) !== "Manual Sale";

const saleSourceColor = (source?: string) => {
  if (source === "POS") return "green";
  if (source === "Online Store") return "blue";
  if (source === "Sales Order") return "gold";
  return "default";
};

export function buildSalesColumns(): TableProps<Sale>["columns"] {
  return [
    {
      title: "# Number",
      key: "saleNumber",
      className: "!pl-8",
      render: (_, sale) => (
        <div className="flex items-center gap-2">
          <Link href={`/orders/${sale.id}`} className="font-medium !text-gray-700 hover:!text-indigo-600">
            {saleDocumentNumber(sale)}
          </Link>
          {shouldShowSaleSourceTag(sale.source) ? (
            <Tag className="!m-0 !rounded-full !px-2" color={saleSourceColor(sale.source)}>
              {saleSourceLabel(sale.source)}
            </Tag>
          ) : null}
          {sale.fulfillmentMethod === "pickup" ? (
            <Tag className="!m-0 !rounded-full !px-2" color="cyan">
              Pickup
            </Tag>
          ) : null}
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, sale) =>
        sale.isDeleted ? (
          <Tag className="!m-0 !rounded-full !px-2" color="red">
            Cancelled
          </Tag>
        ) : sale.status === "draft" ? (
          <Tag className="!m-0 !rounded-full !px-2" color="purple">
            Estimate
          </Tag>
        ) : (
          <Tag className="!m-0 !rounded-full !px-2 capitalize" color={sale.receiptStatus === "received" ? "green" : sale.receiptStatus === "partially_received" ? "gold" : "blue"}>
            {saleFulfillmentStatusLabel(sale.receiptStatus)}
          </Tag>
        ),
    },
    { title: "Customer", key: "customer", render: (_, sale) => sale.contactId?.name || sale.contactId?.displayName || "Walk-in Customer" },
    { title: "Date", key: "date", render: (_, sale) => formatDate(sale.date) },
    { title: "Location", key: "location", render: (_, sale) => sale.locationId?.name || "-" },
    { title: "Total Amount", key: "amount", render: (_, sale) => `${sale.currencyId?.code || ""} ${Number(sale.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
    {
      title: "Balance",
      key: "balance",
      render: (_, sale) => <TransactionBalancePill balance={Number(sale.balance || 0)} currencyCode={sale.currencyId?.code || ""} />,
    },
  ];
}
