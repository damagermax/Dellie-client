import { Table, Tag } from "antd";
import { ColumnsType } from "antd/es/table";

interface Order {
    key: string;
    id: string;
    customer: string;
    date: string;
    amount: number;
    status: "Delivered" | "Processing" | "Shipped" | "Pending" | "Cancelled";
    items: number;
    payment: string;
}

const data: Order[] = [
    {
        key: "1",
        id: "ORD-1001",
        customer: "John Doe",
        date: "2023-07-15 14:30",
        amount: 299.99,
        status: "Delivered",
        items: 3,
        payment: "Credit Card",
    },
    {
        key: "2",
        id: "ORD-1002",
        customer: "Jane Smith",
        date: "2023-07-15 13:15",
        amount: 149.5,
        status: "Processing",
        items: 2,
        payment: "Mobile Money",
    },
    {
        key: "3",
        id: "ORD-1003",
        customer: "Robert Johnson",
        date: "2023-07-15 11:45",
        amount: 89.99,
        status: "Shipped",
        items: 1,
        payment: "Credit Card",
    },
    {
        key: "4",
        id: "ORD-1004",
        customer: "Emily Davis",
        date: "2023-07-14 16:20",
        amount: 199.99,
        status: "Pending",
        items: 4,
        payment: "Bank Transfer",
    },
    {
        key: "5",
        id: "ORD-1005",
        customer: "Michael Brown",
        date: "2023-07-14 10:15",
        amount: 350.0,
        status: "Delivered",
        items: 5,
        payment: "Credit Card",
    },
];

const statusColors: Record<string, string> = {
    Delivered: "green",
    Processing: "blue",
    Shipped: "purple",
    Pending: "orange",
    Cancelled: "red",
};

export function RecentOrders() {
    const columns: ColumnsType<Order> = [
        {
            title: "Order ID",
            dataIndex: "id",
            key: "id",
            render: (id: Order["id"]) => (
                <div className="flex items-center">
                    <a className="font-medium">{id}</a>
                </div>
            ),
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
            render: (amount: Order["amount"]) => (
                <span className="font-medium">GHS {amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: Order["status"]) => <Tag color={statusColors[status] || "default"}>{status}</Tag>,
        },
    ];

    return (
        <Table<Order>
            columns={columns}
            dataSource={data}
            pagination={false}
            size="small"
            title={() => (
                <div className="flex justify-between items-center">
                    <span className="font-medium">Recent Orders</span>
                    <a className="text-sm">View All Orders</a>
                </div>
            )}
        />
    );
}
