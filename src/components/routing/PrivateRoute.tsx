import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const PrivateRoute: React.FC = () => {
  const { firebaseUser, loadingAuth } = useAuth();

  if (loadingAuth) {
    return <p>Loading...</p>;
  }

  return firebaseUser ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRoute;
