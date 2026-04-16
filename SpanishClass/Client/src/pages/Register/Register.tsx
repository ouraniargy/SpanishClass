import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../components/AuthContext";
import "../sharedStyles.css";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [photo, setPhoto] = useState<File | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [role, setRole] = useState("Student");
  const [mobilePhone, setMobilePhone] = useState("");
  const [emailError, setEmailError] = useState("");
  const [serverError, setServerError] = useState("");

  async function handleRegister() {
    try {
      const formData = new FormData();

      formData.append("email", email);
      formData.append("password", password);
      formData.append("name", name);
      formData.append("surname", surname);
      formData.append("role", role);
      formData.append("mobilePhone", mobilePhone);

      if (photo) {
        formData.append("photo", photo);
      }

      const res = await fetch("https://localhost:7185/api/account/register", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();

        if (data.code === "EMAIL_EXISTS") {
          setServerError("This email is already registered");
        } else if (data.errors) {
          setServerError(data.errors.join(", "));
        } else {
          setServerError("Registration failed");
        }

        return;
      }

      const registeredUser = await res.json();

      login({
        userId: registeredUser.userId,
        name: registeredUser.name,
        surname: registeredUser.surname,
        role: registeredUser.role,
      });

      localStorage.setItem("user", JSON.stringify(registeredUser));
      localStorage.setItem("role", registeredUser.role);

      if (role === "Student") navigate("/students");
      else if (role === "Professor") navigate("/professors");
      else if (role === "Admin") navigate("/admins");
    } catch (err) {
      alert(
        "Register failed: " +
          (err instanceof Error ? err.message : String(err)),
      );
    }
  }

  return (
    <div className="page-center">
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
          <option value="Admin">Admin</option>
        </select>

        <h4>Photo</h4>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files) {
              setPhoto(e.target.files[0]);
            }
          }}
        />

        {photo && (
          <img
            src={URL.createObjectURL(photo)}
            alt="preview"
            style={{ width: "100px", borderRadius: "50%", marginTop: "10px" }}
          />
        )}

        <h4>Mobile Phone</h4>
        <input
          type="mobilePhone"
          placeholder="Mobile Phone"
          value={mobilePhone}
          onChange={(e) => setMobilePhone(e.target.value)}
        />

        <h4>Email</h4>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            const value = e.target.value;
            setEmail(value);

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              setEmailError("Invalid email format");
            } else {
              setEmailError("");
            }
          }}
        />

        <h4>Password</h4>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {emailError && <p style={{ color: "red" }}>{emailError}</p>}
        {serverError && <p style={{ color: "red" }}>{serverError}</p>}
        <button
          onClick={handleRegister}
          disabled={!!emailError || !email || !password || !name || !surname}
          style={{
            opacity:
              !!emailError || !email || !password || !name || !surname
                ? 0.5
                : 1,
            cursor:
              !!emailError || !email || !password || !name || !surname
                ? "not-allowed"
                : "pointer",
          }}
        >
          Register
        </button>
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
          Already have an account? <Link to="/login">Login</Link>
        </h5>
      </div>
    </div>
  );
}
