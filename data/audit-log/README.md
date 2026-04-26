# data/audit-log

## 概要

Firestore の `audit_logs` コレクションへの操作ログ自動記録モジュール。`emulsia-build-template` の audit 実装をモジュールとして切り出したもの。

## インストール

```bash
npm install firebase-admin
```

## 使い方

```typescript
import { recordAuditLog, getAuditLogs } from './data/audit-log';

// ログ書き込み
await recordAuditLog({
  orgId: 'org-123',
  userId: 'uid-abc',
  action: 'update',
  collection: 'orders',
  documentId: 'order-xyz',
  changedFields: ['status', 'updatedAt'],
});

// ログ取得
const logs = await getAuditLogs('org-123', { action: 'delete', limit: 20 });
```

### `recordAuditLog(params: AuditLogParams): Promise<void>`

`audit_logs` に 1 件書き込む。`createdAt` はサーバータイムスタンプ。

### `getAuditLogs(orgId: string, options?: GetAuditLogsOptions): Promise<AuditLog[]>`

`orgId` に紐づくログを `createdAt` 降順で取得する。

```typescript
interface GetAuditLogsOptions {
  action?: 'create' | 'update' | 'delete';
  collection?: string;
  userId?: string;
  limit?: number;
  startAfter?: Timestamp;
}
```

## 注意事項

- 複数フィールドでのフィルタリングと `createdAt` の `orderBy` を組み合わせる場合は、Firestore に複合インデックスが必要。
- `firebase-admin` の初期化済みアプリが存在すること。
