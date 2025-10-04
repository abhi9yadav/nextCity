import React, { useState, useEffect } from "react";
import { registerUser } from "../../firebase/auth";
import { useAuth } from "../../contexts/authContext";
import { useNavigate, Link } from "react-router-dom"; // Import Link

const UserRegister = () => {
  const { userLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ✅ Improvement: Use useEffect for side-effects like navigation
  useEffect(() => {
    if (userLoggedIn) {
      navigate("/home");
    }
  }, [userLoggedIn, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear previous errors

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    if (!isRegistering) {
      setIsRegistering(true);
      try {
        // ✅ Correction: Capture the userCredential object
        const userCredential = await registerUser(email, password);
        console.log("register firebase se laut aaye");
        const user = userCredential.user;
        console.log("Firebase user:", user);

        if (!user) {
          throw new Error("User registration failed.");
        }
        // Get Firebase ID token (JWT)
        const idToken = await user.getIdToken();
        console.log("we got idToken and is: ", idToken);
        console.log("going to call backend");

        // Send signup data + token to backend
        const res = await fetch("http://localhost:5000/api/v1/users/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`, // ✅ add "Bearer " prefix
          },
          body: JSON.stringify({
            email,
            role: "citizen", // or officer, etc.
          }),
        });


        if (!res.ok) {
          // Handle non-2xx responses from your backend
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to register on backend.");
        }

        const data = await res.json();
        console.log("Backend response:", data);
        // The navigate will be handled by the auth context state change and useEffect
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsRegistering(false);
      }
    }
  };

  // Prevent rendering the form if the user is already logged in
  if (userLoggedIn) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>

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

          <button
            type="submit"
            disabled={isRegistering}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {isRegistering ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          {/* ✅ Improvement: Use Link for client-side routing */}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default UserRegister;