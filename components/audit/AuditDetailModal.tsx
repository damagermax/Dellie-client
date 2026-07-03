"use client";

import { Tag } from "antd";
import type { ReactNode } from "react";

import { AppModal } from "@/components/ui/AppModal";
import { formatDate } from "@/lib/dateUtils";
import type { AuditAction, AuditLogEntry, AuditLogMetadataRecord, AuditLogMetadataValue } from "@/types/audit-log";

type AuditDetailModalProps = {
  entry?: AuditLogEntry | null;
  open: boolean;
  onClose: () => void;
};

export default function AuditDetailModal({ entry, open, onClose }: AuditDetailModalProps) {
  const metadata = entry?.metadata;
  const created = asRecord(metadata?.created);
  const before = asRecord(metadata?.before);
  const after = asRecord(metadata?.after);
  const changes = before && after ? getChangedFields(before, after) : [];
  const extraMetadata = metadata ? omitKnownMetadata(metadata) : undefined;

  return (
    <AppModal open={open} toggle={onClose} title="Audit Detail" width={760} height="72vh" footer={null}>
      {entry ? (
        <div className="space-y-6 px-5 py-5 md:px-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-gray-950">{entry.title}</h3>
                {entry.detail ? <p className="mt-1 text-sm text-gray-500">{entry.detail}</p> : null}
              </div>
              <Tag className="!m-0 !rounded-full !px-3 capitalize" color={actionColor(entry.action)}>
                {entry.action}
              </Tag>
            </div>
            <div className="mt-4 grid gap-3 text-sm text-gray-600 md:grid-cols-2">
              <SummaryItem label="Actor" value={entry.actorSnapshot?.name || "Unknown user"} />
              <SummaryItem label="When" value={formatDate(entry.createdAt, "DD MMM YYYY, h:mm A")} />
              <SummaryItem label="Entity" value={titleize(entry.entityType)} />
              <SummaryItem label="Target" value={titleize(entry.targetType)} />
            </div>
          </section>

          {created ? (
            <section className="rounded-2xl border border-gray-200 bg-white p-4">
              <h4 className="text-sm font-semibold text-gray-900">Created Data</h4>
              <AuditKeyValueGrid data={created} />
            </section>
          ) : null}

          {changes.length ? (
            <section className="rounded-2xl border border-gray-200 bg-white p-4">
              <h4 className="text-sm font-semibold text-gray-900">Changes</h4>
              <div className="mt-4 space-y-3">
                {changes.map((key) => (
                  <div key={key} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">{titleize(key)}</p>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <ChangeCell label="Before" value={before?.[key]} />
                      <ChangeCell label="After" value={after?.[key]} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {extraMetadata && Object.keys(extraMetadata).length ? (
            <section className="rounded-2xl border border-gray-200 bg-white p-4">
              <h4 className="text-sm font-semibold text-gray-900">Extra Context</h4>
              <AuditKeyValueGrid data={extraMetadata} />
            </section>
          ) : null}
        </div>
      ) : null}
    </AppModal>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 px-3 py-2">
      <p className="text-xs uppercase tracking-[0.12em] text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}

function ChangeCell({ label, value }: { label: string; value: AuditLogMetadataValue }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2">
      <p className="text-xs uppercase tracking-[0.12em] text-gray-400">{label}</p>
      <div className="mt-2 text-sm text-gray-900">{renderAuditValue(value)}</div>
    </div>
  );
}

function AuditKeyValueGrid({ data }: { data: AuditLogMetadataRecord }) {
  return (
    <div className="mt-4 grid gap-3 md:grid-cols-2">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
          <p className="text-xs uppercase tracking-[0.12em] text-gray-400">{titleize(key)}</p>
          <div className="mt-2 text-sm text-gray-900">{renderAuditValue(value)}</div>
        </div>
      ))}
    </div>
  );
}

function renderAuditValue(value: AuditLogMetadataValue): ReactNode {
  if (value === null || value === undefined || value === "") return <span className="text-gray-400">-</span>;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    if (!value.length) return <span className="text-gray-400">-</span>;
    if (value.every((item) => typeof item !== "object" || item === null)) return value.map((item) => String(item)).join(", ");
    return <pre className="whitespace-pre-wrap break-words rounded-lg bg-white px-3 py-2 text-xs text-gray-700">{JSON.stringify(value, null, 2)}</pre>;
  }

  const readable = readObjectValue(value);
  if (readable) return readable;
  return <pre className="whitespace-pre-wrap break-words rounded-lg bg-white px-3 py-2 text-xs text-gray-700">{JSON.stringify(value, null, 2)}</pre>;
}

function readObjectValue(value: AuditLogMetadataRecord) {
  if (typeof value.displayName === "string") return value.displayName;
  if (typeof value.name === "string") return value.name;
  if (typeof value.code === "string" && typeof value.name === "string") return `${value.code} · ${value.name}`;
  if (typeof value.code === "string") return value.code;
  if (typeof value.number === "string") return value.number;
  if (typeof value.email === "string") return value.email;
  if (typeof value.id === "string") return value.id;
  return undefined;
}

function asRecord(value: AuditLogMetadataValue) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as AuditLogMetadataRecord) : undefined;
}

function omitKnownMetadata(metadata: AuditLogMetadataRecord) {
  return Object.fromEntries(Object.entries(metadata).filter(([key]) => !["created", "before", "after"].includes(key)));
}

function getChangedFields(before: AuditLogMetadataRecord, after: AuditLogMetadataRecord) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  return [...keys].filter((key) => JSON.stringify(before[key] ?? null) !== JSON.stringify(after[key] ?? null));
}

function titleize(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function actionColor(action: AuditAction) {
  switch (action) {
    case "create":
      return "green";
    case "update":
      return "gold";
    case "delete":
    case "archive":
      return "red";
    default:
      return "blue";
  }
}
