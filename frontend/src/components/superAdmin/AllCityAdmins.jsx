import React, { useEffect, useState } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { getAuth } from "firebase/auth";
import axios from "axios";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import CreateCityAdminModal from "./SuperAdminModals/CreateCityAdminModal";

const AllCityAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return setLoading(false);

        const token = await user.getIdToken(true);
        const res = await axios.get(
          "http://localhost:5000/api/v1/superAdmin/cityAdmins",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setAdmins(res.data.admins);
        console.log("All admins:", res.data.admins);
      } catch (error) {
        console.error("Error fetching city admins:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleDelete = async (firebaseUid) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken(true);

      await axios.delete(
        `http://localhost:5000/api/v1/superAdmin/users/${firebaseUid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAdmins((prev) =>
        prev.filter((admin) => admin.firebaseUid !== firebaseUid)
      );
      alert("Admin deleted successfully!");
    } catch (error) {
      console.error("Error deleting admin:", error);
      alert("Failed to delete admin.");
    }
  };

  const handleUpdate = (admin) => {
    if (!admin.firebaseUid) {
      console.error("firebaseUid missing for admin:", admin);
      alert("Cannot update this admin. Missing Firebase UID.");
      return;
    }

    setSelectedAdmin({
      ...admin,
      firebaseUid: admin.firebaseUid,
    });
    setPhotoPreview(admin.photoURL || null);
    setPhoto(null);
    setShowModal(true);
  };

  const handleSaveUpdate = async () => {
    if (!selectedAdmin || !selectedAdmin.firebaseUid) {
      alert("Invalid admin data. Cannot update.");
      return;
    }

    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken(true);

      const formData = new FormData();
      formData.append("name", selectedAdmin.name);
      formData.append("email", selectedAdmin.email);
      formData.append("phone", selectedAdmin.phone || "");
      if (photo) formData.append("photo", photo);

      const res = await axios.patch(
        `http://localhost:5000/api/v1/superAdmin/users/${selectedAdmin.firebaseUid}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setAdmins((prev) =>
        prev.map((admin) =>
          admin.firebaseUid === selectedAdmin.firebaseUid
            ? {
                ...admin,
                ...selectedAdmin,
                photoURL: photoPreview || admin.photoURL,
              }
            : admin
        )
      );

      setShowModal(false);
      alert("Admin updated successfully!");
    } catch (error) {
      console.error("Error updating admin:", error.response || error);
      alert("Failed to update admin. Check console for details.");
    }
  };

  const filteredAdmins = admins.filter((admin) => {
    const term = debouncedTerm.toLowerCase();
    const matchesSearch =
      admin.name.toLowerCase().includes(term) ||
      admin.email.toLowerCase().includes(term) ||
      (admin.city_id?.city_name || "").toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === ""
        ? true
        : statusFilter === "active"
        ? admin.isActive
        : !admin.isActive;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="text-center p-6">Loading City Admins...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-8">
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
        <h1 className="text-2xl font-bold">All City Admins</h1>

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
            className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-md">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-200 sticky top-0 z-10">
            <tr>
              <th className="p-4 text-sm font-medium">Name</th>
              <th className="p-4 text-sm font-medium">Email</th>
              <th className="p-4 text-sm font-medium">City</th>
              <th className="p-4 text-sm font-medium">Status</th>
              <th className="p-4 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdmins.length > 0 ? (
              filteredAdmins.map((admin) => (
                <tr
                  key={admin._id}
                  className="border-b hover:bg-gray-50 transition-all duration-150"
                >
                  <td className="p-4">{admin.name}</td>
                  <td className="p-4">{admin.email}</td>
                  <td className="p-4">{admin.city_id?.city_name || "N/A"}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        admin.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {admin.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 flex gap-3">
                    <button
                      onClick={() => handleUpdate(admin)}
                      className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow-md transition"
                      data-tooltip-id={`update-${admin._id}`}
                      data-tooltip-content="Update Admin"
                    >
                      <FiEdit size={18} />
                    </button>
                    <Tooltip id={`update-${admin._id}`} place="top" />

                    <button
                      onClick={() => handleDelete(admin.firebaseUid)}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md transition"
                      data-tooltip-id={`delete-${admin._id}`}
                      data-tooltip-content="Delete Admin"
                    >
                      <FiTrash2 size={18} />
                    </button>
                    <Tooltip id={`delete-${admin._id}`} place="top" />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No admins found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Update Modal */}
      <CreateCityAdminModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Update City Admin for ${
          selectedAdmin?.city_id?.city_name || "City"
        }`}
      >
        {selectedAdmin && (
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={selectedAdmin.name}
              onChange={(e) =>
                setSelectedAdmin({ ...selectedAdmin, name: e.target.value })
              }
              placeholder="Full Name"
              className="p-3 border rounded-xl w-full focus:ring-2 focus:ring-purple-500 outline-none"
            />
            <input
              type="email"
              value={selectedAdmin.email}
              onChange={(e) =>
                setSelectedAdmin({ ...selectedAdmin, email: e.target.value })
              }
              placeholder="Email Address"
              className="p-3 border rounded-xl w-full focus:ring-2 focus:ring-purple-500 outline-none"
            />
            <input
              type="text"
              value={selectedAdmin.phone || ""}
              onChange={(e) =>
                setSelectedAdmin({ ...selectedAdmin, phone: e.target.value })
              }
              placeholder="Phone Number"
              className="p-3 border rounded-xl w-full focus:ring-2 focus:ring-purple-500 outline-none"
            />

            {/* Upload Photo Section */}
            <div className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:bg-gray-50">
              <label className="block cursor-pointer">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="mx-auto h-32 w-32 object-cover rounded-full mb-2"
                  />
                ) : (
                  <p className="text-gray-500">Click to upload photo</p>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setPhoto(file);
                      setPhotoPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>

            <button
              onClick={handleSaveUpdate}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:opacity-90 transition-all"
            >
              Update Admin
            </button>
          </div>
        )}
      </CreateCityAdminModal>
    </div>
  );
};

export default AllCityAdmins;
