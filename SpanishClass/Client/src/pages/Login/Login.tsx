import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost } from "../../api/api";
import "../sharedStyles.css";
import { LoginRequest } from "./Login.Props";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleLogin() {
    const body: LoginRequest = { email, password };
    try {
      const data = (await apiPost("/account/login", body)) as {
        userId: string;
        role: string;
      };

      console.log("Login response:", data);

      localStorage.setItem(
        "user",
        JSON.stringify({ userId: data.userId, role: data.role }),
      );

      const role = data.role;

      switch (role) {
        case "Student":
          navigate("/students", { replace: true });
          // console.log("Login response:", data);
          break;
        case "Professor":
          navigate("/professors", { replace: true });
          break;
        default:
          alert(`Unknown user role: ${data.role}`);
      }
    } catch (err) {
      alert(
        "Login failed: " + (err instanceof Error ? err.message : String(err)),
      );
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
