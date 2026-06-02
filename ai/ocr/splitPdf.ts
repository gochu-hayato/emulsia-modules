/**
 * @module ai/ocr/splitPdf
 *
 * PDF を一定ページ数ごとのチャンクに分割するユーティリティ。
 * 大きな PDF を OCR / 構造化抽出にかける際、1 リクエストあたりのページ数を
 * 抑えるために使用する。pdf-lib をベースにしており、各チャンクは独立した
 * base64 PDF として返る。
 */

import { PDFDocument } from 'pdf-lib';

/** base64 文字列を Uint8Array に変換する。 */
function base64ToBytes(base64: string): Uint8Array {
  return new Uint8Array(Buffer.from(base64, 'base64'));
}

/** Uint8Array を base64 文字列に変換する。 */
function bytesToBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64');
}

/**
 * PDF（base64）のページ数を返す。
 *
 * @param base64 PDF の base64 文字列
 * @returns ページ数
 */
export async function countPdfPages(base64: string): Promise<number> {
  const doc = await PDFDocument.load(base64ToBytes(base64));
  return doc.getPageCount();
}

/**
 * PDF（base64）を `pagesPerChunk` ページごとのチャンクに分割する。
 *
 * 例：12 ページの PDF を `pagesPerChunk = 5` で分割すると
 * `[1-5ページ, 6-10ページ, 11-12ページ]` の 3 チャンク（base64）が返る。
 *
 * @param base64 分割対象 PDF の base64 文字列
 * @param pagesPerChunk 1 チャンクあたりの最大ページ数（1 以上）
 * @returns チャンクごとの base64 PDF 配列
 * @throws pagesPerChunk が 1 未満の場合
 */
export async function splitPdf(base64: string, pagesPerChunk: number): Promise<string[]> {
  if (pagesPerChunk < 1) {
    throw new Error('pagesPerChunk は 1 以上である必要があります');
  }

  const src = await PDFDocument.load(base64ToBytes(base64));
  const total = src.getPageCount();
  const chunks: string[] = [];

  for (let start = 0; start < total; start += pagesPerChunk) {
    const end = Math.min(start + pagesPerChunk, total);
    const indices = Array.from({ length: end - start }, (_, i) => start + i);

    const chunkDoc = await PDFDocument.create();
    const copied = await chunkDoc.copyPages(src, indices);
    copied.forEach((page) => chunkDoc.addPage(page));

    const bytes = await chunkDoc.save();
    chunks.push(bytesToBase64(bytes));
  }

  return chunks;
}
