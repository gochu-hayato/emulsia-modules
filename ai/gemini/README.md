# ai/gemini

## 概要

Google Gemini API（`gemini-1.5-flash`）を使った AI チャットクライアント。大量コンテキスト処理・画像解析に適している。

## インストール

```bash
npm install @google/generative-ai
```

## 使い方

```typescript
import { geminiClient } from './ai/gemini';

const client = geminiClient(process.env.GEMINI_API_KEY!);

const reply = await client.chat('この画像について説明してください', {
  systemPrompt: 'あなたは画像解析の専門家です。',
  maxTokens: 512,
  temperature: 0.7,
});
```

### `geminiClient(apiKey: string): AiClient`

`AiClient` を返す。`chat(userMessage, options?)` でメッセージを送信し、応答テキストを返す。

## 注意事項

- `gemini-1.5-flash` は大量トークンを安価に処理できるが、推論精度は Gemini 1.5 Pro より低い。
- API キーは Google AI Studio から取得すること。
- 利用量に応じた課金が発生するため、`maxTokens` で上限を設定することを推奨。
