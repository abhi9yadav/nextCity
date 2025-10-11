import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BoundaryPicker from '../../map/BoundaryPicker';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

const UpdateZone = () => {
  const navigate = useNavigate();
  const { dept_id } = useParams();

  const [zones, setZones] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [zoneName, setZoneName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [updatedBoundary, setUpdatedBoundary] = useState(null);
  const [center, setCenter] = useState(null);
  const [address, setAddress] = useState('');
  const [showPicker, setShowPicker] = useState(false);

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
      setZones(res.data.zones);
    } catch (err) {
      console.error('Failed to fetch zones:', err);
    }
  };

  const handleSelectZone = (zoneId) => {
    setSelectedZoneId(zoneId);
    const zone = zones.find((z) => z._id === zoneId);
    if (zone) {
      setZoneName(zone.zone_name);
      setDescription(zone.description);
      setColor(zone.color || '#3b82f6');
      setUpdatedBoundary(zone.geographical_boundary || null);
      setCenter(zone.center || null);
      setAddress(zone.address || '');
    }
  };

  const handleUpdate = async () => {
    if (!selectedZoneId) return alert('Please select a zone!');
    if (!zoneName.trim()) return alert('Zone name is required!');
    if (!updatedBoundary) return alert('Please draw a boundary!');

    let coords = updatedBoundary.coordinates?.[0];
    if (
      coords &&
      coords.length > 0 &&
      (coords[0][0] !== coords[coords.length - 1][0] ||
        coords[0][1] !== coords[coords.length - 1][1])
    ) {
      coords.push(coords[0]);
    }

    const updates = {
      zone_name: zoneName,
      description,
      color,
      geographical_boundary: {
        type: 'Polygon',
        coordinates: [coords],
      },
      center,
      address,
    };

    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();

      await axios.patch(`/api/v1/zones/${selectedZoneId}`, updates, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('✅ Zone updated successfully!');
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert('❌ Failed to update zone');
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-8 bg-white shadow-2xl rounded-2xl">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Update Zone
      </h2>

      <div className="mb-6">
        <label className="block text-gray-700 font-semibold mb-2">
          Select Zone
        </label>
        <select
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={selectedZoneId}
          onChange={(e) => handleSelectZone(e.target.value)}
        >
          <option value="">-- Choose Zone --</option>
          {zones.map((zone) => (
            <option key={zone._id} value={zone._id}>
              {zone.zone_name}
            </option>
          ))}
        </select>
      </div>

      {selectedZoneId && (
        <div className="space-y-5">
          {/* Zone Name, Description, Color, Boundary */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Zone Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
              placeholder="Enter new zone name"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Zone Color
            </label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-16 h-10 rounded-lg border border-gray-300 p-1"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Geographical Boundary
            </label>
            <button
              onClick={() => setShowPicker(true)}
              className="bg-green-600 text-white px-5 py-2 rounded-lg shadow hover:bg-green-700 transition"
            >
              Draw / Edit Boundary
            </button>

            {updatedBoundary && (
              <div className="mt-3 p-3 border border-gray-200 rounded-lg bg-gray-50 space-y-1">
                <p>
                  <strong>Boundary type:</strong>{' '}
                  {updatedBoundary.type || 'Polygon'}
                </p>
                <p>
                  <strong>Coordinates:</strong>{' '}
                  {updatedBoundary.coordinates?.[0]?.length || 0} points
                </p>
                {center && (
                  <p>
                    <strong>Center:</strong> {center.lat}, {center.lng}
                  </p>
                )}
                {address && (
                  <p>
                    <strong>Address:</strong> {address}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 flex gap-4 justify-end">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-500 text-white px-5 py-2 rounded-lg hover:bg-gray-600 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleUpdate}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Update Zone
        </button>
      </div>

      {showPicker && (
        <BoundaryPicker
          onSelect={(data) => {
            setUpdatedBoundary(data.geographical_boundary || data);
            setCenter(data.center);
            setAddress(data.address);
            setShowPicker(false);
          }}
          onCancel={() => setShowPicker(false)}
        />
      )}
    </div>
  );
};

export default UpdateZone;
