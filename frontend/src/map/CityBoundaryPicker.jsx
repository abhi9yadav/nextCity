import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  FeatureGroup,
  Polygon,
  useMap,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import axios from "axios";

const CityBoundaryPicker = ({
  onSelect,
  onCancel,
  defaultPolygon,
  cityName,
  stateName,
  country,
}) => {
  const [polygonCoords, setPolygonCoords] = useState([]);
  const [center, setCenter] = useState(null);
  const [useAutoBoundary, setUseAutoBoundary] = useState(false);
  const [isLoadingBoundary, setIsLoadingBoundary] = useState(false);
  const featureGroupRef = useRef(null);

  // Load existing boundary
  useEffect(() => {
    if (defaultPolygon?.coordinates?.[0]) {
      const leafletCoords = defaultPolygon.coordinates[0].map(([lng, lat]) => [
        lat,
        lng,
      ]);
      setPolygonCoords(leafletCoords);
      setCenter(leafletCoords[0]);
    }
  }, [defaultPolygon]);

  useEffect(() => {
    const fetchCityCenter = async () => {
      if (cityName && stateName && country) {
        try {
          const query = encodeURIComponent(
            `${cityName}, ${stateName}, ${country}`
          );
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}`
          );
          if (res.data.length > 0) {
            const { lat, lon } = res.data[0];
            setCenter([parseFloat(lat), parseFloat(lon)]);
            return;
          }
        } catch (err) {
          console.warn("City center fetch failed:", err);
        }
      }
      setCenter([22.9734, 78.6569]);
    };
    fetchCityCenter();
  }, [cityName, stateName, country]);

  const fetchAutoBoundary = async () => {
    if (!cityName || !stateName || !country) {
      alert("Please ensure city, state, and country are selected!");
      return;
    }

    try {
      setIsLoadingBoundary(true);
      const query = encodeURIComponent(`${cityName}, ${stateName}, ${country}`);
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search.php?q=${query}&polygon_geojson=1&format=json`
      );

      if (res.data.length === 0) {
        alert("No automatic boundary found for this city.");
        setUseAutoBoundary(false);
        return;
      }

      const cityData = res.data[0];
      if (!cityData.geojson || cityData.geojson.type !== "Polygon") {
        alert("Automatic boundary not available as a polygon. Draw manually.");
        setUseAutoBoundary(false);
        return;
      }

      const coords = cityData.geojson.coordinates[0].map(([lng, lat]) => [
        lat,
        lng,
      ]);
      setPolygonCoords(coords);
      setCenter([parseFloat(cityData.lat), parseFloat(cityData.lon)]);
    } catch (err) {
      console.error("Auto boundary fetch error:", err);
      alert("Failed to fetch automatic boundary.");
    } finally {
      setIsLoadingBoundary(false);
    }
  };

  const handleCreated = (e) => {
    if (e.layerType === "polygon") {
      const latlngs = e.layer.getLatLngs()[0].map((p) => [p.lat, p.lng]);
      setPolygonCoords(latlngs);
    }
  };

  const handleEdited = (e) => {
    e.layers.eachLayer((layer) => {
      const latlngs = layer.getLatLngs()[0].map((p) => [p.lat, p.lng]);
      setPolygonCoords(latlngs);
    });
  };

  const handleDeleted = () => setPolygonCoords([]);

  const handleSelect = async () => {
    if (polygonCoords.length === 0) {
      alert("Please draw or use automatic boundary before saving!");
      return;
    }

    const avgLat =
      polygonCoords.reduce((sum, [lat]) => sum + lat, 0) / polygonCoords.length;
    const avgLng =
      polygonCoords.reduce((sum, [, lng]) => sum + lng, 0) /
      polygonCoords.length;

    let addressInfo = {};
    try {
      const reverseRes = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${avgLat}&lon=${avgLng}`
      );
      addressInfo = reverseRes.data.address || {};
    } catch (err) {
      console.warn("Reverse geocoding failed:", err);
    }

    const city =
      addressInfo.city ||
      addressInfo.town ||
      addressInfo.village ||
      addressInfo.municipality ||
      addressInfo.county ||
      "";

    const state = addressInfo.state || "";
    const countryName = addressInfo.country || "";

    const coords = polygonCoords.map(([lat, lng]) => [lng, lat]);
    const first = coords[0];
    const last = coords[coords.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      coords.push(first);
    }

    onSelect({
      boundary: {
        type: "Polygon",
        coordinates: [coords],
      },
      center: { lat: avgLat, lng: avgLng },
      address: { city, state, country: countryName },
    });
  };

  const MapViewSetter = () => {
    const map = useMap();
    useEffect(() => {
      if (center) map.setView(center, 11);
    }, [center, map]);
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-4 w-11/12 md:w-2/3">
        <h2 className="text-lg font-semibold mb-3 text-center">
          Select City Boundary for {cityName || "your location"}
        </h2>

        {/* Auto boundary toggle */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <input
            type="checkbox"
            id="auto-boundary"
            checked={useAutoBoundary}
            onChange={(e) => {
              setUseAutoBoundary(e.target.checked);
              if (e.target.checked) fetchAutoBoundary();
              else setPolygonCoords([]);
            }}
            disabled={isLoadingBoundary}
          />
          <label htmlFor="auto-boundary" className="font-medium">
            Use Automatic Boundary
          </label>
          {isLoadingBoundary && (
            <p className="text-blue-600 text-sm">Fetching boundary...</p>
          )}
        </div>

        {center ? (
          <MapContainer
            center={center}
            zoom={11}
            style={{ height: "400px", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapViewSetter />
            <FeatureGroup ref={featureGroupRef}>
              <EditControl
                position="topright"
                onCreated={handleCreated}
                onEdited={handleEdited}
                onDeleted={handleDeleted}
                draw={{
                  polygon: !useAutoBoundary,
                  polyline: false,
                  rectangle: false,
                  circle: false,
                  marker: false,
                  circlemarker: false,
                }}
              />
              {polygonCoords.length > 0 && (
                <Polygon positions={polygonCoords} />
              )}
            </FeatureGroup>
          </MapContainer>
        ) : (
          <p className="text-center py-4 text-gray-600">Loading map...</p>
        )}

        <div className="flex justify-end gap-4 mt-4">
          <button
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            onClick={handleSelect}
          >
            Save Boundary
          </button>
        </div>
      </div>
    </div>
  );
};

export default CityBoundaryPicker;
