import React, { useState } from "react";
import axios from "axios";
import { getAuth } from "firebase/auth";
import CityBoundaryPicker from "../../map/CityBoundaryPicker";
import { Country, State, City } from "country-state-city";
import { useNavigate } from "react-router-dom";

const CreateCityPage = () => {
  const navigate = useNavigate();
  const [country, setCountry] = useState("IN");
  const [stateCode, setStateCode] = useState("");
  const [cityName, setCityName] = useState("");
  const [boundary, setBoundary] = useState(null);
  const [center, setCenter] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [address, setAddress] = useState({ city: "", state: "", country: "" });

  const countries = Country.getAllCountries();
  const states = State.getStatesOfCountry(country);
  const cities = stateCode ? City.getCitiesOfState(country, stateCode) : [];
  const selectedCountry = countries.find((c) => c.isoCode === country);
  const selectedState = states.find((s) => s.isoCode === stateCode);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!boundary) {
      alert("Please select a boundary before submitting!");
      return;
    }
    try {
      const auth = getAuth();

      const user = auth.currentUser;
      if (!user) return alert("You must be logged in!");

      const token = await user.getIdToken();
      
      await axios.post(
        `${BASE_URL}/superAdmin/cities`,
        {
          city_name: cityName,
          state: selectedState?.name,
          country: selectedCountry?.name,
          boundary: boundary.boundary,
          center: boundary.center,
          address: boundary.address,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("City created successfully!");
      setCityName("");
      setStateCode("");
      setBoundary(null);
      setCenter(null);
      setAddress({ city: "", state: "", country: "" });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create city.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg shadow hover:bg-gray-200 transition"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-gray-800 text-center flex-1">
          Create City
        </h1>
        <div style={{ width: "80px" }}></div> {/* placeholder */}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Country */}
        <div>
          <label className="block font-semibold text-gray-700 mb-2">Country</label>
          <select
            className="border border-gray-300 rounded-lg w-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              setStateCode("");
              setCityName("");
              setAddress({ city: "", state: "", country: "" });
            }}
          >
            {countries.map((c) => (
              <option key={c.isoCode} value={c.isoCode}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* State */}
        <div>
          <label className="block font-semibold text-gray-700 mb-2">State</label>
          <select
            className="border border-gray-300 rounded-lg w-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            value={stateCode}
            onChange={(e) => {
              setStateCode(e.target.value);
              setCityName("");
              setAddress({ city: "", state: "", country: "" });
            }}
            required
          >
            <option value="">Select State</option>
            {states.map((s) => (
              <option key={s.isoCode} value={s.isoCode}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* City */}
        <div>
          <label className="block font-semibold text-gray-700 mb-2">City</label>
          <select
            className="border border-gray-300 rounded-lg w-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            value={cityName}
            onChange={(e) => setCityName(e.target.value)}
            required
          >
            <option value="">Select City</option>
            {cities.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Map Button */}
        <div>
          <button
            type="button"
            onClick={() => setShowMap(true)}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition"
          >
            {boundary ? "Edit Boundary" : "Select Boundary"}
          </button>
        </div>

        {/* Display Center & Address */}
        {center && (
          <div className="mt-3 text-gray-600 text-sm bg-gray-50 p-3 rounded border border-gray-200">
            <p>🧭 Center: {center.lat.toFixed(4)}, {center.lng.toFixed(4)}</p>
            <p>🏷 Address: {address.city}, {address.state}, {address.country}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-green-700 transition"
        >
          Create City
        </button>
      </form>

      {/* CityBoundaryPicker Modal */}
      {showMap && (
        <CityBoundaryPicker
          cityName={cityName}
          stateName={selectedState?.name}
          country={selectedCountry?.name}
          defaultPolygon={boundary?.geographical_boundary || null}
          onSelect={(b) => {
            setBoundary(b);
            setCenter(b.center);
            if (b.address.city) setCityName(b.address.city);
            if (b.address.state) {
              const matchedState = State.getStatesOfCountry(country).find(
                (s) => s.name === b.address.state
              );
              if (matchedState) setStateCode(matchedState.isoCode);
            }
            setAddress(b.address);
            setShowMap(false);
          }}
          onCancel={() => setShowMap(false)}
        />
      )}
    </div>
  );
};

export default CreateCityPage;
