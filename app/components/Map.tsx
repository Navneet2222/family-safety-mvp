"use client";
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Next.js map pin icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationLog {
  id: number;
  lat: number;
  lng: number;
  timestamp: string;
}

interface SelectedLocation {
  lat: number;
  lng: number;
}

interface MapProps {
  logs: LocationLog[];
  selectedLocation: SelectedLocation | null;
}

function MapController({ selectedLocation }: { selectedLocation: SelectedLocation | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedLocation) {
      map.flyTo([selectedLocation.lat, selectedLocation.lng], 16, {
        animate: true,
        duration: 1.5
      });
    }
  }, [selectedLocation, map]);
  
  return null;
}

export default function Map({ logs, selectedLocation }: MapProps) {
  // Default map center set to Patna, Bihar
  const defaultCenter: [number, number] = [25.5941, 85.1376]; 
  
  // Center map on the latest log if available, otherwise default location
  const currentCenter: [number, number] = logs.length > 0 
    ? [logs[0].lat, logs[0].lng] 
    : defaultCenter;

  return (
    <MapContainer 
      center={currentCenter} 
      zoom={12} 
      className="h-full w-full z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapController selectedLocation={selectedLocation} />

      {/* VIP FEATURE: Only draw ONE pin, and ONLY if a coordinate is clicked in the sidebar */}
      {selectedLocation && (
        <Marker position={[selectedLocation.lat, selectedLocation.lng] as [number, number]}>
          <Popup>
            Target Located. <br/> 
            Lat: {selectedLocation.lat.toFixed(4)}, Lng: {selectedLocation.lng.toFixed(4)}
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}