import { Link } from "react-router-dom";
import "../sharedStyles.css";

export default function ProfessorPage() {
  return (
    <>
      <div className="card">
        <h2>
          <Link to="/calendar">Calendar of Availabilities and Bookings</Link>
        </h2>
        <h2>
          <Link to="/createLesson">Add a lesson</Link>
        </h2>
      </div>
    </>
  );
}
