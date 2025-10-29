import React, { useState } from "react";
import { X, Pencil, Trash } from "lucide-react";
import axios from "axios";
import MapPicker from "./MapPicker";
import clsx from "clsx";

const ComplaintModal = ({ complaint, token, onClose, onUpdate, onDelete }) => {
  const [mode, setMode] = useState("view");
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    title: complaint.title || "",
    description: complaint.description || "",
    concernedDepartment: complaint.concernedDepartment || "",
    location: complaint.location || { type: "Point", coordinates: [complaint.location?.coordinates?.[0] || 0, complaint.location?.coordinates?.[1] || 0], address: complaint.location?.address || "" },
  });

  const BASE_URL = import.meta.env.VITE_API_BASE_URL

  const [showMapPicker, setShowMapPicker] = useState(false);

  const handleChange = (e) => setForm(s => ({ ...s, [e.target.name]: e.target.value }));

  const handleOpenMap = () => setShowMapPicker(true);
  const handleCancelMap = () => setShowMapPicker(false);

  const handleConfirmLocation = (coordsLatLng, address) => {
    form.location = { type: "Point", coordinates: [coordsLatLng[1], coordsLatLng[0]], address };
    setForm({ ...form });
    setShowMapPicker(false);
  };

  const handleSave = async () => {
    setLoadingSave(true);
    setError(null);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        concernedDepartment: form.concernedDepartment,
        location: {
          type: "Point",
          coordinates: form.location.coordinates,
          address: form.location.address,
        }
      };

      const res = await axios.patch(
        `${BASE_URL}/complaints/${complaint._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = res.data || { ...complaint, ...payload };
      onUpdate(updated);
      setMode("view");
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to save changes. Try again.");
    } finally {
      setLoadingSave(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this complaint? This action cannot be undone.")) return;
    setLoadingDelete(true);
    try {
      await axios.delete(`${BASE_URL}/complaints/${complaint._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onDelete(complaint._id);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to delete complaint.");
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-xl overflow-auto max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">Complaint Details</h3>
            <span className="text-xs text-gray-500">ID: {complaint._id?.toString().slice(-8)}</span>
          </div>
          <div className="flex items-center gap-2">
            {mode === "view" ? (
              <button onClick={() => setMode("edit")} className="flex items-center gap-1 px-3 py-1 bg-yellow-50 border rounded text-xs">
                <Pencil size={14} /> Edit
              </button>
            ) : (
              <button onClick={() => setMode("view")} className="px-3 py-1 bg-gray-100 rounded text-xs">Cancel edit</button>
            )}
            <button onClick={handleDelete} className="flex items-center gap-2 px-3 py-1 bg-red-50 border rounded text-xs text-red-600" disabled={loadingDelete}>
              <Trash size={14} /> {loadingDelete ? "Deleting..." : "Delete"}
            </button>
            <button onClick={onClose} className="p-2 text-gray-600 hover:text-gray-800">
              <X />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Image */}
          <div>
            <img src={complaint.attachments?.[0]?.url || "https://cdn-icons-png.flaticon.com/512/2698/2698508.png"} alt={complaint.title} className="w-full h-56 object-cover rounded-md" />
          </div>

          {/* MAIN DETAILS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              {/* Title */}
              <div>
                <label className="text-xs text-gray-600">Title</label>
                {mode === "view" ? (
                  <div className="mt-1 text-sm font-medium">{form.title}</div>
                ) : (
                  <input name="title" value={form.title} onChange={handleChange} className="w-full p-2 border rounded" />
                )}
              </div>

              {/* Description */}
              <div>
                <label className="text-xs text-gray-600">Description</label>
                {mode === "view" ? (
                  <div className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{form.description}</div>
                ) : (
                  <textarea name="description" value={form.description} onChange={handleChange} rows={5} className="w-full p-2 border rounded" />
                )}
              </div>

              {/* concernedDepartment */}
              <div>
                <label className="text-xs text-gray-600">Concerned Department</label>
                {mode === "view" ? (
                  <div className="mt-1 text-sm">{form.concernedDepartment}</div>
                ) : (
                  <input name="concernedDepartment" value={form.concernedDepartment} onChange={handleChange} className="w-full p-2 border rounded" />
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600">Status (read-only)</label>
                <div className="mt-1 text-sm font-medium">{complaint.status}</div>
              </div>

              <div>
                <label className="text-xs text-gray-600">Location</label>
                <div className="mt-1 text-sm">{complaint.location?.address || "Not specified"}</div>

                {mode === "edit" && (
                  <div className="mt-2">
                    <button onClick={handleOpenMap} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Change Location</button>
                    {/* show small preview coords */}
                    <div className="text-xs text-gray-500 mt-2">Coords: {form.location?.coordinates ? `${form.location.coordinates[1].toFixed(6)}, ${form.location.coordinates[0].toFixed(6)}` : "—"}</div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-gray-600">Created At</label>
                <div className="mt-1 text-sm">{new Date(complaint.createdAt).toLocaleString("en-IN")}</div>
              </div>

              <div>
                <label className="text-xs text-gray-600">Votes</label>
                <div className="mt-1 text-sm">{(complaint.votes || []).length}</div>
              </div>
            </div>
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          {/* Map picker modal area (conditional) */}
          {showMapPicker && (
            <div className="p-3 border rounded">
              <MapPicker
                initialPosition={
                  form.location?.coordinates?.length === 2
                    ? [form.location.coordinates[1], form.location.coordinates[0]]
                    : [26.5123, 80.2329]
                }
                initialAddress={form.location?.address || ""}
                onConfirm={(coordsLatLng, address) => handleConfirmLocation(coordsLatLng, address)}
                onCancel={handleCancelMap}
              />
            </div>
          )}

          {/* Footer actions: Save/Cancel when editing, otherwise Close */}
          <div className="flex justify-end gap-2">
            {mode === "edit" ? (
              <>
                <button onClick={() => setMode("view")} className="px-4 py-2 rounded bg-gray-100">Cancel</button>
                <button onClick={handleSave} disabled={loadingSave} className="px-4 py-2 rounded bg-blue-600 text-white">
                  {loadingSave ? "Saving..." : "Save Changes"}
                </button>
              </>
            ) : (
              <button onClick={onClose} className="px-4 py-2 rounded bg-gray-100">Close</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintModal;
