
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/authContext";
import Modal from "../ui/Modal";

export default function CompletionModal({ task, onClose, onSuccess }) {
  const { token } = useAuth();

  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef();

  // 🟢 Handle file select
  const handleFile = (file) => {
    if (!file) return;

    // ✅ Validate image type
    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed");
      return;
    }

    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  // 🟢 Drag & Drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  // 🟢 Clean preview memory
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // 🟢 Submit
  const submit = async () => {
    try {
      setLoading(true);
      setProgress(0);

      const form = new FormData();
      form.append("status", "RESOLVED");
      form.append("remarks", message);
      if (photo) form.append("photo", photo);

      console.log(form.get("status"), form.get("remarks"), form.get("photo"));

      await axios.patch(
        `http://localhost:5000/api/v1/complaints/${task._id}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (e) => {
            if (!e.total) return;
            const percent = Math.round((e.loaded * 100) / e.total);
            setProgress(percent);
          },
        }
      );

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="w-[420px] bg-white rounded-2xl shadow-2xl p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Complete Task</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <p className="text-sm text-gray-500 mb-4">{task?.title}</p>

        {/* Message */}
        <textarea
          className="w-full border rounded-lg p-3 mb-4"
          placeholder="Write message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        {/* Drag Drop Upload */}
        <div
          onClick={() => fileInputRef.current.click()}   // ✅ click opens file picker
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition"
        >
          <p className="text-sm text-gray-500">
            Drag & Drop image OR click
          </p>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>

        {/* Preview */}
        {preview && (
          <img
            src={preview}
            alt="preview"
            className="w-full h-40 object-cover rounded mt-4"
          />
        )}

        {/* Progress Bar */}
        {loading && (
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 border rounded py-2"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 bg-green-500 text-white py-2 rounded"
          >
            {loading ? `${progress}%` : "Submit"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

