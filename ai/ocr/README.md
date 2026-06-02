# ai/ocr

## 概要

画像・PDF からスキーマに従って**型付きの構造化データ**を抽出する OCR モジュール。

抽出本体は AI SDK（[`ai`](https://www.npmjs.com/package/ai)）の `generateObject` に委譲しており、`AiClient.completeWithDocumentStructured` 経由で **Gemini / Claude** を同一インターフェースで利用する。本モジュール（`extractFromDocument`）が担うのは次の 4 つ。

1. mimeType 判定（`image/*` or `application/pdf`）
2. 大きい PDF のページ分割（`pdf-lib`）と各チャンクの抽出
3. 補正関数の適用（全角半角・日付整形など）
4. Zod スキーマによる検証（成功＝型付きデータ / 失敗＝エラー情報）

プロバイダー差異の吸収・JSON 検証・リトライは AI SDK に任せる。モデル名は `ai/config.ts` の `AI_MODELS` から参照し、直書きしない。

## 設計方針（copy-on-use）

- **見本集**: このモジュールは「踏襲すべき構造」を示すサンプル。各案件はコピーして使い、実行は各案件側で完結させる（中央集約しない）。
- **設定はコードに書く**: スキーマ・プロンプト・補正関数はコードで管理し、DB には持たない。
- **汎用スキーマは `schemas/`、案件固有スキーマは各案件リポジトリ側**に置く。

## インストール

```bash
npm install ai @ai-sdk/google @ai-sdk/anthropic zod pdf-lib
```

## 使い方

### 画像から請求書を抽出

```typescript
import { geminiClient } from '../gemini';
import { extractFromDocument, invoiceSchema, toHalfWidth, normalizeDate } from './';

const client = geminiClient(process.env.GEMINI_API_KEY!);

const result = await extractFromDocument({
  client,
  prompt: '請求書の各項目を抽出してください。',
  data: imageBase64,        // 画像の base64
  mimeType: 'image/png',
  schema: invoiceSchema,
  // 任意: 検証前に素値を整える
  correct: (raw) => {
    const obj = raw as Record<string, unknown>;
    return { ...obj, issueDate: normalizeDate(toHalfWidth(String(obj.issueDate))) };
  },
});

if (result.ok) {
  console.log(result.data.totalAmount); // 型付き（Invoice）
} else {
  console.error(result.issues); // Zod の検証エラー
}
```

### 大きい PDF（ページ分割 + 統合）

ページ数が上限を超える PDF は自動でチャンク分割され、チャンクごとに抽出される。複数チャンクを 1 件の帳票に統合するには `merge` を渡す（**分割が発生する PDF では必須**）。

```typescript
import { claudeClient } from '../claude';
import { extractFromDocument, invoiceSchema, type Invoice } from './';

const client = claudeClient(process.env.ANTHROPIC_API_KEY!);

const result = await extractFromDocument<Invoice>({
  client,
  prompt: '請求書の各項目を抽出してください。',
  data: pdfBase64,
  mimeType: 'application/pdf',
  schema: invoiceSchema,
  chunking: { pagesPerChunk: 5 },   // 5 ページ超で分割。1 チャンク = 5 ページ
  merge: (chunks) => ({
    ...chunks[0],
    lineItems: chunks.flatMap((c) => c.lineItems),
    totalAmount: chunks.reduce((sum, c) => sum + c.totalAmount, 0),
  }),
});
```

### マージ戦略

複数ページをどう統合するかは案件依存のため、`merge` 関数で指定する。

- **1 帳票に統合**: 上記のように明細を結合し合計を再計算する。
- **ページ単位で配列にする**: ページ配列を持つスキーマ（例 `z.object({ pages: z.array(pageSchema) })`）を用意し、`merge: (chunks) => ({ pages: chunks })` を渡す。

## API

### `extractFromDocument<T>(params): Promise<ExtractResult<T>>`

| パラメータ   | 型                              | 説明 |
|--------------|---------------------------------|------|
| `client`     | `AiClient`                      | `geminiClient` / `claudeClient` など |
| `prompt`     | `string`                        | 抽出指示プロンプト |
| `data`       | `string`                        | 画像 / PDF の base64 |
| `mimeType`   | `string`                        | `image/*` or `application/pdf` |
| `schema`     | `ZodType<T>`                    | 抽出結果を検証する Zod スキーマ |
| `correct?`   | `(raw: unknown) => unknown`     | 検証前に素値を整える補正関数 |
| `merge?`     | `(chunks: T[]) => unknown`      | PDF 分割時に複数チャンクを統合 |
| `chunking?`  | `ChunkingOptions`               | 分割閾値（`pagesPerChunk` / `maxPagesBeforeSplit`） |
| `options?`   | `AiOptions`                     | ティア・温度など |

返り値 `ExtractResult<T>` は次の判別共用体。

```typescript
type ExtractResult<T> =
  | { ok: true; data: T }
  | { ok: false; issues: ZodError['issues']; raw: unknown };
```

### 補正ヘルパー（`normalize.ts`）

| 関数             | 用途 |
|------------------|------|
| `toHalfWidth`    | 全角英数字・記号を半角化 |
| `parseAmount`    | 金額文字列（`¥1,234`・全角）を数値化 |
| `normalizeDate`  | 日付文字列を `YYYY-MM-DD` に整形 |

### PDF 分割（`splitPdf.ts`）

| 関数            | 用途 |
|-----------------|------|
| `countPdfPages` | PDF（base64）のページ数を返す |
| `splitPdf`      | PDF（base64）を N ページごとのチャンク（base64[]）に分割 |

## スキーマ（`schemas/`）

汎用帳票テンプレートの Zod スキーマ（見本）。

| スキーマ             | 帳票   |
|----------------------|--------|
| `invoiceSchema`      | 請求書 |
| `deliveryNoteSchema` | 納品書 |

案件固有のスキーマは中央集約せず、各案件リポジトリ側にこの構造を踏襲して置く。

## 注意事項

- API キーは環境変数から取得し、ソースコードに直接記述しないこと。
- モデル名は必ず `ai/config.ts` の `AI_MODELS` から参照すること（直書き禁止）。
- **GPT の構造化抽出は当面未対応**（`gptClient.completeWithDocumentStructured` は throw）。OCR は Gemini / Claude 中心で運用し、必要になった時点で実装する。
- 既存の `complete` / `completeWithImage` は変更していない（稼働中のため）。
- PDF プレビュー/サムネイル表示は本モジュールのスコープ外（別レイヤー）。

## テスト

```bash
npm test
```

Vitest で以下を検証している（実 API には到達せず、`AiClient` と AI SDK はモック）。

- 画像＋スキーマで型付きデータが返る
- 単一ページ PDF で型付きデータが返る
- 上限超の大 PDF が分割処理され統合結果が返る
- 必須項目欠落データが検証エラーで弾かれる
- Gemini / Claude が同一インターフェースで `generateObject` を呼ぶ
