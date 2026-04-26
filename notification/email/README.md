# notification/email

## 概要

Resend を使ったメール送信モジュール。招待メール・通知メールの HTML テンプレートを同梱。Cloud Functions Gen2 から呼び出す前提。

## インストール

```bash
npm install resend
firebase functions:secrets:set RESEND_API_KEY
```

## 使い方

```typescript
import { onCall } from 'firebase-functions/v2/https';
import { sendEmail, resendApiKeySecret, inviteEmailTemplate } from './notification/email';

export const sendInvite = onCall({ secrets: [resendApiKeySecret] }, async (request) => {
  const html = inviteEmailTemplate('My Org', 'https://app.example.com/invite?token=xxx');
  await sendEmail({ to: 'user@example.com', subject: 'My Org への招待', html });
});
```

### `sendEmail(params: SendEmailParams): Promise<void>`

メールを送信する。`RESEND_API_KEY` が未設定の場合は `Error` をthrow。

```typescript
interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string; // デフォルト: noreply@emulsia.jp
}
```

### `inviteEmailTemplate(orgName: string, inviteUrl: string): string`

招待メール用の HTML を生成する。

### `notificationEmailTemplate(title: string, body: string): string`

通知メール用の HTML を生成する。

### `resendApiKeySecret`

Cloud Functions の `secrets` 配列に渡す `SecretParam`。

## 注意事項

- `resendApiKeySecret` を Cloud Functions の `secrets` 配列に含めることで、実行時に `RESEND_API_KEY` が自動注入される。
- `from` のデフォルト値（`noreply@emulsia.jp`）は Resend で送信ドメインとして認証済みであること。
