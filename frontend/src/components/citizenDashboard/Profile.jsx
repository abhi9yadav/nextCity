import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/authContext/index";
import toast, { Toaster } from "react-hot-toast";

const Profile = () => {
  const { currentUser,token } = useAuth();
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [newProfileImageFile, setNewProfileImageFile] = useState(null);
  const fileInputRef = useRef(null);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        photoURL: currentUser.photoURL || "",
      });
      setProfileImagePreview(currentUser.photoURL);
    }
  }, [currentUser]);

  const handleEditToggle = () => {
    if (isEditing) {
      setFormData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        photoURL: currentUser.photoURL || "",
      });
      setProfileImagePreview(currentUser.photoURL);
      setNewProfileImageFile(null);
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    toast.loading("Updating profile...");

    try {
      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        payload.append(key, formData[key]);
      });
      if (newProfileImageFile) payload.append("photo", newProfileImageFile);
      
      const res = await axios.put(
        `${BASE_URL}/users/update`,
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFormData(res.data.user);
      setProfileImagePreview(res.data.user.photoURL);
      setIsEditing(false);
      toast.dismiss();
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Profile update failed:", err);
      toast.dismiss();
      toast.error("Failed to update profile.");
    }
  };

  const handleChangePassword = () => {
    toast("Redirecting to change password flow...", { icon: "🔒" });
    // i have to implement Firebase password reset or a modal here 
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 flex justify-center">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          My Profile
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
        >
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 border-b border-gray-200">
            <div className="relative">
              <img
                src={profileImagePreview || currentUser.photoURL}
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover border-4 border-gray-200"
              />
              {isEditing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-xl font-bold text-gray-800">{formData.name}</h2>
              <p className="text-gray-500">{formData.email}</p>
              <p className="text-gray-500">{formData.phone}</p>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {["name", "email", "phone"].map((field) => (
              <div key={field}>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                {isEditing ? (
                  <input
                    type={field === "email" ? "email" : "text"}
                    name={field}
                    value={formData[field] || ""}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-800">{formData[field]}</p>
                )}
              </div>
            ))}

            
          </div>

          {/* Change Password */}
          <div className="p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleChangePassword}
              className="text-blue-600 hover:underline font-semibold"
            >
              Change Password
            </button>
          </div>

          {/* Action Buttons */}
          <div className="p-6 bg-gray-50 flex justify-end gap-4">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleEditToggle}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleEditToggle}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
