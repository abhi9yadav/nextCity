import React, { useState, useEffect } from "react";
import { registerUser, signInWithGoogle } from "../../firebase/auth";
import { useAuth } from "../../contexts/authContext";
import { useNavigate, Link } from "react-router-dom";

const UserRegister = () => {
  const { currentUser } = useAuth();
  const userLoggedIn = !!currentUser;
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (userLoggedIn) {
      navigate("/citizen");
    }
  }, [userLoggedIn, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    if (isRegistering) return;

    setIsRegistering(true);

    let user = null;

    try {
      const userCredential = await registerUser(email, password);
      user = userCredential.user;

      if (!user) {
        throw new Error("User registration failed.");
      }

      const idToken = await user.getIdToken();

      let BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api/v1";

      const res = await fetch(`${BASE_URL}/users/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          email,
          role: "citizen",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Backend signup failed.");
      }

      await user.getIdToken(true);
    } catch (error) {

      // rollback firebase user
      if (user) {
        try {
          await user.delete();
          console.log("Firebase user rolled back.");
        } catch (deleteError) {
          console.error("Failed to delete Firebase user:", deleteError);
        }
      }

      if (error.code === "auth/email-already-in-use") {
        setErrorMessage("This email is already registered. Please login.");
      } else if (error.code === "auth/weak-password") {
        setErrorMessage("Password should be at least 6 characters.");
      } else {
        setErrorMessage(error.message || "Something went wrong. Please try again.");
      }

    } finally {
      setIsRegistering(false);
    }
  };

  const handleGoogleSignup = async () => {
    setErrorMessage("");

    try {
      const user = await signInWithGoogle();

      if (!user) {
        throw new Error("Google sign-in failed.");
      }

      const idToken = await user.getIdToken();

      let BASE_URL = import.meta.env.VITE_API_BASE_URL;

      if (!BASE_URL) {
        console.error("VITE_API_BASE_URL not defined.");
        BASE_URL = "http://localhost:5001/api/v1";
      }

      const res = await fetch(`${BASE_URL}/users/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          email: user.email,
          role: "citizen",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Backend signup failed");
      }

    } catch (error) {
      if (user) {
        await user.delete();
      }
      setErrorMessage(error.message);
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
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 cursor-pointer"
          >
            {isRegistering ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-4">
          <button
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-2 border py-2 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="google"
              className="w-5 h-5"
            />
            Sign Up with Google
          </button>
        </div>

        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default UserRegister;