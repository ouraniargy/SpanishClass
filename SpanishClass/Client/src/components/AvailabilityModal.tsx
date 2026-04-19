import React, { useState } from "react";
import { apiPost } from "../api/api";
import QRScanner from "../shared/QRScanner";

type Student = {
  userId?: string;
  studentName: string;
  email: string;
};

type Props = {
  show: boolean;
  onClose: () => void;
  title: string;
  students: Student[];
  availabilityId?: string;
  onDelete: (id: string) => void;
  lessonImage?: string;
  entries?: any[];
  totalCheckedIn?: number;
  onValidateSuccess?: () => void;
};

const overlayStyle: React.CSSProperties = {
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
};

const modalStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  padding: "24px",
  borderRadius: "8px",
  width: "80%",
  maxHeight: "90%",
  overflowY: "auto",
  position: "relative",
};

const closeBtn: React.CSSProperties = {
  position: "absolute",
  top: "12px",
  right: "20px",
  fontSize: "40px",
  border: "none",
  background: "transparent",
  cursor: "pointer",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const thTd: React.CSSProperties = {
  border: "1px solid #ccc",
  padding: "8px",
};

export default function AvailabilityModal({
  show,
  onClose,
  title,
  students,
  availabilityId,
  onDelete,
  lessonImage,
  entries,
  totalCheckedIn,
  onValidateSuccess,
}: Props) {
  const [bookingInput, setBookingInput] = useState("");
  const [loading, setLoading] = useState(false);

  if (!show) return null;
  const handleValidate = async () => {
    if (!bookingInput) {
      alert("Enter booking ID");
      return;
    }

    try {
      setLoading(true);

      await apiPost("/booking/validate-ticket", {
        bookingId: bookingInput,
      });

      alert("✅ Checked in successfully");

      setBookingInput("");

      if (onValidateSuccess) {
        onValidateSuccess();
      }
    } catch (err) {
      alert("❌ Invalid or already used ticket");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button style={closeBtn} onClick={onClose}>
          ×
        </button>

        <h3>Bookings for: {title}</h3>
        {lessonImage && (
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <img
              src={lessonImage}
              alt={title}
              style={{
                maxWidth: "100%",
                maxHeight: "200px",
                borderRadius: 8,
              }}
            />
          </div>
        )}
        {students.length === 0 ? (
          <>
            <p>No students have booked yet.</p>
            <button
              onClick={() => availabilityId && onDelete(availabilityId)}
              style={{ marginTop: 12 }}
            >
              Delete Availability
            </button>
          </>
        ) : (
          <>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thTd}>#</th>
                  <th style={thTd}>Name</th>
                  <th style={thTd}>Email</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, index) => (
                  <tr key={s.userId || index}>
                    <td style={thTd}>{index + 1}</td>
                    <td style={thTd}>{s.studentName}</td>
                    <td style={thTd}>{s.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <hr style={{ margin: "20px 0" }} />

            <h3>Check-in</h3>

            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <input
                placeholder="Scan or enter booking ID"
                value={bookingInput}
                onChange={(e) => setBookingInput(e.target.value)}
                style={{ flex: 1, padding: "8px" }}
              />

              <button
                onClick={handleValidate}
                disabled={loading}
                style={{
                  background: "#28a745",
                  color: "white",
                  border: "none",
                  padding: "8px 12px",
                  cursor: "pointer",
                }}
              >
                {loading ? "Checking..." : "Validate"}
              </button>
            </div>

            <QRScanner onSuccess={onValidateSuccess} />

            <h3>Check-ins</h3>

            <p>
              <b>Total checked in:</b> {totalCheckedIn ?? 0}
            </p>

            {entries && entries.length > 0 ? (
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thTd}>#</th>
                    <th style={thTd}>Student</th>
                    <th style={thTd}>Seat</th>
                    <th style={thTd}>Entry Time</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, index) => (
                    <tr key={index}>
                      <td style={thTd}>{index + 1}</td>
                      <td style={thTd}>{e.studentName}</td>
                      <td style={thTd}>{e.seatNumber}</td>
                      <td style={thTd}>
                        {new Date(e.entryTime).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No one has checked in yet</p>
            )}

            <button
              onClick={() => availabilityId && onDelete(availabilityId)}
              style={{ marginTop: 12 }}
            >
              Delete Availability
            </button>
          </>
        )}
      </div>
    </div>
  );
}
