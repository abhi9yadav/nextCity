import React, { useState, useEffect } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { X, Pencil } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

// Sub-components
import ViewModeContent from "./ViewModeContent";
import EditModeContent from "./EditModeContent";
import ConfirmationOverlay from "./ConfirmationOverlay";
import ImageLightbox from "./ImageLightbox";
import CustomToast from "./CustomToast";

const ComplaintModal = ({ complaint, token, onClose, onUpdate, onDelete }) => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { theme } = useTheme();
  
  const [mode, setMode] = useState("view");
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showConfirm, setShowConfirm] = useState({ show: false, type: "" }); // 'delete' or 'reopen'
  
  const [loading, setLoading] = useState({ save: false, action: false });
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const [form, setForm] = useState({
    title: complaint.title || "",
    description: complaint.description || "",
    location: complaint.location || { type: "Point", coordinates: [0, 0], address: "" },
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const handleAction = async (actionType) => {
    setLoading(prev => ({ ...prev, action: true }));
    try {
      if (actionType === "delete") {
        await axios.delete(`${BASE_URL}/complaints/${complaint._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast("Deleted successfully!");
        setTimeout(() => { onDelete(complaint._id); onClose(); }, 1500);
      } else {
        const res = await axios.patch(`${BASE_URL}/complaints/${complaint._id}`, 
          { status: "REOPEN" }, { headers: { Authorization: `Bearer ${token}` } }
        );
        onUpdate(res.data);
        showToast("Reopened successfully!");
        setShowConfirm({ show: false, type: "" });
      }
    } catch (err) {
      showToast("Operation failed", "error");
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleSave = async () => {
    setLoading(prev => ({ ...prev, save: true }));
    try {
      const res = await axios.patch(`${BASE_URL}/complaints/${complaint._id}`, form, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdate(res.data);
      showToast("Updated successfully!");
      setMode("view");
    } catch (err) {
      setError("Failed to save.");
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative`}>
          
          <header className={`flex justify-between items-center p-5 border-b ${theme.cardBorder}`}>
            <div>
              <h2 className={`text-xl font-bold ${theme.textDefault}`}>{complaint.title}</h2>
              <p className={`text-xs ${theme.textSubtle}`}>ID: {complaint._id.slice(-6).toUpperCase()}</p>
            </div>
            <div className="flex items-center gap-3">
              {mode === "view" && complaint.status !== "RESOLVED" && (
                <button onClick={() => setMode("edit")} className={`p-2 cursor-pointer rounded-full hover:bg-white/10 ${theme.primaryAccentText}`}><Pencil size={18} /></button>
              )}
              <button onClick={onClose} className={`p-2 cursor-pointer rounded-full hover:bg-white/10 ${theme.textSubtle}`}><X size={20} /></button>
            </div>
          </header>

          <div className="p-6 grid md:grid-cols-2 gap-8 overflow-y-auto">
            <div className="space-y-6">
              <img 
                src={complaint.attachments?.[0]?.url || "/no-image.png"} 
                className="w-full rounded-lg cursor-pointer object-cover aspect-video"
                onClick={() => complaint.attachments?.[0]?.url && setPreviewImage(complaint.attachments[0].url)}
              />
              {/* Map Logic here */}
            </div>
            <div className="space-y-6">
              {mode === "view" ? <ViewModeContent complaint={complaint} theme={theme} /> : <EditModeContent form={form} setForm={setForm} theme={theme} />}
            </div>
          </div>

          <footer className={`p-4 flex justify-end gap-3 border-t ${theme.cardBorder} bg-black/20`}>
            {mode === "edit" ? (
              <button onClick={handleSave} className="px-5 cursor-pointer py-2 bg-blue-600 text-white rounded-md">{loading.save ? "Saving..." : "Save Changes"}</button>
            ) : (
              <button onClick={() => setShowConfirm({ show: true, type: "delete" })} className="px-4 py-2 bg-red-600 cursor-pointer text-white rounded-md">Delete</button>
            )}
          </footer>
        </motion.div>

        {/* Overlays */}
        {showConfirm.show && <ConfirmationOverlay type={showConfirm.type} onConfirm={() => handleAction(showConfirm.type)} onCancel={() => setShowConfirm({ show: false, type: "" })} loading={loading.action} theme={theme} />}
        {previewImage && <ImageLightbox url={previewImage} onClose={() => setPreviewImage(null)} />}
        {toast.show && <CustomToast message={toast.message} type={toast.type} />}
      </motion.div>
    </AnimatePresence>
  );
};

export default ComplaintModal;