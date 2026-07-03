"use client";

import { useState } from "react";
import { FileText, ImageIcon, PackageCheck, Pencil, RefreshCcw, RotateCcw, UserCog, Wallet } from "lucide-react";

import { useGetAuditLogsQuery } from "@/lib/redux/services";
import { formatDate } from "@/lib/dateUtils";
import type { AuditAction, AuditEntityType, AuditTargetType } from "@/types/audit-log";
import AuditDetailModal from "./AuditDetailModal";

type EntityAuditTimelineProps = {
  entityType: AuditEntityType;
  entityId: string;
  className?: string;
};

export default function EntityAuditTimeline({ entityType, entityId, className = "" }: EntityAuditTimelineProps) {
  const { data = [], isLoading } = useGetAuditLogsQuery({ entityType, entityId }, { skip: !entityId });
  const [selectedEntry, setSelectedEntry] = useState<(typeof data)[number] | null>(null);

  return (
    <div className={className}>
      <h2 className="text-base font-medium text-gray-900">Activity</h2>
      <p className="mt-2 text-sm text-gray-500">Track the recorded actions for this {entityType}.</p>

      {isLoading ? (
        <div className="mt-6 space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-sm border border-gray-200 bg-white px-4 py-4">
              <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
              <div className="mt-3 h-3 w-full animate-pulse rounded bg-gray-100" />
              <div className="mt-2 h-3 w-32 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      ) : data.length ? (
        <ol className="mt-6 space-y-5">
          {data.map((item, index) => (
            <li key={item.id} className="relative pl-9">
              {index < data.length - 1 ? <span className="absolute left-[11px] top-7 h-[calc(100%+12px)] w-px bg-gray-200" aria-hidden /> : null}
              <span className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600">{activityIcon(item.targetType, item.action)}</span>
              <button type="button" onClick={() => setSelectedEntry(item)} className="w-full text-left">
                <p className="text-sm font-medium text-gray-900 transition hover:text-[#2d837d]">{item.title}</p>
                {item.detail ? <p className="mt-1 text-sm leading-5 text-gray-500">{item.detail}</p> : null}
                <p className="mt-2 text-xs text-gray-500">{item.actorSnapshot?.name || "Unknown user"}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-gray-400">{formatDate(item.createdAt, "DD MMM YYYY, h:mm A")}</p>
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <div className="mt-6  text-sm text-gray-500">No audit activity recorded yet.</div>
      )}
      <AuditDetailModal entry={selectedEntry} open={Boolean(selectedEntry)} onClose={() => setSelectedEntry(null)} />
    </div>
  );
}

function activityIcon(targetType: AuditTargetType, action: AuditAction) {
  if (targetType === "payment") return <Wallet size={14} />;
  if (targetType === "fulfillment") return <PackageCheck size={14} />;
  if (targetType === "return") return <RotateCcw size={14} />;
  if (targetType === "employee_access" || targetType === "assignment") return <UserCog size={14} />;
  if (targetType === "media" || targetType === "attachment") return <ImageIcon size={14} />;
  if (action === "update" || action === "archive" || action === "restore") return <Pencil size={14} />;
  if (action === "reopen" || action === "convert") return <RefreshCcw size={14} />;
  return <FileText size={14} />;
}
