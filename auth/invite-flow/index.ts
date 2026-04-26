import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v2/https';
import { getUserRole } from '../role-management';
import type { InvitationData, InvitationStatus, Role } from './types';

export type { InvitationData, InvitationStatus, Role } from './types';

const INVITATIONS = 'invitations';
const EXPIRY_MS = 72 * 60 * 60 * 1000;

function isRole(value: unknown): value is Role {
  return value === 'admin' || value === 'member' || value === 'viewer';
}

function isInvitationStatus(value: unknown): value is InvitationStatus {
  return value === 'pending' || value === 'accepted' || value === 'revoked';
}

function parseInvitationData(raw: Record<string, unknown>): InvitationData {
  const { orgId, email, role, createdBy, createdAt, expiresAt, status } = raw;

  if (
    typeof orgId !== 'string' ||
    typeof email !== 'string' ||
    !isRole(role) ||
    typeof createdBy !== 'string' ||
    !(createdAt instanceof Timestamp) ||
    !(expiresAt instanceof Timestamp) ||
    !isInvitationStatus(status)
  ) {
    throw new HttpsError('internal', '招待データの形式が不正です');
  }

  return { orgId, email, role, createdBy, createdAt, expiresAt, status };
}

export async function createInvitation(
  orgId: string,
  email: string,
  role: Role,
  callerUid: string,
): Promise<string> {
  const token = crypto.randomUUID();
  const now = Timestamp.now();
  const expiresAt = Timestamp.fromMillis(now.toMillis() + EXPIRY_MS);

  const data: InvitationData = {
    orgId,
    email,
    role,
    createdBy: callerUid,
    createdAt: now,
    expiresAt,
    status: 'pending',
  };

  const db = getFirestore();
  await db.collection(INVITATIONS).doc(token).set(data);

  return token;
}

export async function validateInvitation(token: string): Promise<InvitationData> {
  const db = getFirestore();
  const snap = await db.collection(INVITATIONS).doc(token).get();

  if (!snap.exists) {
    throw new HttpsError('not-found', '招待トークンが見つかりません');
  }

  const invitation = parseInvitationData(snap.data() as Record<string, unknown>);

  if (invitation.expiresAt.toMillis() < Date.now()) {
    throw new HttpsError('failed-precondition', '招待トークンの有効期限が切れています');
  }

  if (invitation.status !== 'pending') {
    throw new HttpsError('failed-precondition', 'この招待は既に使用済みまたは無効化されています');
  }

  return invitation;
}

export async function revokeInvitation(token: string, callerUid: string): Promise<void> {
  const callerRole = await getUserRole(callerUid);

  if (callerRole !== 'admin') {
    throw new HttpsError('permission-denied', '招待の無効化は admin のみ実行できます');
  }

  const db = getFirestore();
  const docRef = db.collection(INVITATIONS).doc(token);
  const snap = await docRef.get();

  if (!snap.exists) {
    throw new HttpsError('not-found', '招待トークンが見つかりません');
  }

  await docRef.update({ status: 'revoked' });
}
