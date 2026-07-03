"use client";

import Link from "next/link";
import { DashboardCard } from "./DashboardCard";
import { DashboardOverviewSaleItem } from "@/types/dashboard-overview";
import { formatDashboardMoney } from "./dashboard-utils";
import { formatDate } from "@/lib/dateUtils";
import { TransactionBalancePill } from "@/components/ui/TransactionBalancePill";

interface DashboardOverviewSalesCardProps {
  sales: DashboardOverviewSaleItem[];
  showingRecent: boolean;
  className?: string;
}

export function DashboardOverviewSalesCard({ sales, showingRecent, className }: DashboardOverviewSalesCardProps) {
  return (
    <DashboardCard
      className={className}
      title={showingRecent ? "Recent Sales" : "Sales Today"}
      description={showingRecent ? "No sales were recorded today. Showing your latest completed sales instead." : "Orders recorded today across the active store."}
      contentClassName="p-0"
    >
      {sales.length ? (
        <div className="divide-y divide-gray-100">
          {sales.map((sale) => (
            <Link key={sale.id} href={`/orders/${sale.id}`} className="block px-6 py-4 transition-colors hover:bg-gray-50">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="truncate font-medium text-gray-950">{sale.documentNumber}</p>
                  </div>
                  <p className="mt-1 truncate text-sm text-gray-500">{sale.customerName}</p>
                </div>
                <div className="flex items-center justify-between gap-4 md:justify-end">
                  <div className="text-left md:text-right">
                    <p className="font-semibold text-gray-950">{formatDashboardMoney(sale.currencyCode, sale.amount)}</p>
                    <p className="mt-1 text-xs text-gray-500">{formatDate(sale.date, "DD MMM YYYY, h:mm A")}</p>
                  </div>
                  <TransactionBalancePill balance={sale.balance} currencyCode={sale.currencyCode} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="px-6 py-16 text-center">
          <p className="font-medium text-gray-950">No sales yet.</p>
          <p className="mt-2 text-sm text-gray-500">Once sales are recorded, they will appear here.</p>
        </div>
      )}
    </DashboardCard>
  );
}
