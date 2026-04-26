# file/pdf

pdf-lib を使った PDF 生成モジュール。帳票・請求書・報告書に対応。Cloud Functions / Next.js API Route 両方から呼び出し可能。

## 日本語フォント

`fonts/NotoSansJP-Regular.ttf` を PDF に埋め込む。ビルド時にフォントファイルが出力先に含まれていることを確認すること。

**Next.js の場合**: `next.config.js` で `outputFileTracingIncludes` を設定するか、`public/` に配置して読み込む。  
**Cloud Functions の場合**: `firebase.json` の `functions.source` に含めるか、フォントパスを環境変数で上書きする。

## API

### `generatePdf(params: PdfParams): Promise<Uint8Array>`

汎用帳票を生成する。返り値の `Uint8Array` をそのままレスポンスに渡せる。

```typescript
interface PdfParams {
  title: string;
  rows: { label: string; value: string }[];
  footer?: string;
}
```

### `generateInvoicePdf(params: InvoiceParams): Promise<Uint8Array>`

請求書PDFを生成する。

```typescript
interface InvoiceParams {
  invoiceNumber: string;
  issueDate: string;
  items: { name: string; amount: number }[];
  total: number;
  companyName: string;
}
```

## 使用例

### Cloud Functions Gen2

```typescript
import { onCall } from 'firebase-functions/v2/https';
import { generatePdf, generateInvoicePdf } from './file/pdf';

export const exportReport = onCall(async (request) => {
  const pdfBytes = await generatePdf({
    title: '月次レポート',
    rows: [
      { label: '対象月', value: '2024年4月' },
      { label: '件数', value: '42件' },
    ],
    footer: 'Emulsia - 自動生成',
  });
  return Buffer.from(pdfBytes).toString('base64');
});
```

### Next.js API Route

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { generateInvoicePdf } from '../../file/pdf';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const pdfBytes = await generateInvoicePdf({
    invoiceNumber: 'INV-2024-001',
    issueDate: '2024-04-26',
    items: [
      { name: 'システム開発', amount: 500000 },
      { name: 'サポート費', amount: 50000 },
    ],
    total: 550000,
    companyName: '株式会社サンプル',
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="invoice.pdf"');
  res.send(Buffer.from(pdfBytes));
}
```
