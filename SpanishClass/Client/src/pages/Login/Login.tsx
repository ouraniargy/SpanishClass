import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost } from "../../api/api";
import { useAuth } from "../../components/AuthContext";
import "../sharedStyles.css";
import { LoginRequest } from "./Login.Props";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleLogin() {
    const body: LoginRequest = { email, password };
    try {
      const data = (await apiPost("/account/login", body)) as {
        userId: string;
        role: string;
        name: string;
        surname: string;
        profilePicture?: string;
      };

      login({
        userId: data.userId,
        role: data.role,
        name: data.name,
        surname: data.surname,
        profilePicture: data.profilePicture,
      });

      const role = data.role?.trim();
      if (role === "Student") {
        navigate("/students", { replace: true });
      } else if (role === "Professor") {
        navigate("/professors", { replace: true });
      } else if (role === "Admin") {
        navigate("/admins", { replace: true });
      } else {
        alert(`Unknown user role: ${data.role}`);
      }
    } catch (err) {
      alert(
        "Login failed: " + (err instanceof Error ? err.message : String(err)),
      );
    }
  }

  return (
    <div className="page-center">
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
        <a
          href="https://localhost:7185/api/account/external-login?provider=Google"
          style={{
            display: "block",
            marginTop: "20px",
            backgroundColor: "#4285F4",
            color: "white",
            fontWeight: "bold",
            padding: "10px",
            borderRadius: "8px",
            textAlign: "center",
            textDecoration: "none",
          }}
        >
          Login with Google
        </a>
        <h5>
          Don't have an account? <Link to="/register">Register</Link>
        </h5>
      </div>
    </div>
  );
}
