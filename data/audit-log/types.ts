import type { Timestamp } from 'firebase-admin/firestore';

export type AuditAction = 'create' | 'update' | 'delete';

export interface AuditLogParams {
  orgId: string;
  userId: string;
  action: AuditAction;
  collection: string;
  documentId: string;
  changedFields?: string[];
}

export interface AuditLog extends AuditLogParams {
  id: string;
  createdAt: Timestamp;
}

export interface GetAuditLogsOptions {
  action?: AuditAction;
  collection?: string;
  userId?: string;
  limit?: number;
  startAfter?: Timestamp;
}
