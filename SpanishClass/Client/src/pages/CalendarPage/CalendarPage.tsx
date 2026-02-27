import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useCallback, useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost } from "../../api/api";
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
  const [selectedAvailabilityTitle, setSelectedAvailabilityTitle] =
    useState<string>("");
  const [showStudentBookingModal, setShowStudentBookingModal] = useState(false);
  const [selectedAvailabilityId, setSelectedAvailabilityId] = useState<
    string | null
  >(null);

  const fetchCalendarEvents = useCallback(() => {
    apiGet<any[]>("/booking/availabilities")
      .then((data) => {
        try {
          const mapped = (data || []).map((a: any) => {
            const start = a.startTime ?? a.start ?? a.date ?? a.startDate;
            const end = a.endTime ?? a.end ?? a.endDate;
            const isMine =
              role === "Professor" &&
              a.professorUserId?.toLowerCase() === userId?.toLowerCase();

            const bookedByMe = a.bookedByMe;

            const color = bookedByMe
              ? "#ffc107"
              : isMine
                ? "#2b8cff"
                : a.bookedSeats >= a.maxSeats
                  ? "#dc3545"
                  : "#28a745";

            return {
              id: a.id,
              title: `${a.name} - ${a.description} - ${a.professorName} - ${a.bookedSeats}/${a.maxSeats}`,
              start,
              end,
              color,
              editable: !!isMine,
              extendedProps: {
                professorUserId: a.professorUserId,
                isMine,
                bookedSeats: a.bookedSeats,
                maxSeats: a.maxSeats,
                bookedByMe,
              },
            };
          });
          setEvents(mapped);
        } catch (err) {
          setEvents(data as any[]);
        }
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
      setSelectedAvailabilityId(id);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert("Failed to load bookings");
    }
  };

  const handleStudentEventClick = (clickInfo: any) => {
    const event = clickInfo.event;
    const { bookedSeats, maxSeats } = event.extendedProps;

    if (bookedSeats >= maxSeats) {
      alert("No seats available");
      return;
    }

    setSelectedAvailabilityId(event.id);
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
          <div style={{ marginBottom: 12 }}>
            <label style={{ marginRight: 8 }}>Select Lesson:</label>
            <select
              value={selectedLessonId}
              onChange={(e) => setSelectedLessonId(e.target.value)}
              style={{ padding: "6px" }}
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
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            events={events}
            height="auto"
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
              }

              if (!bookedByMe && bookedSeats < maxSeats) {
                info.el.style.backgroundColor = "#28a745";
                info.el.style.color = "#fff";
              }

              if (bookedSeats >= maxSeats) {
                info.el.style.backgroundColor = "#dc3545";
                if (role !== "Professor") {
                  info.el.style.pointerEvents = "none";
                }
              }

              if (role === "Professor" && !isMine) {
                info.el.style.opacity = "0.5";
              }
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
                        deleteAvailability(selectedAvailabilityId!)
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
                    {JSON.stringify(selectedAvailabilityId)}
                    <button
                      onClick={() =>
                        deleteAvailability(selectedAvailabilityId!)
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
          {showStudentBookingModal && selectedAvailabilityId && (
            <StudentBookingModal
              availabilityId={selectedAvailabilityId}
              studentUserId={user.userId}
              onClose={() => {
                setShowStudentBookingModal(false);
                fetchCalendarEvents();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
