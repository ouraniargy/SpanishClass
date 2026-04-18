import { useState } from "react";
import { apiPost } from "../../api/api";

export default function ValidateTicketPage() {
  const [bookingId, setBookingId] = useState("");
  const [result, setResult] = useState<any>();

  const handleValidateTicket = async (id: string) => {
    try {
      const res = await apiPost<{ received: string }>(
        "/booking/validate-ticket",
        { bookingId: id },
      );

      setResult(res);
    } catch (err: any) {
      alert(err?.message ?? "Validation failed");
    }
  };
  return (
    <div className="page-center">
      <div className="card">
        <h2>QR Ticket Validation</h2>

        <input
          placeholder="Enter Booking ID"
          value={bookingId}
          onChange={(e) => setBookingId(e.target.value)}
        />

        <button onClick={() => handleValidateTicket(bookingId)}>
          Validate Ticket
        </button>

        {result && (
          <p style={{ color: "green" }}>Ticket validated: {result.received}</p>
        )}
      </div>
    </div>
  );
}
