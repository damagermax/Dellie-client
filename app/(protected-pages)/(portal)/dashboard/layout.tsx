"use client";

import { usePermissions } from "@/hooks/usePermissions";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { ready } = usePermissions();

  if (!ready) return <>{children}</>;

  return (
    <div>
      <DashboardTabs />
      {children}
    </div>
  );
}
