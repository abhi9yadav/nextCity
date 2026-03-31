import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { getAuth } from "firebase/auth";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const StatCard = ({ title, value, color }) => {
  const colorMap = {
    orange: "bg-orange-100 text-orange-600",
    blue: "bg-blue-100 text-blue-600",
    gray: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
      <div
        className={`inline-block px-3 py-1 rounded-md text-xs font-semibold mb-3 ${colorMap[color]}`}
      >
        {title}
      </div>

      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  );
};

const Bar = ({ label, value, maxValue }) => {
  const heightPercent = maxValue ? (value / maxValue) * 100 : 0;

  return (
    <div className="flex flex-col items-center justify-end h-full">
      <div
        className="bg-blue-500 w-12 rounded-t-md transition-all"
        style={{ height: `${heightPercent}%` }}
      ></div>

      <p className="text-gray-700 text-sm mt-2">{label}</p>
      <p className="text-gray-500 text-xs">{value}</p>
    </div>
  );
};

const CityComplaints = () => {
  const [stats, setStats] = useState(null);
  const [activeDeptStats, setActiveDeptStats] = useState([]);
  const [resolvedDeptStats, setResolvedDeptStats] = useState([]);

  useEffect(() => {
    const fetchCityStats = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        const token = await user.getIdToken();

        const headers = { Authorization: `Bearer ${token}` };

        const res = await axios.get(`${BASE_URL}/cityAdmin/complaints/stats`, {
          headers,
        });
        // console.log("res:"+res);

        const deptRes = await axios.get(
          `${BASE_URL}/cityAdmin/departments/stats`,
          { headers },
        );

        setStats(res.data);
        setActiveDeptStats(deptRes.data.activeByDept);
        setResolvedDeptStats(deptRes.data.resolvedByDept);
      } catch (error) {
        console.error("Error fetching city stats:", error);
      }
    };

    fetchCityStats();
  }, []);

  if (!stats) return <p className="text-center mt-10">Loading...</p>;

  const activeMax = Math.max(...activeDeptStats.map((d) => d.count), 1);
  const resolvedMax = Math.max(...resolvedDeptStats.map((d) => d.count), 1);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-200 min-h-screen">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">In Your City, {stats.cityName}..</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Active Complaints"
          value={stats.activeComplaints}
          color="orange"
        />
        <StatCard
          title="Resolved This Month"
          value={stats.resolvedLast30Days}
          color="blue"
        />
      </div>

      {/* Active Complaints Chart */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h3 className="text-gray-800 font-semibold mb-4">
          Active Complaints by Department
        </h3>

        <div className="flex items-end gap-10 h-56 overflow-x-auto">
          {activeDeptStats.map((dept, i) => (
            <Bar
              key={i}
              label={dept._id.replace("Department of ", "")}
              value={dept.count}
              maxValue={activeMax}
            />
          ))}
        </div>
      </div>

      {/* Resolved Complaints Chart */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h3 className="text-gray-800 font-semibold mb-4">
          Resolved Complaints by Department (Last 30 Days)
        </h3>

        <div className="flex items-end gap-10 h-56 overflow-x-auto">
          {resolvedDeptStats.map((dept, i) => (
            <Bar
              key={i}
              label={dept._id.replace("Department of ", "")}
              value={dept.count}
              maxValue={resolvedMax}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CityComplaints;