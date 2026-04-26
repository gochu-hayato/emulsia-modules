import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import type { AuditLog, AuditLogParams, GetAuditLogsOptions } from './types';

export type { AuditAction, AuditLog, AuditLogParams, GetAuditLogsOptions } from './types';

const COLLECTION = 'audit_logs';

export async function recordAuditLog(params: AuditLogParams): Promise<void> {
  const db = getFirestore();
  await db.collection(COLLECTION).add({
    ...params,
    createdAt: FieldValue.serverTimestamp(),
  });
}

export async function getAuditLogs(
  orgId: string,
  options?: GetAuditLogsOptions,
): Promise<AuditLog[]> {
  const db = getFirestore();

  const base = db.collection(COLLECTION).where('orgId', '==', orgId);

  const withAction = options?.action ? base.where('action', '==', options.action) : base;
  const withColl = options?.collection
    ? withAction.where('collection', '==', options.collection)
    : withAction;
  const withUser = options?.userId
    ? withColl.where('userId', '==', options.userId)
    : withColl;

  let q = withUser.orderBy('createdAt', 'desc');

  if (options?.startAfter) {
    q = q.startAfter(options.startAfter);
  }

  const finalQuery = options?.limit !== undefined ? q.limit(options.limit) : q;
  const snap = await finalQuery.get();

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<AuditLog, 'id'>),
  }));
}
