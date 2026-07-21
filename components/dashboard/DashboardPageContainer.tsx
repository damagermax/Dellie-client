"use client";

import { cn } from "@/lib/utils";

export function DashboardPageContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("h-full bg-gray-50 p-4 md:bg-white md:p-6", className)}>{children}</div>;
}
