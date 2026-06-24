"use client";

import { cn } from "@/lib/utils";

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  title?: string;
  description?: string;
  headerExtra?: React.ReactNode;
}

export function DashboardCard({ children, className, contentClassName, title, description, headerExtra }: DashboardCardProps) {
  return (
    <div className={cn("rounded-sm border border-gray-200 bg-white", className)}>
      {title || description || headerExtra ? (
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-4">
          <div className="min-w-0">
            {title ? <p className="font-medium text-gray-950">{title}</p> : null}
            {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
          </div>
          {headerExtra}
        </div>
      ) : null}
      <div className={cn("px-6 py-5", contentClassName)}>{children}</div>
    </div>
  );
}
