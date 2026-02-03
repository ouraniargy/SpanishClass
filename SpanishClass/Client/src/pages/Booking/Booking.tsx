import { useState } from "react";
import { apiPost } from "../../api/api";
import { CreateBookingRequest } from "./Booking.Props";

export default function Bookings() {
  const [lessonId, setLessonId] = useState("");

  async function createBooking() {
    const body: CreateBookingRequest = { lessonId };
    await apiPost("/booking", body);
    alert("Booking created");
  }

  return (
    <div>
      <h2>Create Booking</h2>
      <input
        placeholder="Lesson Id"
        value={lessonId}
        onChange={(e) => setLessonId(e.target.value)}
      />
      <button onClick={createBooking}>Book</button>
    </div>
  );
}
