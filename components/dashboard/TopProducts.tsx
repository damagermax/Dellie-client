import { Progress, Table } from "antd";

const data = [
    {
        key: "1",
        name: "Wireless Earbuds Pro",
        sku: "WEB-001",
        sales: 154,
        revenue: 30799.46,
        stock: 24,
        trend: [20, 35, 45, 60, 80, 100, 120, 140, 154],
    },
    {
        key: "2",
        name: "Smartphone X",
        sku: "SPX-2023",
        sales: 128,
        revenue: 25600.0,
        stock: 15,
        trend: [10, 25, 40, 65, 90, 100, 110, 120, 128],
    },
    {
        key: "3",
        name: "Bluetooth Speaker",
        sku: "BTS-022",
        sales: 98,
        revenue: 8819.02,
        stock: 8,
        trend: [5, 15, 30, 45, 60, 75, 85, 92, 98],
    },
    {
        key: "4",
        name: "Laptop Stand",
        sku: "LS-012",
        sales: 75,
        revenue: 4499.25,
        stock: 32,
        trend: [5, 10, 20, 35, 45, 55, 65, 70, 75],
    },
    {
        key: "5",
        name: "Wireless Mouse",
        sku: "WM-056",
        sales: 62,
        revenue: 5579.38,
        stock: 0,
        trend: [2, 8, 15, 25, 35, 45, 52, 58, 62],
    },
];

export function TopProducts() {
    const columns = [
        {
            title: "Product",
            dataIndex: "name",
            key: "name",
            render: (text: string, record: any) => (
                <div>
                    <div className="font-medium">{text}</div>
                </div>
            ),
        },
        {
            title: "Sales",
            dataIndex: "sales",
            key: "sales",
            sorter: (a: any, b: any) => a.sales - b.sales,
            render: (sales: number) => (
                <div className="flex items-center">
                    <div className="w-16 mr-2">
                        <Progress percent={Math.min(100, (sales / 200) * 100)} showInfo={false} strokeColor="#1890ff" size="small" />
                    </div>
                    {sales.toLocaleString()}
                </div>
            ),
        },
        {
            title: "Revenue",
            dataIndex: "revenue",
            key: "revenue",
            sorter: (a: any, b: any) => a.revenue - b.revenue,
            render: (revenue: number) => (
                <span className="font-medium">GHS {revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            ),
        },
        {
            title: "Stock",
            dataIndex: "stock",
            key: "stock",
            render: (stock: number) => <span className={stock === 0 ? "text-red-500" : ""}>{stock === 0 ? "Out of Stock" : stock}</span>,
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={data}
            pagination={false}
            size="small"
            title={() => (
                <div className="flex justify-between items-center">
                    <span className="font-medium">Top Selling Products</span>
                    <a className="text-sm">View All</a>
                </div>
            )}
        />
    );
}
