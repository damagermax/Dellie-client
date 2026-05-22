"use client";
import AppTable from "@/components/ui/AppTable";
import type { TableProps } from "antd/es/table";
import Link from "next/link";
import AppTag from "../../ui/AppTag";

interface Order {
    key: string;
    orderNumber: string;
    date: string;
    orderType: "Pickup" | "Delivery";
    total: number;
    customer: string;
    status: string;
}

export default function OrdersTable() {
    const columns: TableProps<Order>["columns"] = [
        {
            title: "Order #",
            dataIndex: "orderNumber",
            key: "orderNumber",
            className: "!pl-8",
            render: (text: string, record: Order) => (
                <Link href={`/orders/${record.key}`} className="text-primary hover:underline">
                    {text}
                </Link>
            ),
        },
        {
            title: "Customer",
            dataIndex: "customer",
            key: "customer",
        },
        {
            title: "Type",
            dataIndex: "orderType",
            key: "orderType",
        },
        {
            title: "Amount",
            dataIndex: "total",
            key: "total",
            render: (text: any) => `GHS ${text}`, // Formats total as currency
        },

        {
            title: "Date",
            dataIndex: "date",
            key: "date",
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            className: "!pr-8",

            render: (status: Order["status"]) => <AppTag value={status} />,
        },
    ];

    const dataSource: Order[] = [
        { key: "1", orderNumber: "ORD12345", customer: "John Doe", orderType: "Pickup", total: 49.99, status: "Pending", date: "Mar 17, 2025" },
        { key: "2", orderNumber: "ORD12346", customer: "Jane Smith", orderType: "Delivery", total: 19.99, status: "Shipped", date: "Mar 16, 2025" },
        {
            key: "3",
            orderNumber: "ORD12347",
            customer: "Alice Brown",
            orderType: "Delivery",
            total: 149.95,
            status: "Delivered",
            date: "Mar 15, 2025",
        },
        { key: "4", orderNumber: "ORD12348", customer: "Bob Johnson", orderType: "Pickup", total: 89.97, status: "Canceled", date: "Mar 14, 2025" },

        {
            key: "13",
            orderNumber: "ORD12345",
            customer: "Charlie Davis",
            orderType: "Delivery",
            total: 49.99,
            status: "Pending",
            date: "Mar 13, 2025",
        },
        { key: "23", orderNumber: "ORD12346", customer: "Eve Wilson", orderType: "Pickup", total: 19.99, status: "Shipped", date: "Mar 12, 2025" },
        {
            key: "33",
            orderNumber: "ORD12347",
            customer: "Grace Lee",
            orderType: "Delivery",
            total: 149.95,
            status: "Delivered",
            date: "Mar 11, 2025",
        },
        { key: "43", orderNumber: "ORD12348", customer: "Frank Harris", orderType: "Pickup", total: 89.97, status: "Canceled", date: "Mar 10, 2025" },
        { key: "13", orderNumber: "ORD12345", customer: "Henry Clark", orderType: "Pickup", total: 49.99, status: "Pending", date: "Mar 09, 2025" },
        { key: "s2", orderNumber: "ORD12346", customer: "Ivy Adams", orderType: "Delivery", total: 19.99, status: "Shipped", date: "Mar 08, 2025" },
        { key: "3s", orderNumber: "ORD12347", customer: "Jack White", orderType: "Pickup", total: 149.95, status: "Delivered", date: "Mar 07, 2025" },
        {
            key: "4s",
            orderNumber: "ORD12348",
            customer: "Karen Scott",
            orderType: "Delivery",
            total: 89.97,
            status: "Canceled",
            date: "Mar 06, 2025",
        },
        { key: "1sd", orderNumber: "ORD12345", customer: "Leo Martinez", orderType: "Pickup", total: 49.99, status: "Pending", date: "Mar 05, 2025" },
        {
            key: "2s",
            orderNumber: "ORD12346",
            customer: "Mia Rodriguez",
            orderType: "Delivery",
            total: 19.99,
            status: "Shipped",
            date: "Mar 04, 2025",
        },
        {
            key: "3s",
            orderNumber: "ORD12347",
            customer: "Nathan Carter",
            orderType: "Pickup",
            total: 149.95,
            status: "Delivered",
            date: "Mar 03, 2025",
        },
        {
            key: "4s",
            orderNumber: "ORD12348",
            customer: "Olivia Evans",
            orderType: "Delivery",
            total: 89.97,
            status: "Canceled",
            date: "Mar 02, 2025",
        },
        { key: "1d", orderNumber: "ORD12345", customer: "Paul Walker", orderType: "Delivery", total: 49.99, status: "Pending", date: "Mar 01, 2025" },
        { key: "2d", orderNumber: "ORD12346", customer: "Quinn Foster", orderType: "Pickup", total: 19.99, status: "Shipped", date: "Feb 29, 2025" },
        {
            key: "3d",
            orderNumber: "ORD12347",
            customer: "Ryan Hill",
            orderType: "Delivery",
            total: 149.95,
            status: "Delivered",
            date: "Feb 28, 2025",
        },
        { key: "42", orderNumber: "ORD12348", customer: "Sophia Green", orderType: "Pickup", total: 89.97, status: "Canceled", date: "Feb 27, 2025" },
        {
            key: "1s",
            orderNumber: "ORD12345",
            customer: "Thomas Baker",
            orderType: "Delivery",
            total: 49.99,
            status: "Pending",
            date: "Feb 26, 2025",
        },
        { key: "2d", orderNumber: "ORD12346", customer: "Uma Nelson", orderType: "Pickup", total: 19.99, status: "Shipped", date: "Feb 25, 2025" },
        {
            key: "3d",
            orderNumber: "ORD12347",
            customer: "Victor Carter",
            orderType: "Delivery",
            total: 149.95,
            status: "Delivered",
            date: "Feb 24, 2025",
        },
        { key: "4d", orderNumber: "ORD12348", customer: "Wendy Perez", orderType: "Pickup", total: 89.97, status: "Canceled", date: "Feb 23, 2025" },
    ];

    return (
        <div className="  -border border-solid -rounded-lg border-gray-200 overflow-clip border-b-0">
            <AppTable<Order> columns={columns} dataSource={dataSource} className="custom-table " />
        </div>
    );
}
