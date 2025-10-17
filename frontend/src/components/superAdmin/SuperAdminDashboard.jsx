import React, { useState, useEffect } from "react";
import Modal from "./SuperAdminModals/CreateCityAdminModal";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import axios from "axios";
import CreateDepartmentModal from "./SuperAdminModals/CreateDepartmentModal";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ cities: 0, departments: 0, admins: 0 });
  const [cities, setCities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [admins, setAdmins] = useState([]);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "city_admin",
    city_id: "",
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("cities");
  const [isModalOpen, setIsModalOpen] = useState({ type: null, isOpen: false });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        const token = user ? await user.getIdToken() : null;

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const [citiesRes, deptsRes, adminsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/v1/superAdmin/cities", config),
          axios.get(
            "http://localhost:5000/api/v1/superAdmin/departments",
            config
          ),
          axios.get(
            "http://localhost:5000/api/v1/superAdmin/cityAdmins",
            config
          ),
        ]);

        const citiesData = citiesRes.data.cities || citiesRes.data;
        const deptsData = deptsRes.data.departments || deptsRes.data;
        const adminsData = adminsRes.data.admins || adminsRes.data;

        setCities(citiesData);
        setDepartments(deptsData);
        setAdmins(adminsData);

        setStats({
          cities: citiesRes.data.total || citiesData.length,
          departments: deptsRes.data.total || deptsData.length,
          admins: adminsRes.data.total || adminsData.length,
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openModal = (type) => setIsModalOpen({ type, isOpen: true });
  const closeModal = () => setIsModalOpen({ type: null, isOpen: false });

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.city_id) {
      return alert("All fields are required.");
    }
    alert(`User "${newUser.name}" created!`);
    setNewUser({ name: "", email: "", role: "city_admin", city_id: "" });
    closeModal();
  };

  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="text-center p-10">Loading Super Admin Dashboard...</div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className=" mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Super Admin Dashboard
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <h2 className="text-gray-500 text-sm">Total Cities</h2>
            <p className="text-3xl font-bold">{stats.cities}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <h2 className="text-gray-500 text-sm">Total City Admins</h2>
            <p className="text-3xl font-bold">{stats.admins}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <h2 className="text-gray-500 text-sm">Total Departments</h2>
            <p className="text-3xl font-bold">{stats.departments}</p>
          </div>
        </div>

        {/* Tabs and Action Buttons */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            {/* Tabs */}
            <div className="border-b sm:border-b-0 border-gray-200">
              <nav className="-mb-px flex space-x-6">
                <button
                  onClick={() => setActiveTab("cities")}
                  className={`py-2 px-1 font-semibold ${
                    activeTab === "cities"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-blue-500"
                  }`}
                >
                  Cities
                </button>
                <button
                  onClick={() => setActiveTab("admins")}
                  className={`py-2 px-1 font-semibold ${
                    activeTab === "admins"
                      ? "border-b-2 border-purple-500 text-purple-600"
                      : "text-gray-500 hover:text-purple-500"
                  }`}
                >
                  City Admins
                </button>
                <button
                  onClick={() => setActiveTab("departments")}
                  className={`py-2 px-1 font-semibold ${
                    activeTab === "departments"
                      ? "border-b-2 border-green-500 text-green-600"
                      : "text-gray-500 hover:text-green-500"
                  }`}
                >
                  Departments
                </button>
              </nav>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4 sm:mt-0">
              <button
                onClick={() => openModal("dept")}
                className="bg-green-600 text-white font-bold py-2 px-3 rounded-lg text-sm hover:bg-green-700"
              >
                + Create Dept
              </button>
              {/* <button
                onClick={() => openModal("admin")}
                className="bg-purple-600 text-white font-bold py-2 px-3 rounded-lg text-sm hover:bg-purple-700"
              >
                + Create Admin
              </button> */}
              <button
                onClick={() => navigate("/super-admin/create-city")}
                className="bg-blue-600 text-white font-bold py-2 px-3 rounded-lg text-sm hover:bg-blue-700"
              >
                + Create City
              </button>
            </div>
          </div>
        </div>

        {/* Content based on Active Tab */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          {activeTab === "admins" && (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">City</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin._id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{admin.name}</td>
                    <td className="p-2">{admin.email}</td>
                    <td className="p-2">{admin.city_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {activeTab === "cities" && (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="p-2">City Name</th>
                  <th className="p-2">State</th>
                  <th className="p-2">Country</th>
                </tr>
              </thead>
              <tbody>
                {cities.map((city) => (
                  <tr key={city._id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{city.city_name}</td>
                    <td className="p-2">{city.state}</td>
                    <td className="p-2">{city.country}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {activeTab === "departments" && (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="p-2">Department Name</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => (
                  <tr key={dept._id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{dept.department_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modals for Creating New Items */}
        <Modal
          isOpen={isModalOpen.type === "admin"}
          onClose={closeModal}
          title="Create New City Admin"
        >
          <form onSubmit={handleCreateUser} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={newUser.name}
              onChange={handleUserFormChange}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={newUser.email}
              onChange={handleUserFormChange}
              className="w-full p-2 border rounded"
              required
            />
            <select
              name="city_id"
              value={newUser.city_id}
              onChange={handleUserFormChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select City</option>
              {cities.map((city) => (
                <option key={city._id} value={city._id}>
                  {city.city_name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700"
            >
              Create Admin
            </button>
          </form>
        </Modal>

        <CreateDepartmentModal
          isOpen={isModalOpen.type === "dept"}
          onClose={closeModal}
          onCreate={(newDept) => setDepartments((prev) => [...prev, newDept])}
        />
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
