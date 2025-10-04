import React, { useState } from "react";
import { registerUser } from "../../firebase/auth";
import { useAuth } from "../../contexts/authContext";
import { useNavigate } from "react-router-dom";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebase/firebase";

const OfficerRegister = () => {
  const { userLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [ward, setWard] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    if (!isRegistering) {
      setIsRegistering(true);
      try {
        // create auth account
        const userCredential = await registerUser(email, password);
        const user = userCredential.user;

        // store officer info in Firestore
        await addDoc(collection(db, "users"), {
          uid: user.uid,
          email,
          role: "officer",
          department,
          ward,
          status: "pending", // requires admin approval
          createdAt: new Date(),
        });

        navigate("/officer-dashboard"); // redirect after signup
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsRegistering(false);
      }
    }
  };

  if (userLoggedIn) {
    navigate("/officer-dashboard");
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Officer Registration</h2>

        {errorMessage && (
          <p className="text-red-500 text-sm text-center mb-4">{errorMessage}</p>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 focus:outline-none"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Department (e.g. Roads, Garbage, Streetlights)"
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 focus:outline-none"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Ward (e.g. Ward 12)"
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 focus:outline-none"
            value={ward}
            onChange={(e) => setWard(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={isRegistering}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {isRegistering ? "Registering..." : "Register as Officer"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Already registered?{" "}
          <a href="/" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default OfficerRegister;
