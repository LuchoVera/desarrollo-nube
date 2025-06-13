import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebaseinit";
import { doc, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./register.css";

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [direccion, setDireccion] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState<Date | null>(null);
  const [edad, setEdad] = useState("");
  const [error, setError] = useState("");
  const navigator = useNavigate();

  const handleRegister = async (f: React.FormEvent) => {
    f.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "usuarios", user.uid), {
        uid: user.uid,
        email: user.email,
        direccion: direccion,
        fechaNacimiento: fechaNacimiento,
        edad: Number(edad),
      });

      navigator("/home");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="register-div">
      <h2>REGISTRO</h2>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="email@correo.com"
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
        <input
          type="text"
          placeholder="Dirección"
          value={direccion}
          onChange={(d) => setDireccion(d.target.value)}
          required
        />

        <DatePicker
          selected={fechaNacimiento}
          onChange={(date: Date | null) => setFechaNacimiento(date)}
          placeholderText="Fecha de Nacimiento"
          dateFormat="dd/MM/yyyy"
          showYearDropdown
          dropdownMode="select"
          required
          className="custom-datepicker"
        />

        <input
          type="number"
          placeholder="Edad"
          value={edad}
          onChange={(e) => setEdad(e.target.value)}
          required
        />
        <button type="submit">Registrarse</button>
        {error && <p style={{ color: "var(--error-color)" }}>{error}</p>}
      </form>
      <p>
        ¿Ya tienes una cuenta? <Link to="/">Inicia sesión</Link>
      </p>
    </div>
  );
};

export default Register;
