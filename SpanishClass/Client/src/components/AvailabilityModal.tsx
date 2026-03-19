import React from "react";

type Student = {
  studentUserId?: string;
  studentName: string;
  studentEmail: string;
};

type Props = {
  show: boolean;
  onClose: () => void;
  title: string;
  students: Student[];
  availabilityId?: string;
  onDelete: (id: string) => void;
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
}: Props) {
  if (!show) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button style={closeBtn} onClick={onClose}>
          ×
        </button>

        <h3>Bookings for: {title}</h3>

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
                  <tr key={s.studentUserId || index}>
                    <td style={thTd}>{index + 1}</td>
                    <td style={thTd}>{s.studentName}</td>
                    <td style={thTd}>{s.studentEmail}</td>
                  </tr>
                ))}
              </tbody>
            </table>

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
