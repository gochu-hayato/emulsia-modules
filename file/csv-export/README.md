# file/csv-export

## 概要

PapaParse を使った CSV 書き出しモジュール。BOM 付き UTF-8 で出力するため Excel での文字化けを防ぐ。サーバー（文字列生成）とブラウザ（ファイルダウンロード）の両方に対応。

## インストール

```bash
npm install papaparse
npm install --save-dev @types/papaparse
```

## 使い方

```typescript
import { generateCsvString, exportToCsv } from './file/csv-export';

const data = [
  { 名前: '山田太郎', 年齢: 30, 部署: '開発' },
  { 名前: '鈴木花子', 年齢: 25, 部署: '営業' },
];

// ブラウザでファイルダウンロード
exportToCsv(data, 'users');

// サーバーで CSV 文字列生成（Cloud Functions など）
const csv = generateCsvString(data);
// → '﻿名前,年齢,部署\r\n山田太郎,30,開発\r\n...'
```

### `generateCsvString<T extends object>(data: T[]): string`

オブジェクト配列を BOM 付き CSV 文字列に変換する（サーバー用）。

### `exportToCsv<T extends object>(data: T[], filename: string): void`

ブラウザでCSVファイルをダウンロードさせる（ブラウザ専用）。拡張子 `.csv` が付いていない場合は自動付与する。

## 注意事項

- `exportToCsv` は `document` を使用するためブラウザ環境専用。サーバー側では `generateCsvString` を使うこと。
- オブジェクトのキーがそのままヘッダー行になる。
