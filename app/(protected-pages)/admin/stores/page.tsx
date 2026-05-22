"use client";

import { fetchStores, fetchStoreStats } from "@/lib/mock/stores";
import { Store, StoreStats } from "@/types/store";
import { EditOutlined, EyeOutlined, FilterOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Col, DatePicker, Input, Progress, Row, Select, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";

// Dynamically import charts with no SSR
const ColumnChart = dynamic(() => import("@ant-design/charts").then((mod) => mod.Column), { ssr: false });

const { Search } = Input;
const { RangePicker } = DatePicker;

export default function StoresPage() {
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<StoreStats | null>(null);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [filters, setFilters] = useState({
        status: undefined as string | undefined,
        plan: undefined as string | undefined,
        dateRange: undefined as [any, any] | undefined,
        search: "",
    });

    useEffect(() => {
        loadStores();
        loadStats();
    }, [pagination.current, pagination.pageSize, filters]);

    const loadStores = async () => {
        try {
            setLoading(true);
            const { data, total } = await fetchStores(pagination.current, pagination.pageSize);
            setStores(data);
            setPagination((prev) => ({ ...prev, total }));
        } catch (error) {
            console.error("Failed to fetch stores:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const data = await fetchStoreStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch store stats:", error);
        }
    };

    const handleTableChange = (pagination: any) => {
        setPagination(pagination);
    };

    const handleSearch = (value: string) => {
        setFilters({ ...filters, search: value });
        setPagination({ ...pagination, current: 1 });
    };

    const handleFilterChange = (key: string, value: any) => {
        setFilters({ ...filters, [key]: value });
        setPagination({ ...pagination, current: 1 });
    };

    const columns: ColumnsType<Store> = [
        {
            title: "Store",
            dataIndex: "name",
            key: "name",
            render: (text, record) => (
                <div className="flex items-center">
                    {record.logo && <img src={record.logo} alt={text} className="w-8 h-8 rounded-md mr-3 object-cover" />}
                    <div>
                        <div className="font-medium line-clamp-1 ellipsis">{text}</div>
                        <div className="text-xs text-gray-500 line-clamp-1 ellipsis">{record.domains[0]}</div>
                    </div>
                </div>
            ),
        },
        {
            title: "Owner",
            dataIndex: ["owner", "name"],
            key: "owner",
            render: (text, record) => (
                <div>
                    <div className="font-medium line-clamp-1 ellipsis">{text}</div>
                    <div className="text-xs text-gray-500 line-clamp-1 ellipsis">{record.owner.email}</div>
                </div>
            ),
        },
        {
            title: "Plan",
            dataIndex: ["subscription", "plan"],
            key: "plan",
            render: (plan) => (
                <Tag color={plan === "enterprise" ? "purple" : plan === "pro" ? "blue" : "default"} className="capitalize">
                    {plan}
                </Tag>
            ),
        },
        // {
        //     title: "Status",
        //     dataIndex: "status",
        //     key: "status",
        //     render: (status) => {
        //         const statusMap = {
        //             active: { color: "green", text: "Active" },
        //             inactive: { color: "orange", text: "Inactive" },
        //             suspended: { color: "red", text: "Suspended" },
        //             banned: { color: "gray", text: "Banned" },
        //         };
        //         const currentStatus = statusMap[status as keyof typeof statusMap] || { color: "default", text: status };
        //         return <Tag color={currentStatus.color}>{currentStatus.text}</Tag>;
        //     },
        // },
        {
            title: "Revenue",
            dataIndex: ["metrics", "totalRevenue"],
            key: "revenue",
            render: (value) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            sorter: (a, b) => a.metrics.totalRevenue - b.metrics.totalRevenue,
        },
        {
            title: "Items",
            dataIndex: ["metrics", "totalProducts"],
            key: "products",
            sorter: (a, b) => a.metrics.totalProducts - b.metrics.totalProducts,
        },
        // {
        //     title: "Created",
        //     dataIndex: "createdAt",
        //     key: "createdAt",
        //     render: (date) => format(new Date(date), "MMM d, yyyy"),
        //     sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        // },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space size="middle">
                    <Link href={`/admin/stores/${record.id}`}>
                        <Button icon={<EyeOutlined />} size="small" />
                    </Link>
                    <Button icon={<EditOutlined />} size="small" />
                </Space>
            ),
        },
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Stores Management</h1>
                <Button type="primary" icon={<PlusOutlined />}>
                    Add New Store
                </Button>
            </div>

            {/* Stores Table */}
            <Card
                title={
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <h2 className="text-lg font-medium">All Stores</h2>
                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                            <Search placeholder="Search stores..." onSearch={handleSearch} className="w-full sm:w-64" allowClear />
                            <div className="flex gap-2">
                                <Select
                                    placeholder="Status"
                                    allowClear
                                    className="w-full sm:w-32"
                                    onChange={(value) => handleFilterChange("status", value)}
                                >
                                    <Select.Option value="active">Active</Select.Option>
                                    <Select.Option value="inactive">Inactive</Select.Option>
                                    <Select.Option value="suspended">Suspended</Select.Option>
                                    <Select.Option value="banned">Banned</Select.Option>
                                </Select>
                                <Select
                                    placeholder="Plan"
                                    allowClear
                                    className="w-full sm:w-32"
                                    onChange={(value) => handleFilterChange("plan", value)}
                                >
                                    <Select.Option value="basic">Basic</Select.Option>
                                    <Select.Option value="pro">Pro</Select.Option>
                                    <Select.Option value="enterprise">Enterprise</Select.Option>
                                </Select>
                                <RangePicker className="w-full sm:w-56" onChange={(dates) => handleFilterChange("dateRange", dates)} />
                                <Button icon={<FilterOutlined />}>Filters</Button>
                            </div>
                        </div>
                    </div>
                }
            >
                <Table
                    columns={columns}
                    dataSource={stores}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "20", "50", "100"],
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} stores`,
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: true }}
                />
            </Card>
        </div>
    );
}
