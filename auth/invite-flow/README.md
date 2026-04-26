# auth/invite-flow

## 概要

招待トークン発行 → メール送信 → 受諾 → アカウント作成のフロー実装。`emulsia-build-template` の `bootstrapUser` と連携することを前提とする。

フロー: `createInvitation()` でトークン発行・Firestore 書き込み（有効期限 72 時間）→ 招待メール送信（別モジュール担当）→ `validateInvitation()` でトークン検証 → `bootstrapUser()` でアカウント作成・ロール付与。

## インストール

```bash
npm install firebase-admin firebase-functions
```

## 使い方

```typescript
import { createInvitation, validateInvitation, revokeInvitation } from './auth/invite-flow';

// 招待作成
const token = await createInvitation('org-123', 'user@example.com', 'member', 'admin-uid');

// 受諾時の検証
const invitation = await validateInvitation(token);
// → { orgId, email, role, createdBy, createdAt, expiresAt, status }

// 招待の無効化
await revokeInvitation(token, 'admin-uid');
```

### `createInvitation(orgId, email, role, callerUid): Promise<string>`

`crypto.randomUUID()` でトークンを生成し `invitations/{token}` に書き込む。有効期限は 72 時間。

### `validateInvitation(token): Promise<InvitationData>`

トークンを検証して `InvitationData` を返す。未存在・有効期限切れ・使用済みの場合は `HttpsError('not-found' | 'failed-precondition')`。

### `revokeInvitation(token, callerUid): Promise<void>`

招待を無効化する（`status: 'revoked'` に更新）。`callerUid` が `admin` でない場合は `HttpsError('permission-denied')`。

## 注意事項

- Cloud Functions Gen2 からの呼び出しを前提とする。
- `firebase-admin` の初期化済みアプリが存在すること。
- `auth/role-management` モジュールが利用可能であること。
- メール送信は `notification/email` モジュールと組み合わせること。
