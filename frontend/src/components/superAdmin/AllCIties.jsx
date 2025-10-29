import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAuth } from "firebase/auth";
import { MapContainer, TileLayer, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { MapPin } from "lucide-react";
import CreateCityAdminModal from "./SuperAdminModals/CreateCityAdminModal";
import CityAdminDetailsModal from "./SuperAdminModals/CityAdminDetailsModal";

const AllCities = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [adminCity, setAdminCity] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState({ type: null, isOpen: false });
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    photo: null,
  });

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          setError("You must be logged in!");
          setLoading(false);
          return;
        }
        const token = await user.getIdToken();
        const res = await axios.get(
          `${BASE_URL}/superAdmin/cities`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCities(res.data.cities || []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to fetch cities.");
      } finally {
        setLoading(false);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 1000);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const openModal = (type, city) => {
    setAdminCity(city);
    if (type === "admin" && city) {
      setNewUser({ name: "", email: "", phone: "", photo: null });
    }
    setIsModalOpen({ type, isOpen: true });
  };

  const closeModal = () => {
    setIsModalOpen({ type: null, isOpen: false });
    setAdminCity(null);
    setNewUser({ name: "", email: "", phone: "", photo: null });
  };

  const handleDeleteCity = async (cityId, cityName) => {
    if (!window.confirm(`Are you sure you want to delete ${cityName}?`)) return;
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const token = await user.getIdToken();
      await axios.delete(
        `${BASE_URL}/superAdmin/city/${cityId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCities((prev) => prev.filter((c) => c._id !== cityId));
      alert(`City "${cityName}" deleted successfully.`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete city.");
    }
  };

  const handleViewCityAdmin = async (cityAdminId) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("User not logged in");
      const token = await user.getIdToken();

      const res = await axios.get(
        `${BASE_URL}/superAdmin/cityAdmin/${cityAdminId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSelectedAdmin(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch City Admin details.");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!adminCity) {
      alert("City not selected!");
      return;
    }
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("User not logged in");
      const idToken = await user.getIdToken(true);

      const formData = new FormData();
      formData.append("name", newUser.name);
      formData.append("email", newUser.email);
      formData.append("phone", newUser.phone);
      formData.append("role", "city_admin");
      formData.append("city_id", adminCity._id);
      formData.append("city_name", adminCity.city_name);

      if (newUser.photo) formData.append("photo", newUser.photo);

      const res = await axios.post(
        `${BASE_URL}/superAdmin/users/create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("City admin created successfully!");
      closeModal();
    } catch (err) {
      console.error("Error in handleCreateUser:", err);
      alert(err.response?.data?.message || "Failed to create city admin.");
    }
  };

  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  // Filters
  const filteredCities = cities.filter((city) => {
    const term = debouncedTerm.toLowerCase();
    const matchesSearch =
      city.city_name.toLowerCase().includes(term) ||
      city.state.toLowerCase().includes(term) ||
      (city.city_id?.city_name || "").toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "assigned"
        ? !!city.city_admin
        : !city.city_admin;

    return matchesSearch && matchesStatus;
  });

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-600 text-lg">
        Loading cities...
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-500 font-semibold mt-6">{error}</div>
    );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* Sticky Header */}
      <div
        className="p-4 mb-4 shadow-md rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-2"
        style={{
          position: "sticky",
          top: "75px",
          zIndex: "40",
          backgroundColor: "#f3f4f6",
        }}
      >
        <h1 className="text-2xl font-bold">All Cities</h1>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
          >
            <option value="all">All Cities</option>
            <option value="assigned">City Admin Assigned</option>
            <option value="not_assigned">City Admin Not Assigned</option>
          </select>
        </div>
      </div>

      {filteredCities.length === 0 ? (
        <p className="text-gray-500 text-center">No cities found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="py-3 px-4 text-left font-semibold">#</th>
                <th className="py-3 px-4 text-left font-semibold">City</th>
                <th className="py-3 px-4 text-left font-semibold">State</th>
                <th className="py-3 px-4 text-left font-semibold">Country</th>
                <th className="py-3 px-4 text-center font-semibold">
                  City Admin
                </th>
                <th className="py-3 px-4 text-center font-semibold">
                  View on Map
                </th>
                <th className="py-3 px-4 text-center font-semibold">Delete</th>
              </tr>
            </thead>
            <tbody>
              {filteredCities.map((city, i) => (
                <tr
                  key={i}
                  className={`border-t border-gray-200 hover:bg-gray-50 transition ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="py-3 px-4">{i + 1}</td>
                  <td className="py-3 px-4 font-medium text-gray-800">
                    {city.city_name}
                  </td>
                  <td className="py-3 px-4 text-gray-700">{city.state}</td>
                  <td className="py-3 px-4 text-gray-700">{city.country}</td>

                  <td className="py-3 px-4 text-center">
                    {city.city_admin ? (
                      <button
                        onClick={() => handleViewCityAdmin(city.city_admin)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow"
                      >
                        View Details
                      </button>
                    ) : (
                      <button
                        onClick={() => openModal("admin", city)}
                        className="bg-purple-600 text-white font-bold py-2 px-3 rounded-lg text-sm hover:bg-purple-700"
                      >
                        + Add City Admin
                      </button>
                    )}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center">
                      <button
                        onClick={() => setSelectedCity(city)}
                        className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/40 transition-all duration-300 ease-out ring-2 ring-blue-400/40 hover:ring-blue-500 hover:bg-blue-600 hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300"
                        title="View Location on Map"
                        aria-label="View Location on Map"
                      >
                        <MapPin size={22} strokeWidth={2.3} />
                      </button>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <IconButton
                      onClick={() => handleDeleteCity(city._id, city.city_name)}
                      color="error"
                      size="large"
                      title="Delete City"
                    >
                      <DeleteIcon fontSize="inherit" />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Map Modal */}
      {selectedCity && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 transition-opacity">
          <div className="bg-white rounded-lg shadow-lg w-[90%] md:w-[70%] h-[80%] relative overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b bg-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">
                {selectedCity.city_name}, {selectedCity.state}
              </h2>
              <button
                onClick={() => setSelectedCity(null)}
                className="text-gray-600 hover:text-gray-900 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="flex-1">
              <MapContainer
                center={
                  selectedCity.center?.lat && selectedCity.center?.lng
                    ? [selectedCity.center.lat, selectedCity.center.lng]
                    : [20.5937, 78.9629]
                }
                zoom={12}
                className="h-full w-full"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="© OpenStreetMap contributors"
                />
                {selectedCity.boundary?.coordinates?.[0] && (
                  <Polygon
                    positions={selectedCity.boundary.coordinates[0].map(
                      (coord) => [coord[1], coord[0]]
                    )}
                    pathOptions={{
                      color: "blue",
                      weight: 2,
                      fillColor: "rgba(30,144,255,0.3)",
                    }}
                  />
                )}
              </MapContainer>
            </div>
            <div className="p-4 border-t bg-gray-50 text-gray-600 text-sm text-center"></div>
          </div>
        </div>
      )}

      {/* City Admin Details Modal */}
      <CityAdminDetailsModal
        selectedAdmin={selectedAdmin}
        setSelectedAdmin={setSelectedAdmin}
      />

      {/* Modal for Creating CityAdmin */}
      <CreateCityAdminModal
        isOpen={isModalOpen.type === "admin"}
        onClose={closeModal}
        title={`Add City Admin for ${adminCity?.city_name || "City"}`}
      >
        <form onSubmit={handleCreateUser} className="space-y-5">
          {/* Name Input */}
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={newUser.name}
            onChange={handleUserFormChange}
            className="w-full p-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition"
            required
          />

          {/* Email Input */}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={newUser.email}
            onChange={handleUserFormChange}
            className="w-full p-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition"
            required
          />

          {/* Phone Input */}
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={newUser.phone}
            onChange={handleUserFormChange}
            className="w-full p-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition"
            required
          />

          {/* City Info */}
          {adminCity ? (
            <div className="w-full p-3 border rounded-2xl bg-gray-100 text-gray-700 font-medium shadow-inner">
              {adminCity.city_name}
            </div>
          ) : (
            <select
              name="city_id"
              value={newUser.city_id}
              onChange={handleUserFormChange}
              className="w-full p-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition"
              required
            >
              <option value="">Select City</option>
              {cities.map((city, index) => (
                <option key={city._id || index} value={city._id}>
                  {city.city_name}
                </option>
              ))}
            </select>
          )}

          {/* Photo Upload */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Upload Photo
            </label>
            <label className="flex flex-col items-center justify-center w-full p-5 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition duration-200 text-gray-500">
              <input
                type="file"
                name="photo"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, photo: e.target.files[0] }))
                }
              />
              {newUser.photo ? (
                <span className="text-gray-700 font-medium">
                  Chosen photo: {newUser.photo.name}
                </span>
              ) : (
                <span>Click to upload photo</span>
              )}
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold py-3 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Create Admin
          </button>
        </form>
      </CreateCityAdminModal>
    </div>
  );
};

export default AllCities;
