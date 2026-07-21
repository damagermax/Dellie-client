"use client";

import { cn } from "@/lib/utils";

export function DashboardToolbar({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between", className)}>{children}</div>;
}
