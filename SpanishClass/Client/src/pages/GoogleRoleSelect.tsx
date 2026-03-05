import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiPost } from "../api/api";
import { useAuth } from "../components/AuthContext";

export default function GoogleRoleSelect() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth(); // <-- check if user already exists

  const queryParams = new URLSearchParams(location.search);
  const userId = queryParams.get("userId");

  const [role, setRole] = useState("Student");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initUser() {
      if (!userId || user) {
        // already have user or no userId → skip fetching
        setLoading(false);
        return;
      }

      try {
        const res = await apiPost<{
          userId: string;
          name: string;
          surname: string;
          role?: string;
        }>("/account/get-user", { userId });

        login({
          userId: res.userId,
          name: res.name,
          surname: res.surname,
          role: res.role || "",
        });

        if (res.role) {
          if (res.role === "Student") navigate("/students", { replace: true });
          else if (res.role === "Professor")
            navigate("/professors", { replace: true });
        }
      } catch (err) {
        console.error("Failed to init user:", err);
      } finally {
        setLoading(false);
      }
    }

    initUser();
  }, [userId, login, navigate, user]);

  async function handleRoleSelect() {
    if (!userId) return alert("No user id provided.");

    try {
      const updatedUser = await apiPost<{
        userId: string;
        name: string;
        surname: string;
        role: string;
      }>("/account/set-role", { userId, role });

      login({
        userId: updatedUser.userId,
        name: updatedUser.name,
        surname: updatedUser.surname,
        role: updatedUser.role,
      });

      if (role && role !== "select-role") {
        if (role === "Student") navigate("/students", { replace: true });
        else if (role === "Professor")
          navigate("/professors", { replace: true });
      }
    } catch (err) {
      alert(
        "Role selection failed: " +
          (err instanceof Error ? err.message : String(err)),
      );
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page-center">
      <div className="card">
        <h2>Select Your Role</h2>
        <p>Please select your role to continue:</p>

        <h4>Role</h4>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="Student">Student</option>
          <option value="Professor">Professor</option>
        </select>

        <button style={{ marginTop: "20px" }} onClick={handleRoleSelect}>
          Continue
        </button>
      </div>
    </div>
  );
}
