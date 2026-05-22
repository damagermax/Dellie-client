import { Card, List, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import React from "react";

import { ViewType } from "../ui/AppViewSegments";

const { Text } = Typography;

interface Transaction {
    id: string;
    orderId: string;
    customer: string;
    date: string;
    amount: number;
    status: "completed" | "pending" | "failed" | "refunded";
    paymentMethod: string;
}

const statusColors = {
    completed: "green",
    pending: "orange",
    failed: "red",
    refunded: "blue",
} as const;

const transactionsData: Transaction[] = [
    {
        id: "TXN-001",
        orderId: "ORD-1001",
        customer: "John Doe",
        date: "2023-06-15",
        amount: 129.99,
        status: "completed",
        paymentMethod: "Credit Card",
    },
    {
        id: "TXN-002",
        orderId: "ORD-1002",
        customer: "Jane Smith",
        date: "2023-06-14",
        amount: 89.5,
        status: "pending",
        paymentMethod: "PayPal",
    },
    {
        id: "TXN-003",
        orderId: "ORD-1003",
        customer: "Robert Johnson",
        date: "2023-06-13",
        amount: 45.99,
        status: "failed",
        paymentMethod: "Credit Card",
    },
];

const columns: ColumnsType<Transaction> = [
    {
        title: "Transaction ID",
        dataIndex: "id",
        key: "id",
    },
    {
        title: "Order ID",
        dataIndex: "orderId",
        key: "orderId",
    },
    {
        title: "Customer",
        dataIndex: "customer",
        key: "customer",
    },
    {
        title: "Date",
        dataIndex: "date",
        key: "date",
    },
    {
        title: "Amount",
        dataIndex: "amount",
        key: "amount",
        render: (amount: number) => `$${amount.toFixed(2)}`,
    },
    {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status: Transaction["status"]) => <Tag color={statusColors[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Tag>,
    },
    {
        title: "Payment Method",
        dataIndex: "paymentMethod",
        key: "paymentMethod",
    },
];

interface TransactionsViewProps {
    view: ViewType;
}

const TransactionsView: React.FC<TransactionsViewProps> = ({ view }) => {
    if (view === "table") {
        return (
            <div className="">
                <Table columns={columns} dataSource={transactionsData} rowKey="id" pagination={{ pageSize: 10 }} />
            </div>
        );
    }

    if (view === "list") {
        return (
            <div className="">
                <List
                    itemLayout="horizontal"
                    dataSource={transactionsData}
                    renderItem={(transaction) => (
                        <List.Item
                            className="!px-8"
                            actions={[
                                <Text key="amount">${transaction.amount.toFixed(2)}</Text>,
                                <Tag key="status" color={statusColors[transaction.status]}>
                                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                </Tag>,
                            ]}
                        >
                            <List.Item.Meta
                                title={
                                    <Space>
                                        <Text strong>{transaction.id}</Text>
                                        <Text type="secondary">Order: {transaction.orderId}</Text>
                                    </Space>
                                }
                                description={
                                    <Space direction="vertical" size={0}>
                                        <Text>{transaction.customer}</Text>
                                        <Text type="secondary">
                                            {transaction.date} • {transaction.paymentMethod}
                                        </Text>
                                    </Space>
                                }
                            />
                        </List.Item>
                    )}
                />
            </div>
        );
    }

    // Card view
    return (
        <div className=" p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {transactionsData.map((transaction) => (
                <Card
                    key={transaction.id}
                    title={
                        <Space>
                            <Text strong>{transaction.id}</Text>
                            <Tag color={statusColors[transaction.status]}>
                                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            </Tag>
                        </Space>
                    }
                    className=" hover:shadow-md transition-shadow"
                >
                    <Space direction="vertical" className="w-full">
                        <div className="flex justify-between">
                            <Text type="secondary">Order ID</Text>
                            <Text>{transaction.orderId}</Text>
                        </div>
                        <div className="flex justify-between">
                            <Text type="secondary">Customer</Text>
                            <Text>{transaction.customer}</Text>
                        </div>
                        <div className="flex justify-between">
                            <Text type="secondary">Date</Text>
                            <Text>{transaction.date}</Text>
                        </div>
                        <div className="flex justify-between">
                            <Text type="secondary">Payment Method</Text>
                            <Text>{transaction.paymentMethod}</Text>
                        </div>
                        <div className="flex justify-between border-t border-gray-100 pt-2 mt-2">
                            <Text strong>Amount</Text>
                            <Text strong>${transaction.amount.toFixed(2)}</Text>
                        </div>
                    </Space>
                </Card>
            ))}
        </div>
    );
};

export default TransactionsView;
