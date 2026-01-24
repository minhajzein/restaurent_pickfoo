'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useEffect } from 'react';

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLocation?: [number, number];
}

function LocationMarker({ onLocationSelect, position }: { onLocationSelect: (lat: number, lng: number) => void, position: [number, number] | null }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMapEvents({});
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13);
    }
  }, [center, map]);
  return null;
}

export default function LocationPicker({ onLocationSelect, initialLocation }: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(initialLocation || null);
  const [prevInitialLocation, setPrevInitialLocation] = useState(initialLocation); // Track prop for changes

  // Update state from props pattern (avoids useEffect)
  if (initialLocation !== prevInitialLocation) {
    setPrevInitialLocation(initialLocation);
    setPosition(initialLocation || null);
  }

  useEffect(() => {
    // @ts-expect-error: Leaflet icon prototype doesn't have _getIconUrl type defined correctly in some versions
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  const handleSelect = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onLocationSelect(lat, lng);
  };

  const defaultCenter: [number, number] = initialLocation || [10.8505, 76.2711]; // Default to Kerala coordinates

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-white/10 z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={13} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {initialLocation && <MapUpdater center={initialLocation} />}
        <LocationMarker onLocationSelect={handleSelect} position={position} />
      </MapContainer>
    </div>
  );
}
