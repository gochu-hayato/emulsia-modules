# ai

## 概要

Gemini・Claude・GPT を統一インターフェース `AiClient` で扱うモジュール群。`complete`（テキスト生成）と `completeWithImage`（画像+テキスト生成）の2メソッドを共通 API として提供する。

モデル名は `ai/config.ts` に集約し、`heavy` / `balanced` / `lite` の3ティアで管理する。推奨モデルは `.dev/references/ai-models.md` を参照。

## インストール

```bash
npm install @google/generative-ai @anthropic-ai/sdk openai
```

## 使い方

```typescript
import { claudeClient } from './ai/claude';
import { geminiClient } from './ai/gemini';
import { gptClient } from './ai/gpt';

// balanced ティア（デフォルト）
const claude = claudeClient(process.env.ANTHROPIC_API_KEY!);
const reply = await claude.complete('この文章を要約してください', {
  systemPrompt: 'あなたは要約の専門家です。',
  maxTokens: 512,
});

// heavy ティアに切り替え（呼び出しごと）
const summary = await claude.complete('複雑な推論が必要なプロンプト', { tier: 'heavy' });

// 画像解析
const gemini = geminiClient(process.env.GEMINI_API_KEY!, 'heavy');
const description = await gemini.completeWithImage(
  'この画像に何が写っていますか？',
  imageBase64,
  'image/jpeg',
);
```

### ティア

| ティア     | 用途                                       |
|------------|-------------------------------------------|
| `heavy`    | 高精度推論・複雑な評価（高コスト）           |
| `balanced` | 通常の生成タスク（デフォルト）               |
| `lite`     | 高速・低コストが優先される用途               |

### 環境変数によるモデル上書き

`AI_MODEL_CLAUDE` / `AI_MODEL_GEMINI` / `AI_MODEL_GPT` が設定されている場合、`config.ts` の値より優先される。

## 注意事項

- API キーは環境変数から取得し、ソースコードに直接記述しないこと。
- Cloud Functions から呼び出す場合は `defineSecret` でシークレット管理を行うこと。
- モデル名を変更する際は `ai/config.ts` と `.dev/references/ai-models.md` を同時に更新すること。
- 各プロバイダの利用規約・料金体系を確認してから使用すること。
