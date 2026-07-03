"use client";

import { DownOutlined, RightOutlined } from "@ant-design/icons";
import { format } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import { mockOrders, OrderViewItem, orderStatusConfig, sortOrdersByDate } from "./ordersViewData";

const OrderListItem = ({ order }: { order: OrderViewItem }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusConfig = orderStatusConfig[order.status];

  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:border-primary">
      <div className="p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsExpanded(!isExpanded)} className="text-gray-400 transition-colors hover:text-primary" aria-label={isExpanded ? "Collapse order details" : "Expand order details"}>
                {isExpanded ? <DownOutlined className="text-sm" /> : <RightOutlined className="text-sm" />}
              </button>
              <div>
                <Link href={`/orders/${order.id}`} className="block text-lg font-semibold text-gray-900 hover:text-primary">
                  #{order.orderNumber}
                </Link>
                <p className="text-sm text-gray-500">{format(new Date(order.date), "MMM d, yyyy • h:mm a")}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium capitalize" style={{ color: statusConfig.color, backgroundColor: statusConfig.bgColor }}>
              {order.status}
            </span>
            <span className="whitespace-nowrap text-lg font-semibold text-gray-900">GHS {order.total.toFixed(2)}</span>
          </div>
        </div>

        {isExpanded ? (
          <div className="mt-4 space-y-4 border-t border-gray-100 pt-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-500">Customer</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-700">
                    <div className="mr-3 w-5 text-gray-400" />
                    <span>{order.customer}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <span className="mr-3 w-5 text-gray-400">@</span>
                    <span>{order.contactEmail}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <span className="mr-3 w-5 text-gray-400">📱</span>
                    <span>{order.contactPhone}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-500">Shipping</h4>
                <p className="text-gray-700">{order.shippingAddress}</p>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="mb-3 text-sm font-medium text-gray-500">Order Items</h4>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-200 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">GHS {item.price.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <div className="text-sm text-gray-500">
                {order.itemsCount} item{order.itemsCount !== 1 ? "s" : ""} • {order.paymentMethod}
              </div>
              <Link href={`/orders/${order.id}`}>
                <button type="button" className="rounded bg-primary px-4 py-2 font-bold text-white hover:bg-primary/90">
                  View Full Details
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center text-sm text-gray-600">
                <div className="mr-2 text-gray-400" />
                <span className="mr-4">{order.customer}</span>
                <div className="mr-2 text-gray-400" />
                <span>
                  {order.itemsCount} item{order.itemsCount !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm capitalize text-gray-500">{order.paymentMethod}</span>
                <button type="button" className="text-primary hover:bg-primary/10" onClick={() => setIsExpanded(true)}>
                  Show details
                </button>
                <Link href={`/orders/${order.id}`}>
                  <button type="button" className="rounded bg-primary px-4 py-2 font-bold text-white hover:bg-primary/90">
                    View
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function OrdersListView() {
  const sortedOrders = sortOrdersByDate(mockOrders);

  return (
    <div className="space-y-4 px-8 pt-5">
      {sortedOrders.map((order) => (
        <OrderListItem key={order.id} order={order} />
      ))}
    </div>
  );
}
