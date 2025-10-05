import React, { useState, useEffect } from "react";
import { loginUser, signInWithGoogle } from "../../firebase/auth";
import { useAuth } from "../../contexts/authContext";
import { useNavigate, Link } from "react-router-dom"; // Import Link and useEffect

const Login = () => {
  const { userLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ✅ Best Practice: Use useEffect for redirects
  useEffect(() => {
    if (userLoggedIn) {
      navigate("/home");
    }
  }, [userLoggedIn, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear previous errors
    if (!isSigningIn) {
      setIsSigningIn(true);
      try {
        const userCredential = await loginUser(email, password);
        // ✅ Backend Integration: Send token after login
        await handleBackendLogin(userCredential.user);
        console.log("Login successful, navigating to home...");
      } catch (error) {
        setErrorMessage(error.message);
        setIsSigningIn(false); // Ensure loading state is reset on error
      }
      // No need to setIsSigningIn(false) here, as the component will unmount on success
    }
  };

  const onGoogleSignIn = async () => {
    if (!isSigningIn) {
      setIsSigningIn(true);
      try {
        const userCredential = await signInWithGoogle();
        // ✅ Backend Integration: Send token after login
        await handleBackendLogin(userCredential.user);
      } catch (error) {
        setErrorMessage(error.message);
        setIsSigningIn(false); // Ensure loading state is reset on error
      }
    }
  };

  // ✅ New Function: Handles sending the token to your backend
  const handleBackendLogin = async (user) => {
    const idToken = await user.getIdToken();
    const res = await fetch(`http://localhost:${process.env.PORT}/api/v1/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Backend login failed.");
    }

    console.log("Backend login successful.");
    // Navigation is handled by the useEffect hook when userLoggedIn state changes
  };

  // Prevent rendering the form if user is already logged in
  if (userLoggedIn) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Welcome Back</h2>

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

          <button
            type="submit"
            disabled={isSigningIn}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isSigningIn ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="my-4 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-400">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <button
          onClick={onGoogleSignIn}
          disabled={isSigningIn}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48">
             <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l8.11 6.28C12.09 13.42 17.63 9.5 24 9.5z"></path>
             <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.53-4.18 7.12-10.31 7.12-17.65z"></path>
             <path fill="#FBBC05" d="M10.67 28.18C10.24 26.83 10 25.41 10 24s.24-2.83.67-4.18l-8.11-6.28C.96 16.29 0 20.03 0 24s.96 7.71 2.56 10.42l8.11-6.24z"></path>
             <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.82l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.36 0-11.9-3.92-13.84-9.22l-8.11 6.28C6.51 42.62 14.62 48 24 48z"></path>
             <path fill="none" d="M0 0h48v48H0z"></path>
          </svg>
          Sign in with Google
        </button>

        <p className="mt-6 text-center text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;