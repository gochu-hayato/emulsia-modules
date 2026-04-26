# file/csv-import

PapaParse を使った CSV 読み込みモジュール。1行目をヘッダーとして扱いオブジェクト配列に変換する。

## API

### `parseCsvString<T>(csv: string): T[]`

CSV 文字列をパースしてオブジェクト配列を返す（同期・サーバー用）。

### `parseCsv<T>(file: File): Promise<T[]>`

ブラウザの `File` オブジェクトを非同期でパースする（ブラウザ用）。

## 使用例

```typescript
import { parseCsvString, parseCsv } from './file/csv-import';

interface User {
  名前: string;
  年齢: string;
  部署: string;
}

// CSV文字列から（サーバー用）
const csv = '名前,年齢,部署\n山田太郎,30,開発\n鈴木花子,25,営業';
const users = parseCsvString<User>(csv);

// ブラウザのFileから
const handleFile = async (file: File) => {
  const users = await parseCsv<User>(file);
  console.log(users);
};
```

## csv-export との連携

```typescript
import { generateCsvString } from '../csv-export';
import { parseCsvString } from '../csv-import';

const original = [{ name: 'Alice', score: 100 }];
const csv = generateCsvString(original);
// BOMを除去してからparse（parseCsvStringはBOMを自動無視）
const parsed = parseCsvString(csv);
// → original と一致
```
