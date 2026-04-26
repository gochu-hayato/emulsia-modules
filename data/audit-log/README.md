# data/audit-log

Firestore の `audit_logs` コレクションへの操作ログ自動記録モジュール。
`emulsia-build-template` の audit 実装をモジュールとして切り出したもの。

## Firestoreスキーマ

コレクション: `audit_logs/{auto-id}`

| フィールド     | 型         | 説明                          |
|--------------|------------|------------------------------|
| orgId        | string     | 組織ID                        |
| userId       | string     | 操作者のUID                   |
| action       | string     | `'create' \| 'update' \| 'delete'` |
| collection   | string     | 操作対象のコレクション名        |
| documentId   | string     | 操作対象のドキュメントID        |
| changedFields | string[]  | 変更されたフィールド名（任意）   |
| createdAt    | Timestamp  | サーバータイムスタンプ          |

## API

### `recordAuditLog(params: AuditLogParams): Promise<void>`

`audit_logs` に1件書き込む。`createdAt` はサーバータイムスタンプを使用。

### `getAuditLogs(orgId: string, options?: GetAuditLogsOptions): Promise<AuditLog[]>`

`orgId` に紐づくログを取得する。`createdAt` 降順。

```typescript
interface GetAuditLogsOptions {
  action?: 'create' | 'update' | 'delete';
  collection?: string;
  userId?: string;
  limit?: number;
  startAfter?: Timestamp;
}
```

## 使用例

```typescript
import { recordAuditLog, getAuditLogs } from './data/audit-log';

// 書き込み
await recordAuditLog({
  orgId: 'org-123',
  userId: 'uid-abc',
  action: 'update',
  collection: 'orders',
  documentId: 'order-xyz',
  changedFields: ['status', 'updatedAt'],
});

// 取得
const logs = await getAuditLogs('org-123', { action: 'delete', limit: 20 });
```

## 注意

複数フィールドでのフィルタリングと `createdAt` の `orderBy` を組み合わせる場合は、Firestore に複合インデックスが必要。
