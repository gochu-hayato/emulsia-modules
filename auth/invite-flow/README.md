# auth/invite-flow

招待トークン発行→メール送信→受諾→アカウント作成のフロー実装。
`emulsia-build-template` の `bootstrapUser` と連携することを前提とする。

## フロー概要

```
1. createInvitation()  → token 発行・Firestore書き込み（有効期限72時間）
2. （メール送信）       → token をURLに埋め込んで送付（別モジュール担当）
3. validateInvitation() → token検証・InvitationData返却
4. bootstrapUser()     → アカウント作成・ロール付与（emulsia-build-template）
```

## Firestoreスキーマ

コレクション: `invitations/{token}`

| フィールド  | 型                              | 説明                           |
|------------|--------------------------------|-------------------------------|
| orgId      | string                         | 招待先の組織ID                  |
| email      | string                         | 招待先のメールアドレス            |
| role       | `'admin' \| 'member' \| 'viewer'` | 付与するロール                  |
| createdBy  | string                         | 招待作成者のUID                 |
| createdAt  | Timestamp                      | 作成日時                        |
| expiresAt  | Timestamp                      | 有効期限（作成から72時間後）       |
| status     | `'pending' \| 'accepted' \| 'revoked'` | 招待ステータス          |

## API

### `createInvitation(orgId, email, role, callerUid): Promise<string>`

`crypto.randomUUID()` でトークンを生成し `invitations/{token}` に書き込む。有効期限は72時間。

### `validateInvitation(token): Promise<InvitationData>`

トークンを検証して `InvitationData` を返す。

- トークン未存在 → `HttpsError('not-found')`
- 有効期限切れ → `HttpsError('failed-precondition')`
- 使用済み・無効化済み → `HttpsError('failed-precondition')`

### `revokeInvitation(token, callerUid): Promise<void>`

招待を無効化する（`status: 'revoked'` に更新）。`callerUid` が `admin` でない場合は `HttpsError('permission-denied')`。

## 前提

- Cloud Functions Gen2
- `firebase-admin` の初期化済みアプリが存在すること
- `auth/role-management` モジュールが利用可能であること

## 使用例

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
