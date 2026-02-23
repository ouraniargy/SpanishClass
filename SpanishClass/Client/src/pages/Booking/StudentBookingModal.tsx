import { useState } from "react";
import { apiPost } from "../../api/api";
import { BookingDetails } from "./BookingDetails";

export default function StudentBookingModal({
  availabilityId,
  studentUserId,
  onClose,
}: {
  availabilityId: string;
  studentUserId: string;
  onClose: () => void;
}) {
  const [sendEmail, setSendEmail] = useState(false);
  const [booking, setBooking] = useState<BookingDetails | null>(null);

  const handleBook = async () => {
    try {
      const result: BookingDetails = await apiPost(
        `/booking/booking/${availabilityId}?studentUserId=${studentUserId}&sendEmail=${sendEmail}`,
        {},
      );
      setBooking(result);
      alert("Booking successful!");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Booking failed");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "24px",
          borderRadius: "8px",
          width: "80%",
          maxHeight: "90%",
          overflowY: "auto",
          position: "relative",
        }}
      >
        <button
          style={{
            position: "absolute",
            top: "12px",
            right: "20px",
            fontSize: "40px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
          }}
          onClick={onClose}
        >
          ×
        </button>

        {!booking ? (
          <>
            <h2>Book this lesson</h2>
            <label>
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={() => setSendEmail(!sendEmail)}
              />
              Send email
            </label>
            <br />
            <button onClick={handleBook} style={{ marginTop: 12 }}>
              Confirm Booking
            </button>
          </>
        ) : (
          <>
            <h2>Booking Confirmed!</h2>
            <p>
              <strong>Student:</strong> {booking.studentName}
            </p>
            <p>
              <strong>Lesson:</strong> {booking.lessonName}
            </p>
            <p>
              <strong>Description:</strong> {booking.description}
            </p>
            <p>
              <strong>Seat:</strong> {booking.seatNumber}
            </p>
            <p>
              <strong>Date:</strong> {new Date(booking.date).toLocaleString()}
            </p>
            <img
              src={booking.roomPhoto}
              alt="Room"
              style={{ width: "100%", maxHeight: 200 }}
            />
            <p>
              <strong>Email sent to:</strong> {booking.guestsEmails.join(", ")}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
