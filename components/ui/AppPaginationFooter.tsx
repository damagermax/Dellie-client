"use client";

import { Pagination } from "antd";
import { PaginationMeta } from "@/types/shared";

interface AppPaginationFooterProps {
  entity: string;
  dataLength: number;
  meta?: PaginationMeta;
  page?: number;
  limit?: number;
  total?: number;
  sticky?: boolean;
  onChange: (page: number, limit: number) => void;
}

export default function AppPaginationFooter({ entity, dataLength, meta, page: pageProp, limit: limitProp, total: totalProp, sticky = true, onChange }: AppPaginationFooterProps) {
  const page = meta?.page || pageProp || 1;
  const limit = meta?.limit || limitProp || 20;
  const apiTotal = meta?.total || totalProp || 0;
  const from = dataLength > 0 ? (page - 1) * limit + 1 : 0;
  const to = (page - 1) * limit + dataLength;
  const shouldEstimateNextPage = dataLength === limit && apiTotal <= to;
  const total = shouldEstimateNextPage ? to + 1 : Math.max(apiTotal, to);
  const showPagination = dataLength > 0 && (total > limit || page > 1);

  if (!showPagination) return null;

  return (
    <div className={`${sticky ? "sticky bottom-0 z-10" : ""} flex items-center justify-between border-t border-gray-100 bg-white/95 px-8 py-4 backdrop-blur`}>
      <p className="text-sm text-gray-500">
        Showing {from}-{to} of {shouldEstimateNextPage ? `${to}+` : total} {entity}
      </p>
      <Pagination current={page} pageSize={limit} total={total} showSizeChanger pageSizeOptions={["20", "50", "100"]} onChange={onChange} />
    </div>
  );
}
