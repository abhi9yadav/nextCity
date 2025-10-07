import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  FeatureGroup,
  useMapEvents,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

/**
 * BoundaryPicker.jsx
 * -----------------------------------------------------
 * Lets a CityAdmin draw polygon boundaries (zones) on map.
 * Returns GeoJSON coordinates, center, and address automatically.
 *
 * Props:
 *  - onSelect(zoneData): callback with polygon data
 *  - onCancel(): callback when cancelled
 * -----------------------------------------------------
 */
const BoundaryPicker = ({ onSelect, onCancel }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [polygonCoords, setPolygonCoords] = useState(null);

  // ✅ Fetch current user location to center the map
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCurrentLocation([lat, lng]);
        },
        (err) => {
          console.warn("Geolocation failed:", err);
          setCurrentLocation([25.4358, 81.8463]); // Default: Prayagraj
        }
      );
    } else {
      setCurrentLocation([25.4358, 81.8463]); // Fallback
    }
  }, []);

  // ✅ Handle polygon creation (store coordinates)
  const handleCreated = (e) => {
    if (e.layerType === "polygon") {
      const latlngs = e.layer.getLatLngs()[0].map((p) => [p.lng, p.lat]);
      setPolygonCoords(latlngs);
    }
  };

  // ✅ Handle polygon deletion (reset)
  const handleDeleted = () => {
    setPolygonCoords(null);
  };

  const MapEvents = () => {
    useMapEvents({});
    return null;
  };

  // ✅ Return polygon data (GeoJSON + center + address)
  const handleSelect = async () => {
    if (!polygonCoords) {
      alert("Please draw a polygon boundary first!");
      return;
    }

    // Calculate polygon center (approximate centroid)
    const lats = polygonCoords.map((p) => p[1]);
    const lngs = polygonCoords.map((p) => p[0]);
    const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

    // Optional reverse geocoding (OpenStreetMap)
    let address = "";
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${centerLat}&lon=${centerLng}&format=json`
      );
      const data = await res.json();
      address = data.display_name || "";
    } catch (err) {
      console.warn("Address lookup failed:", err);
    }

    // ✅ Construct final data object for backend
    const zoneData = {
      geographical_boundary: {
        type: "Polygon",
        coordinates: [polygonCoords], // GeoJSON standard [[[lng, lat], ...]]
      },
      center: { lat: centerLat, lng: centerLng },
      address,
    };

    onSelect(zoneData);
  };

  if (!currentLocation) return <p className="text-center">Fetching your location...</p>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-4 w-11/12 md:w-2/3">
        <h2 className="text-lg font-semibold mb-3 text-center">
          Select Zone Boundary
        </h2>

        <MapContainer
          center={currentLocation}
          zoom={15}
          style={{ height: "400px", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <FeatureGroup>
            <EditControl
              position="topright"
              onCreated={handleCreated}
              onDeleted={handleDeleted}
              draw={{
                polygon: true,
                polyline: false,
                rectangle: false,
                circle: false,
                marker: false,
                circlemarker: false,
              }}
            />
          </FeatureGroup>

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
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            onClick={handleSelect}
          >
            Select Boundary
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoundaryPicker;
