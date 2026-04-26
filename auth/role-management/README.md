# auth/role-management

## 概要

Firebase Auth と Firestore を使ったロール管理モジュール。Custom Claims は使わず、Firestore の `users/{uid}.role` を正とする。

ロール階層: `admin`（3）> `member`（2）> `viewer`（1）。上位ロールは下位ロールが要求する操作をすべて実行できる。

## インストール

```bash
npm install firebase-admin firebase-functions
```

## 使い方

```typescript
import { getUserRole, requireRole, updateUserRole } from './auth/role-management';

// ロール取得
const role = await getUserRole('uid-xxx');

// admin 以上の権限を要求
await requireRole(callerUid, 'admin');

// ロール変更（callerUid が admin である必要がある）
await updateUserRole('target-uid', 'member', 'admin-uid');
```

### `getUserRole(uid: string): Promise<Role>`

Firestore の `users/{uid}.role` からロールを取得する。ドキュメント未存在時は `HttpsError('not-found')`、不正値は `HttpsError('internal')`。

### `requireRole(uid: string, requiredRole: Role): Promise<void>`

ユーザーが指定ロール以上の権限を持っているか検証する。権限不足の場合は `HttpsError('permission-denied')`。

### `updateUserRole(targetUid: string, newRole: Role, callerUid: string): Promise<void>`

対象ユーザーのロールを更新する。`callerUid` が `admin` でない場合は `HttpsError('permission-denied')`。

## 注意事項

- Cloud Functions Gen2 からの呼び出しを前提とする。
- `firebase-admin` の初期化済みアプリが存在すること（`initializeApp()` 呼び出し済み）。
- Firestore コレクション `users` の各ドキュメントに `role` フィールドが存在すること。
