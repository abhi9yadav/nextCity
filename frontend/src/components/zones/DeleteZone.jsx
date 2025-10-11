import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

const DeleteZone = () => {
  const { dept_id } = useParams();
  const navigate = useNavigate();
  const [zones, setZones] = useState([]);

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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this zone?')) return;

    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();

      await axios.delete(`/api/v1/zones/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('✅ Zone deleted successfully!');
      fetchZones();
    } catch (err) {
      console.error(err);
      alert('❌ Failed to delete zone');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 flex flex-col items-center p-8">
      <div className="w-full max-w-2xl bg-white shadow-2xl rounded-3xl p-8">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-indigo-700">
          Delete Zone
        </h2>

        {zones.length === 0 ? (
          <p className="text-center text-gray-500 mt-10 text-lg">
            No zones available to delete.
          </p>
        ) : (
          <ul className="space-y-4">
            {zones.map((zone) => (
              <li
                key={zone._id}
                className="flex justify-between items-center p-4 bg-indigo-50 border border-indigo-100 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div>
                  <p className="text-lg font-semibold text-indigo-900">
                    {zone.zone_name}
                  </p>
                  {zone.description && (
                    <p className="text-sm text-indigo-600 mt-1">
                      {zone.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(zone._id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-semibold shadow-md transition duration-300"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={() => navigate(-1)}
          className="mt-8 w-full bg-gray-400 hover:bg-gray-500 text-white font-semibold py-3 rounded-2xl shadow-md transition duration-300"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default DeleteZone;
