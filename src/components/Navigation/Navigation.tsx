import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseinit";
import { useAuth } from "../../context/AuthContext";
import "./Navigation.css";

const Navigation: React.FC = () => {
  const { userProfile, firebaseUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <nav className="main-nav">
      <div className="nav-links">
        {userProfile?.role === "artist" ? (
          <Link to="/artist-dashboard">Dashboard</Link>
        ) : (
          <Link to="/home">Home</Link>
        )}
        {userProfile?.role === "admin" && <Link to="/admin">Admin Panel</Link>}
      </div>

      <div className="nav-user-section">
        {firebaseUser ? (
          <>
            <span className="user-email">{firebaseUser.email}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </>
        ) : (
          <Link to="/">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
