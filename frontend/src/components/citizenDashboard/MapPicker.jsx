import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    }
  });
  return null;
};

export default function MapPicker({
  initialPosition = [26.5123, 80.2329],
  initialAddress = "",
  onConfirm,
  onCancel,
}) {
  const [position, setPosition] = useState(initialPosition);
  const [address, setAddress] = useState(initialAddress);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const searchTimeout = useRef(null);

  useEffect(() => { setAddress(initialAddress); }, [initialAddress]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [lat, lon] = position;
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
        const res = await fetch(url, { headers: { "Accept-Language": "en" } });
        const json = await res.json();
        if (active && json.display_name) setAddress(json.display_name);
      } catch (err) {
        // ignore
      }
    })();
    return () => { active = false; };
  }, [position]);

  // Search (Nominatim) with debounce
  useEffect(() => {
    if (!query) { setSearchResults([]); return; }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(async () => {
      try {
        setSearching(true);
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`;
        const res = await fetch(url);
        const arr = await res.json();
        setSearchResults(arr || []);
      } catch (err) {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => clearTimeout(searchTimeout.current);
  }, [query]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search address or place..."
          className="flex-1 p-2 border rounded"
        />
        <button onClick={() => { setQuery(''); setSearchResults([]); }} className="px-3 rounded bg-gray-100">Clear</button>
      </div>

      {searchResults.length > 0 && (
        <div className="max-h-40 overflow-auto border rounded p-2 bg-white">
          {searchResults.map((r) => (
            <button
              key={r.place_id}
              onClick={() => {
                const lat = parseFloat(r.lat), lon = parseFloat(r.lon);
                setPosition([lat, lon]);
                setAddress(r.display_name);
                setSearchResults([]);
                setQuery('');
              }}
              className="text-left w-full p-2 hover:bg-gray-100 rounded"
            >
              <div className="text-sm">{r.display_name}</div>
            </button>
          ))}
        </div>
      )}

      <div className="h-64 rounded overflow-hidden border">
        <MapContainer center={position} zoom={15} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
          <LocationMarker position={position} setPosition={setPosition} />
          <Marker
            position={position}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const latlng = e.target.getLatLng();
                setPosition([latlng.lat, latlng.lng]);
              }
            }}
          />
        </MapContainer>
      </div>

      <div>
        <label className="block text-xs text-gray-600">Address (editable)</label>
        <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-2 border rounded mt-1" />
        <div className="text-xs text-gray-500 mt-1">Coords: {position[0].toFixed(6)}, {position[1].toFixed(6)}</div>
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-4 py-2 rounded bg-gray-100">Cancel</button>
        <button onClick={() => onConfirm(position, address)} className="px-4 py-2 rounded bg-blue-600 text-white">Confirm Location</button>
      </div>
    </div>
  );
}
