# payment/stripe

## 概要

Stripe SDK を使った決済モジュール。PaymentIntent 作成と Webhook 受信に対応。Cloud Functions Gen2 から呼び出す前提。

## インストール

```bash
npm install stripe
firebase functions:secrets:set STRIPE_SECRET_KEY
```

## 使い方

```typescript
import { onCall, onRequest } from 'firebase-functions/v2/https';
import { createPaymentIntent, handleWebhook, stripeSecretKey } from './payment/stripe';

// PaymentIntent 作成
export const startCheckout = onCall({ secrets: [stripeSecretKey] }, async (request) => {
  const clientSecret = await createPaymentIntent(1000); // ¥1,000
  return { clientSecret };
});

// Webhook 受信
export const stripeWebhook = onRequest({ secrets: [stripeSecretKey] }, async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const event = handleWebhook(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);

  switch (event.type) {
    case 'payment_intent.succeeded':
      // 決済完了処理
      break;
  }

  res.json({ received: true });
});
```

### `createPaymentIntent(amount: number, currency?: string): Promise<string>`

PaymentIntent を作成して `client_secret` を返す。デフォルト通貨は `jpy`。

### `handleWebhook(rawBody: Buffer, signature: string, secret: string): StripeEvent`

Webhook の署名を検証してイベントを返す。署名が無効な場合は `StripeSignatureVerificationError` をthrow。

### `stripeSecretKey`

Cloud Functions の `secrets` 配列に渡す `SecretParam`。

## 注意事項

- `handleWebhook` は必ず `stripe-signature` ヘッダーと Webhook エンドポイントの署名シークレットで検証を行う。署名が不正な場合は `StripeSignatureVerificationError` がthrowされるため、呼び出し元でキャッチして 400 を返すこと。
- `stripeSecretKey` を Cloud Functions の `secrets` 配列に含めることで、実行時に `STRIPE_SECRET_KEY` が自動注入される。
