"use client";

import Link from "next/link";
import { DashboardCard } from "./DashboardCard";
import { DashboardAttentionCounts } from "@/types/dashboard-overview";
import { cn } from "@/lib/utils";

interface DashboardAttentionCountsSectionProps {
  counts?: DashboardAttentionCounts;
}

const DEFAULT_COUNTS: DashboardAttentionCounts = {
  unpaidSales: 0,
  overdueInvoices: 0,
  unfulfilledSales: 0,
  unpaidPurchases: 0,
  overdueExpenses: 0,
};

const ATTENTION_ITEMS: Array<{
  key: keyof DashboardAttentionCounts;
  title: string;
  href: string;
}> = [
  {
    key: "unpaidSales",
    title: "Unpaid Sales",
    href: "/orders?paymentStatus=unpaid",
  },
  {
    key: "overdueInvoices",
    title: "Overdue Invoices",
    href: "/orders?overdue=true",
  },
  {
    key: "unfulfilledSales",
    title: "Unfulfilled Sales",
    href: "/orders?fulfillmentStatus=pending",
  },
  {
    key: "unpaidPurchases",
    title: "Unpaid Purchases",
    href: "/purchases?paymentStatus=unpaid",
  },
  {
    key: "overdueExpenses",
    title: "Overdue Expenses",
    href: "/expenses?overdue=true",
  },
];

export function DashboardAttentionCountsSection({ counts }: DashboardAttentionCountsSectionProps) {
  const resolvedCounts = counts || DEFAULT_COUNTS;

  return (
    <section className="space-y-2.5">
      <div>
        <p className="text-sm font-semibold text-gray-950">Needs Attention Today</p>
      </div>
      <DashboardCard className="border-gray-300 bg-white" contentClassName="px-5 py-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5 xl:gap-0">
          {ATTENTION_ITEMS.map((item, index) => (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "block rounded-lg transition-colors hover:bg-gray-50",
                index > 0 && "xl:border-l xl:border-gray-200 xl:pl-4",
                index < ATTENTION_ITEMS.length - 1 && "sm:border-r sm:border-gray-200 sm:pr-4 xl:border-r-0 xl:pr-0",
                index > 0 && "sm:pl-4",
              )}
            >
              <p className="text-xs font-medium text-gray-500">{item.title}</p>
              <p className="mt-1 text-2xl font-semibold text-gray-950">{resolvedCounts[item.key].toLocaleString()}</p>
            </Link>
          ))}
        </div>
      </DashboardCard>
    </section>
  );
}
