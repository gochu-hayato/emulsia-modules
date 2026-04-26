export type Role = 'admin' | 'member' | 'viewer';

export interface UserRoleDocument {
  role: Role;
}
