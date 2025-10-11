import React, { useState } from "react";
import axios from "axios";
import { getAuth } from "firebase/auth";
import CityBoundaryPicker from "../../map/CityBoundaryPicker";
import { Country, State, City } from "country-state-city";

const CreateCityPage = () => {
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
        "http://localhost:5000/api/v1/superAdmin/cities",
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
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create City</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Country Dropdown */}
        <div>
          <label className="block font-medium">Country</label>
          <select
            className="border rounded w-full p-2"
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

        {/* State Dropdown */}
        <div>
          <label className="block font-medium">State</label>
          <select
            className="border rounded w-full p-2"
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

        {/* City Dropdown */}
        <div>
          <label className="block font-medium">City</label>
          <select
            className="border rounded w-full p-2"
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
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {boundary ? "Edit Boundary" : "Select Boundary"}
          </button>
        </div>

        {/* Display Center & Address */}
        {center && (
          <div className="mt-2 text-sm text-gray-700">
            <p>
              🧭 Center: {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
            </p>
            <p>
              🏷 Address: {address.city}, {address.state}, {address.country}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded mt-4"
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
