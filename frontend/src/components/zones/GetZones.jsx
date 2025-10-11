import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Polygon, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

const FlyTo = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 17, { duration: 1.5 });
  }, [position, map]);
  return null;
};

const GetZones = () => {
  const navigate = useNavigate();
  const { dept_id } = useParams();
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState(null);

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();

      const res = await axios.get(`/api/v1/zones/${dept_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setZones(res.data.zones || []);
    } catch (err) {
      console.error('Failed to fetch zones:', err);
    } finally {
      setLoading(false);
    }
  };

  const defaultCenter = zones.length
    ? [
        zones[0].geographical_boundary.coordinates[0][0][1],
        zones[0].geographical_boundary.coordinates[0][0][0],
      ]
    : [26.85, 80.95];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-3xl p-6">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">
          All Zones
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="mb-4 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition duration-300"
        >
          Back
        </button>

        {loading ? (
          <p className="text-center text-gray-600">Loading zones...</p>
        ) : zones.length === 0 ? (
          <p className="text-center text-gray-500">No zones found.</p>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-2/3 h-[500px] rounded-xl overflow-hidden shadow-lg">
              <MapContainer
                center={defaultCenter}
                zoom={15}
                scrollWheelZoom
                className="h-full w-full"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                {zones.map((zone) => (
                  <Polygon
                    key={zone._id}
                    positions={zone.geographical_boundary.coordinates[0].map(
                      ([lng, lat]) => [lat, lng]
                    )}
                    pathOptions={{
                      color: zone.color || '#3b82f6',
                      fillColor: zone.color || '#3b82f6',
                      fillOpacity: 0.4,
                      weight: 2,
                    }}
                  >
                    <Popup>
                      <strong>{zone.zone_name}</strong>
                      <br />
                      {zone.description || 'No description'}
                    </Popup>
                  </Polygon>
                ))}
                {selectedPosition && <FlyTo position={selectedPosition} />}
              </MapContainer>
            </div>

            <div className="md:w-1/3 overflow-y-auto max-h-[500px] bg-indigo-50 p-4 rounded-xl shadow-inner">
              <h3 className="text-xl font-semibold mb-4 text-indigo-700 text-center">
                Zone List
              </h3>
              <ul className="space-y-3">
                {zones.map((zone) => (
                  <li
                    key={zone._id}
                    className="flex items-center justify-between p-3 bg-white rounded-xl shadow hover:shadow-md cursor-pointer transition duration-300"
                    onClick={() =>
                      setSelectedPosition([
                        zone.geographical_boundary.coordinates[0][0][1],
                        zone.geographical_boundary.coordinates[0][0][0],
                      ])
                    }
                  >
                    <span>{zone.zone_name}</span>
                    <div
                      className="w-5 h-5 rounded-full"
                      style={{ backgroundColor: zone.color || '#3b82f6' }}
                    ></div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GetZones;
