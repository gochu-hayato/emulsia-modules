# location/map

## 概要

`@vis.gl/react-google-maps` を使った Google Maps 表示コンポーネント。複数マーカーの表示に対応。

## インストール

```bash
npm install @vis.gl/react-google-maps
```

## 使い方

```tsx
import { MapView } from './location/map';

<MapView
  lat={35.6762}
  lng={139.6503}
  zoom={14}
  apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
  markers={[
    { lat: 35.6762, lng: 139.6503, label: 'A' },
    { lat: 35.6800, lng: 139.6550, label: 'B' },
  ]}
/>
```

### `MapView: React.FC<MapViewProps>`

```typescript
interface MapViewProps {
  lat: number;        // 中心緯度
  lng: number;        // 中心経度
  zoom?: number;      // ズームレベル（デフォルト: 13）
  markers?: Marker[]; // マーカー一覧
  apiKey: string;     // Google Maps API キー
}

interface Marker {
  lat: number;
  lng: number;
  label?: string; // ピンのラベル（短い文字列推奨）
}
```

## 注意事項

- React 17 以上が必要。
- Google Maps JavaScript API が有効化済みのプロジェクトの API キーを使用すること。
- `apiKey` はクライアントサイドで公開されるため、Google Cloud Console でリファラー制限を設定することを推奨。
