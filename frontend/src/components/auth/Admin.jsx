// AdminRegister.js
import React, { useState } from "react";
import { registerUser } from "../../firebase/auth";
import { useNavigate } from "react-router-dom";

const admin= () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const ADMIN_SECRET = process.env.REACT_APP_ADMIN_SECRET; // keep in .env file

  const onSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    if (secretCode !== ADMIN_SECRET) {
      setErrorMessage("Invalid admin registration code");
      return;
    }

    if (!isRegistering) {
      setIsRegistering(true);
      try {
        await registerUser(email, password, "admin"); // assign admin role
        navigate("/home");
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsRegistering(false);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Admin Registration</h2>

        {errorMessage && (
          <p className="text-red-500 text-sm text-center mb-4">{errorMessage}</p>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <input type="email" placeholder="Email" className="w-full px-4 py-2 border rounded-lg" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" className="w-full px-4 py-2 border rounded-lg" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <input type="password" placeholder="Confirm Password" className="w-full px-4 py-2 border rounded-lg" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          <input type="text" placeholder="Secret Code" className="w-full px-4 py-2 border rounded-lg" value={secretCode} onChange={(e) => setSecretCode(e.target.value)} required />

          <button type="submit" disabled={isRegistering} className="w-full bg-red-600 text-white py-2 rounded-lg">
            {isRegistering ? "Creating Admin..." : "Sign Up as Admin"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default admin;
