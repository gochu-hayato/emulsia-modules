import type { Timestamp } from 'firebase-admin/firestore';
import type { Role } from '../role-management/types';

export type { Role };

export type InvitationStatus = 'pending' | 'accepted' | 'revoked';

export interface InvitationData {
  orgId: string;
  email: string;
  role: Role;
  createdBy: string;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  status: InvitationStatus;
}
