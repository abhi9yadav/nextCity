import React, { useState } from "react";
import axios from "axios";
import { getAuth } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";

const CreateDepartmentModal = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleCreate = async () => {
    if (!name.trim()) return alert("Department name is required.");
    try {
      setLoading(true);
      const auth = getAuth();
      const idToken = await auth.currentUser.getIdToken(true);

      const formData = new FormData();
      formData.append("department_name", name);
      formData.append("description", description);
      if (image) formData.append("photo", image);

      const res = await axios.post(
        `${BASE_URL}/superAdmin/departments`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert(res.data.message || "Department created successfully!");
      onCreate(res.data.department);
      onClose();

      setName("");
      setDescription("");
      setImage(null);
      setPreview("");
    } catch (error) {
      console.error("Error creating department:", error);
      alert(
        error.response?.data?.message ||
          "Failed to create department. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative bg-gradient-to-br from-[#f8fafc] via-[#e2e8f0] to-[#f1f5f9] text-gray-900 rounded-3xl shadow-2xl w-[90%] max-w-lg p-8 border border-gray-200 overflow-hidden"
          >
            {/* Subtle glow border */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/10 to-purple-400/10 pointer-events-none rounded-3xl"></div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-full transition"
            >
              <IoClose size={20} />
            </button>

            {/* Header */}
            <h2 className="text-2xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
              Create New Department
            </h2>

            {/* Image Upload */}
            <div className="flex flex-col items-center mb-6">
              <label className="relative cursor-pointer group">
                <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-dashed border-gray-300 group-hover:border-blue-500 shadow-inner transition-all">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                      Upload
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">Click to upload photo</p>
            </div>

            {/* Inputs */}
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="deptName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Department Name
                </label>
                <input
                  type="text"
                  id="deptName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter department name"
                />
              </div>

              <div>
                <label
                  htmlFor="deptDesc"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="deptDesc"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                  placeholder="Enter description"
                ></textarea>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-blue-500/25 transition disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateDepartmentModal;
