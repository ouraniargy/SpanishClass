import React, { useEffect, useState } from "react";
import { apiGet } from "../../api/api";

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

export default function ViewBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(
    window.innerWidth < 800 ? 1 : 2,
  );

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
        const data = await apiGet<Booking[]>(`/booking/myAvailabilities`);
        setBookings(data);

        const qrPromises = data.map(async (b) => {
          const res = await apiGet<{ qrImageBase64: string }>(
            `/booking/qrcode/${b.bookingCode}`,
          );
          return {
            bookingCode: b.bookingCode,
            qrImageBase64: res.qrImageBase64,
          };
        });

        const qrResults = await Promise.all(qrPromises);
        const qrMap: Record<string, string> = {};
        qrResults.forEach((q) => (qrMap[q.bookingCode] = q.qrImageBase64));
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

  const handleDownloadQr = (bookingCode: string) => {
    const qrBase64 = qrCodes[bookingCode];
    if (!qrBase64) return alert("QR code not loaded yet");

    const link = document.createElement("a");
    link.href = `data:image/png;base64,${qrBase64}`;
    link.download = `Booking-${bookingCode}.png`;
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

  const cardStyle = (isMobile: boolean): React.CSSProperties => ({
    flex: isMobile ? "0 0 100%" : "0 0 50%",
    background: "#f5f5f5",
    padding: isMobile ? 15 : 20,
    borderRadius: 8,
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  });

  return (
    <div style={{ padding: 20 }}>
      <h2>My Bookings</h2>

      <div style={navWrapper}>
        <button
          onClick={() =>
            setCurrentIndex(Math.max(currentIndex - cardsPerView, 0))
          }
          disabled={currentIndex === 0}
          style={navBtn}
        >
          ◀
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
          ▶
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, overflow: "hidden" }}>
        {bookings.slice(currentIndex, currentIndex + cardsPerView).map((b) => (
          <div key={b.bookingCode} style={cardStyle(isMobile)}>
            <h3 style={{ fontSize: isMobile ? 16 : 18 }}>
              Welcome {b.studentName}
            </h3>
            <p>
              <b>Lesson:</b> {b.lessonName}
            </p>
            <p>
              <b>Description:</b> {b.description}
            </p>
            <p>
              <b>Date:</b> {new Date(b.start).toLocaleString()}
            </p>

            {qrCodes[b.bookingCode] && (
              <>
                <img
                  src={`data:image/png;base64,${qrCodes[b.bookingCode]}`}
                  alt="Booking QR"
                  style={{
                    marginTop: 15,
                    width: isMobile ? 120 : 140,
                    height: isMobile ? 120 : 140,
                  }}
                />
                <button
                  style={downloadBtn}
                  onClick={() => handleDownloadQr(b.bookingCode)}
                >
                  Download QR
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
