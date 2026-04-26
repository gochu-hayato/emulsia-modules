# file/pdf

## 概要

pdf-lib を使った PDF 生成モジュール。帳票・請求書に対応。NotoSansJP フォントを埋め込むことで日本語を正しく描画する。Cloud Functions / Next.js API Route 両方から呼び出し可能。

## インストール

```bash
npm install pdf-lib @pdf-lib/fontkit
```

フォントファイル（`fonts/NotoSansJP-Regular.ttf`）をビルド出力に含めること。

## 使い方

```typescript
import { generatePdf, generateInvoicePdf } from './file/pdf';

// 汎用帳票
const pdfBytes = await generatePdf({
  title: '月次レポート',
  rows: [
    { label: '対象月', value: '2024年4月' },
    { label: '件数', value: '42件' },
  ],
  footer: 'Emulsia - 自動生成',
});

// 請求書
const invoiceBytes = await generateInvoicePdf({
  invoiceNumber: 'INV-2024-001',
  issueDate: '2024-04-26',
  items: [{ name: 'システム開発', amount: 500000 }],
  total: 500000,
  companyName: '株式会社サンプル',
});

// Next.js API Route でのレスポンス例
res.setHeader('Content-Type', 'application/pdf');
res.send(Buffer.from(pdfBytes));
```

### `generatePdf(params: PdfParams): Promise<Uint8Array>`

汎用帳票を生成する。

### `generateInvoicePdf(params: InvoiceParams): Promise<Uint8Array>`

請求書 PDF を生成する。

## 注意事項

- Cloud Functions の場合: `firebase.json` の `functions.source` にフォントファイルを含めること。
- Next.js の場合: `outputFileTracingIncludes` を設定するか `public/` に配置すること。
- フォントファイルは `fonts/NotoSansJP-Regular.ttf` に配置すること（`__dirname` からの相対パス）。
