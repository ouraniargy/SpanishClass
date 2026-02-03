import { useState } from "react";
import { apiPost } from "../../api/api";
import { LoginRequest } from "./Login.Props";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function login() {
    const body: LoginRequest = { email, password };
    try {
      await apiPost("/account/login", body);
      alert("Logged in");
    } catch {
      alert("Login failed");
    }
  }

  return (
    <div>
      <h2>Login</h2>
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={login}>Login</button>
    </div>
  );
}
