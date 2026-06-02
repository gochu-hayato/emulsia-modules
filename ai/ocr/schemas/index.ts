/**
 * @module ai/ocr/schemas
 *
 * 汎用帳票テンプレート（Zod スキーマ）の集約エクスポート。
 * 案件固有のスキーマは中央集約せず各案件リポジトリ側に置く方針のため、
 * ここには「どの案件でも踏襲できる汎用ひな型」のみを置く。
 */

export {
  invoiceSchema,
  invoiceLineItemSchema,
  type Invoice,
  type InvoiceLineItem,
} from './invoice';

export {
  deliveryNoteSchema,
  deliveryNoteLineItemSchema,
  type DeliveryNote,
  type DeliveryNoteLineItem,
} from './deliveryNote';
