/**
 * @module ai/ocr/schemas/deliveryNote
 *
 * 汎用「納品書」帳票の Zod スキーマ（見本）。
 *
 * copy-on-use: 各案件はこのスキーマをコピーし、自案件のフォーマットに合わせて
 * 項目を増減・改名する。
 */

import { z } from 'zod';

/** 納品書の明細行。 */
export const deliveryNoteLineItemSchema = z.object({
  /** 品目名・摘要 */
  description: z.string(),
  /** 数量 */
  quantity: z.number(),
  /** 単位（個・式・本 など、任意） */
  unit: z.string().optional(),
});

/** 納品書スキーマ。 */
export const deliveryNoteSchema = z.object({
  /** 納品書番号 */
  deliveryNoteNumber: z.string(),
  /** 納品日（YYYY-MM-DD に整形して渡す想定） */
  deliveryDate: z.string(),
  /** 納品元（発行者）名 */
  sellerName: z.string(),
  /** 納品先（宛先）名 */
  buyerName: z.string(),
  /** 明細行 */
  lineItems: z.array(deliveryNoteLineItemSchema),
  /** 備考（任意） */
  remarks: z.string().optional(),
});

export type DeliveryNoteLineItem = z.infer<typeof deliveryNoteLineItemSchema>;
export type DeliveryNote = z.infer<typeof deliveryNoteSchema>;
