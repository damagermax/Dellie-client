"use client";

import { RootState } from "@/lib/store";
import Link from "next/link";
import { Menu, type MenuProps } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";

type MenuItem = Required<MenuProps>["items"][number];

type DashboardTabItem = MenuItem & {
  moduleKey?: "purchases";
  featureKey?: "trackQuantityEnabled";
};

const dashboardTabItems: DashboardTabItem[] = [
  { label: <Link href="/dashboard">Overview</Link>, key: "/dashboard" },
  { label: <Link href="/dashboard/sales-reports">Sales Reports</Link>, key: "/dashboard/sales-reports" },
  { label: <Link href="/dashboard/purchase-reports">Purchase Reports</Link>, key: "/dashboard/purchase-reports", moduleKey: "purchases" },
  { label: <Link href="/dashboard/inventory-report">Inventory Report</Link>, key: "/dashboard/inventory-report", featureKey: "trackQuantityEnabled" },
  { label: <Link href="/dashboard/payments-and-accounting">Finance Report</Link>, key: "/dashboard/payments-and-accounting" },
];

export const dashboardTabRoutes = dashboardTabItems
  .map((item) => ("key" in (item || {}) ? item?.key : undefined))
  .filter((key): key is string => typeof key === "string");

export function DashboardTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const enabledModules = useSelector((state: RootState) => state.currentUser.storeSettings.enabledModules);
  const featureSettings = useSelector((state: RootState) => state.currentUser.storeSettings.features);
  const items = dashboardTabItems.filter((item) => {
    if (item.moduleKey && !enabledModules[item.moduleKey]) return false;
    if (item.featureKey && featureSettings[item.featureKey] === false) return false;
    return true;
  });

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
        items={items}
        onClick={(event) => router.push(event.key)}
      />
    </div>
  );
}
