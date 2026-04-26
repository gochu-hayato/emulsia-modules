import React from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

export interface Marker {
  lat: number;
  lng: number;
  label?: string;
}

export interface MapViewProps {
  lat: number;
  lng: number;
  zoom?: number;
  markers?: Marker[];
  apiKey: string;
}

export const MapView: React.FC<MapViewProps> = ({
  lat,
  lng,
  zoom = 13,
  markers = [],
  apiKey,
}) => (
  <APIProvider apiKey={apiKey}>
    <Map
      defaultCenter={{ lat, lng }}
      defaultZoom={zoom}
      style={{ width: '100%', height: '400px' }}
    >
      {markers.map((marker, index) => (
        <AdvancedMarker key={index} position={{ lat: marker.lat, lng: marker.lng }}>
          <Pin
            background="#1a56db"
            glyphColor="#ffffff"
            borderColor="#0d3d9e"
            glyph={marker.label}
          />
        </AdvancedMarker>
      ))}
    </Map>
  </APIProvider>
);
