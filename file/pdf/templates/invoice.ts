import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { InvoiceParams } from '../types';

const FONT_PATH = resolve(__dirname, '..', 'fonts', 'NotoSansJP-Regular.ttf');

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN = 50;

export async function generateInvoicePdf(params: InvoiceParams): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const fontBytes = new Uint8Array(readFileSync(FONT_PATH));
  const font = await doc.embedFont(fontBytes);

  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const { width, height } = page.getSize();

  // Header
  page.drawText('請求書', {
    x: width / 2 - 28,
    y: height - MARGIN - 28,
    size: 26,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });

  page.drawLine({
    start: { x: MARGIN, y: height - MARGIN - 40 },
    end: { x: width - MARGIN, y: height - MARGIN - 40 },
    thickness: 1.5,
    color: rgb(0.2, 0.2, 0.6),
  });

  // Meta info
  const metaY = height - MARGIN - 70;
  page.drawText(`請求番号: ${params.invoiceNumber}`, {
    x: MARGIN,
    y: metaY,
    size: 10,
    font,
    color: rgb(0.35, 0.35, 0.35),
  });
  page.drawText(`発行日: ${params.issueDate}`, {
    x: MARGIN,
    y: metaY - 18,
    size: 10,
    font,
    color: rgb(0.35, 0.35, 0.35),
  });
  page.drawText(`請求先: ${params.companyName} 御中`, {
    x: MARGIN,
    y: metaY - 40,
    size: 12,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });

  // Items table header
  const tableTop = height - MARGIN - 140;
  page.drawRectangle({
    x: MARGIN,
    y: tableTop - 4,
    width: width - MARGIN * 2,
    height: 20,
    color: rgb(0.92, 0.93, 0.98),
  });
  page.drawText('品目', {
    x: MARGIN + 8,
    y: tableTop,
    size: 10,
    font,
    color: rgb(0.2, 0.2, 0.2),
  });
  page.drawText('金額', {
    x: width - MARGIN - 70,
    y: tableTop,
    size: 10,
    font,
    color: rgb(0.2, 0.2, 0.2),
  });

  // Items
  let y = tableTop - 28;
  for (const item of params.items) {
    if (y < MARGIN + 80) break;

    page.drawText(item.name, {
      x: MARGIN + 8,
      y,
      size: 11,
      font,
      color: rgb(0.15, 0.15, 0.15),
    });
    page.drawText(`¥${item.amount.toLocaleString('ja-JP')}`, {
      x: width - MARGIN - 70,
      y,
      size: 11,
      font,
      color: rgb(0.15, 0.15, 0.15),
    });

    y -= 6;
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: width - MARGIN, y },
      thickness: 0.4,
      color: rgb(0.88, 0.88, 0.88),
    });
    y -= 22;
  }

  // Total
  y -= 6;
  page.drawLine({
    start: { x: MARGIN, y: y + 12 },
    end: { x: width - MARGIN, y: y + 12 },
    thickness: 1.2,
    color: rgb(0.2, 0.2, 0.5),
  });

  page.drawRectangle({
    x: width - MARGIN - 180,
    y: y - 6,
    width: 180,
    height: 24,
    color: rgb(0.2, 0.2, 0.6),
  });
  page.drawText('合計', {
    x: width - MARGIN - 170,
    y,
    size: 12,
    font,
    color: rgb(1, 1, 1),
  });
  page.drawText(`¥${params.total.toLocaleString('ja-JP')}`, {
    x: width - MARGIN - 75,
    y,
    size: 12,
    font,
    color: rgb(1, 1, 1),
  });

  // Footer
  page.drawText('このPDFはシステムにより自動生成されました。', {
    x: MARGIN,
    y: MARGIN,
    size: 8,
    font,
    color: rgb(0.6, 0.6, 0.6),
  });

  return doc.save();
}
