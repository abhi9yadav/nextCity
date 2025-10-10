import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { getAuth } from "firebase/auth";
import { Edit, Trash2, UserPlus, ArrowLeft, Upload } from "lucide-react";

const ManageDeptAdminPage = () => {
  const { dept_id } = useParams();
  const navigate = useNavigate();

  const [deptAdmin, setDeptAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    photo: null,
  });
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("User not logged in");
        const idToken = await currentUser.getIdToken(true);

        try {
          const adminRes = await axios.get(
            `http://localhost:5000/api/v1/cityAdmin/${dept_id}`,
            { headers: { Authorization: `Bearer ${idToken}` } }
          );
          setDeptAdmin(adminRes.data.departmentAdmin);
        } catch {
          setDeptAdmin(null);
        }
      } catch (err) {
        console.error("Error fetching department/admin:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dept_id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, photo: file });
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const auth = getAuth();
      const idToken = await auth.currentUser.getIdToken(true);

      const form = new FormData();
      form.append("name", formData.name);
      form.append("email", formData.email);
      form.append("phone", formData.phone);
      if (formData.photo) form.append("photo", formData.photo);

      if (!deptAdmin) {
        await axios.post(
          `http://localhost:5000/api/v1/cityAdmin/${dept_id}/createDeptAdmin`,
          form,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        alert("Department Admin created successfully!");
      } else {
        await axios.patch(
          `http://localhost:5000/api/v1/cityAdmin/updateDeptAdmin/${deptAdmin.firebaseUid}`,
          form,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        alert("Department Admin updated successfully!");
      }

      window.location.reload();
    } catch (err) {
      console.error("Error creating/updating DeptAdmin:", err);
      alert("Operation failed!");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this Department Admin?")) return;
    try {
      const auth = getAuth();
      const idToken = await auth.currentUser.getIdToken(true);
      await axios.delete(
        `http://localhost:5000/api/v1/cityAdmin/deleteDeptAdmin/${deptAdmin.firebaseUid}`,
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      alert("Department Admin deleted successfully!");
      window.location.reload();
    } catch (err) {
      console.error("Error deleting DeptAdmin:", err);
      alert("Failed to delete Department Admin.");
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 text-lg">Loading...</div>;

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen transition-all">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg p-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-4">
          Manage Department Admin
        </h1>

        {/* Admin Info */}
        {deptAdmin && (
          <div className="flex flex-col items-center space-y-3">
            {deptAdmin.photoURL ? (
              <img
                src={deptAdmin.photoURL}
                alt="Admin"
                className="w-28 h-28 rounded-full object-cover shadow-lg border-2 border-blue-200"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-lg font-medium shadow-inner">
                No Photo
              </div>
            )}
            <h3 className="text-xl font-semibold text-gray-800">{deptAdmin.name}</h3>
            <p className="text-gray-600">{deptAdmin.email}</p>
            {deptAdmin.phone && <p className="text-gray-600">{deptAdmin.phone}</p>}

            <div className="flex gap-4 mt-4">
              <button
                onClick={() => {
                  setShowForm(true);
                  setFormData({
                    name: deptAdmin.name,
                    email: deptAdmin.email,
                    phone: deptAdmin.phone || "",
                    photo: null,
                  });
                }}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition transform hover:scale-105"
              >
                <Edit size={18} /> Update
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition transform hover:scale-105"
              >
                <Trash2 size={18} /> Delete
              </button>
            </div>
          </div>
        )}

        {/* Add Button */}
        {!deptAdmin && !showForm && (
          <div className="text-center">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition transform hover:scale-105 mx-auto"
            >
              <UserPlus size={20} /> Add Department Admin
            </button>
          </div>
        )}

        {/* Form with smooth slide-down */}
        <div
          className={`overflow-hidden transition-all duration-500 ${
            showForm ? "max-h-[1000px] opacity-100 mt-6" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-gray-50 rounded-2xl p-6 shadow-inner">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              {deptAdmin ? "Update Department Admin" : "Create Department Admin"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-400 outline-none transition"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-400 outline-none transition"
              />
              <input
                type="text"
                placeholder="Phone (optional)"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-400 outline-none transition"
              />

              {/* File Upload */}
              <div className="border border-dashed border-gray-300 p-4 rounded-xl text-center bg-white hover:bg-gray-50 transition">
                <label className="cursor-pointer flex flex-col items-center space-y-2">
                  <Upload size={24} className="text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {formData.photo ? formData.photo.name : "Click to upload photo"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover mx-auto mt-3 border shadow-sm"
                  />
                )}
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2 bg-gray-300 rounded-full hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition transform hover:scale-105"
                >
                  {deptAdmin ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageDeptAdminPage;
