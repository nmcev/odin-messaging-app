import React from 'react';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationCardProps {
  lat: number;
  lng: number;
}

export const LocationCard: React.FC<LocationCardProps> = ({ lat, lng }) => {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <div className="w-64 sm:w-72">
      {/* relative z-0 keeps Leaflet's internal z-indexes below your modals */}
      <div className="relative z-0 h-40 rounded-lg overflow-hidden">
        <MapContainer
          center={[lat, lng]}
          zoom={15}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          touchZoom={false}
          zoomControl={false}
          keyboard={false}
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {/* CircleMarker avoids the broken default-icon problem with Vite */}
          <CircleMarker
            center={[lat, lng]}
            radius={10}
            pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#ef4444', fillOpacity: 1 }}
          />
        </MapContainer>
      </div>
      <p className="text-xs mt-2">
        📍 {lat.toFixed(5)}, {lng.toFixed(5)}
      </p>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-1 text-xs font-semibold underline"
      >
        Open in Maps
      </a>
    </div>
  );
};