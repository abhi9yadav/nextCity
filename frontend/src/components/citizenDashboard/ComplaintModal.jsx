import React, { useState } from "react";
import { X, Pencil, Trash, MapPin, Loader2, AlertTriangle } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import MapPicker from "./MapPicker";

// -------- Small reusable blocks --------
const InfoBlock = ({ label, children }) => (
  <div>
    <label className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
      {label}
    </label>
    <div className="text-base text-slate-200 mt-1">{children}</div>
  </div>
);

const Alert = ({ message }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center gap-3 p-3 my-4 bg-red-500/10 text-red-300 rounded-lg border border-red-400/30"
  >
    <AlertTriangle size={20} />
    <span className="text-sm font-medium">{message}</span>
  </motion.div>
);

// -------- Sub Components --------
const ViewModeContent = ({ complaint }) => (
  <>
    <InfoBlock label="Title">
      <p>{complaint.title}</p>
    </InfoBlock>
    <InfoBlock label="Description">
      <p className="whitespace-pre-line">{complaint.description}</p>
    </InfoBlock>
    <InfoBlock label="Location">
      <p className="flex items-center gap-2 text-slate-400">
        <MapPin size={14} />
        {complaint.location?.address}
      </p>
    </InfoBlock>
  </>
);

const EditModeContent = ({ form, handleChange, setShowMapPicker }) => (
  <>
    <div>
      <label htmlFor="title" className="text-sm font-medium text-cyan-300">
        Title
      </label>
      <input
        id="title"
        name="title"
        value={form.title}
        onChange={handleChange}
        className="mt-1 w-full px-3 py-2 border border-cyan-600/30 bg-slate-900/50 text-white rounded-md shadow-inner focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500"
      />
    </div>
    <div>
      <label htmlFor="description" className="text-sm font-medium text-cyan-300">
        Description
      </label>
      <textarea
        id="description"
        name="description"
        value={form.description}
        onChange={handleChange}
        rows={4}
        className="mt-1 w-full px-3 py-2 border border-cyan-600/30 bg-slate-900/50 text-white rounded-md shadow-inner focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500"
      />
    </div>
    <div>
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-cyan-300">Location</label>
        <button
          type="button"
          onClick={() => setShowMapPicker(true)}
          className="relative overflow-hidden text-sm font-semibold text-cyan-400 group"
        >
          <span className="absolute inset-0 bg-cyan-400/20 scale-0 group-hover:scale-100 transition-transform rounded-full blur-sm"></span>
          <span className="relative flex items-center gap-1">
            <MapPin size={14} /> Change Location
          </span>
        </button>
      </div>
      <p className="text-sm text-slate-300 mt-2 p-3 bg-slate-800/40 rounded-md border border-cyan-600/20">
        {form.location?.address}
      </p>
    </div>
  </>
);

