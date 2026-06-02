/**
 * @module ai/ocr
 *
 * OCR / AI 構造化抽出モジュール。画像・PDF からスキーマに従って型付きデータを抽出する。
 * 抽出本体は AI SDK の `generateObject`（AiClient.completeWithDocumentStructured 経由）に委譲し、
 * 本モジュールは「mimeType 判定・大 PDF のページ分割・結果統合・補正・検証」を担う。
 *
 * 詳細・使い方は同ディレクトリの README.md を参照。
 */

export {
  extractFromDocument,
  type ExtractFromDocumentParams,
  type ExtractResult,
  type ChunkingOptions,
} from './extractFromDocument';

export { splitPdf, countPdfPages } from './splitPdf';

export { toHalfWidth, parseAmount, normalizeDate } from './normalize';

export * from './schemas';
