# file/csv-import

## 概要

PapaParse を使った CSV 読み込みモジュール。1行目をヘッダーとして扱いオブジェクト配列に変換する。サーバー（同期）とブラウザ（非同期 File API）の両方に対応。

## インストール

```bash
npm install papaparse
npm install --save-dev @types/papaparse
```

## 使い方

```typescript
import { parseCsvString, parseCsv } from './file/csv-import';

interface User {
  名前: string;
  年齢: string;
  部署: string;
}

// CSV 文字列から（サーバー用）
const csv = '名前,年齢,部署\n山田太郎,30,開発\n鈴木花子,25,営業';
const users = parseCsvString<User>(csv);

// ブラウザの File オブジェクトから
const handleFile = async (file: File) => {
  const users = await parseCsv<User>(file);
};
```

### `parseCsvString<T>(csv: string): T[]`

CSV 文字列をパースしてオブジェクト配列を返す（同期・サーバー用）。

### `parseCsv<T>(file: File): Promise<T[]>`

ブラウザの `File` オブジェクトを非同期でパースする（ブラウザ用）。

## 注意事項

- `parseCsv` は `File` API を使用するためブラウザ環境専用。サーバー側では `parseCsvString` を使うこと。
- `csv-export` の `generateCsvString` が付与する BOM は自動的に無視される。
- 数値フィールドも文字列として返るため、必要に応じて変換すること。
