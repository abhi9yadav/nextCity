import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "./../assets/logo.png";

export default function SetPassword() {
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encodedToken = params.get("token");
    if (!encodedToken) {
      setError("No token provided");
      setStatus("error");
      setTimeout(() => navigate("/"), 3000);
      return;
    }
    const token = decodeURIComponent(encodedToken);
    setToken(token);
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    axios
      .get(`${BASE_URL}/auth/validate-token`, { params: { token } })
      .then((res) => {
        setEmail(res.data.email);
        setStatus("ready");
      })
      .catch((err) => {
        const msg = err.response?.data?.message || "Invalid token";
        setError(msg);
        setStatus("error");
        toast.error(msg);
        setTimeout(() => navigate("/login"), 3000);
      });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      toast.warn("Please fill both password fields!");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      await axios.post(`${BASE_URL}/auth/set-password`, {
        token,
        password,
      });

      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Password set successfully! Redirecting to dashboard...");
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to set password";
      toast.error(msg);
    }
  };

  if (status === "loading")
    return (
      <div className="loading-screen">
        <p>Verifying your invitation link...</p>
      </div>
    );

  if (status === "error")
    return (
      <div className="error-screen">
        <p>{error}</p>
      </div>
    );

  return (
    <div className="page-wrapper">
      <ToastContainer position="top-center" />
      <div className="card">
        <div className="logo-container">
          <img src={logo} alt="NextCity Logo" />
        </div>
        <h1>Welcome to NextCity!</h1>
        <p className="subtitle">
          Let’s secure your account. Set a password for <strong>{email}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit">Set Password</button>
        </form>
      </div>

      <style jsx="true">{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

        .page-wrapper {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #6a11cb, #2575fc, #1abc9c);
          background-size: 400% 400%;
          animation: gradientAnimation 15s ease infinite;
          padding: 20px;
          font-family: 'Inter', sans-serif;
        }

        .card {
          max-width: 480px;
          width: 100%;
          background: #ffffffee;
          backdrop-filter: blur(15px);
          padding: 45px 35px;
          border-radius: 18px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: fadeIn 0.8s ease forwards;
        }

        .logo-container {
          margin-bottom: 25px;
          display: flex;
          justify-content: center;
          width: 100%;
        }

        .logo-container img {
          max-width: 160px;
          transition: transform 0.3s ease;
        }

        .logo-container img:hover {
          transform: scale(1.1);
        }

        h1 {
          font-size: 30px;
          font-weight: 700;
          color: #111;
          margin-bottom: 10px;
        }

        .subtitle {
          font-size: 16px;
          color: #555;
          margin-bottom: 30px;
        }

        form input {
          width: 100%;
          padding: 15px 18px;
          margin-bottom: 18px;
          border-radius: 12px;
          border: 1px solid #ccc;
          font-size: 15px;
          transition: all 0.3s;
          outline: none;
        }

        form input:focus {
          border-color: #2575fc;
          box-shadow: 0 0 10px rgba(37, 117, 252, 0.3);
        }

        form button {
          width: 100%;
          padding: 15px;
          background: #2575fc;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        form button:hover {
          background: #6a11cb;
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(106, 17, 203, 0.4);
        }

        .loading-screen,
        .error-screen {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 18px;
          color: #fff;
          text-align: center;
        }

        .error-screen p {
          color: #ff6b6b;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradientAnimation {
          0% {background-position: 0% 50%;}
          50% {background-position: 100% 50%;}
          100% {background-position: 0% 50%;}
        }
      `}</style>
    </div>
  );
}
