import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useCallback, useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost } from "../../api/api";
import "./CalendarPage.css";

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  const [lessons, setLessons] = useState<any[]>([]);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?.userId;
  const role = user?.role;

  const fetchCalendarEvents = useCallback(() => {
    apiGet<any[]>("/booking/booking/availabilities")
      .then((data) => {
        try {
          const mapped = (data || []).map((a: any) => {
            const start = a.startTime ?? a.start ?? a.date ?? a.startDate;
            const end = a.endTime ?? a.end ?? a.endDate;
            const isMine =
              role === "Professor" &&
              a.professorUserId?.toLowerCase() === userId?.toLowerCase();

            const color = isMine
              ? "#2b8cff"
              : a.bookedSeats >= a.maxSeats
                ? "#dc3545"
                : "#28a745";
            const lessonName = a.lessonName ?? "Lesson";
            const professorName = a.professorName ?? "";

            return {
              id: a.id,
              title: `${lessonName} - ${professorName}`,
              start: start,
              end: end,
              color,
              editable: !!isMine,
              extendedProps: { professorUserId: a.professorUserId, isMine },
            };
          });
          setEvents(mapped);
        } catch (err) {
          setEvents(data as any[]);
        }
      })
      .catch((err) => console.error("Failed to load calendar events:", err));
  }, [role]);

  useEffect(() => {
    apiGet<any[]>("/lesson/lesson")
      .then((data) => {
        setLessons(data);
      })
      .catch((err) => console.error("Failed to load lessons:", err));
  }, []);

  useEffect(() => {
    fetchCalendarEvents();
  }, [fetchCalendarEvents]);

  const handleEventClick = (clickInfo: any) => {
    const eventId = clickInfo.event.id;
    const { isMine } = clickInfo.event.extendedProps;

    if (!isMine || role !== "Professor") {
      alert("You can only delete your own availabilities");
      return;
    }

    const confirmed = window.confirm("Delete this availability?");
    if (!confirmed) return;

    apiDelete(`/booking/booking/availabilities/${eventId}`)
      .then(() => {
        fetchCalendarEvents();
        alert("Availability deleted successfully");
      })
      .catch((err) => {
        console.error("Error deleting availability:", err);
        alert("Failed to delete availability");
      });
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

    apiPost("/booking/booking/addAvailability", {
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

  return (
    <div>
      <div className="calendar-container">
        <div className="calendar-header">
          <h2>Calendar of Availabilities and Bookings</h2>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ marginRight: 8 }}>Select Lesson:</label>
          <select
            value={selectedLessonId}
            onChange={(e) => setSelectedLessonId(e.target.value)}
            style={{ padding: "6px" }}
          >
            <option value="" disabled>
              -- select lesson --
            </option>
            {lessons.map((l) => (
              <option key={l.id} value={l.id}>
                {l.levelName} - {l.durationMinutes}min
              </option>
            ))}
          </select>
        </div>

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
            eventClick={handleEventClick}
            eventDidMount={(info) => {
              if (!info.event.extendedProps.isMine) {
                info.el.style.opacity = "0.5";
                info.el.style.pointerEvents = "none";
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
