import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../../api/api";
import "../sharedStyles.css";
import { RegisterRequest } from "./Register.Props";

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [role, setRole] = useState("Student");

  async function handleRegister() {
    const body: RegisterRequest = { email, password, name, surname, role };
    try {
      await apiPost("/account/register", body);
      navigate("/students", { replace: true });
    } catch {
      alert("Register failed");
    }
  }
  return (
    <div className="card">
      <h2>Register</h2>

      <h4>Name</h4>
      <input
        type="name"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <h4>Surname</h4>
      <input
        type="Surname"
        placeholder="Surname"
        value={surname}
        onChange={(e) => setSurname(e.target.value)}
      />

      <h4>Role</h4>
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="Student">Student</option>
        <option value="Professor">Professor</option>
      </select>

      <h4>Email</h4>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <h4>Password</h4>
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleRegister}>Register</button>
    </div>
  );
}
