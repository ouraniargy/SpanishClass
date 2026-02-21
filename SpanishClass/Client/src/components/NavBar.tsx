import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  if (!user) return null;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "15px",
      }}
    >
      <div>Spanish Class</div>

      <div>
        👤 {user.name} {user.surname} | {user.role}
        <button onClick={handleLogout} style={{ marginLeft: "15px" }}>
          Logout
        </button>
      </div>
    </div>
  );
}
