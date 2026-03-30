import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/authContext";

export default function CompletionModal({ task, onClose }) {
  const { token } = useAuth();

  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async () => {
    try {
      setLoading(true);

      const form = new FormData();
      form.append("status", "RESOLVED");
      form.append("remarks", message);

      if (photo) form.append("photo", photo);

      await axios.patch(
        `http://localhost:5000/api/v1/complaints/${task._id}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to submit proof.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[2000]">

      <div className="w-[420px] bg-white rounded-2xl shadow-2xl p-6 animate-[fadeIn_.2s_ease]">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Complete Task
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Task Title */}
        <p className="text-sm text-gray-500 mb-4">
          {task?.title}
        </p>

        {/* Message */}
        <textarea
          className="w-full border border-gray-200 rounded-lg p-3 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          placeholder="Write completion message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        {/* Upload */}
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition">

          <span className="text-sm text-gray-500">
            Upload Proof Photo
          </span>

          <input
            type="file"
            accept="image/*"
            onChange={handlePhoto}
            className="hidden"
          />
        </label>

        {/* Preview */}
        {preview && (
          <img
            src={preview}
            alt="proof"
            className="w-full h-40 object-cover rounded-lg mt-4"
          />
        )}

        {/* Buttons */}
        <div className="flex gap-3 mt-6">

          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold hover:scale-[1.02] transition disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit Proof"}
          </button>

        </div>

      </div>
    </div>
  );
}