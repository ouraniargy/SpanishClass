import { apiDelete } from "../../api/api";

export default function CancelBookingModal({
  booking,
  onClose,
  refreshCalendar,
  markBookingAsMine,
}: {
  booking: any;
  onClose: () => void;
  refreshCalendar: () => void;
  markBookingAsMine?: (availabilityId: string, bookingId: string) => void;
}) {
  const handleCancel = async () => {
    if (!booking) return;

    const confirmCancel = window.confirm("Cancel this booking?");
    if (!confirmCancel) return;

    try {
      await apiDelete(`/booking/${booking.id}`);
      if (markBookingAsMine && booking.extendedProps?.bookingId) {
        markBookingAsMine(booking.id, booking.extendedProps.bookingId);
      }

      await refreshCalendar();
      onClose();
      alert("Booking cancelled");
    } catch {
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
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        padding: 20,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "30px 24px",
          borderRadius: "12px",
          maxWidth: "400px",
          width: "100%",
          boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
        }}
      >
        <h2 style={{ margin: 0 }}>Cancel Booking</h2>
        <p style={{ margin: 0, fontSize: 14, color: "#555" }}>
          Are you sure you want to cancel this booking?
        </p>

        <button
          onClick={handleCancel}
          style={{
            padding: "10px 20px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 500,
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#c82333")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#dc3545")
          }
        >
          Cancel Booking
        </button>

        <button
          onClick={onClose}
          style={{
            padding: "8px 18px",
            backgroundColor: "#eee",
            color: "#333",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 500,
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ddd")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#eee")}
        >
          Close
        </button>
      </div>
    </div>
  );
}
