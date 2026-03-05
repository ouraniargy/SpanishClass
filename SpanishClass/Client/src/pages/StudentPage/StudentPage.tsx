import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../components/AuthContext";
import "../sharedStyles.css";

export default function StudentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userId = params.get("userId");
    const name = params.get("name");
    const surname = params.get("surname");
    const role = params.get("role");

    if (userId && role) {
      login({
        userId,
        name: name ?? "",
        surname: surname ?? "",
        role,
      });

      navigate("/students", { replace: true });
    }
  }, [location, login, navigate]);

  return (
    <div className="page-center">
      <div className="card">
        <h2>
          <Link to="/calendar">Calendar of Availabilities and Bookings</Link>
        </h2>
      </div>
    </div>
  );
}
