import React, { useState } from "react";
import { useParams } from "react-router-dom";
import ManageDeptAdminPage from "./ManageDepartmentAdmins";
import CityDepartmentComplaints from "./CityDepartmentComplaints";
import ManageZones from "../zones/ManageZones";

const ManageZonesIcon = () => (
  <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25M3 12h18" />
  </svg>
);
const ManageAdminsIcon = () => (
  <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372A9.337 9.337 0 0021.746 18.5a4.125 4.125 0 00-7.533-2.493M15 19.128v.106A12.318 12.318 0 018.624 21C6.293 21 4.112 20.355 2.25 19.234a6.375 6.375 0 0111.964-4.663v0" />
  </svg>
);
const ViewComplaintsIcon = () => (
  <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
  </svg>
);

const StatCard = ({ title, value, color }) => {
  const colorMap = {
    orange: "bg-orange-500",
    blue: "bg-blue-500",
    gray: "bg-gray-500",
  };
  return (
    <div
      className={`${colorMap[color]} text-white p-5 rounded-xl shadow-lg transform transition hover:-translate-y-1`}
    >
      <p className="text-3xl sm:text-4xl font-bold">{value}</p>
      <p className="text-xs sm:text-sm uppercase mt-1">{title}</p>
    </div>
  );
};

const ComplaintsChart = () => (
  <div className="bg-slate-700 p-5 rounded-xl shadow-lg flex flex-col justify-between">
    <h3 className="text-lg font-bold text-white mb-2">Complaints by Status</h3>
    <div className="flex justify-around items-end h-32">
      <div className="text-center">
        <div className="w-8 h-14 bg-gray-400 rounded-t"></div>
        <p className="text-xs text-gray-300 mt-1">New</p>
      </div>
      <div className="text-center">
        <div className="w-8 h-24 bg-orange-500 rounded-t"></div>
        <p className="text-xs text-gray-300 mt-1">In Progress</p>
      </div>
      <div className="text-center">
        <div className="w-8 h-20 bg-blue-500 rounded-t"></div>
        <p className="text-xs text-gray-300 mt-1">Resolved</p>
      </div>
    </div>
  </div>
);

const DepartmentDashboard = () => {
  const { dept_id } = useParams();
  const [activeSection, setActiveSection] = useState(null);
  const departmentName = "Fire Department";

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-800 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Welcome to the {departmentName} Dashboard!
        </h1>
        <div className="mt-4 sm:mt-0 p-3 bg-red-900/50 rounded-lg">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M12 3l4.5 4.5M12 3L7.5 7.5M12 21l4.5-4.5M12 21L7.5 16.5M2.25 12h19.5" />
          </svg>
        </div>
      </div>

      {/* Stats Section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">
          Department Statistics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Active Complaints" value="12" color="orange" />
          <StatCard title="Resolved This Month" value="85" color="blue" />
          <StatCard title="Zones Managed" value="5" color="gray" />
        </div>
      </section>

      {/* Action Buttons */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveSection("zones")}
            className={`flex items-center justify-center p-4 rounded-lg font-semibold transition-colors ${
              activeSection === "zones" ? "bg-cyan-600" : "bg-slate-700 hover:bg-slate-600"
            } text-white`}
          >
            <ManageZonesIcon /> Manage Zones
          </button>
          <button
            onClick={() => setActiveSection("admins")}
            className={`flex items-center justify-center p-4 rounded-lg font-semibold transition-colors ${
              activeSection === "admins" ? "bg-cyan-600" : "bg-slate-700 hover:bg-slate-600"
            } text-white`}
          >
            <ManageAdminsIcon /> Manage Department Admins
          </button>
          <button
            onClick={() => setActiveSection("complaints")}
            className={`flex items-center justify-center p-4 rounded-lg font-semibold transition-colors ${
              activeSection === "complaints" ? "bg-cyan-600" : "bg-blue-600 hover:bg-blue-500"
            } text-white`}
          >
            <ViewComplaintsIcon /> View Complaints
          </button>
        </div>
      </section>

      {/* Dynamic Section */}
      <div className="transition-all">
        {activeSection === "zones" && <ManageZones />}
        {activeSection === "admins" && <ManageDeptAdminPage />}
        {activeSection === "complaints" && <CityDepartmentComplaints />}
      </div>

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 space-y-6">
          <ComplaintsChart />
        </div>
        <div className="bg-slate-700 p-5 rounded-xl shadow-lg">
          <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
          <ul className="space-y-3">
            <li className="text-sm text-slate-300 border-b border-slate-600 pb-2">
              New complaint filed in Zone A.
            </li>
            <li className="text-sm text-slate-300 border-b border-slate-600 pb-2">
              Admin <span className="font-semibold text-slate-100">John Doe</span> updated a zone.
            </li>
            <li className="text-sm text-slate-300">
              Complaint #1024 has been{" "}
              <span className="font-semibold text-green-400">resolved</span>.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DepartmentDashboard;
