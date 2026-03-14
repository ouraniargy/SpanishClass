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
        maxWidth: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 30px",
      }}
    >
      <div
        style={{
          fontSize: "18px",
          fontWeight: "600",
          letterSpacing: "0.5px",
        }}
      >
        Spanish Class
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
          fontSize: "14px",
          marginLeft: "auto",
        }}
      >
        <div
          style={{
            backgroundColor: "pink",
            padding: "6px 12px",
            borderRadius: "20px",
          }}
          onClick={() => navigate("/profile")}
        >
          👤 {user.name} {user.surname} | {user.role}{" "}
          {user.profilePicture && (
            <img
              src={`https://localhost:7185/uploads/${user.profilePicture}`}
              alt="profile"
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                marginLeft: "5px",
              }}
            />
          )}
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: "8px 14px",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "#ef4444",
            color: "white",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
