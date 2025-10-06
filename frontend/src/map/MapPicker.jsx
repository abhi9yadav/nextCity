import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"; 
import "leaflet-defaulticon-compatibility";

const MapPicker = ({ onSelect, onCancel }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [marker, setMarker] = useState(null);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCurrentLocation([lat, lng]);
          setMarker({ lat, lng }); // Optional: start marker at current location
        },
        (err) => {
          console.error("Could not get location:", err);
          alert("Unable to fetch your current location.");
          setCurrentLocation([0, 0]); // fallback location
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setCurrentLocation([0, 0]); // fallback location
    }
  }, []);

  // Component to handle map clicks
  const MapEvents = () => {
    useMapEvents({
      click: (e) => {
        setMarker({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return null;
  };

  const handleSelect = async () => {
    if (!marker) return;

    // Get address from OpenStreetMap
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${marker.lat}&lon=${marker.lng}&format=json`
    );
    const data = await res.json();
    const address = data.display_name || "";

    onSelect({ lat: marker.lat, lng: marker.lng, address });
  };

  if (!currentLocation) return <p className="text-center">Fetching your location...</p>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-4 w-11/12 md:w-2/3">
        <MapContainer
          center={currentLocation}
          zoom={16}
          style={{ height: "400px", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {marker && <Marker position={[marker.lat, marker.lng]} />}
          <MapEvents />
        </MapContainer>

        <div className="flex justify-end gap-4 mt-4">
          <button
            type="button"
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handleSelect}
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapPicker;
