import { useState } from "react";
import { Link } from "react-router-dom";
import { apiPost } from "../../api/api";
import "../sharedStyles.css";
import { LoginRequest } from "./Login.Props";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    const body: LoginRequest = { email, password };
    try {
      await apiPost("/account/login", body);
      alert("Logged in");
    } catch {
      alert("Login failed");
    }
  }

  return (
    <>
      <div className="card">
        <h2>Login</h2>
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
        <button onClick={handleLogin}>Login</button>
        <h5>
          Don't have an account? <Link to="/register">Register</Link>
        </h5>
      </div>
    </>
  );
}
