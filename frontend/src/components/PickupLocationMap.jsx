import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Loader2, AlertTriangle } from 'lucide-react';

// ── Vite / Webpack Leaflet icon-URL fix ──────────────────────────────────────
// Leaflet bundles its marker PNGs relative to its own dist path, which breaks
// when bundled by Vite. Deleting the prototype method forces Leaflet to fall
// back to our explicit iconUrl strings defined on each icon object.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Premium custom Leaflet Marker icon matching the FoodShare emerald theme
const greenMarkerIcon = new L.DivIcon({
  className: 'custom-green-marker map-marker-pulse',
  html: `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
      <div style="background-color: #059669; padding: 6px; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); display: flex; items-center; justify-content: center; color: white;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
      <div style="width: 2px; height: 8px; background-color: #059669; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"></div>
    </div>
  `,
  iconSize: [28, 38],
  iconAnchor: [14, 38]
});

// Helper component to handle click events on the map canvas
function MapClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

export default function PickupLocationMap({ selectedCoords, onLocationSelect }) {
  // Default coordinates (Hyderabad, center point for demo)
  const defaultCenter = [17.3850, 78.4867];
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [geocoding, setGeocoding] = useState(false);
  const [permissionMsg, setPermissionMsg] = useState('');

  // Handle HTML5 Geolocation API lookup on load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setMapCenter([lat, lng]);
          setPermissionMsg('User location centered');
          handleLocationClick(lat, lng);
        },
        (err) => {
          console.warn('Geolocation permission not granted or timeout. Using default center.');
          setPermissionMsg('Using default location center');
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  // Fetch human-readable address from Nominatim OpenStreetMap Reverse Geocoding
  const handleLocationClick = async (lat, lng) => {
    setGeocoding(true);
    let resolvedAddress = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
        headers: {
          'Accept-Language': 'en'
        }
      });
      const data = await res.json();
      if (data && data.display_name) {
        resolvedAddress = data.display_name;
      }
    } catch (err) {
      console.warn('OSM Reverse geocoding failed. Utilizing raw coordinates as address fallback.', err);
    } finally {
      setGeocoding(false);
      onLocationSelect(lat, lng, resolvedAddress);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Geolocation status label */}
      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wide px-1">
        <span className="flex items-center gap-1.5">
          <Navigation size={12} className="text-[#059669] animate-pulse" />
          {permissionMsg || 'Detecting Location...'}
        </span>
      </div>

      {/* React Leaflet Map Canvas */}
      <div className="w-full h-[320px] rounded-[28px] overflow-hidden border border-slate-100 shadow-inner relative z-10">
        {geocoding && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-[1000] flex flex-col items-center justify-center gap-2.5 transition-all duration-300">
            <div className="w-9 h-9 border-3 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin"></div>
            <span className="text-[11px] font-bold text-slate-800 tracking-wide uppercase">Resolving Location Address...</span>
          </div>
        )}
        <MapContainer 
          key={`${mapCenter[0]}-${mapCenter[1]}`}
          center={mapCenter} 
          zoom={13} 
          style={{ width: '100%', height: '100%' }}
          scrollWheelZoom={true}
        >
          {/* OSM Standard Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapClickHandler onClick={handleLocationClick} />

          {selectedCoords && (
            <Marker 
              position={[selectedCoords.lat, selectedCoords.lng]} 
              icon={greenMarkerIcon}
            />
          )}
        </MapContainer>
      </div>

      {/* Selected Coordinates Overlay Box */}
      {selectedCoords ? (
        <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex items-center justify-between gap-3 text-xs text-slate-700 font-semibold animate-fadeIn">
          <span className="flex items-center gap-2 truncate">
            <span className="w-2.5 h-2.5 rounded-full bg-[#059669] animate-ping flex-shrink-0"></span>
            <span className="font-bold text-[#059669] flex-shrink-0">PINNED AT:</span> 
            <span className="font-mono text-slate-650 truncate">{selectedCoords.lat.toFixed(6)}°, {selectedCoords.lng.toFixed(6)}°</span>
          </span>
          <span className="text-[9px] bg-[#059669] text-white px-2.5 py-0.75 rounded-full font-extrabold uppercase tracking-wider flex-shrink-0">
            Active GPS
          </span>
        </div>
      ) : (
        <div className="p-3.5 bg-amber-50 border border-amber-100 rounded-2xl text-xs text-amber-700 font-bold flex items-center gap-2 animate-pulse">
          <AlertTriangle size={15} className="text-amber-600 flex-shrink-0" />
          <span>Tap the map canvas to set your location coordinates.</span>
        </div>
      )}

      {/* Geolocation instructions guide */}
      <div className="text-[11px] bg-slate-55/60 border border-slate-100 rounded-2xl p-3.5 text-slate-500 font-medium leading-relaxed mt-1">
        <span className="font-bold text-slate-700 block mb-1">📍 Map Navigation Tips:</span>
        <ul className="list-disc pl-4 space-y-1">
          <li>Pan the map by clicking and dragging. Zoom using the +/- buttons or mouse scroll.</li>
          <li>Click/tap once at the exact pickup building or street point.</li>
          <li>The reverse geocoder will automatically fill out your street address in the form.</li>
        </ul>
      </div>
    </div>
  );
}
