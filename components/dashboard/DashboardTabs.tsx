"use client";

import Link from "next/link";
import { Menu, type MenuProps } from "antd";
import { usePathname, useRouter } from "next/navigation";

type MenuItem = Required<MenuProps>["items"][number];

const dashboardTabItems: MenuItem[] = [
  { label: <Link href="/dashboard">Overview</Link>, key: "/dashboard" },
  { label: <Link href="/dashboard/sales-reports">Sales Reports</Link>, key: "/dashboard/sales-reports" },
  { label: <Link href="/dashboard/purchase-reports">Purchase Reports</Link>, key: "/dashboard/purchase-reports" },
  { label: <Link href="/dashboard/inventory-report">Inventory Report</Link>, key: "/dashboard/inventory-report" },
  { label: <Link href="/dashboard/payments-and-accounting">Finance Report</Link>, key: "/dashboard/payments-and-accounting" },
];

export const dashboardTabRoutes = dashboardTabItems
  .map((item) => ("key" in (item || {}) ? item?.key : undefined))
  .filter((key): key is string => typeof key === "string");

export function DashboardTabs() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div>
      <div className="px-8 flex justify-between items-center">
        <h3 className="pageTittle">Dashboard</h3>
      </div>
      <hr className="border-gray-200/80" />
      <Menu
        style={{ fontSize: "16px" }}
        selectedKeys={[pathname]}
        mode="horizontal"
        items={dashboardTabItems}
        onClick={(event) => router.push(event.key)}
      />
    </div>
  );
}
