"use client";

import Link from "next/link";
import { Empty, Tag } from "antd";
import type { TableProps } from "antd/es/table";
import { useSelector } from "react-redux";

import AppTable from "@/components/ui/AppTable";
import { RootState } from "@/lib/store";

import type { ProductOrderHistoryItem } from "./types";
import { formatDate, formatMoney, formatQuantity, receiptStatusColor, saleSourceColor } from "./utils";

export function OrderHistoryTable({ orderHistory }: { orderHistory: ProductOrderHistoryItem[] }) {
  const storeCurrencyCode = useSelector((state: RootState) => state.currentStore?.currency?.code || state.currentUser?.store?.currency?.code || state.currentUser?.store?.currencyCode || "");

  const columns: TableProps<ProductOrderHistoryItem>["columns"] = [
    {
      title: "# Number",
      key: "documentNumber",
      className: "!pl-8",
      render: (_, order) => (
        <div className="flex items-center gap-2">
          <Link href={order.type === "purchase" ? `/purchases/${order.id}` : `/orders/${order.id}`} className="font-medium !text-gray-700 hover:!text-indigo-600">
            {order.documentNumber || "-"}
          </Link>
          {order.type === "sale" && order.source && order.source !== "Manual Sale" ? (
            <Tag className="!m-0 !rounded-full !px-2" color={saleSourceColor(order.source)}>
              {order.source}
            </Tag>
          ) : null}
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, order) =>
        order.isDeleted ? (
          <Tag className="!m-0 !rounded-full !px-2" color="red">
            Cancelled
          </Tag>
        ) : order.type === "sale" && order.status === "draft" ? (
          <Tag className="!m-0 !rounded-full !px-2" color="purple">
            Estimate
          </Tag>
        ) : (
          <Tag className="!m-0 !rounded-full !px-2 capitalize" color={receiptStatusColor(order.receiptStatus)}>
            {(order.receiptStatus || "pending").replaceAll("_", " ")}
          </Tag>
        ),
    },
    {
      title: "Contact",
      key: "contact",
      render: (_, order) => order.contactId?.displayName || order.contactId?.name || (order.type === "sale" ? "Walk-in Customer" : "-"),
    },
    { title: "Date", key: "date", render: (_, order) => formatDate(order.date) },
    { title: "Location", key: "location", render: (_, order) => order.locationId?.name || "-" },
    { title: "Quantity", key: "quantity", render: (_, order) => formatQuantity(order.quantity) },
    { title: "Total Amount", key: "amount", render: (_, order) => order.formattedTotal || formatMoney(order.amount, storeCurrencyCode) },
    { title: "Balance", key: "balance", render: (_, order) => order.formattedBalance || formatMoney(order.balance, storeCurrencyCode) },
  ];

  const emptyText = "No sales or purchases have been recorded for this product yet.";

  return orderHistory.length ? (
    <>
      <div className="divide-y divide-gray-200 border-y border-gray-200 md:hidden">
        {orderHistory.map((order) => (
          <Link key={order.id} href={order.type === "purchase" ? `/purchases/${order.id}` : `/orders/${order.id}`} className="block px-4 py-4 active:bg-gray-50">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-gray-950">{order.documentNumber || "-"}</p>
              </div>
              <p className="font-semibold text-gray-950">{order.formattedTotal || formatMoney(order.amount, storeCurrencyCode)}</p>
            </div>
            <div className="mt-1.5 flex justify-between text-xs text-gray-500">
              <p className="  text-gray-500">
                {order.contactId?.displayName || order.contactId?.name || (order.type === "sale" ? "Walk-in Customer" : "-")} <span className="capitalize">· {formatDate(order.date)}</span>
              </p>

              <span>{formatQuantity(order.quantity)} units</span>
            </div>
          </Link>
        ))}
      </div>
      <div className="hidden md:block">
        <AppTable<ProductOrderHistoryItem> columns={columns} dataSource={orderHistory} rowKey="id" pagination={false} />
      </div>
    </>
  ) : (
    <Empty className="py-10" description={emptyText} />
  );
}
