# location/map

`@vis.gl/react-google-maps` を使った Google Maps 表示コンポーネント。

## API

### `MapView: React.FC<MapViewProps>`

```typescript
interface MapViewProps {
  lat: number;       // 中心緯度
  lng: number;       // 中心経度
  zoom?: number;     // ズームレベル（デフォルト: 13）
  markers?: Marker[]; // マーカー一覧
  apiKey: string;    // Google Maps API キー
}

interface Marker {
  lat: number;
  lng: number;
  label?: string;    // ピンのラベル（短い文字列推奨）
}
```

## 使用例

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

## 前提

- React 17+
- Google Maps JavaScript API が有効化済みのプロジェクト
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` などの環境変数で API キーを管理すること