// -------- Main Component --------
const ComplaintModal = ({ complaint, token, onClose, onUpdate, onDelete }) => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL
  const [mode, setMode] = useState("view");
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    title: complaint.title || "",
    description: complaint.description || "",
    location: complaint.location || {
      type: "Point",
      coordinates: [0, 0],
      address: "",
    },
  });

  


  const handleChange = (e) => setForm(s => ({ ...s, [e.target.name]: e.target.value }));

  const handleOpenMap = () => setShowMapPicker(true);
  const handleCancelMap = () => setShowMapPicker(false);

  const handleConfirmLocation = (coordsLatLng, address) => {
    setForm((prev) => ({
      ...prev,
      location: {
        type: "Point",
        coordinates: [coordsLatLng[1], coordsLatLng[0]], // [lng, lat]
        address,
      },
    }));
    setShowMapPicker(false);
  };

  const handleSave = async () => {
    setLoadingSave(true);
    setError(null);
    try {
      const res = await axios.patch(
        `${BASE_URL}/complaints/${complaint._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdate(res.data);
      setMode("view");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save changes. Please try again."
      );
    } finally {
      setLoadingSave(false);
    }
  };

  const handleDelete = async () => {
    setLoadingDelete(true);
    setError(null);
    try {
      await axios.delete(`${BASE_URL}/complaints/${complaint._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onDelete(complaint._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete complaint.");
      setShowConfirmDelete(false);
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="bg-slate-950/70 border border-cyan-500/30 shadow-[0_0_25px_rgba(56,189,248,0.3)] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <header className="flex justify-between items-center p-5 border-b border-cyan-700/40">
            <div>
              <h2 className="text-xl font-bold text-cyan-300">
                {complaint.title}
              </h2>
              <p className="text-xs text-slate-500">
                ID: {complaint._id.slice(-6)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {mode === "view" && (
                <button
                  onClick={() => setMode("edit")}
                  className="p-2 text-cyan-400 hover:bg-cyan-400/10 rounded-full transition"
                >
                  <Pencil size={18} />
                </button>
              )}
              <button
                className="p-2 text-slate-400 hover:bg-cyan-400/10 rounded-full transition"
                onClick={onClose}
              >
                <X size={20} />
              </button>
            </div>
          </header>

          {/* Body */}
          <div className="p-6 grid md:grid-cols-2 gap-8 overflow-y-auto text-slate-200">
            <div className="space-y-6">
              <img
                src={complaint.attachments?.[0]?.url || "/no-image.png"}
                alt="Complaint"
                className="w-full rounded-lg shadow-lg aspect-video object-cover border border-cyan-600/20"
              />
              {showMapPicker && (
                <MapPicker
                  initialPosition={[
                    form.location.coordinates[1],
                    form.location.coordinates[0],
                  ]}
                  initialAddress={form.location.address}
                  onConfirm={handleConfirmLocation}
                  onCancel={() => setShowMapPicker(false)}
                />
              )}
            </div>
            <div className="space-y-6">
              {error && <Alert message={error} />}
              {mode === "view" ? (
                <ViewModeContent complaint={complaint} />
              ) : (
                <EditModeContent
                  form={form}
                  handleChange={handleChange}
                  setShowMapPicker={setShowMapPicker}
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <footer className="p-4 flex justify-end gap-3 border-t border-cyan-700/40 bg-slate-950/70">
            {mode === "edit" ? (
              <>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMode("view")}
                  className="px-4 py-2 bg-slate-800 text-cyan-300 rounded-md font-semibold text-sm hover:bg-slate-700 transition"
                  disabled={loadingSave}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  className="relative overflow-hidden px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-md font-semibold text-sm shadow-md hover:shadow-lg transition flex items-center gap-2"
                  disabled={loadingSave}
                >
                  {loadingSave ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </motion.button>
              </>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowConfirmDelete(true)}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-md font-semibold text-sm hover:shadow-[0_0_15px_rgba(244,63,94,0.4)] transition flex items-center gap-2"
              >
                <Trash size={14} /> Delete
              </motion.button>
            )}
          </footer>
        </motion.div>

        {/* Delete Confirm */}
        <AnimatePresence>
          {showConfirmDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="bg-slate-900 border border-red-600/40 p-8 rounded-xl shadow-[0_0_25px_rgba(220,38,38,0.3)] text-center text-white w-full max-w-md"
              >
                <h3 className="text-lg font-bold text-red-400">Are you sure?</h3>
                <p className="text-sm text-slate-400 mt-2">
                  This will permanently delete your complaint.
                </p>
                <div className="flex justify-center gap-4 mt-6">
                  <button
                    onClick={() => setShowConfirmDelete(false)}
                    className="px-6 py-2 bg-slate-800 text-cyan-300 rounded-md font-semibold text-sm hover:bg-slate-700 transition"
                    disabled={loadingDelete}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-md font-semibold text-sm hover:shadow-[0_0_15px_rgba(244,63,94,0.4)] flex items-center gap-2"
                    disabled={loadingDelete}
                  >
                    {loadingDelete ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Deleting...
                      </>
                    ) : (
                      "Yes, Delete"
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default ComplaintModal;
