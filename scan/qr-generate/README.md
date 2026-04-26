# scan/qr-generate

qrcode ライブラリを使った QR コード生成モジュール。PNG (base64)・SVG・React コンポーネントの3形式に対応。

## API

### `generateQrPng(text: string, size?: number): Promise<string>`

base64 エンコードされた PNG の data URL を返す。デフォルトサイズは 200px。

### `generateQrSvg(text: string): Promise<string>`

SVG 文字列を返す。スケーラブルな表示が必要な場合に使用する。

### `QrCodeDisplay: React.FC<{ text: string; size?: number }>`

QR コードを表示する React コンポーネント。生成中は何も表示しない。

## ファイル拡張子について

このモジュールは JSX を含むため `index.tsx` を使用している（仕様書の `index.ts` 記述は `.tsx` の意図と解釈）。

## 使用例

```tsx
import { generateQrPng, generateQrSvg, QrCodeDisplay } from './scan/qr-generate';

// PNG (base64)
const dataUrl = await generateQrPng('https://emulsia.jp', 300);
// → 'data:image/png;base64,...'

// SVG
const svg = await generateQrSvg('https://emulsia.jp');

// React コンポーネント
<QrCodeDisplay text="https://emulsia.jp" size={256} />
```
