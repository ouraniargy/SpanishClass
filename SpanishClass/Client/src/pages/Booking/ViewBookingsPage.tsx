import React, { useEffect, useState } from "react";
import { apiGet } from "../../api/api";
import { handleBack } from "../../shared/handleBack";

interface Booking {
  id: string;
  bookingId: string;
  bookingCode: string;
  lessonName: string;
  title: string;
  description: string;
  ProfessorName: string;
  start: string;
  end: string;
  bookedSeats: number;
  maxSeats: number;
  studentName: string;
}

const containerStyle: React.CSSProperties = {
  maxWidth: "2000px",
  margin: "0 auto",
  padding: 15,
};

const titleStyle: React.CSSProperties = {
  textAlign: "center",
  marginBottom: 20,
};

const cardsContainer: React.CSSProperties = {
  gap: 20,
};

const qrBox: React.CSSProperties = {
  marginTop: 15,
  padding: 15,
  background: "#f9fafb",
  borderRadius: 10,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const labelStyle: React.CSSProperties = {
  fontWeight: 600,
};

const cardStyle = (isMobile: boolean): React.CSSProperties => ({
  flex: isMobile ? "0 0 100%" : "0 0 calc(50% - 10px)",
  background: "#ffffff",
  padding: 20,
  borderRadius: 12,
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginBottom: 20,
  marginTop: 20,
});

export default function ViewBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(
    window.innerWidth < 800 ? 1 : 2,
  );
  const goBack = handleBack();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?.userId;
  const isMobile = window.innerWidth < 800;

  useEffect(() => {
    const handleResize = () => setCardsPerView(window.innerWidth < 800 ? 1 : 2);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await apiGet<any[]>("/booking/availabilities");
        setBookings(data);

        const qrPromises = data.map(async (b) => {
          const res = await apiGet<{ qrImageBase64: string }>(
            `/booking/qrcode/${b.bookingId}`,
          );
          return {
            bookingId: b.bookingId,
            qrImageBase64: res.qrImageBase64,
          };
        });

        const qrResults = await Promise.all(qrPromises);
        const qrMap: Record<string, string> = {};
        qrResults.forEach((q) => (qrMap[q.bookingId] = q.qrImageBase64));
        setQrCodes(qrMap);
      } catch (err) {
        console.error(err);
        setError("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userId]);

  const handleDownloadQr = (bookingId: string) => {
    const qrBase64 = qrCodes[bookingId];
    if (!qrBase64) return alert("QR code not loaded yet");

    const link = document.createElement("a");
    link.href = `data:image/png;base64,${qrBase64}`;
    link.download = `Booking-${bookingId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert("QR downloaded!");
  };

  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!bookings.length) return <p>No bookings found.</p>;

  const navWrapper = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
  };
  const navBtn = { padding: "10px", fontSize: "18px", cursor: "pointer" };
  const downloadBtn = {
    marginTop: 10,
    padding: "10px",
    width: "100%",
    borderRadius: "6px",
    border: "none",
    background: "#10b981",
    color: "white",
    cursor: "pointer",
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>My Bookings</h2>

      <div style={navWrapper}>
        <button
          onClick={() =>
            setCurrentIndex(Math.max(currentIndex - cardsPerView, 0))
          }
          disabled={currentIndex === 0}
          style={navBtn}
        >
          ◀ Previous
        </button>

        <button
          onClick={() =>
            setCurrentIndex(
              Math.min(
                currentIndex + cardsPerView,
                bookings.length - cardsPerView,
              ),
            )
          }
          disabled={currentIndex >= bookings.length - cardsPerView}
          style={navBtn}
        >
          Next ▶
        </button>
      </div>

      <div style={cardsContainer}>
        {bookings.slice(currentIndex, currentIndex + cardsPerView).map((b) => (
          <div key={b.bookingId} style={cardStyle(isMobile)}>
            <h3>{b.studentName}</h3>

            <p>
              <span style={labelStyle}>Lesson:</span> {b.lessonName}
            </p>

            <p>
              <span style={labelStyle}>Description:</span> {b.description}
            </p>
            <p>
              <b>Unique number of reservation:</b> {b.id}
            </p>

            <p>
              <span style={labelStyle}>Date:</span>{" "}
              {new Date(b.start).toLocaleString()}
            </p>

            {qrCodes[b.bookingId] && (
              <div style={qrBox}>
                <img
                  src={`data:image/png;base64,${qrCodes[b.bookingId]}`}
                  alt="Booking QR"
                  style={{
                    width: isMobile ? 120 : 140,
                    height: isMobile ? 120 : 140,
                  }}
                />

                <button
                  style={downloadBtn}
                  onClick={() => handleDownloadQr(b.bookingId)}
                >
                  Download QR
                </button>
              </div>
            )}
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={goBack}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
