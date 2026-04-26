# location/geocoding

## 概要

Google Maps Geocoding API を `fetch` で直接呼び出すジオコーディングモジュール。住所 ↔ 緯度経度の相互変換に対応。

## インストール

```bash
npm install --save-dev @types/node
```

外部パッケージは不要。Google Maps Geocoding API キーを別途取得すること。

## 使い方

```typescript
import { geocodeAddress, reverseGeocode } from './location/geocoding';

// 住所 → 座標
const { lat, lng } = await geocodeAddress('東京都千代田区丸の内1丁目', apiKey);
// → { lat: 35.6812, lng: 139.7671 }

// 座標 → 住所
const address = await reverseGeocode(35.6762, 139.6503, apiKey);
// → '日本、〒150-0001 東京都渋谷区神宮前...'
```

### `geocodeAddress(address: string, apiKey: string): Promise<{ lat: number; lng: number }>`

住所文字列を緯度・経度に変換する。変換失敗時は `Error` をthrow。

### `reverseGeocode(lat: number, lng: number, apiKey: string): Promise<string>`

緯度・経度を住所文字列（`formatted_address`）に変換する。変換失敗時は `Error` をthrow。

## 注意事項

- API キーはコードにハードコードせず、環境変数やシークレット管理から取得すること。
- Cloud Functions から使用する場合、Geocoding API へのアウトバウンド通信が許可されていること（Spark プランは不可）。
- Google Maps Platform で Geocoding API が有効化済みであること。
