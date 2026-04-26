# notification/email

Resendを使ったメール送信モジュール。Cloud Functions Gen2から呼び出す。

## セットアップ

### 1. シークレット登録

```bash
firebase functions:secrets:set RESEND_API_KEY
```

### 2. Cloud Functions でシークレットを宣言

```typescript
import { onCall } from 'firebase-functions/v2/https';
import { sendEmail, resendApiKeySecret } from './notification/email';

export const myFunction = onCall({ secrets: [resendApiKeySecret] }, async (request) => {
  await sendEmail({ to: 'user@example.com', subject: '件名', html: '<p>本文</p>' });
});
```

`resendApiKeySecret` を `secrets` 配列に含めることで、実行時に `RESEND_API_KEY` が自動的に注入される。

## API

### `sendEmail(params: SendEmailParams): Promise<void>`

メールを送信する。`RESEND_API_KEY` が未設定の場合は `Error` をthrowする。

```typescript
interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string; // デフォルト: noreply@emulsia.jp
}
```

### `inviteEmailTemplate(orgName: string, inviteUrl: string): string`

招待メール用のHTMLを生成する。

### `notificationEmailTemplate(title: string, body: string): string`

通知メール用のHTMLを生成する。

## エクスポート

| 名前 | 種別 | 説明 |
|------|------|------|
| `sendEmail` | 関数 | メール送信 |
| `resendApiKeySecret` | SecretParam | Cloud Functions の `secrets` 配列に渡す |
| `inviteEmailTemplate` | 関数 | 招待メールHTMLテンプレート |
| `notificationEmailTemplate` | 関数 | 通知メールHTMLテンプレート |
| `SendEmailParams` | 型 | sendEmailの引数型 |

## 使用例

```typescript
import {
  sendEmail,
  resendApiKeySecret,
  inviteEmailTemplate,
  notificationEmailTemplate,
} from './notification/email';

// 招待メール
const html = inviteEmailTemplate('My Org', 'https://app.example.com/invite?token=xxx');
await sendEmail({ to: 'user@example.com', subject: 'My Org への招待', html });

// 通知メール
const html2 = notificationEmailTemplate('申請が承認されました', '<p>申請内容が承認されました。</p>');
await sendEmail({ to: 'user@example.com', subject: '申請承認のお知らせ', html: html2 });
```
