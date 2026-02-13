import { Link } from "react-router-dom";
import "../sharedStyles.css";

export default function StudentPage() {
  return (
    <>
      <div className="card">
        <h2>Calendar of Availabilities and Bookings</h2>

        <h5>
          <Link to="/calendar">View Calendar</Link>
        </h5>
      </div>
    </>
  );
}
