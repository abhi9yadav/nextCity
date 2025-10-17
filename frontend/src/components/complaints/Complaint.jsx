import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MapPicker from "../../map/MapPicker";
import { getAuth } from "firebase/auth";

const CreateComplaint = () => {
  const navigate = useNavigate();
  const [showMap, setShowMap] = useState(false);
  const [fileState, setFileState] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    concernedDepartment: "",
    location: { lat: 0, lng: 0, address: "" },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["lat", "lng", "address"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        location: { ...prev.location, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const uploadData = new FormData();
    uploadData.append("title", formData.title);
    uploadData.append("description", formData.description);
    uploadData.append("concernedDepartment", formData.concernedDepartment);

    uploadData.append(
      "location",
      JSON.stringify({
        type: "Point",
        coordinates: [formData.location.lng, formData.location.lat],
        address: formData.location.address,
      })
    );

    fileState.forEach((file) => {
      uploadData.append("attachments", file);
    });

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to submit a complaint.");
        return;
      }

      const token = await user.getIdToken();
      const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api/v1/";
      const res = await axios.post(
        `${BASE_URL}complaints`,
        uploadData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Complaint created successfully!");
    } catch (error) {
      console.error("Error:", error.response?.data || error);
      alert(
        "Failed to create complaint: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Create Complaint
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Type */}
        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Concerned Department
          </label>
          <select
            name="concernedDepartment"
            value={formData.concernedDepartment}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="" disabled selected hidden>
              -- Select Concerned Department --
            </option>
            <option value="Department of Power Supply">
              Department of Power Supply
            </option>
            <option value="Department of Water Management">
              Department of Water Management
            </option>
            <option value="Department of Roads and Infrastructure">
              Department of Roads and Infrastructure
            </option>
            <option value="Department of Sanitation and Waste Management">
              Department of Sanitation and Waste Management
            </option>
            <option value="Department of Drainage and Sewage">
              Department of Drainage and Sewage
            </option>
            <option value="Department of Parks and Green Spaces">
              Department of Parks and Green Spaces
            </option>
            <option value="Department of Public Health">
              Department of Public Health
            </option>
            <option value="Department of General Services">
              Department of General Services (other)
            </option>
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter complaint title"
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your complaint in detail..."
            rows={4}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Location
          </label>
          <button
            type="button"
            onClick={() => setShowMap(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded mb-2"
          >
            Select Location on Map
          </button>
          {formData.location.address && (
            <p>
              Selected: {formData.location.address} (Lat:{" "}
              {formData.location.lat}, Lng: {formData.location.lng})
            </p>
          )}
        </div>

        {/* Map Picker */}
        {showMap && (
          <MapPicker
            onSelect={(loc) => {
              setFormData((prev) => ({ ...prev, location: loc }));
              setShowMap(false);
            }}
            onCancel={() => setShowMap(false)}
          />
        )}

        {/* Attachments */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Attachments
          </label>

          <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors w-full block">
            <input
              type="file"
              name="attachments"
              accept="image/*,video/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files);
                setFileState(files);
              }}
              className="hidden"
            />
            <p className="text-gray-500">
              Click here or drag files to upload (Images & Videos)
            </p>
          </label>

          {fileState.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {fileState.map((file, idx) => (
                <div
                  key={idx}
                  className="w-20 h-20 border rounded-lg overflow-hidden relative"
                >
                  {file.type.startsWith("image") ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`attachment-${idx}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={URL.createObjectURL(file)}
                      className="w-full h-full object-cover"
                      controls
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="text-center mt-6">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            Submit Complaint
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateComplaint;
