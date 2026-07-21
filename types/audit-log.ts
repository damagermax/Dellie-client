export type AuditEntityType = "sale" | "purchase" | "contact" | "expense" | "product";
export type AuditTargetType =
  | "record"
  | "payment"
  | "fulfillment"
  | "return"
  | "landed_cost"
  | "attachment"
  | "media"
  | "employee_access"
  | "assignment"
  | "variant"
  | "inventory";

export type AuditAction = "create" | "update" | "delete" | "close" | "reopen" | "convert" | "archive" | "restore";

export type AuditLogMetadataValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | AuditLogMetadataRecord
  | AuditLogMetadataValue[];

export type AuditLogMetadataRecord = Record<string, AuditLogMetadataValue>;

export interface AuditLogEntry {
  id: string;
  entityType: AuditEntityType;
  entityId: string;
  targetType: AuditTargetType;
  targetId?: string;
  action: AuditAction;
  title: string;
  detail?: string;
  actorSnapshot?: {
    id?: string;
    name: string;
    email?: string;
    username?: string;
  };
  metadata?: AuditLogMetadataRecord & {
    created?: AuditLogMetadataRecord;
    before?: AuditLogMetadataRecord;
    after?: AuditLogMetadataRecord;
  };
  createdAt: string;
}
