import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider,
} from "firebase/auth";
import { auth } from "../../firebaseinit";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";

const Login: React.FC = () => {
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [error, seterror] = useState("");
  const navigator = useNavigate();

  const handlelogin = async (r: React.FormEvent) => {
    r.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigator("/home");
    } catch (err: any) {
      seterror(err.message);
    }
  };

  const handlegooglelogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigator("/home");
    } catch (err: any) {
      seterror(err.message);
    }
  };

  const handlefacebooklogin = async () => {
    const provider = new FacebookAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigator("/home");
    } catch (err: any) {
      seterror(err.message);
    }
  };

  return (
    <div className="login-div">
      <h2>INICIAR SESION</h2>
      <form className="form-form" onSubmit={handlelogin}>
        <input
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(a) => setemail(a.target.value)}
        />
        <input
          type="password"
          placeholder="******"
          value={password}
          onChange={(p) => setpassword(p.target.value)}
        />
        <button type="submit">Login</button>
        {error && <p>{error}</p>}
      </form>
      <p>
        ¿No tienes una cuenta? <Link to="/register">Regístrate</Link>
      </p>
      <button onClick={handlegooglelogin}>Google</button>
      <button onClick={handlefacebooklogin}>Facebook</button>
    </div>
  );
};

export default Login;
