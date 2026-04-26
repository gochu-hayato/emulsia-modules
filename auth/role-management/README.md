# auth/role-management

Firebase AuthとFirestoreを使ったロール管理モジュール。Custom Claimsは使わず、Firestoreの `users/{uid}.role` を正とする。

## ロール階層

| ロール | レベル |
|--------|--------|
| admin  | 3      |
| member | 2      |
| viewer | 1      |

上位ロールは下位ロールが要求する操作をすべて実行できる。

## API

### `getUserRole(uid: string): Promise<Role>`

Firestoreの `users/{uid}.role` からロールを取得する。

- ドキュメントが存在しない場合 → `HttpsError('not-found')`
- `role` フィールドが不正な値の場合 → `HttpsError('internal')`

### `requireRole(uid: string, requiredRole: Role): Promise<void>`

ユーザーが指定ロール以上の権限を持っているか検証する。権限不足の場合は `HttpsError('permission-denied')` をthrowする。

### `updateUserRole(targetUid: string, newRole: Role, callerUid: string): Promise<void>`

対象ユーザーのロールを更新する。`callerUid` が `admin` でない場合は `HttpsError('permission-denied')` をthrowする。

## 前提

- Cloud Functions Gen2
- `firebase-admin` の初期化済みアプリが存在すること（`initializeApp()` を呼び出し済み）
- Firestoreコレクション `users` の各ドキュメントに `role` フィールドが存在すること

## 使用例

```typescript
import { getUserRole, requireRole, updateUserRole } from './auth/role-management';

// ロール取得
const role = await getUserRole('uid-xxx');

// admin以上の権限を要求
await requireRole(callerUid, 'admin');

// ロール変更（callerUidがadminである必要がある）
await updateUserRole('target-uid', 'member', 'admin-uid');
```
