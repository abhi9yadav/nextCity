import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";

const PrivateRoute = ({ children }) => {
  const { userLoggedIn, loading } = useAuth();

  // While checking auth state, you can show a loading message
  if (loading) {
    return <p>Loading...</p>;
  }

  // If user is not logged in, redirect to login page
  if (!userLoggedIn) {
    return <Navigate to="/" />;
  }

  // Otherwise render the protected page
  return children;
};

export default PrivateRoute;
