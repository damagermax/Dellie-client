"use client";

import { KPICard } from "@/components/dashboard/KPICard";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { StoreSelector } from "@/components/dashboard/StoreSelector";
import { TopProducts } from "@/components/dashboard/TopProducts";
import { DownloadOutlined, FilterOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Card, Col, DatePicker, Row, Space, Typography } from "antd";

const { RangePicker } = DatePicker;
const { Title } = Typography;

const kpiData = [
  {
    title: "Total Revenue",
    value: 124560.99,
    prefix: "GHS ",
    change: 12.5,
    data: [10000, 8000, 12000, 15000, 18000, 20000, 25000],
    tooltip: "Total revenue including taxes and shipping",
  },
  {
    title: "Total Orders",
    value: 1845,
    change: 8.2,
    data: [100, 120, 150, 180, 200, 250, 300],
    tooltip: "Total number of orders placed",
  },
  {
    title: "Average Order Value",
    value: 67.5,
    prefix: "GHS ",
    change: 4.1,
    data: [60, 62, 58, 64, 65, 66, 67.5],
    tooltip: "Average amount spent per order",
  },
  {
    title: "Conversion Rate",
    value: 3.42,
    suffix: "%",
    change: 0.8,
    data: [2.5, 2.8, 3.0, 3.1, 3.2, 3.3, 3.42],
    tooltip: "Percentage of visitors who made a purchase",
  },
];

export default function DashboardPage() {
  return (
    <div className="p-6 h-full  ">
      <div className="flex justify-between items-center mb-6">
        <Title level={3} className="mb-0">
          Dashboard
        </Title>
        <div className="flex items-center gap-4">
          <RangePicker />
          <StoreSelector />
        </div>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        {kpiData.map((kpi, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <KPICard title={kpi.title} value={kpi.value} change={kpi.change} data={kpi.data} prefix={kpi.prefix} suffix={kpi.suffix} tooltip={kpi.tooltip} />
          </Col>
        ))}
      </Row>

      {/* Sales Chart */}
      <Card
        title={
          <div className="flex justify-between items-center">
            <span>Sales Overview</span>
            <Space>
              <Button icon={<ReloadOutlined />} />
              <Button icon={<DownloadOutlined />} />
              <Button icon={<FilterOutlined />} />
            </Space>
          </div>
        }
      >
        <SalesChart />
      </Card>

      <Row gutter={[16, 16]} className="mb-6 mt-8">
        {/* Top Products */}
        <Col xs={24} lg={12}>
          <Card>
            <TopProducts />
          </Card>
        </Col>

        {/* Recent Orders */}
        <Col xs={24} lg={12}>
          <Card>
            <RecentOrders />
          </Card>
        </Col>
      </Row>

      {/* Additional Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="Order Status">
            <div className="space-y-4">
              {[
                { status: "Pending", count: 24, color: "bg-yellow-100 text-yellow-800" },
                { status: "Processing", count: 18, color: "bg-blue-100 text-blue-800" },
                { status: "Shipped", count: 32, color: "bg-purple-100 text-purple-800" },
                { status: "Delivered", count: 156, color: "bg-green-100 text-green-800" },
                { status: "Cancelled", count: 5, color: "bg-red-100 text-red-800" },
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{item.status}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.color}`}>{item.count} orders</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Today's Summary">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">New Orders</span>
                <span className="font-medium">24</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Revenue</span>
                <span className="font-medium">GHS 12,450.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg. Order Value</span>
                <span className="font-medium">GHS 518.75</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Items Sold</span>
                <span className="font-medium">84</span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Order Fulfillment">
            <div className="space-y-4">
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>On Time Delivery</span>
                  <span className="font-medium">94%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full bg-green-500" style={{ width: "94%" }} />
                </div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Order Accuracy</span>
                  <span className="font-medium">98%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full bg-blue-500" style={{ width: "98%" }} />
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Avg. Processing Time</span>
                <span className="font-medium">2.1h</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Return Rate</span>
                <span className="font-medium text-green-600">1.2%</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
