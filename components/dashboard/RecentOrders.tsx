import { Tag } from "antd";

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

const statusColors: Record<Order["status"], string> = {
  Delivered: "green",
  Processing: "blue",
  Shipped: "purple",
  Pending: "orange",
  Cancelled: "red",
};

export function RecentOrders() {
  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="font-medium text-gray-950">Recent Sales</p>
          <p className="mt-1 text-xs text-gray-500">Latest orders, payment methods, and fulfillment status at a glance.</p>
        </div>
        <a className="text-sm text-blue-600">View All Orders</a>
      </div>

      <div className="space-y-4">
        {data.map((order) => (
          <div key={order.key} className="rounded-2xl border border-gray-100 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-950">{order.id}</p>
                  <span className="text-gray-300">•</span>
                  <p className="truncate text-sm text-gray-500">{order.customer}</p>
                </div>
                <p className="mt-1 text-xs text-gray-500">{order.date}</p>
              </div>

              <div className="text-right">
                <p className="font-semibold text-gray-950">
                  GHS {order.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <Tag color={statusColors[order.status]} className="!mt-2 !mr-0 !rounded-full !px-2">
                  {order.status}
                </Tag>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-gray-500">
              <span>{order.items} items</span>
              <span>•</span>
              <span>{order.payment}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
