# ai/claude

## 概要

Anthropic Claude API（`claude-sonnet-4-6`）を使った AI チャットクライアント。思考・評価タスクに適している。システムプロンプトにはプロンプトキャッシュを適用してコストを削減する。

## インストール

```bash
npm install @anthropic-ai/sdk
```

## 使い方

```typescript
import { claudeClient } from './ai/claude';

const client = claudeClient(process.env.ANTHROPIC_API_KEY!);

const reply = await client.chat('この文章を評価してください', {
  systemPrompt: 'あなたは文章評価の専門家です。',
  maxTokens: 1024,
});
```

### `claudeClient(apiKey: string): AiClient`

`AiClient` を返す。システムプロンプトには `cache_control: { type: 'ephemeral' }` を付与し、プロンプトキャッシュを利用する。

## 注意事項

- API キーは Anthropic Console から取得すること。
- プロンプトキャッシュはシステムプロンプトが約 1024 トークン以上の場合に有効になる。
- `max_tokens` のデフォルトは 1024。長い出力が必要な場合は `maxTokens` オプションで調整すること。
