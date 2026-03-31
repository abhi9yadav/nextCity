import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MapPicker from "../../map/MapPicker";
import { getAuth } from "firebase/auth";
import { useTheme } from "../../hooks/useTheme"; // 1. Import useTheme

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const CreateComplaint = () => {
  const navigate = useNavigate();
  const { theme } = useTheme(); // 2. Get the theme object
  const [showMap, setShowMap] = useState(false);
  const [fileState, setFileState] = useState([]);
  const [aiProcessing, setAiProcessing] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    concernedDepartment: "",
    location: { lat: 0, lng: 0, address: "" },
  });

  // ... (rest of your component logic remains the same)
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["lat", "lng", "address"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        location: { ...prev.location, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAIAnalysis = async () => {
    if (fileState.length === 0) return;
    setAiProcessing(true);

    try {
      const aiForm = new FormData();
      aiForm.append("file", fileState[0]);

      const res = await axios.post(
        `${API_BASE}/ai/gemini-analyze`,
        aiForm,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const { title, description, department } = res.data;

      setFormData((prev) => ({
        ...prev,
        title: title || prev.title,
        description: description || prev.description,
        concernedDepartment: department || prev.concernedDepartment,
      }));
    } catch (err) {
      console.error("AI analysis failed:", err.response?.data || err);
      alert("Failed to analyze complaint with Gemini AI.");
    } finally {
      setAiProcessing(false);
    }
  };


 
  const handleSubmit = async (e) => {
    e.preventDefault();

    const uploadData = new FormData();
    uploadData.append("title", formData.title);
    uploadData.append("description", formData.description);
    uploadData.append("concernedDepartment", formData.concernedDepartment);
    uploadData.append(
      "location",
      JSON.stringify({
        type: "Point",
        coordinates: [formData.location.lng, formData.location.lat],
        address: formData.location.address,
      })
    );

    fileState.forEach((file) => uploadData.append("attachments", file));

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return alert("You must be logged in.");

      const token = await user.getIdToken();

      const res = await axios.post(
        `${API_BASE}/complaints`,
        uploadData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Complaint submitted successfully!");
      navigate("/citizen");
    } catch (error) {
      console.error(error);
      alert("Failed to submit complaint.");
    }
  };



  return (
    // 3. Themed main container
    <div className={`max-w-3xl mx-auto p-6 rounded-lg mt-10 ${theme.cardBg} ${theme.cardBorder} ${theme.cardShadow}`}>
      <h2 className={`text-2xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r ${theme.headingGradientFrom} ${theme.headingGradientTo}`}>
        Create Complaint
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Helper function for input class names */}
        {(() => {
          const inputClasses = `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-transparent ${theme.cardBorder} ${theme.textDefault} focus:${theme.navActiveBorder}`;

          return (
            <>
              {/* Concerned Department */}
              <div>
                <label className={`block mb-1 font-semibold ${theme.textSubtle}`}>Concerned Department</label>
                <select name="concernedDepartment" value={formData.concernedDepartment} onChange={handleChange} className={inputClasses} required>
                  <option value="" disabled hidden>-- Select Department --</option>
                  <option>Department of Power Supply</option>
                  <option>Department of Water Management</option>
                  <option>Department of Roads and Infrastructure</option>
                  <option>Department of Sanitation and Waste Management</option>
                  <option>Department of Drainage and Sewage</option>
                  <option>Department of Parks and Green Spaces</option>
                  <option>Department of Public Health</option>
                  <option>Department of General Services</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className={`block mb-1 font-semibold ${theme.textSubtle}`}>Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Enter complaint title" required className={inputClasses}/>
              </div>

              {/* Description */}
              <div>
                <label className={`block mb-1 font-semibold ${theme.textSubtle}`}>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe your complaint" rows={4} required className={inputClasses}/>
              </div>
            </>
          );
        })()}

        {/* Location */}
        <div>
          <label className={`block mb-1 font-semibold ${theme.textSubtle}`}>Location</label>
          <button type="button" onClick={() => setShowMap(true)} className={`px-4 py-2 rounded-lg font-semibold mb-2 ${theme.buttonSecondaryText} bg-gradient-to-r ${theme.buttonSecondaryBgFrom} ${theme.buttonSecondaryBgTo} ${theme.buttonSecondaryHoverBgFrom} ${theme.buttonSecondaryHoverBgTo}`}>
            Select Location on Map
          </button>
          {formData.location.address && (
            <p className={theme.textCardDescription}>
              Selected: {formData.location.address} (Lat: {formData.location.lat}, Lng: {formData.location.lng})
            </p>
          )}
        </div>

        {showMap && (
          <MapPicker onSelect={(loc) => { setFormData((prev) => ({ ...prev, location: loc })); setShowMap(false); }} onCancel={() => setShowMap(false)}/>
        )}

        {/* Attachments */}
        <div>
          <label className={`block mb-2 font-semibold ${theme.textSubtle}`}>Attachments</label>
          <label className={`border-2 border-dashed p-6 block text-center cursor-pointer transition-colors ${theme.cardBorder} hover:${theme.navActiveBorder} hover:${theme.sectionBgTranslucent}`}>
            <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={(e) => setFileState(Array.from(e.target.files))}/>
            <p className={theme.textSubtle}>Click or drag files to upload</p>
          </label>

          {fileState.length > 0 && (
            <>
              <div className="flex flex-wrap gap-2 mt-3">
                {fileState.map((file, idx) => (
                  <div key={idx} className={`w-20 h-20 border rounded overflow-hidden ${theme.cardBorder}`}>
                    {file.type.startsWith("image") ? (
                      <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <video src={URL.createObjectURL(file)} className="w-full h-full object-cover" controls />
                    )}
                  </div>
                ))}
              </div>

              {/* Gemini AI Analyze Button */}
              <button type="button" onClick={handleAIAnalysis} disabled={aiProcessing} className={`mt-3 px-4 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${theme.buttonSecondaryText} bg-gradient-to-r ${theme.buttonSecondaryBgFrom} ${theme.buttonSecondaryBgTo} ${theme.buttonSecondaryHoverBgFrom} ${theme.buttonSecondaryHoverBgTo}`}>
                {aiProcessing ? "Analyzing..." : "Analyze with Gemini AI"}
              </button>
            </>
          )}
        </div>

        {/* Submit */}
        <div className="text-center mt-6">
          <button type="submit" className={`px-6 py-2 rounded-lg font-semibold ${theme.buttonPrimaryText} bg-gradient-to-r ${theme.buttonPrimaryBgFrom} ${theme.buttonPrimaryBgTo} ${theme.buttonPrimaryHoverBgFrom} ${theme.buttonPrimaryHoverBgTo}`}>
            Submit Complaint
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateComplaint;