import React, { useState } from "react";
import BoundaryPicker from "../../map/BoundaryPicker";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const CreateZone = () => {
  const { cityId, departmentId } = useParams();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [zoneName, setZoneName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#3b82f6"); // default blue
  const [zoneData, setZoneData] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  const handleBoundarySelect = (data) => {
    setZoneData(data);
    setShowPicker(false);
  };

  const handleCreateZone = async () => {
    if (!zoneData) return alert("Please draw a zone boundary first!");
    if (!zoneName.trim()) return alert("Zone name is required!");

    let coordinates = zoneData.geographical_boundary.coordinates[0];

    // Close the polygon loop if not already closed
    if (
      coordinates.length > 0 &&
      (coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
        coordinates[0][1] !== coordinates[coordinates.length - 1][1])
    ) {
      coordinates.push([...coordinates[0]]);
    }

    const geoJSON = {
      type: "Polygon",
      coordinates: [coordinates],
    };

    // ✅ Create payload
    const payload = {
      zone_name: zoneName,
      description,
      color,
      city_id: cityId,
      department_id: departmentId,
      geographical_boundary: geoJSON,
    };

    try {
      await axios.post("/api/v1/zones", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Zone created successfully!");
      navigate(-1);
    } catch (err) {
      console.error("Error creating zone:", err.response || err);
      alert("❌ Failed to create zone");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-8 bg-white shadow-xl rounded-xl">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Create New Zone
      </h2>

      {/* Zone Form */}
      <div className="space-y-5">
        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Zone Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={zoneName}
            onChange={(e) => setZoneName(e.target.value)}
            placeholder="Enter zone name"
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
            placeholder="Enter zone description"
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
            Draw Boundary
          </button>

          {zoneData && (
            <div className="mt-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
              <p>
                <strong>Center:</strong> {zoneData.center.lat},{" "}
                {zoneData.center.lng}
              </p>
              <p>
                <strong>Address:</strong> {zoneData.address}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex gap-4 justify-end">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-500 text-white px-5 py-2 rounded-lg hover:bg-gray-600 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleCreateZone}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Save Zone
        </button>
      </div>

      {/* Boundary Picker Modal */}
      {showPicker && (
        <BoundaryPicker
          onSelect={handleBoundarySelect}
          onCancel={() => setShowPicker(false)}
        />
      )}
    </div>
  );
};

export default CreateZone;
