/**
 * @module ai/ocr/extractFromDocument.test
 *
 * extractFromDocument の振る舞いを検証する。AiClient はフェイク実装に差し替え、
 * 実 API には到達しない。PDF は pdf-lib で生成した本物のバイト列を用いる。
 */

import { describe, it, expect, vi } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { z } from 'zod';
import { extractFromDocument } from './extractFromDocument';
import { parseAmount } from './normalize';
import type { AiClient } from '../types';

const invoiceSchema = z.object({
  invoiceNumber: z.string(),
  total: z.number(),
  items: z.array(z.object({ name: z.string(), amount: z.number() })),
});
type Invoice = z.infer<typeof invoiceSchema>;

/** 指定ページ数の PDF を生成して base64 で返す。 */
async function makePdf(pages: number): Promise<string> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pages; i += 1) doc.addPage([200, 200]);
  const bytes = await doc.save();
  return Buffer.from(bytes).toString('base64');
}

/**
 * completeWithDocumentStructured が `responder(callIndex)` の戻り値を返すフェイク client。
 * 呼び出し回数の検証のため vi.fn でラップする。
 */
function fakeClient(responder: (callIndex: number) => unknown): {
  client: AiClient;
  spy: ReturnType<typeof vi.fn>;
} {
  let calls = 0;
  const spy = vi.fn(async () => {
    const value = responder(calls);
    calls += 1;
    return value;
  });
  const client: AiClient = {
    complete: async () => '',
    completeWithImage: async () => '',
    completeWithDocumentStructured: spy as AiClient['completeWithDocumentStructured'],
  };
  return { client, spy };
}

const validInvoice: Invoice = {
  invoiceNumber: 'INV-001',
  total: 300,
  items: [{ name: 'りんご', amount: 300 }],
};

describe('extractFromDocument', () => {
  it('画像＋スキーマで型付きデータが返る', async () => {
    const { client, spy } = fakeClient(() => validInvoice);

    const result = await extractFromDocument({
      client,
      prompt: '請求書を抽出',
      data: 'ZmFrZS1pbWFnZQ==',
      mimeType: 'image/png',
      schema: invoiceSchema,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual(validInvoice);
    }
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('単一ページ PDF で型付きデータが返る（分割なし）', async () => {
    const pdf = await makePdf(1);
    const { client, spy } = fakeClient(() => validInvoice);

    const result = await extractFromDocument({
      client,
      prompt: '請求書を抽出',
      data: pdf,
      mimeType: 'application/pdf',
      schema: invoiceSchema,
      chunking: { pagesPerChunk: 5 },
    });

    expect(result.ok).toBe(true);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('上限超の大 PDF が分割処理され、統合結果が返る', async () => {
    const pdf = await makePdf(12); // 5 ページ/チャンク → 3 チャンク
    // チャンクごとに 1 明細を返す。merge で全明細を結合し total を合算する。
    const { client, spy } = fakeClient((i) => ({
      invoiceNumber: 'INV-001',
      total: 100,
      items: [{ name: `品目${i}`, amount: 100 }],
    }));

    const result = await extractFromDocument<Invoice>({
      client,
      prompt: '請求書を抽出',
      data: pdf,
      mimeType: 'application/pdf',
      schema: invoiceSchema,
      chunking: { pagesPerChunk: 5 },
      merge: (chunks) => ({
        invoiceNumber: chunks[0].invoiceNumber,
        total: chunks.reduce((sum, c) => sum + c.total, 0),
        items: chunks.flatMap((c) => c.items),
      }),
    });

    expect(spy).toHaveBeenCalledTimes(3);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.items).toHaveLength(3);
      expect(result.data.total).toBe(300);
    }
  });

  it('分割が発生したのに merge 未指定なら例外を送出する', async () => {
    const pdf = await makePdf(12);
    const { client } = fakeClient(() => validInvoice);

    await expect(
      extractFromDocument({
        client,
        prompt: 'x',
        data: pdf,
        mimeType: 'application/pdf',
        schema: invoiceSchema,
        chunking: { pagesPerChunk: 5 },
      }),
    ).rejects.toThrow(/merge/);
  });

  it('必須項目欠落データは検証エラーで弾かれる', async () => {
    // total が欠落した不正データを返す
    const { client } = fakeClient(() => ({
      invoiceNumber: 'INV-001',
      items: [{ name: 'りんご', amount: 300 }],
    }));

    const result = await extractFromDocument({
      client,
      prompt: 'x',
      data: 'ZmFrZQ==',
      mimeType: 'image/png',
      schema: invoiceSchema,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues.some((issue) => issue.path.includes('total'))).toBe(true);
    }
  });

  it('補正関数が検証前に適用される', async () => {
    // 金額が全角文字列で返るケースを補正して数値化する
    const { client } = fakeClient(() => ({
      invoiceNumber: 'INV-001',
      total: '３００',
      items: [{ name: 'りんご', amount: 300 }],
    }));

    const result = await extractFromDocument({
      client,
      prompt: 'x',
      data: 'ZmFrZQ==',
      mimeType: 'image/png',
      schema: invoiceSchema,
      correct: (raw) => {
        const obj = raw as Record<string, unknown>;
        return { ...obj, total: parseAmount(String(obj.total)) };
      },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.total).toBe(300);
    }
  });

  it('未対応の mimeType は例外を送出する', async () => {
    const { client } = fakeClient(() => validInvoice);
    await expect(
      extractFromDocument({
        client,
        prompt: 'x',
        data: 'ZmFrZQ==',
        mimeType: 'text/plain',
        schema: invoiceSchema,
      }),
    ).rejects.toThrow(/未対応/);
  });
});
