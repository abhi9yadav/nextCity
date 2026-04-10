import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useTheme } from "../hooks/useTheme";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth } from "../firebase/firebase"; 

const ChangePasswordModal = ({ isOpen, onClose, token, BASE_URL }) => {
  const { theme } = useTheme();

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [show, setShow] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { oldPassword, newPassword, confirmPassword } = form;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return toast.error("All fields are required");
    }

    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setLoading(true);

      // STEP 1: RE-AUTHENTICATE USER
      const user = auth.currentUser;

      const credential = EmailAuthProvider.credential(
        user.email,
        oldPassword
      );

      await reauthenticateWithCredential(user, credential);

      // STEP 2: CALL BACKEND ONLY AFTER VERIFYING
      await axios.put(
        `${BASE_URL}/users/change-password`,
        { newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Password updated successfully");
      onClose();

    } catch (err) {
      if (err.code === "auth/invalid-credential") {
        toast.error("Old password is incorrect");
      } else {
        toast.error(err.response?.data?.message || "Error");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`w-full max-w-md p-6 rounded-lg ${theme.cardBg} ${theme.cardBorder}`}
      >
        <h2 className={`text-xl font-bold mb-4 ${theme.textDefault}`}>
          Change Password
        </h2>

        {/* OLD PASSWORD */}
        <InputField
          label="Old Password"
          name="oldPassword"
          value={form.oldPassword}
          onChange={handleChange}
          show={show.old}
          toggle={() => setShow({ ...show, old: !show.old })}
          theme={theme}
        />

        {/* NEW PASSWORD */}
        <InputField
          label="New Password"
          name="newPassword"
          value={form.newPassword}
          onChange={handleChange}
          show={show.new}
          toggle={() => setShow({ ...show, new: !show.new })}
          theme={theme}
        />

        {/* CONFIRM */}
        <InputField
          label="Confirm Password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          show={show.confirm}
          toggle={() => setShow({ ...show, confirm: !show.confirm })}
          theme={theme}
        />

        {/* BUTTONS */}
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded cursor-pointer">
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer"
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// 🔥 Reusable Input
const InputField = ({ label, name, value, onChange, show, toggle, theme }) => (
  <div className="mb-3">
    <label className={`block mb-1 ${theme.textSubtle}`}>{label}</label>
    <div className="flex">
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full p-2 border rounded-l ${theme.cardBorder} ${theme.textDefault} bg-transparent`}
      />
      <button onClick={toggle} className="px-3 border rounded-r">
        👁
      </button>
    </div>
  </div>
);

export default ChangePasswordModal;