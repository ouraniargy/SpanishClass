import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useCallback, useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost } from "../../api/api";
import { handleBack } from "../../shared/handleBack";
import { Booking, QrResponse } from "../../shared/types";
import CancelBookingModal from "../Booking/CancelBookingModal";
import StudentBookingModal from "../Booking/StudentBookingModal";
import "./CalendarPage.css";

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  const [lessons, setLessons] = useState<any[]>([]);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?.userId;
  const role = user?.role;
  const [showModal, setShowModal] = useState(false);
  const [studentsForAvailability, setStudentsForAvailability] = useState<any[]>(
    [],
  );
  const [searchEmail, setSearchEmail] = useState("");
  const [searchMobilePhone, setSearchMobilePhone] = useState("");
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [selectedAvailabilityTitle, setSelectedAvailabilityTitle] =
    useState<string>("");
  const [showStudentBookingModal, setShowStudentBookingModal] = useState(false);
  const [showCancelBookingModal, setShowCancelBookingModal] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState<any | null>(
    null,
  );
  const goBack = handleBack();
  const isMobile = window.innerWidth < 768;
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardsPerView = 2;
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});

  const fetchQrCode = async (bookingId: string) => {
    try {
      const res = await apiGet<QrResponse>(`/booking/qrcode/${bookingId}`);

      console.log("QR RESPONSE:", res);

      setQrCodes((prev) => ({
        ...prev,
        [bookingId]: res.qrImageBase64,
      }));
    } catch (err) {
      console.error("Failed to load QR code", err);
    }
  };

  const handleSearch = async () => {
    if (!searchEmail && !searchMobilePhone) {
      alert("Enter email or phone to search");
      return;
    }

    try {
      const result = await apiPost<Booking[]>("/booking/search-booking", {
        email: searchEmail,
        phone: searchMobilePhone,
      });

      setSearchResult(result);
      await Promise.all(result.map((b) => fetchQrCode(b.bookingCode)));

      setCurrentIndex(0);
      setShowSearchResults(true);
    } catch (err) {
      alert("No booking found");
      setSearchResult([]);
      setShowSearchResults(false);
    }
  };

  const handleDownloadQr = (bookingCode: string) => {
    apiPost("/booking/qrcode/downloaded", {
      bookingCode,
      userId,
    });

    const link = document.createElement("a");
    link.href = `data:image/png;base64,${qrCodes[bookingCode]}`;
    link.download = `Booking-${bookingCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert("QR downloaded!");
  };

  const fetchCalendarEvents = useCallback(() => {
    apiGet<any[]>("/booking/availabilities")
      .then((data) => {
        const mapped = (data || []).map((a: any) => {
          const start = a.startTime ?? a.start ?? a.date ?? a.startDate;
          const end = a.endTime ?? a.end ?? a.endDate;

          const isMine =
            role === "Professor" &&
            a.professorUserId?.toLowerCase() === userId?.toLowerCase();

          const bookedByMe = a.bookedByMe;

          return {
            id: a.id,
            title: `${a.name} - ${a.description} - ${a.professorName} - ${a.bookedSeats}/${a.maxSeats}`,
            start,
            end,
            editable: !!isMine,
            extendedProps: {
              bookingId: a.bookingId,
              professorUserId: a.professorUserId,
              isMine,
              bookedSeats: a.bookedSeats,
              maxSeats: a.maxSeats,
              bookedByMe,
              bookingDetails: bookedByMe ? a : null,
            },
          };
        });

        setEvents(mapped);
      })
      .catch((err) => console.error("Failed to load calendar events:", err));
  }, [role, userId]);

  useEffect(() => {
    apiGet<any[]>("/lesson")
      .then((data) => {
        setLessons(data);
      })
      .catch((err) => console.error("Failed to load lessons:", err));
  }, []);

  useEffect(() => {
    fetchCalendarEvents();
  }, [fetchCalendarEvents]);

  const handleProfessorEventClick = async (clickInfo: any) => {
    const { id, title } = clickInfo.event;
    const { isMine } = clickInfo.event.extendedProps;

    if (!isMine || role !== "Professor") return;

    try {
      const students = await apiGet<any[]>(
        `/booking/availabilities/${id}/students`,
      );

      setStudentsForAvailability(students || []);
      setSelectedAvailabilityTitle(title);
      setSelectedAvailability(clickInfo.event);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert("Failed to load bookings");
    }
  };

  const handleStudentEventClick = (clickInfo: any) => {
    const event = clickInfo.event;
    const { bookedSeats, maxSeats, bookedByMe } = event.extendedProps;

    if (bookedSeats >= maxSeats && !bookedByMe) {
      alert("No seats available");
      return;
    }

    console.log(bookedByMe);
    if (event.extendedProps.bookedByMe) {
      setSelectedAvailability({
        id: event.extendedProps.bookingId,
        ...event,
      });
      setShowCancelBookingModal(true);
      return;
    }

    setSelectedAvailability(event);
    setShowStudentBookingModal(true);
  };

  const handleSelect = (selectionInfo: any) => {
    const start = selectionInfo.startStr;
    const end = selectionInfo.endStr;

    const confirmAdd = window.confirm(
      `Add availability from ${start} to ${end}?`,
    );
    if (!confirmAdd) return;

    if (!selectedLessonId) {
      alert("Please select a lesson before adding availability.");
      return;
    }

    const guidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    if (!guidRegex.test(selectedLessonId)) {
      alert("Selected lesson id is invalid.");
      return;
    }

    apiPost("/booking/addAvailability", {
      startTime: new Date(start).toISOString(),
      endTime: new Date(end).toISOString(),
      maxSeats: 1,
      lessonId: selectedLessonId,
    })
      .then((newEvent: any) => {
        fetchCalendarEvents();
        alert("Availability added successfully");
      })
      .catch((err) => {
        console.error("Error:", err);
        alert("Failed to add availability");
      });
  };

  const deleteAvailability = async (availabilityId: string) => {
    if (!availabilityId) return;

    try {
      await apiDelete(`/booking/availabilities/${availabilityId}`);
      fetchCalendarEvents();
      setShowModal(false);
      alert("Availability deleted successfully");
    } catch (err) {
      console.error("Error deleting availability:", err);
      alert("Failed to delete availability");
    }
  };

  return (
    <div>
      <div className="calendar-container">
        <div className="calendar-header">
          <h2>Calendar of Availabilities and Bookings</h2>
        </div>
        {role !== "Professor" ? (
          <p style={{ marginBottom: 12, fontSize: 20 }}>
            Click on an event to book a seat. Green means available, red means
            fully booked.
          </p>
        ) : (
          <div style={{ marginBottom: 12, width: "100%", maxWidth: "500px" }}>
            <label style={{ display: "block", marginBottom: 4 }}>
              Select Lesson:
            </label>
            <select
              value={selectedLessonId}
              onChange={(e) => setSelectedLessonId(e.target.value)}
              style={{ width: "100%", padding: "6px", boxSizing: "border-box" }}
            >
              <option value="" disabled>
                Select lesson
              </option>
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} - {l.levelName} - {l.durationMinutes}min
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="calendar-wrapper">
          <div style={{ marginBottom: 12, width: "100%", maxWidth: "500px" }}>
            <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
              <input
                type="email"
                placeholder="Enter email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                style={{
                  padding: "20px 30px",
                  flex: 1,
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  outline: "none",
                  fontSize: "14px",
                }}
              />

              <input
                placeholder="Enter mobile phone"
                value={searchMobilePhone}
                onChange={(e) => setSearchMobilePhone(e.target.value)}
                style={{
                  padding: "20px 30px",
                  flex: 1,
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  outline: "none",
                  fontSize: "14px",
                }}
              />

              <button
                onClick={handleSearch}
                style={{
                  padding: "10px 20px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  fontWeight: "500",
                  cursor: "pointer",
                  fontSize: "14px",
                  transition: "background-color 0.2s",
                }}
              >
                Search Booking
              </button>

              {showSearchResults && (
                <button
                  onClick={() => setShowSearchResults(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    fontSize: 20,
                    cursor: "pointer",
                  }}
                >
                  X
                </button>
              )}
            </div>
          </div>
          {showSearchResults && (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <button
                  onClick={() =>
                    setCurrentIndex((prev) => Math.max(prev - cardsPerView, 0))
                  }
                  disabled={currentIndex === 0}
                >
                  ◀
                </button>
                <button
                  onClick={() =>
                    setCurrentIndex((prev) =>
                      Math.min(
                        prev + cardsPerView,
                        searchResult.length - cardsPerView,
                      ),
                    )
                  }
                  disabled={currentIndex >= searchResult.length - cardsPerView}
                >
                  ▶
                </button>
              </div>

              <div style={{ display: "flex", gap: 10, overflow: "hidden" }}>
                {searchResult
                  .slice(currentIndex, currentIndex + cardsPerView)
                  .map((b: any) => (
                    <div
                      key={b.bookingCode}
                      style={{
                        flex: "0 0 50%",
                        background: "#f5f5f5",
                        padding: 20,
                        borderRadius: 8,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <h3>Welcome {b.studentName}</h3>

                      <p>
                        <b>Lesson:</b> {b.lesson}
                      </p>

                      <p>
                        <b>Description:</b> {b.description}
                      </p>

                      <p>
                        <b>Date:</b> {new Date(b.date).toLocaleString()}
                      </p>

                      {qrCodes[b.bookingCode] && (
                        <>
                          <img
                            src={`data:image/png;base64,${qrCodes[b.bookingCode]}`}
                            alt="Booking QR"
                            style={{ marginTop: 15, width: 140, height: 140 }}
                          />
                          <br />
                          <button
                            onClick={() => handleDownloadQr(b.bookingCode)}
                          >
                            Download QR
                          </button>
                        </>
                      )}
                    </div>
                  ))}
              </div>
            </>
          )}
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: isMobile
                ? "timeGridDay,dayGridMonth"
                : "timeGridWeek,dayGridMonth",
            }}
            height="auto"
            events={events}
            editable={user?.role === "Professor"}
            selectable={user?.role === "Professor"}
            selectMirror={true}
            select={handleSelect}
            eventClick={
              user?.role === "Professor"
                ? handleProfessorEventClick
                : handleStudentEventClick
            }
            eventDidMount={(info) => {
              const { bookedSeats, maxSeats, bookedByMe, isMine } =
                info.event.extendedProps;

              if (bookedByMe) {
                info.el.style.backgroundColor = "#ffc107";
                info.el.style.color = "#000";
                return;
              }

              if (isMine && bookedSeats >= maxSeats) {
                info.el.style.backgroundColor = "#dc3545";
                info.el.style.color = "#fff";
                if (role !== "Professor") info.el.style.pointerEvents = "none";
                return;
              }

              if (isMine) {
                info.el.style.backgroundColor = "#2b8cff";
                info.el.style.color = "#fff";
                return;
              }

              info.el.style.backgroundColor = "#28a745";
              info.el.style.color = "#fff";
            }}
          />
          {showModal && (
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
                  onClick={() => setShowModal(false)}
                >
                  ×
                </button>
                <h3>Bookings for: {selectedAvailabilityTitle}</h3>

                {studentsForAvailability.length === 0 ? (
                  <>
                    <p>No students have booked yet.</p>
                    <button
                      onClick={() =>
                        deleteAvailability(selectedAvailability?.id!)
                      }
                      style={{ marginTop: 12 }}
                    >
                      Delete Availability
                    </button>
                  </>
                ) : (
                  <>
                    {" "}
                    <table
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <thead>
                        <tr>
                          <th
                            style={{ border: "1px solid #ccc", padding: "8px" }}
                          >
                            #
                          </th>
                          <th
                            style={{ border: "1px solid #ccc", padding: "8px" }}
                          >
                            Name
                          </th>
                          <th
                            style={{ border: "1px solid #ccc", padding: "8px" }}
                          >
                            Email
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentsForAvailability.map((s, index) => (
                          <tr key={s.studentUserId || index}>
                            <td
                              style={{
                                border: "1px solid #ccc",
                                padding: "8px",
                              }}
                            >
                              {index + 1}
                            </td>
                            <td
                              style={{
                                border: "1px solid #ccc",
                                padding: "8px",
                              }}
                            >
                              {s.studentName}
                            </td>
                            <td
                              style={{
                                border: "1px solid #ccc",
                                padding: "8px",
                              }}
                            >
                              {s.studentEmail}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <button
                      onClick={() =>
                        deleteAvailability(selectedAvailability?.id!)
                      }
                      style={{ marginTop: 12 }}
                    >
                      Delete Availability
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
          {showStudentBookingModal && selectedAvailability?.id && (
            <StudentBookingModal
              availability={selectedAvailability}
              studentUserId={user.userId}
              onClose={() => {
                setShowStudentBookingModal(false);
                fetchCalendarEvents();
              }}
              refreshCalendar={fetchCalendarEvents}
              markBookingAsMine={(availabilityId, bookingId) =>
                setEvents((prevEvents) =>
                  prevEvents.map((evt) =>
                    evt.id === availabilityId
                      ? {
                          ...evt,
                          color: "#ffc107",
                          extendedProps: {
                            ...evt.extendedProps,
                            bookedByMe: true,
                            bookingId,
                            bookingDetails: {
                              ...evt.extendedProps.bookingDetails,
                              bookingId,
                            },
                          },
                        }
                      : evt,
                  ),
                )
              }
            />
          )}
          {showCancelBookingModal && selectedAvailability && (
            <CancelBookingModal
              booking={selectedAvailability}
              onClose={() => {
                setShowCancelBookingModal(false);
                fetchCalendarEvents();
              }}
              refreshCalendar={fetchCalendarEvents}
            />
          )}
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
    </div>
  );
}
