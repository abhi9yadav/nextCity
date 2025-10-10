import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, onIdTokenChanged } from "firebase/auth";
import { auth } from "../../firebase/firebase";

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("currentUser")) || null
  );
  const [token, setToken] = useState(localStorage.getItem("idToken") || null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);


  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get fresh token (cached or renewed automatically)
          const idToken = await firebaseUser.getIdToken();

          setToken(idToken);
          localStorage.setItem("idToken", idToken);

          // Fetch user data from backend
          const res = await fetch("http://localhost:5000/api/v1/users/me", {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });

          const user = await res.json();
          console.log("✅ Fetched user data:", user);

          const backendUser = user  || {};
          const fullUser = { ...firebaseUser, ...backendUser };
          setRole(user.role);

          setCurrentUser(fullUser);
          localStorage.setItem("currentUser", JSON.stringify(fullUser));
        } catch (err) {
          console.error("❌ Error verifying user:", err);
          setCurrentUser(firebaseUser);
        }
      } else {
        setCurrentUser(null);
        setToken(null);
        localStorage.removeItem("currentUser");
        localStorage.removeItem("idToken");
      }
      setLoading(false);
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
