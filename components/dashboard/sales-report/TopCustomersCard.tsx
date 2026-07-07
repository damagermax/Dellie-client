"use client";

import { AppModal } from "@/components/ui/AppModal";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import type { SalesReportResponse } from "@/types/sales-report";
import { formatDashboardMoney } from "../dashboard-utils";
import { useMemo, useState } from "react";

const PREVIEW_LIMIT = 5;

export function TopCustomersCard({ report }: { report: SalesReportResponse }) {
  const money = (value: number) => formatDashboardMoney(report.currencyCode, value);
  const [viewMoreOpen, setViewMoreOpen] = useState(false);
  const previewCustomers = useMemo(() => report.topCustomers.slice(0, PREVIEW_LIMIT), [report.topCustomers]);
  const hasOverflow = report.topCustomers.length > PREVIEW_LIMIT;

  return (
    <>
      <DashboardCard
        className="h-full"
        title="Top Customers"
        description="Customers driving the highest value this period."
        contentClassName="space-y-4"
        headerExtra={
          hasOverflow ? (
            <button type="button" onClick={() => setViewMoreOpen(true)} className="shrink-0 text-sm font-medium text-[#2d837d] transition hover:text-[#256b66]">
              View more
            </button>
          ) : null
        }
      >
        {report.topCustomers.length ? previewCustomers.map((customer) => <TopCustomerRow key={customer.id || customer.name} customer={customer} money={money} />) : <p className="py-8 text-center text-sm text-gray-500">Customer performance will appear here.</p>}
      </DashboardCard>

      <AppModal open={viewMoreOpen} toggle={() => setViewMoreOpen(false)} title="Top Customers" footer={null} width={760} height="70vh">
        <div className="space-y-4 bg-white px-6 py-5">
          {report.topCustomers.map((customer) => (
            <TopCustomerRow key={customer.id || customer.name} customer={customer} money={money} />
          ))}
        </div>
      </AppModal>
    </>
  );
}

function TopCustomerRow({
  customer,
  money,
}: {
  customer: SalesReportResponse["topCustomers"][number];
  money: (value: number) => string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
      <div className="min-w-0">
        <p className="font-medium text-gray-900">{customer.name}</p>
        <p className="mt-1 text-xs text-gray-500">
          {customer.orderCount} {customer.orderCount === 1 ? "order" : "orders"} · {customer.paidOrderCount} paid
        </p>
      </div>
      <p className="font-semibold text-gray-950">{money(customer.netSales)}</p>
    </div>
  );
}
