import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/authContext/index";
import toast, { Toaster } from "react-hot-toast";
import { useTheme } from "../../hooks/useTheme"; // 1. Import useTheme


const Profile = () => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { currentUser, token } = useAuth();
  const { theme } = useTheme(); // 2. Get the theme object
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [newProfileImageFile, setNewProfileImageFile] = useState(null);
  const fileInputRef = useRef(null);

  

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
    } catch (err) {
      console.error("Error updating profile:", err.response?.data || err);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      toast.dismiss();
    }
  }

  const handleChangePassword = () => {
    toast("Redirecting to change password flow...", { icon: "🔒" });
  };


  return (
    // 3. Removed bg-gray-50 to inherit from layout
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 flex justify-center">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="w-full max-w-3xl">
        {/* 4. Themed page title */}
        <h1 className={`text-2xl sm:text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r ${theme.headingGradientFrom} ${theme.headingGradientTo}`}>
          My Profile
        </h1>

        <form
          onSubmit={handleSubmit}
          // 5. Themed main card container
          className={`rounded-lg overflow-hidden ${theme.cardBg} ${theme.cardBorder} ${theme.cardShadow}`}
        >
          {/* Profile Header */}
          <div className={`flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 border-b ${theme.footerBorder}`}>
            <div className="relative">
              <img
                src={profileImagePreview || currentUser?.photoURL}
                alt="Profile"
                // 6. Themed profile image border
                className={`w-28 h-28 rounded-full object-cover border-4 ${theme.imageBorder} ${theme.imageShadow}`}
              />
              {isEditing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  // 7. Themed "change image" button
                  className={`absolute bottom-0 right-0 rounded-full p-2 transition-colors ${theme.buttonPrimaryText} bg-gradient-to-r ${theme.buttonPrimaryBgFrom} ${theme.buttonPrimaryBgTo} ${theme.buttonPrimaryHoverBgFrom} ${theme.buttonPrimaryHoverBgTo}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </button>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange}/>
            </div>
            <div className="text-center sm:text-left flex-1">
              {/* 8. Themed text */}
              <h2 className={`text-xl font-bold ${theme.textDefault}`}>{formData.name}</h2>
              <p className={theme.textSubtle}>{formData.email}</p>
              <p className={theme.textSubtle}>{formData.phone}</p>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {["name", "email", "phone"].map((field) => (
              <div key={field}>
                <label className={`block text-sm font-semibold mb-1 ${theme.textSubtle}`}>
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                {isEditing ? (
                  <input
                    type={field === "email" ? "email" : "text"}
                    name={field}
                    value={formData[field] || ""}
                    onChange={handleChange}
                    // 9. Themed input fields
                    className={`w-full p-2 border rounded-md focus:ring-2 bg-transparent ${theme.cardBorder} ${theme.textDefault} focus:${theme.navActiveBorder}`}
                  />
                ) : (
                  <p className={theme.textDefault}>{formData[field]}</p>
                )}
              </div>
            ))}
          </div>
          
          {/* Change Password */}
          <div className={`p-6 border-t ${theme.footerBorder}`}>
              <button type="button" onClick={handleChangePassword} className={`${theme.primaryAccentText} hover:underline font-semibold`}>
                  Change Password
              </button>
          </div>

          {/* Action Buttons */}
          <div className={`p-6 flex justify-end gap-4 ${theme.sectionBgTranslucent}`}>
            {isEditing ? (
              <>
                {/* 10. Themed secondary button */}
                <button type="button" onClick={handleEditToggle} className={`px-4 py-2 rounded-lg font-semibold ${theme.buttonSecondaryText} bg-gradient-to-r ${theme.buttonSecondaryBgFrom} ${theme.buttonSecondaryBgTo} ${theme.buttonSecondaryHoverBgFrom} ${theme.buttonSecondaryHoverBgTo}`}>
                  Cancel
                </button>
                {/* 11. Themed primary button */}
                <button type="submit" className={`px-4 py-2 rounded-lg font-semibold ${theme.buttonPrimaryText} bg-gradient-to-r ${theme.buttonPrimaryBgFrom} ${theme.buttonPrimaryBgTo} ${theme.buttonPrimaryHoverBgFrom} ${theme.buttonPrimaryHoverBgTo}`}>
                  Save
                </button>
              </>
            ) : (
              <button type="button" onClick={handleEditToggle} className={`px-4 py-2 rounded-lg font-semibold ${theme.buttonPrimaryText} bg-gradient-to-r ${theme.buttonPrimaryBgFrom} ${theme.buttonPrimaryBgTo} ${theme.buttonPrimaryHoverBgFrom} ${theme.buttonPrimaryHoverBgTo}`}>
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