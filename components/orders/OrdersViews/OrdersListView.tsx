"use client";

import { DownOutlined, RightOutlined } from "@ant-design/icons";
import { format } from "date-fns";
import Link from "next/link";
import { useState } from "react";

interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
    sku: string;
}

interface Order {
    id: string;
    orderNumber: string;
    date: string;
    customer: string;
    status: "pending" | "processing" | "fulfilled" | "cancelled" | "delivered";
    total: number;
    itemsCount: number;
    paymentMethod: string;
    items: OrderItem[];
    shippingAddress: string;
    contactEmail: string;
    contactPhone: string;
}

const statusColors = {
    pending: "#FFA500", // Orange
    processing: "#1890FF", // Blue
    fulfilled: "#52C41A", // Green
    cancelled: "#FF4D4F", // Red
    delivered: "722ED1", // Purple
};

const statusBgColors = {
    pending: "rgba(255, 165, 0, 0.1)",
    processing: "rgba(24, 144, 255, 0.1)",
    fulfilled: "rgba(82, 196, 26, 0.1)",
    cancelled: "rgba(255, 77, 79, 0.1)",
    delivered: "rgba(114, 46, 209, 0.1)",
};

const mockOrders: Order[] = [
    {
        id: "1",
        orderNumber: "ORD-001",
        date: "2023-06-15T10:30:00Z",
        customer: "John Doe",
        status: "processing",
        total: 299.99,
        itemsCount: 3,
        paymentMethod: "Credit Card",
        shippingAddress: "123 Main St, Accra, Ghana",
        contactEmail: "john.doe@example.com",
        contactPhone: "+233 24 123 4567",
        items: [
            { id: "101", name: "Wireless Earbuds Pro", quantity: 1, price: 199.99, sku: "WEB-001" },
            { id: "102", name: "Phone Case", quantity: 1, price: 29.99, sku: "PHC-045" },
            { id: "103", name: "Screen Protector", quantity: 2, price: 35.0, sku: "SP-112" },
        ],
    },
    {
        id: "2",
        orderNumber: "ORD-002",
        date: "2023-06-14T14:45:00Z",
        customer: "Jane Smith",
        status: "pending",
        total: 149.5,
        itemsCount: 2,
        paymentMethod: "PayPal",
        shippingAddress: "456 Oak Ave, Kumasi, Ghana",
        contactEmail: "jane.smith@example.com",
        contactPhone: "+233 20 987 6543",
        items: [
            { id: "201", name: "Bluetooth Speaker", quantity: 1, price: 89.99, sku: "BTS-022" },
            { id: "202", name: "USB-C Cable", quantity: 2, price: 29.75, sku: "UCC-117" },
        ],
    },
    {
        id: "3",
        orderNumber: "ORD-003",
        date: "2023-06-13T09:15:00Z",
        customer: "Robert Johnson",
        status: "delivered",
        total: 89.99,
        itemsCount: 1,
        paymentMethod: "Bank Transfer",
        shippingAddress: "789 Palm St, Takoradi, Ghana",
        contactEmail: "robert.j@example.com",
        contactPhone: "+233 27 555 1234",
        items: [{ id: "301", name: "Wireless Mouse", quantity: 1, price: 89.99, sku: "WM-056" }],
    },
    {
        id: "4",
        orderNumber: "ORD-004",
        date: "2023-06-12T16:20:00Z",
        customer: "Emily Davis",
        status: "cancelled",
        total: 199.99,
        itemsCount: 2,
        paymentMethod: "Credit Card",
        shippingAddress: "321 Pine Rd, Tamale, Ghana",
        contactEmail: "emily.d@example.com",
        contactPhone: "+233 54 321 9876",
        items: [
            { id: "401", name: "Laptop Stand", quantity: 1, price: 59.99, sku: "LS-012" },
            { id: "402", name: "Wireless Keyboard", quantity: 1, price: 140.0, sku: "WK-078" },
        ],
    },
];

const OrderListItem = ({ order }: { order: Order }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden transition-all hover:border-primary mb-4">
            <div className="p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-gray-400 hover:text-primary transition-colors"
                                aria-label={isExpanded ? "Collapse order details" : "Expand order details"}
                            >
                                {isExpanded ? <DownOutlined className="text-sm" /> : <RightOutlined className="text-sm" />}
                            </button>
                            <div>
                                <Link href={`/orders/${order.id}`} className="text-lg font-semibold text-gray-900 hover:text-primary block">
                                    #{order.orderNumber}
                                </Link>
                                <p className="text-sm text-gray-500">{format(new Date(order.date), "MMM d, yyyy • h:mm a")}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <span
                            className="text-xs font-medium px-2.5 py-1 rounded-full capitalize whitespace-nowrap"
                            style={{
                                color: statusColors[order.status],
                                backgroundColor: statusBgColors[order.status],
                            }}
                        >
                            {order.status}
                        </span>
                        <span className="text-lg font-semibold text-gray-900 whitespace-nowrap">GHS {order.total.toFixed(2)}</span>
                    </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Customer</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center text-gray-700">
                                        <div className="mr-3 text-gray-400 w-5" />
                                        <span>{order.customer}</span>
                                    </div>
                                    <div className="flex items-center text-gray-700">
                                        <span className="text-gray-400 w-5 mr-3">@</span>
                                        <span>{order.contactEmail}</span>
                                    </div>
                                    <div className="flex items-center text-gray-700">
                                        <span className="text-gray-400 w-5 mr-3">📱</span>
                                        <span>{order.contactPhone}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Shipping</h4>
                                <p className="text-gray-700">{order.shippingAddress}</p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-500 mb-3">Order Items</h4>
                            <div className="space-y-3">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-400" />
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

                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                            <div className="text-sm text-gray-500">
                                {order.itemsCount} item{order.itemsCount !== 1 ? "s" : ""} • {order.paymentMethod}
                            </div>
                            <Link href={`/orders/${order.id}`}>
                                <button type="button" className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded">
                                    View Full Details
                                </button>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Collapsed Footer */}
                {!isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
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
                                <span className="text-sm text-gray-500 capitalize">{order.paymentMethod}</span>
                                <button type="button" className="text-primary hover:bg-primary/10" onClick={() => setIsExpanded(true)}>
                                    Show details
                                </button>
                                <Link href={`/orders/${order.id}`}>
                                    <button type="button" className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded">
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
    // Sort all orders by date (newest first)
    const sortedOrders = [...mockOrders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="px-8 pt-5 space-y-4">
            {sortedOrders.map((order) => (
                <OrderListItem key={order.id} order={order} />
            ))}
        </div>
    );
}
