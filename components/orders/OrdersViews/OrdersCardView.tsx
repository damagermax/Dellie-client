"use client";

import { ShoppingCartOutlined, UserOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { format } from "date-fns";
import Link from "next/link";

interface Order {
    id: string;
    orderNumber: string;
    date: string;
    customer: string;
    status: "pending" | "processing" | "fulfilled" | "cancelled" | "delivered";
    total: number;
    itemsCount: number;
    paymentMethod: string;
}

const statusColors = {
    pending: "#FFA500", // Orange
    processing: "#1890FF", // Blue
    fulfilled: "#52C41A", // Green
    cancelled: "#FF4D4F", // Red
    delivered: "#722ED1", // Purple
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
    },
    {
        id: "5",
        orderNumber: "ORD-005",
        date: "2023-06-11T11:05:00Z",
        customer: "Michael Wilson",
        status: "fulfilled",
        total: 179.5,
        itemsCount: 4,
        paymentMethod: "PayPal",
    },
    {
        id: "6",
        orderNumber: "ORD-006",
        date: "2023-06-10T13:25:00Z",
        customer: "Sarah Johnson",
        status: "delivered",
        total: 249.99,
        itemsCount: 3,
        paymentMethod: "Credit Card",
    },
];

const OrderCard = ({ order }: { order: Order }) => (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden transition-colors hover:border-primary">
        <div className="p-5">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <Link href={`/orders/${order.id}`} className="text-lg font-semibold text-gray-900 hover:text-primary">
                        #{order.orderNumber}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">{format(new Date(order.date), "MMM d, yyyy • h:mm a")}</p>
                </div>
                <span
                    className="text-xs font-medium px-2.5 py-1 rounded-full capitalize"
                    style={{
                        color: statusColors[order.status],
                        backgroundColor: statusBgColors[order.status],
                    }}
                >
                    {order.status}
                </span>
            </div>

            <div className="space-y-3.5 mt-4">
                <div className="flex items-center text-gray-700">
                    <UserOutlined className="mr-3 text-gray-400" />
                    <span>{order.customer}</span>
                </div>

                <div className="flex items-center text-gray-700">
                    <ShoppingCartOutlined className="mr-3 text-gray-400" />
                    <span>
                        {order.itemsCount} item{order.itemsCount !== 1 ? "s" : ""}
                    </span>
                </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Total</span>
                    <span className="text-lg font-semibold text-gray-900">GHS {order.total.toFixed(2)}</span>
                </div>
            </div>
        </div>

        <div className="bg-gray-50 px-5 py-3 flex justify-end items-center border-t border-gray-100">
            <Link href={`/orders/${order.id}`}>
                <Button type="primary" className="bg-primary hover:bg-primary/90">
                    View Order
                </Button>
            </Link>
        </div>
    </div>
);

export default function OrdersCardView() {
    return (
        <div className="px-8 pt-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {mockOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                ))}
            </div>
        </div>
    );
}
