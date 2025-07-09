import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const RoleBasedRedirect: React.FC = () => {
  const { userProfile, loadingAuth, firebaseUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loadingAuth) {
      return;
    }

    if (!firebaseUser) {
      navigate("/");
      return;
    }

    if (!userProfile) {
      console.error(
        "Redirect Error: User is authenticated but has no profile data."
      );
      navigate("/home");
      return;
    }

    switch (userProfile.role) {
      case "admin":
        navigate("/admin");
        break;
      case "artist":
        navigate("/artist-dashboard");
        break;
      case "user":
      default:
        navigate("/home");
        break;
    }
  }, [userProfile, loadingAuth, firebaseUser, navigate]);

  return <p>Loading your experience...</p>;
};

export default RoleBasedRedirect;
