import { useState, useEffect } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";

const WorkerFormModal = ({
  isOpen,
  onClose,
  worker,
  onSubmit,
  zones,
  isDedicatedPage,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    zone_id: "",
    photoURL: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!worker;

  const [photoPreview, setPhotoPreview] = useState("");

  useEffect(() => {
    if (isEditMode && worker) {
      setFormData({
        name: worker.name || "",
        email: worker.email || "",
        phone: worker.phone || "",
        zone_id: worker.zone_id || zones[0]?._id || "",
        photoURL: worker.photoURL || "",
        isActive: worker.isActive ?? true,
      });
      setPhotoPreview(worker.photoURL || "");
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        zone_id: zones[0]?._id || "",
        photoURL: "",
        isActive: true,
      });
      setPhotoPreview("");
    }
    setErrors({});
  }, [isOpen, worker, zones, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "photoURL") {
      setPhotoPreview(value);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Worker name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format.";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required.";
    if (!formData.zone_id) newErrors.zone_id = "Zone is required.";
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the highlighted fields before submitting.", {
        position: "top-right",
        style: {
          border: "1px solid #f87171",
          background: "#fef2f2",
          color: "#7f1d1d",
          fontWeight: "600",
          borderRadius: "10px",
          padding: "14px",
        },
        icon: "❌",
      });
    }

    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const res = await onSubmit(
        isEditMode ? { workerId: worker._id, ...formData } : formData
      );

      const firstName = formData.name.split(" ")[0];
      const invitationStatus = res?.worker?.invitationSent
        ? "and invitation sent ✉️"
        : "and invitation not sent ❌";

      if (!isEditMode) {
        toast.success(
          `Staff member ${firstName} added successfully 🎉 ${invitationStatus}`,
          {
            position: "top-right",
            style: {
              border: "1px solid #22c55e",
              background: "#f0fdf4",
              color: "#166534",
              fontWeight: "600",
              borderRadius: "10px",
              padding: "14px",
            },
            icon: "✅",
          }
        );
      }

      if (!isEditMode) {
        setFormData({
          name: "",
          email: "",
          phone: "",
          zone_id: zones[0]?._id || "",
          photoURL: "",
          isActive: true,
        });
        setPhotoPreview("");
      }

      if (!isDedicatedPage) onClose();
    } catch (err) {
      console.error("Error submitting form:", err);
      toast.error("Failed to save worker. Please try again.", {
        position: "top-right",
        style: {
          border: "1px solid #f87171",
          background: "#fef2f2",
          color: "#7f1d1d",
          fontWeight: "600",
          borderRadius: "10px",
          padding: "14px",
        },
        icon: "❌",
      });
      setErrors((prev) => ({
        ...prev,
        api: err.message || "Submission failed.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🎨 Modal custom styles
  const customModalStyles = {
    content: {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      borderRadius: "1rem",
      maxWidth: "600px",
      width: "90%",
      border: "none",
      padding: "2.5rem",
      background: "#ffffff",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      animation: "fadeIn 0.3s ease-in-out",
    },
    overlay: { backgroundColor: "rgba(0, 0, 0, 0.65)", zIndex: 50 },
  };

  const inputClass = (name) =>
    `w-full px-4 py-3 border rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 ${
      errors[name] ? "border-red-500 bg-red-50" : "border-gray-300"
    }`;

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
      {/* Header */}
      {!isDedicatedPage && (
        <div className="flex justify-between items-center pb-3 border-b border-gray-200 mb-5">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditMode ? "Edit Worker Details" : "Add New Worker"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
      )}

      {errors.api && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
          {errors.api}
        </div>
      )}

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Worker Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={inputClass("name")}
            placeholder="e.g., John Doe"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-red-600 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Email (Login ID)
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={inputClass("email")}
            placeholder="e.g., worker@nextcity.com"
            disabled={isEditMode || isSubmitting}
          />
          {errors.email && (
            <p className="text-red-600 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={inputClass("phone")}
            placeholder="123-456-7890"
            disabled={isSubmitting}
          />
          {errors.phone && (
            <p className="text-red-600 text-xs mt-1">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Assigned Zone
          </label>
          <select
            name="zone_id"
            value={formData.zone_id}
            onChange={handleChange}
            className={`${inputClass("zone_id")} bg-white`}
            disabled={isSubmitting}
          >
            <option value="">-- Select Zone --</option>
            {zones.map((zone) => (
              <option key={zone._id} value={zone._id}>
                {zone.zone_name}
              </option>
            ))}
          </select>
          {errors.zone_id && (
            <p className="text-red-600 text-xs mt-1">{errors.zone_id}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Photo URL (Optional)
          </label>
          <input
            type="url"
            name="photoURL"
            value={formData.photoURL}
            onChange={handleChange}
            className={inputClass("photoURL")}
            placeholder="https://example.com/photo.jpg"
            disabled={isSubmitting}
          />
          {/* Photo Preview */}
          {photoPreview && (
            <div className="mt-2">
              <img
                src={photoPreview}
                alt="Worker Preview"
                className="h-24 w-24 rounded-lg object-cover border border-gray-300 shadow-sm"
                onError={(e) => (e.target.src = "")}
              />
            </div>
          )}
        </div>
      </div>

      {/* Active toggle for Edit mode */}
      {isEditMode && (
        <div className="pt-2">
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={isSubmitting}
            />
            <label className="text-sm font-semibold text-gray-800 cursor-pointer">
              Worker Status:{" "}
              <span
                className={`${
                  formData.isActive ? "text-green-600" : "text-red-600"
                }`}
              >
                {formData.isActive ? "Active" : "Deactivated"}
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-5">
        {!isDedicatedPage && (
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className={`px-5 py-2.5 rounded-lg text-white font-semibold shadow-md flex items-center gap-2 transition-all bg-gradient-to-r from-blue-500 to-blue-700  cursor-pointer hover:from-blue-600 hover:to-blue-800 ${
            isSubmitting ? "opacity-70 cursor-not-allowed" : ""
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              {isEditMode ? "Saving..." : "Inviting..."}
            </>
          ) : isEditMode ? (
            "Save Changes"
          ) : (
            "Add Worker & Invite"
          )}
        </button>
      </div>
    </form>
  );

  return isDedicatedPage ? (
    formContent
  ) : (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customModalStyles}
      contentLabel={isEditMode ? "Edit Worker" : "Add New Worker"}
    >
      {formContent}
    </Modal>
  );
};

export default WorkerFormModal;
