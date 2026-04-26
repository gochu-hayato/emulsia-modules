# file/csv-export

PapaParse を使った CSV 書き出しモジュール。BOM 付き UTF-8 で Excel の文字化けを防ぐ。

## API

### `generateCsvString<T extends object>(data: T[]): string`

オブジェクト配列を BOM 付き CSV 文字列に変換する（サーバー・Cloud Functions 用）。
オブジェクトのキーがヘッダー行になる。

### `exportToCsv<T extends object>(data: T[], filename: string): void`

ブラウザでCSVファイルをダウンロードさせる（ブラウザ専用）。
拡張子 `.csv` が付いていない場合は自動付与する。

## 使用例

```typescript
import { generateCsvString, exportToCsv } from './file/csv-export';

const data = [
  { 名前: '山田太郎', 年齢: 30, 部署: '開発' },
  { 名前: '鈴木花子', 年齢: 25, 部署: '営業' },
];

// ブラウザでダウンロード
exportToCsv(data, 'users');

// サーバーでCSV文字列生成
const csv = generateCsvString(data);
// → '﻿名前,年齢,部署\r\n山田太郎,30,開発\r\n...'
```
