"use client";

import {
    ArrowDownOutlined,
    ArrowUpOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    DownloadOutlined,
    FilterOutlined,
    ReloadOutlined,
    ShopOutlined,
} from "@ant-design/icons";
import { Avatar, Badge, Button, Card, Col, List, Progress, Row, Tag, Typography } from "antd";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
const { Text } = Typography;

// Dynamically import Chart.js components
const { Line, Bar } = {
    Line: dynamic(() => import("react-chartjs-2").then((mod) => mod.Line), { ssr: false }),
    Bar: dynamic(() => import("react-chartjs-2").then((mod) => mod.Bar), { ssr: false }),
};

// Import Chart.js components
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface Store {
    id: string;
    name: string;
    logo?: string;
    revenue: number;
    processedOrders: number;
    url: string;
    plan: "basic" | "pro" | "enterprise";
    status: "active" | "trial" | "churned";
}

interface SystemStatus {
    api: boolean;
    database: boolean;
    payment: boolean;
    lastChecked: string;
}

interface MetricCardProps {
    title: string;
    value: string | number;
    trend: {
        value: number;
        isUp: boolean;
    };
}

const MetricCard = ({ title, value, trend }: MetricCardProps) => (
    <Card className="h-full">
        <div className="flex justify-between items-center">
            <div>
                <p className="text-gray-500 text-sm mb-2">{title}</p>
                <div className="flex items-baseline">
                    <span className="text-2xl font-semibold">{value}</span>
                    <span className={`ml-2 text-sm ${trend.isUp ? "text-green-500" : "text-red-500"}`}>
                        {trend.isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                        {trend.value}%
                    </span>
                </div>
            </div>
        </div>
    </Card>
);

const SystemStatusBadge = ({ status }: { status: boolean }) =>
    status ? <Badge status="success" text="Operational" /> : <Badge status="error" text="Degraded" />;

const PlanTag = ({ plan }: { plan: string }) => {
    const colors: Record<string, string> = {
        basic: "blue",
        pro: "purple",
        enterprise: "gold",
    };
    return <Tag color={colors[plan] || "default"}>{plan.charAt(0).toUpperCase() + plan.slice(1)}</Tag>;
};

const OverviewPage = () => {
    const [loading, setLoading] = useState(true);
    const [systemStatus, setSystemStatus] = useState<SystemStatus>({
        api: true,
        database: true,
        payment: true,
        lastChecked: new Date().toISOString(),
    });

    const [stats, setStats] = useState<{
        // Core Metrics
        mrr: number;
        arr: number;
        churnRate: number;
        activeSubscriptions: number;

        // User Metrics
        newSignups: number;
        activeUsers: {
            daily: number;
            monthly: number;
        };
        trialConversionRate: number;

        // Financial
        revenueByPlan: {
            basic: number;
            pro: number;
            enterprise: number;
        };
        paymentSuccessRate: number;

        // Store Metrics
        totalStores: number;
        newStores: number;
        activeStores: number;
        totalRevenue: number;
        averageRevenue: number;
        totalOrders: number;
        totalCustomers: number;
        storesByStatus: {
            active: number;
            inactive: number;
            suspended: number;
            banned: number;
        };
    } | null>(null);

    const [metrics, setMetrics] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalStores: 0,
        totalCustomers: 0,
    });

    useEffect(() => {
        // Simulate API call
        const fetchMetrics = async () => {
            try {
                // Simulate API call
                await new Promise((resolve) => setTimeout(resolve, 1000));
                setMetrics({
                    totalRevenue: 12543.89,
                    totalOrders: 328,
                    totalStores: 24,
                    totalCustomers: 1567,
                });

                setStats({
                    // Core Metrics
                    mrr: 125000,
                    arr: 1500000,
                    churnRate: 2.5,
                    activeSubscriptions: 42,

                    // User Metrics
                    newSignups: 28,
                    activeUsers: {
                        daily: 156,
                        monthly: 1245,
                    },
                    trialConversionRate: 18.5,

                    // Financial
                    revenueByPlan: {
                        basic: 45000,
                        pro: 65000,
                        enterprise: 15000,
                    },
                    paymentSuccessRate: 98.7,

                    // Store Metrics
                    totalStores: 42,
                    newStores: 5,
                    activeStores: 38,
                    totalRevenue: 125000,
                    averageRevenue: 3200,
                    totalOrders: 1245,
                    totalCustomers: 156,
                    storesByStatus: {
                        active: 38,
                        inactive: 3,
                        suspended: 1,
                        banned: 0,
                    },
                });
            } catch (error) {
                console.error("Error fetching metrics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    return (
        <div className="space-y-6 px-8 py-6 bg-gray-50">
            <h1 className="text-2xl font-bold">Dashboard Overview</h1>

            {/* System Status */}
            <Card className="!mb-6" title="System Status">
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                        <div className="flex items-center">
                            {systemStatus.api ? (
                                <CheckCircleOutlined className="text-green-500 text-xl mr-2" />
                            ) : (
                                <CloseCircleOutlined className="text-red-500 text-xl mr-2" />
                            )}
                            <div>
                                <div>API</div>
                                <div className="text-sm text-gray-500">Last checked: {new Date(systemStatus.lastChecked).toLocaleTimeString()}</div>
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} sm={8}>
                        <div className="flex items-center">
                            {systemStatus.database ? (
                                <CheckCircleOutlined className="text-green-500 text-xl mr-2" />
                            ) : (
                                <CloseCircleOutlined className="text-red-500 text-xl mr-2" />
                            )}
                            <div>Database</div>
                        </div>
                    </Col>
                    <Col xs={24} sm={8}>
                        <div className="flex items-center">
                            {systemStatus.payment ? (
                                <CheckCircleOutlined className="text-green-500 text-xl mr-2" />
                            ) : (
                                <CloseCircleOutlined className="text-red-500 text-xl mr-2" />
                            )}
                            <div>Payment Processing</div>
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Core Metrics */}
            <div className="mb-6 w-full">
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                        {stats && <MetricCard title="MRR" value={`$${stats.mrr.toLocaleString()}`} trend={{ value: 12.5, isUp: true }} />}
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        {stats && <MetricCard title="Total Revenue" value={`${stats.churnRate}%`} trend={{ value: 0.5, isUp: false }} />}
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        {stats && <MetricCard title="Processed Orders" value={stats.newSignups} trend={{ value: 15.3, isUp: true }} />}
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        {stats && (
                            <MetricCard
                                title="Active Stores"
                                value={`${stats.activeUsers.daily}/${stats.activeUsers.monthly}`}
                                trend={{ value: 5.7, isUp: true }}
                            />
                        )}
                    </Col>
                </Row>
            </div>

            {/* Revenue by Plan */}
            <Card className="!my-6" title="Revenue by Plan">
                <Row gutter={[16, 16]}>
                    {stats && (
                        <>
                            <Col xs={24} md={8}>
                                <div className="mb-4">
                                    <div className="flex justify-between mb-1">
                                        <span>Free</span>
                                        <span className="font-medium">${stats.revenueByPlan.basic.toLocaleString()}</span>
                                    </div>
                                    <Progress percent={Math.round((stats.revenueByPlan.basic / stats.mrr) * 100)} strokeColor="#1890ff" />
                                </div>
                            </Col>
                            <Col xs={24} md={8}>
                                <div className="mb-4">
                                    <div className="flex justify-between mb-1">
                                        <span>Pro</span>
                                        <span className="font-medium">${stats.revenueByPlan.pro.toLocaleString()}</span>
                                    </div>
                                    <Progress percent={Math.round((stats.revenueByPlan.pro / stats.mrr) * 100)} strokeColor="#722ed1" />
                                </div>
                            </Col>
                            <Col xs={24} md={8}>
                                <div className="mb-4">
                                    <div className="flex justify-between mb-1">
                                        <span>Enterprise</span>
                                        <span className="font-medium">${stats.revenueByPlan.enterprise.toLocaleString()}</span>
                                    </div>
                                    <Progress percent={Math.round((stats.revenueByPlan.enterprise / stats.mrr) * 100)} strokeColor="#faad14" />
                                </div>
                            </Col>
                            <Col span={24} className="text-right">
                                <Text type="secondary">
                                    Payment Success Rate: <Text strong>{stats.paymentSuccessRate}%</Text>
                                </Text>
                            </Col>
                        </>
                    )}
                </Row>
            </Card>

            {/* Sales & User Growth Chart */}
            <Card
                title={
                    <div className="flex justify-between items-center">
                        <span>Monthly Revenue & User Growth</span>
                        <div className="flex space-x-2">
                            <Button icon={<ReloadOutlined />} />
                            <Button icon={<DownloadOutlined />} />
                            <Button icon={<FilterOutlined />} />
                        </div>
                    </div>
                }
                className="mt-6"
            >
                <div className="w-full h-80 mt-4">
                    <Bar
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            interaction: {
                                mode: "index",
                                intersect: false,
                            },
                            plugins: {
                                legend: {
                                    position: "top" as const,
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function (context) {
                                            const label = context.dataset.label || "";
                                            const value = context.parsed.y;
                                            if (value === null) return "";

                                            if (label === "Revenue") {
                                                return `${label}: $${value.toLocaleString()}`;
                                            }
                                            return `${label}: ${value.toLocaleString()}`;
                                        },
                                    },
                                },
                            },
                            scales: {
                                x: {
                                    grid: {
                                        display: false,
                                    },
                                    stacked: false,
                                },
                                y: {
                                    type: "linear" as const,
                                    display: true,
                                    position: "left" as const,
                                    title: {
                                        display: true,
                                        text: "Revenue ($)",
                                    },
                                    ticks: {
                                        callback: function (value: any) {
                                            return "$" + value.toLocaleString();
                                        },
                                    },
                                    grid: {
                                        drawOnChartArea: false,
                                    },
                                },
                                y1: {
                                    type: "linear" as const,
                                    display: true,
                                    position: "right" as const,
                                    grid: {
                                        drawOnChartArea: false,
                                    },
                                    title: {
                                        display: true,
                                        text: "New Users",
                                    },
                                },
                            },
                        }}
                        data={{
                            labels: months,
                            datasets: [
                                {
                                    label: "Revenue",
                                    data: [1200, 1900, 1500, 2100, 1800, 2500],
                                    backgroundColor: "rgba(59, 130, 246, 0.8)",
                                    borderColor: "rgb(59, 130, 246)",
                                    borderWidth: 1,
                                    yAxisID: "y",
                                    barPercentage: 1,
                                    categoryPercentage: 0.7,
                                },
                                {
                                    label: "New Users",
                                    data: [220, 290, 250, 210, 280, 250],
                                    backgroundColor: "rgba(16, 185, 129, 0.8)",
                                    borderColor: "rgb(16, 185, 129)",
                                    borderWidth: 1,
                                    yAxisID: "y1",
                                    barPercentage: 1,
                                    categoryPercentage: 0.7,
                                },
                            ],
                        }}
                    />
                </div>
            </Card>

            <div className=" grid grid-cols-3 mt-5">
                {/* Top 5 Performing Stores */}
                <Card
                    title="Top Performing Stores"
                    className="mt-6 col-span-2"
                    extra={
                        <Button type="link" size="small">
                            View All
                        </Button>
                    }
                >
                    <List
                        itemLayout="horizontal"
                        dataSource={[
                            {
                                id: "1",
                                name: "Fashion Haven",
                                revenue: 12500,
                                processedOrders: 245,
                                url: "/stores/1",
                                plan: "pro",
                                status: "active",
                            },
                            {
                                id: "2",
                                name: "Tech Gadgets",
                                revenue: 9800,
                                processedOrders: 187,
                                url: "/stores/2",
                                plan: "enterprise",
                                status: "active",
                            },
                            {
                                id: "3",
                                name: "Home & Living",
                                revenue: 8450,
                                processedOrders: 156,
                                url: "/stores/3",
                                plan: "basic",
                                status: "trial",
                            },
                            {
                                id: "4",
                                name: "Beauty Spot",
                                revenue: 7200,
                                processedOrders: 132,
                                url: "/stores/4",
                                plan: "pro",
                                status: "active",
                            },
                            {
                                id: "5",
                                name: "Sports World",
                                revenue: 6800,
                                processedOrders: 121,
                                url: "/stores/5",
                                plan: "basic",
                                status: "active",
                            },
                        ]}
                        renderItem={(store: Store) => (
                            <List.Item
                                key={store.id}
                                actions={[
                                    <Text key="revenue" strong>
                                        ${store.revenue.toLocaleString()}
                                    </Text>,
                                    <Text key="orders" type="secondary">
                                        {store.processedOrders} orders
                                    </Text>,
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={<Avatar size="large" icon={<ShopOutlined />} className="bg-blue-100 text-blue-600" />}
                                    title={<a href={store.url}>{store.name}</a>}
                                    description={
                                        <a href={store.url} className="text-blue-500 text-sm">
                                            View Store
                                        </a>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                </Card>
            </div>
        </div>
    );
};

export default OverviewPage;
