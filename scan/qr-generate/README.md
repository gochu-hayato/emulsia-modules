# scan/qr-generate

## 概要

qrcode ライブラリを使った QR コード生成モジュール。PNG（base64 data URL）・SVG 文字列・React コンポーネントの 3 形式に対応。

## インストール

```bash
npm install qrcode
npm install --save-dev @types/qrcode
```

## 使い方

```tsx
import { generateQrPng, generateQrSvg, QrCodeDisplay } from './scan/qr-generate';

// PNG (base64 data URL)
const dataUrl = await generateQrPng('https://emulsia.jp', 300);
// → 'data:image/png;base64,...'

// SVG 文字列
const svg = await generateQrSvg('https://emulsia.jp');

// React コンポーネント
<QrCodeDisplay text="https://emulsia.jp" size={256} />
```

### `generateQrPng(text: string, size?: number): Promise<string>`

base64 エンコードされた PNG の data URL を返す。デフォルトサイズは 200px。

### `generateQrSvg(text: string): Promise<string>`

SVG 文字列を返す。スケーラブルな表示が必要な場合に使用する。

### `QrCodeDisplay: React.FC<{ text: string; size?: number }>`

QR コードを表示する React コンポーネント。生成中は何も表示しない。

## 注意事項

- JSX を含むため実装ファイルは `index.tsx`。
- `QrCodeDisplay` は React 環境専用。サーバーサイドでは `generateQrPng` / `generateQrSvg` を使うこと。
- `size` はピクセル単位で指定する。
