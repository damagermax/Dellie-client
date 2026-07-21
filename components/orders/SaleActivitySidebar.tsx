"use client";

import EntityAuditTimeline from "@/components/audit/EntityAuditTimeline";
import type { Sale } from "@/types/sale";

export default function SaleActivitySidebar({ sale }: { sale: Sale }) {
  return (
    <aside className="hidden w-full border-t border-gray-200 bg-gray-50 lg:block lg:w-[30%] lg:border-l lg:border-t-0">
      <div className="px-5 pb-8 pt-6 lg:px-7">
        <EntityAuditTimeline entityType="sale" entityId={sale.id} />
      </div>
    </aside>
  );
}
