# ai

## 概要

複数の LLM プロバイダ（Gemini・Claude・GPT）を統一インターフェース `AiClient` で扱うモジュール群。

## インストール

```bash
npm install @google/generative-ai @anthropic-ai/sdk openai
```

## 使い方

```typescript
import { geminiClient } from './ai/gemini';
import { claudeClient } from './ai/claude';
import { gptClient } from './ai/gpt';

const client = geminiClient(process.env.GEMINI_API_KEY!);
const reply = await client.chat('日本語で挨拶してください');
```

各プロバイダのモジュールは `AiClient` インターフェースを実装しているため、差し替えが容易。

## 注意事項

- API キーは環境変数から取得し、ソースコードに直接記述しないこと。
- Cloud Functions から呼び出す場合は `defineSecret` でシークレット管理を行うこと。
- 各プロバイダの利用規約・料金体系を確認してから使用すること。
