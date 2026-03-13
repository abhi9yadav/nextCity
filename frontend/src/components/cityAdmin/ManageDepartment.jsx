import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { getAuth } from "firebase/auth";

import ManageDeptAdminPage from "./ManageDepartmentAdmins";
import CityDepartmentComplaints from "./CityDepartmentComplaints";
import ManageZones from "../zones/ManageZones";

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

const DepartmentDashboard = () => {
  const { dept_id } = useParams();

  const [department, setDepartment] = useState(null);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    const fetchDepartmentData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        const token = await user.getIdToken();

        const headers = { Authorization: `Bearer ${token}` };

        // Department info
        const deptRes = await axios.get(
          `${BASE_URL}/cityAdmin/departments/${dept_id}`,
          { headers },
        );

        // Stats
        const statsRes = await axios.get(
          `${BASE_URL}/cityAdmin/departments/${dept_id}/stats`,
          { headers },
        );

        // Activity
        const activityRes = await axios.get(
          `${BASE_URL}/cityAdmin/departments/${dept_id}/recent-activity`,
          { headers },
        );

        setDepartment(deptRes.data);
        setStats(statsRes.data);
        setActivity(activityRes.data);
      } catch (error) {
        console.error("Error loading department dashboard:", error);
      }
    };

    fetchDepartmentData();
  }, [dept_id]);

  if (!department || !stats)
    return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-200 min-h-screen">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {department.department_name}
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Active Complaints"
          value={stats.activeComplaints}
          color="orange"
        />
        <StatCard
          title="Resolved This Month"
          value={stats.resolvedThisMonth}
          color="blue"
        />
        <StatCard
          title="Zones Managed"
          value={stats.zonesManaged}
          color="gray"
        />
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => setActiveSection("complaints")}
          className="bg-orange-600 text-white py-3 rounded-lg shadow hover:bg-orange-700 transition"
        >
          View Complaints
        </button>
        
        <button
          onClick={() => setActiveSection("zones")}
          className="bg-blue-600 text-white py-3 rounded-lg shadow hover:bg-blue-700 transition"
        >
          Manage Zones
        </button>

        <button
          onClick={() => setActiveSection("admins")}
          className="bg-green-600 text-white py-3 rounded-lg shadow hover:bg-green-700 transition"
        >
          Manage Department Admin
        </button>
      </div>

      {/* Dynamic Section */}
      {activeSection === "zones" && <ManageZones dept_id={dept_id} />}
      {activeSection === "admins" && <ManageDeptAdminPage dept_id={dept_id} />}
      {activeSection === "complaints" && (
        <CityDepartmentComplaints dept_id={dept_id} />
      )}

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6 flex flex-col">
        <h3 className="text-gray-800 font-semibold mb-4">
          Complaints by Status
        </h3>

        {(() => {
          const chartData = [
            { label: "New", value: stats.new },
            { label: "In Progress", value: stats.inProgress },
            { label: "Resolved", value: stats.resolved },
          ];

          const maxValue = Math.max(...chartData.map((d) => d.value), 1);

          return (
            <div className="flex items-end gap-12 h-48">
              {chartData.map((item, i) => (
                <Bar
                  key={i}
                  label={item.label}
                  value={item.value}
                  maxValue={maxValue}
                />
              ))}
            </div>
          );
        })()}
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-gray-800 font-semibold mb-4">Recent Activity</h3>

        <ul className="space-y-2">
          {activity.map((a, i) => (
            <li key={i} className="text-gray-600 text-sm">
              {a.message}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DepartmentDashboard;
