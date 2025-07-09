import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db, analytics } from "../../firebaseinit";
import { logEvent } from "firebase/analytics";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";
import { doc, getDoc, setDoc } from "firebase/firestore";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigator = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      logEvent(analytics, "login", { method: "email" });
      navigator("/auth-redirect");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "User",
          role: "user",
        });
      }
      logEvent(analytics, "login", { method: "google" });
      navigator("/auth-redirect");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="login-div">
      <h2>LOGIN</h2>
      <form className="form-form" onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="******"
          value={password}
          onChange={(p) => setPassword(p.target.value)}
        />
        <button type="submit">Login</button>
        {error && <p>{error}</p>}
      </form>
      <button onClick={handleGoogleLogin}>Login with Google</button>
      <p>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default Login;
