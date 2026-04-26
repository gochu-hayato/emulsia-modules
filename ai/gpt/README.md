# ai/gpt

## 概要

OpenAI GPT API（`gpt-4o`）を使った AI チャットクライアント。二次評価・汎用タスクに適している。

## インストール

```bash
npm install openai
```

## 使い方

```typescript
import { gptClient } from './ai/gpt';

const client = gptClient(process.env.OPENAI_API_KEY!);

const reply = await client.chat('このコードをレビューしてください', {
  systemPrompt: 'あなたはシニアエンジニアです。',
  maxTokens: 2048,
  temperature: 0.5,
});
```

### `gptClient(apiKey: string): AiClient`

`AiClient` を返す。`chat(userMessage, options?)` でメッセージを送信し、応答テキストを返す。

## 注意事項

- API キーは OpenAI Platform から取得すること。
- `gpt-4o` は高精度だが `gpt-4o-mini` より高コスト。用途に応じてモデルを検討すること。
- 利用量に応じた課金が発生するため、`maxTokens` で上限を設定することを推奨。
