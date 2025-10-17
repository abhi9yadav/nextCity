import React, { createContext, useContext, useState, useEffect } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { auth } from "../../firebase/firebase";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("currentUser")) || null
  );
  const [token, setToken] = useState(localStorage.getItem("idToken") || null);
  const [role, setRole] = useState(localStorage.getItem("role") || null);
  const [loading, setLoading] = useState(true);

  // Helper to fetch and store user data from backend
  const fetchBackendUser = async (firebaseUser) => {
    const idToken = await firebaseUser.getIdToken();
    setToken(idToken);
    localStorage.setItem("idToken", idToken);
    let BASE_URL = import.meta.env.VITE_API_BASE_URL;
    if (!BASE_URL) {
      console.error("VITE_API_BASE_URL is not defined in the environment variables.");
      BASE_URL = "http://localhost:5001/api/v1";
    }
    const res = await fetch(`${BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${idToken}` },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch user");

    const user = data || {};
    const fullUser = { ...firebaseUser, ...user };

    setRole(user.role || null);
    localStorage.setItem("role", user.role || "");
    setCurrentUser(fullUser);
    localStorage.setItem("currentUser", JSON.stringify(fullUser));
  };

  //Listen for Firebase auth changes
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) await fetchBackendUser(firebaseUser);
        else {
          setCurrentUser(null);
          setToken(null);
          setRole(null);
          localStorage.clear();
        }
      } catch (err) {
        console.error("Auth error:", err);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    token,
    role,
    setRole,
    setCurrentUser,
    setToken,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
