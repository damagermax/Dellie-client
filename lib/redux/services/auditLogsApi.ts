import type { AuditEntityType, AuditLogEntry } from "@/types/audit-log";
import { baseApi, TAG_TYPES } from "./baseApi";

export const auditLogsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<AuditLogEntry[], { entityType: AuditEntityType; entityId: string }>({
      query: ({ entityType, entityId }) => ({
        url: "audit-logs",
        params: { entityType, entityId },
      }),
      providesTags: (result, error, { entityType, entityId }) => [
        TAG_TYPES.AUDIT_LOGS,
        { type: TAG_TYPES.AUDIT_LOGS, id: `${entityType}:${entityId}` },
      ],
    }),
  }),
});

export const { useGetAuditLogsQuery } = auditLogsApi;
