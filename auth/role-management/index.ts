import { getFirestore } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v2/https';

export type { Role } from './types';
import type { Role } from './types';

const ROLE_HIERARCHY: Record<Role, number> = {
  admin: 3,
  member: 2,
  viewer: 1,
};

function isValidRole(value: unknown): value is Role {
  return value === 'admin' || value === 'member' || value === 'viewer';
}

export async function getUserRole(uid: string): Promise<Role> {
  const db = getFirestore();
  const snap = await db.collection('users').doc(uid).get();

  if (!snap.exists) {
    throw new HttpsError('not-found', `ユーザー（uid: ${uid}）が見つかりません`);
  }

  const rawRole: unknown = snap.data()?.role;

  if (!isValidRole(rawRole)) {
    throw new HttpsError('internal', `ユーザー（uid: ${uid}）のロールが不正です`);
  }

  return rawRole;
}

export async function requireRole(uid: string, requiredRole: Role): Promise<void> {
  const userRole = await getUserRole(uid);

  if (ROLE_HIERARCHY[userRole] < ROLE_HIERARCHY[requiredRole]) {
    throw new HttpsError(
      'permission-denied',
      `この操作には ${requiredRole} 以上の権限が必要です。現在のロール: ${userRole}`,
    );
  }
}

export async function updateUserRole(
  targetUid: string,
  newRole: Role,
  callerUid: string,
): Promise<void> {
  const callerRole = await getUserRole(callerUid);

  if (callerRole !== 'admin') {
    throw new HttpsError('permission-denied', 'ロールの変更は admin のみ実行できます');
  }

  const db = getFirestore();
  await db.collection('users').doc(targetUid).update({ role: newRole });
}
