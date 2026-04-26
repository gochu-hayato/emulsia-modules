import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { PdfParams } from './types';

export type { PdfParams, InvoiceParams } from './types';
export { generateInvoicePdf } from './templates/invoice';

const FONT_PATH = resolve(__dirname, 'fonts', 'NotoSansJP-Regular.ttf');

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN = 50;

async function createDocWithFont(): Promise<{
  doc: PDFDocument;
  font: Awaited<ReturnType<PDFDocument['embedFont']>>;
}> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const fontBytes = new Uint8Array(readFileSync(FONT_PATH));
  const font = await doc.embedFont(fontBytes);
  return { doc, font };
}

export async function generatePdf(params: PdfParams): Promise<Uint8Array> {
  const { doc, font } = await createDocWithFont();
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const { width, height } = page.getSize();

  page.drawText(params.title, {
    x: MARGIN,
    y: height - MARGIN - 28,
    size: 22,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });

  page.drawLine({
    start: { x: MARGIN, y: height - MARGIN - 38 },
    end: { x: width - MARGIN, y: height - MARGIN - 38 },
    thickness: 1,
    color: rgb(0.2, 0.2, 0.6),
  });

  let y = height - MARGIN - 70;

  for (const row of params.rows) {
    if (y < MARGIN + 60) break;

    page.drawText(row.label, {
      x: MARGIN,
      y,
      size: 11,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
    page.drawText(row.value, {
      x: MARGIN + 180,
      y,
      size: 11,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });

    y -= 8;
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: width - MARGIN, y },
      thickness: 0.5,
      color: rgb(0.88, 0.88, 0.88),
    });
    y -= 22;
  }

  if (params.footer) {
    page.drawText(params.footer, {
      x: MARGIN,
      y: MARGIN,
      size: 9,
      font,
      color: rgb(0.55, 0.55, 0.55),
    });
  }

  return doc.save();
}
