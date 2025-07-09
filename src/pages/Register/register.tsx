import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db, analytics } from "../../firebaseinit";
import { logEvent } from "firebase/analytics";
import { doc, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import "./register.css";

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (f: React.FormEvent) => {
    f.preventDefault();
    if (!displayName) {
      setError("Please enter a display name.");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        role: "user",
      });

      logEvent(analytics, "sign_up", { method: "email" });
      navigate("/home");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="register-div">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Choose a Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(a) => setEmail(a.target.value)}
          required
        />
        <input
          type="password"
          placeholder="******"
          value={password}
          onChange={(p) => setPassword(p.target.value)}
          required
        />
        <button type="submit">Register</button>
        {error && <p style={{ color: "var(--error-color)" }}>{error}</p>}
      </form>
      <p>
        Already have an account? <Link to="/">Login</Link>
      </p>
    </div>
  );
};

export default Register;
