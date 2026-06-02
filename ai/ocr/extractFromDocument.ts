/**
 * @module ai/ocr/extractFromDocument
 *
 * 画像・PDF からスキーマに従って構造化データを抽出する汎用関数。
 *
 * 処理フロー:
 *   1. mimeType を判定（image/* or application/pdf）。
 *   2. PDF かつページ数が上限超 → ページ分割 → チャンクごとに
 *      `AiClient.completeWithDocumentStructured` を実行 → 結果を統合（merge）。
 *   3. 補正関数があれば適用（全角半角・日付整形など）。
 *   4. `schema.safeParse` で検証。成功＝型付きデータ、失敗＝エラー情報を返す。
 *
 * モデル名は `ai/config.ts` 経由（AiClient 実装側で参照）。本モジュールはモデル名を直書きしない。
 */

import type { ZodError, ZodType } from 'zod';
import type { AiClient, AiOptions } from '../types';
import { countPdfPages, splitPdf } from './splitPdf';

const PDF_MIME_TYPE = 'application/pdf';

/** PDF 分割の閾値設定。 */
export interface ChunkingOptions {
  /** 1 チャンクあたりの最大ページ数（デフォルト: 5） */
  pagesPerChunk?: number;
  /**
   * このページ数を超えたら分割処理に入る（デフォルト: pagesPerChunk と同値）。
   * これ以下のページ数の PDF は分割せず 1 リクエストで処理する。
   */
  maxPagesBeforeSplit?: number;
}

const DEFAULT_PAGES_PER_CHUNK = 5;

/** `extractFromDocument` の入力。 */
export interface ExtractFromDocumentParams<T> {
  /** 抽出に使用する AiClient（geminiClient / claudeClient など） */
  client: AiClient;
  /** 抽出指示プロンプト */
  prompt: string;
  /** 画像または PDF の base64 文字列 */
  data: string;
  /** `image/*` または `application/pdf` */
  mimeType: string;
  /** 抽出結果を検証する Zod スキーマ */
  schema: ZodType<T>;
  /**
   * 検証前に生データを整える補正関数（全角半角・日付整形など）。
   * 単一リクエスト時は抽出結果、PDF 分割時は merge 後の結果に適用される。
   */
  correct?: (raw: unknown) => unknown;
  /**
   * PDF を複数チャンクに分割したとき、各チャンクの抽出結果を 1 件に統合する関数。
   * 分割が発生する PDF を扱う場合は必須。未指定で分割が発生すると例外を送出する。
   * 「ページ単位で配列にする」戦略を取りたい場合は、配列をまとめる型のスキーマと
   * `(pages) => ({ pages })` のような merge を案件側で渡す。
   */
  merge?: (chunks: T[]) => unknown;
  /** PDF 分割の閾値設定 */
  chunking?: ChunkingOptions;
  /** AiClient 呼び出しオプション（ティア・温度など） */
  options?: AiOptions;
}

/** `extractFromDocument` の結果（成功 or 検証失敗）。 */
export type ExtractResult<T> =
  | { ok: true; data: T }
  | { ok: false; issues: ZodError['issues']; raw: unknown };

/**
 * 画像・PDF から構造化データを抽出し、スキーマで検証した結果を返す。
 *
 * @typeParam T 抽出結果の型（`schema` から推論される）
 * @param params 抽出パラメータ
 * @returns 検証成功時は型付きデータ、失敗時はエラー情報（Zod issues と補正後の生データ）
 * @throws mimeType が未対応、または分割が発生したのに merge が未指定の場合
 */
export async function extractFromDocument<T>(
  params: ExtractFromDocumentParams<T>,
): Promise<ExtractResult<T>> {
  const { client, prompt, data, mimeType, schema, correct, merge, chunking, options } = params;

  const chunks = await extractChunks(client, prompt, data, mimeType, schema, chunking, options);

  let raw: unknown;
  if (chunks.length === 1) {
    raw = chunks[0];
  } else {
    if (!merge) {
      throw new Error(
        'PDF が分割されましたが merge 関数が指定されていません。複数チャンクを統合する merge を渡してください。',
      );
    }
    raw = merge(chunks);
  }

  const corrected = correct ? correct(raw) : raw;

  const parsed = schema.safeParse(corrected);
  if (parsed.success) {
    return { ok: true, data: parsed.data };
  }
  return { ok: false, issues: parsed.error.issues, raw: corrected };
}

/**
 * mimeType に応じてドキュメントを 1 つ以上のチャンクに分けて抽出する。
 * 画像・分割不要 PDF は 1 要素、分割 PDF はチャンク数分の要素を返す。
 */
async function extractChunks<T>(
  client: AiClient,
  prompt: string,
  data: string,
  mimeType: string,
  schema: ZodType<T>,
  chunking: ChunkingOptions | undefined,
  options: AiOptions | undefined,
): Promise<T[]> {
  if (mimeType === PDF_MIME_TYPE) {
    return extractPdf(client, prompt, data, schema, chunking, options);
  }
  if (mimeType.startsWith('image/')) {
    const result = await client.completeWithDocumentStructured(prompt, data, mimeType, schema, options);
    return [result];
  }
  throw new Error(`未対応の mimeType です: ${mimeType}（image/* または ${PDF_MIME_TYPE} のみ対応）`);
}

/** PDF を必要に応じて分割し、各チャンクを抽出する。 */
async function extractPdf<T>(
  client: AiClient,
  prompt: string,
  data: string,
  schema: ZodType<T>,
  chunking: ChunkingOptions | undefined,
  options: AiOptions | undefined,
): Promise<T[]> {
  const pagesPerChunk = chunking?.pagesPerChunk ?? DEFAULT_PAGES_PER_CHUNK;
  const maxPagesBeforeSplit = chunking?.maxPagesBeforeSplit ?? pagesPerChunk;

  const pageCount = await countPdfPages(data);

  if (pageCount <= maxPagesBeforeSplit) {
    const result = await client.completeWithDocumentStructured(prompt, data, PDF_MIME_TYPE, schema, options);
    return [result];
  }

  const pdfChunks = await splitPdf(data, pagesPerChunk);
  const results: T[] = [];
  for (const chunk of pdfChunks) {
    results.push(
      await client.completeWithDocumentStructured(prompt, chunk, PDF_MIME_TYPE, schema, options),
    );
  }
  return results;
}
