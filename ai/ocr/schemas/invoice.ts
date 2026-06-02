/**
 * @module ai/ocr/schemas/invoice
 *
 * 汎用「請求書」帳票の Zod スキーマ（見本）。
 *
 * copy-on-use: 各案件はこのスキーマをコピーし、自案件のフォーマットに合わせて
 * 項目を増減・改名する。設定（スキーマ・プロンプト・補正）は DB に持たず
 * コードで管理する方針のため、案件固有スキーマは各案件リポジトリ側に置く。
 */

import { z } from 'zod';

/** 請求書の明細行。 */
export const invoiceLineItemSchema = z.object({
  /** 品目名・摘要 */
  description: z.string(),
  /** 数量 */
  quantity: z.number(),
  /** 単価（円） */
  unitPrice: z.number(),
  /** 金額（円・税抜想定） */
  amount: z.number(),
});

/** 請求書スキーマ。必須項目が欠落していると `safeParse` で弾かれる。 */
export const invoiceSchema = z.object({
  /** 請求書番号 */
  invoiceNumber: z.string(),
  /** 発行日（YYYY-MM-DD に整形して渡す想定） */
  issueDate: z.string(),
  /** 支払期限（YYYY-MM-DD、任意） */
  dueDate: z.string().optional(),
  /** 請求元（発行者）名 */
  sellerName: z.string(),
  /** 請求先（宛先）名 */
  buyerName: z.string(),
  /** 明細行 */
  lineItems: z.array(invoiceLineItemSchema),
  /** 小計（円・税抜） */
  subtotal: z.number(),
  /** 消費税額（円） */
  taxAmount: z.number(),
  /** 合計金額（円・税込） */
  totalAmount: z.number(),
});

export type InvoiceLineItem = z.infer<typeof invoiceLineItemSchema>;
export type Invoice = z.infer<typeof invoiceSchema>;
