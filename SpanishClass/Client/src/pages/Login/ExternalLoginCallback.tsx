import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../components/AuthContext";

export default function ExternalLoginCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userId = params.get("userId");
    const role = params.get("role");
    const name = params.get("name");
    const surname = params.get("surname");

    if (userId && role && name && surname) {
      login({ userId, role, name, surname });

      if (role === "Student") navigate("/students", { replace: true });
      else if (role === "Professor") navigate("/professors", { replace: true });
      else navigate("/select-role", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [location.search, login, navigate]);

  return <div className="page-center">Logging in...</div>;
}
