import React, { useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MapPicker from "../../map/MapPicker";
import { getAuth } from "firebase/auth";
import { useTheme } from "../../hooks/useTheme";
import ImageLightbox from "../citizenDashboard/ImageLightbox";
import CustomToast from "../citizenDashboard/CustomToast";
import { Loader2, UploadCloud, Trash2 } from "lucide-react"; // Icons for better UX

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const CreateComplaint = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  // States
  const [showMap, setShowMap] = useState(false);
  const [fileState, setFileState] = useState([]);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevents duplicate submissions
  const [previewImage, setPreviewImage] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    concernedDepartment: "",
    location: { lat: 0, lng: 0, address: "" },
  });

  // Derived State for Validation (Industry Practice)
  const isFormInvalid = useMemo(() => {
    return (
      !formData.title ||
      !formData.description ||
      !formData.concernedDepartment ||
      !formData.location.address ||
      fileState.length === 0 // 🚀 Photo upload is mandatory
    );
  }, [formData, fileState]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFileState((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFileState((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAIAnalysis = async () => {
    if (fileState.length === 0) return showToast("Upload an image first!", "error");
    setAiProcessing(true);

    try {
      const aiForm = new FormData();
      aiForm.append("file", fileState[0]);
      const res = await axios.post(`${API_BASE}/ai/gemini-analyze`, aiForm);
      
      const { title, description, department } = res.data;
      setFormData((prev) => ({
        ...prev,
        title: title || prev.title,
        description: description || prev.description,
        concernedDepartment: department || prev.concernedDepartment,
      }));
      showToast("AI analysis complete!");
    } catch (err) {
      showToast("AI Analysis failed", "error");
    } finally {
      setAiProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isFormInvalid || isSubmitting) return;

    setIsSubmitting(true); // 🚀 Lock the button immediately

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("Authentication required");

      const token = await user.getIdToken();
      const uploadData = new FormData();
      
      uploadData.append("title", formData.title);
      uploadData.append("description", formData.description);
      uploadData.append("concernedDepartment", formData.concernedDepartment);
      uploadData.append("location", JSON.stringify({
        type: "Point",
        coordinates: [formData.location.lng, formData.location.lat],
        address: formData.location.address,
      }));

      fileState.forEach((file) => uploadData.append("attachments", file));

      await axios.post(`${API_BASE}/complaints`, uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      showToast("Complaint registered successfully!");
      setTimeout(() => navigate("/citizen"), 1500);
    } catch (error) {
      showToast(error.message || "Submission failed", "error");
      setIsSubmitting(false); // 🚀 Unlock on error so user can retry
    }
  };

  const inputClasses = `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-transparent transition-all ${theme.cardBorder} ${theme.textDefault} focus:ring-blue-500/50`;

  return (
    <div className={`max-w-3xl mx-auto p-8 rounded-2xl mt-10 mb-10 border ${theme.cardBg} ${theme.cardBorder} ${theme.cardShadow}`}>
      <h2 className={`text-3xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r ${theme.headingGradientFrom} ${theme.headingGradientTo}`}>
        Report an Issue
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Department Selection */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className={`block mb-2 font-bold text-sm ${theme.textSubtle}`}>Department</label>
            <select name="concernedDepartment" value={formData.concernedDepartment} onChange={handleChange} className={inputClasses} required>
              <option value="" className="bg-slate-900">-- Select --</option>
              <option value="Electricity">Department of Power Supply</option>
              <option value="Water">Department of Water Management</option>
              <option value="Roads">Department of Roads and Infrastructure</option>
              <option value="Sanitation">Department of Sanitation</option>
            </select>
          </div>

          <div>
            <label className={`block mb-2 font-bold text-sm ${theme.textSubtle}`}>Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="What is the issue?" required className={inputClasses} />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className={`block mb-2 font-bold text-sm ${theme.textSubtle}`}>Detailed Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe the problem in detail..." rows={4} required className={inputClasses} />
        </div>

        {/* Location Picker */}
        <div className={`p-4 rounded-xl border-2 border-dashed ${theme.cardBorder} bg-black/5`}>
          <div className="flex justify-between items-center mb-2">
            <label className={`font-bold text-sm ${theme.textSubtle}`}>Incident Location</label>
            <button type="button" onClick={() => setShowMap(true)} className={`text-sm font-bold underline ${theme.primaryAccentText}`}>
              Open Map
            </button>
          </div>
          {formData.location.address ? (
            <p className={`text-xs p-2 rounded bg-blue-500/10 ${theme.textDefault}`}>📍 {formData.location.address}</p>
          ) : (
            <p className="text-xs text-red-400 italic">No location selected yet.</p>
          )}
        </div>

        {showMap && (
          <MapPicker onSelect={(loc) => { setFormData(p => ({ ...p, location: loc })); setShowMap(false); }} onCancel={() => setShowMap(false)} />
        )}

        {/* File Upload Section */}
        <div>
          <label className={`block mb-2 font-bold text-sm ${theme.textSubtle}`}>
            Proof / Attachments <span className="text-red-500">*</span>
          </label>
          <div className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${fileState.length > 0 ? 'border-green-500/50 bg-green-500/5' : `${theme.cardBorder} hover:bg-white/5`}`}>
            <input type="file" accept="image/*,video/*" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
            <UploadCloud className={`mx-auto mb-2 ${theme.textSubtle}`} size={32} />
            <p className={`text-sm ${theme.textSubtle}`}>Click to upload images or videos</p>
            <p className="text-[10px] opacity-50 uppercase mt-1 tracking-widest text-white">Required to submit</p>
          </div>

          {fileState.length > 0 && (
            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap gap-3">
                {fileState.map((file, idx) => (
                  <div key={idx} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-white/20">
                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="Preview" />
                    <button type="button" onClick={() => removeFile(idx)} className="absolute top-1 right-1 p-1 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={12} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={handleAIAnalysis} disabled={aiProcessing} className="flex items-center gap-2 text-xs font-bold py-2 px-4 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50">
                {aiProcessing ? <Loader2 size={14} className="animate-spin" /> : "✨ Smart Autofill with AI"}
              </button>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={isFormInvalid || isSubmitting} 
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex justify-center items-center gap-3 ${
            isFormInvalid || isSubmitting 
            ? "bg-gray-600 cursor-not-allowed opacity-50" 
            : `bg-gradient-to-r ${theme.buttonPrimaryBgFrom} ${theme.buttonPrimaryBgTo} hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-blue-500/20`
          } ${theme.buttonPrimaryText}`}
        >
          {isSubmitting ? (
            <><Loader2 className="animate-spin" /> Processing...</>
          ) : (
            "Submit Complaint"
          )}
        </button>

        {/* Overlays */}
        {previewImage && <ImageLightbox url={previewImage} onClose={() => setPreviewImage(null)} />}
        {toast.show && <CustomToast message={toast.message} type={toast.type} />}
      </form>
    </div>
  );
};

export default CreateComplaint;