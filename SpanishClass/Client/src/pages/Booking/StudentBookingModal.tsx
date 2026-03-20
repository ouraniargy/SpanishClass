import { useState } from "react";
import { apiDelete, apiPost } from "../../api/api";
import { BookingDetails } from "./BookingDetails";

export default function StudentBookingModal({
  availability,
  studentUserId,
  onClose,
  refreshCalendar,
  markBookingAsMine,
}: {
  availability: any;
  studentUserId: string;
  onClose: () => void;
  refreshCalendar: () => void;
  markBookingAsMine: (availabilityId: string, bookingId: string) => void;
}) {
  const [sendEmail, setSendEmail] = useState(false);
  const [booking, setBooking] = useState<BookingDetails | null>(null);

  const handleBook = async () => {
    try {
      const result = await apiPost<BookingDetails>(
        `/booking/${availability.id}?studentUserId=${studentUserId}`,
        {},
      );

      if (result.bookingId) {
        markBookingAsMine(availability.id, result.bookingId);
      }

      setBooking(result);
      alert("Booking successful!");
    } catch (err) {
      console.error(err);
      alert("Booking failed");
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;

    const confirmCancel = window.confirm("Cancel this booking?");
    if (!confirmCancel) return;

    try {
      await apiDelete(`/booking/${booking.bookingId}`);
      alert("Booking cancelled");
      setBooking(null);
      refreshCalendar();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to cancel booking");
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
            <h2>Book this lesson: {availability.title}</h2>
            <label>
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={() => setSendEmail(!sendEmail)}
              />
              Send email
            </label>
            <br />
            <button
              onClick={handleBook}
              style={{ marginTop: 12, padding: "10px 20px" }}
            >
              Confirm Booking
            </button>
          </>
        ) : (
          <>
            <h1 style={{ color: "#394d67", fontSize: "30px" }}>
              Booking Confirmed!
            </h1>
            <p>
              <strong>Date:</strong> {new Date(booking.date).toLocaleString()}
            </p>
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
              <strong>Unique number of reservation:</strong> {booking.bookingId}
            </p>

            <button
              onClick={handleCancelBooking}
              style={{
                marginTop: 15,
                padding: "10px 20px",
                background: "#dc3545",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              Cancel Booking
            </button>
          </>
        )}
      </div>
    </div>
  );
}
