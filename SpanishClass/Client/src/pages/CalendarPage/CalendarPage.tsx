import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useCallback, useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost } from "../../api/api";
import AvailabilityModal from "../../components/AvailabilityModal";
import BookingSearch from "../../components/BookingSearch";
import LessonSelection from "../../components/LessonSelection";
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
  const [searchId, setSearchId] = useState("");

  const [searchLessonName, setSearchLessonName] = useState("");
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [selectedAvailabilityTitle, setSelectedAvailabilityTitle] =
    useState<string>("");
  const [showStudentBookingModal, setShowStudentBookingModal] = useState(false);
  const [showCancelBookingModal, setShowCancelBookingModal] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState<any | null>(
    null,
  );
  const goBack = handleBack();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 800);
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardsPerView = isMobile ? 1 : 2;
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 800);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    if (!searchEmail && !searchMobilePhone && !searchId && !searchLessonName) {
      alert("Enter email, phone, ID, or lesson name to search");
      return;
    }

    try {
      let result = await apiPost<Booking[]>("/booking/search-booking", {
        email: searchEmail,
        phone: searchMobilePhone,
        id: searchId,
        lessonName: searchLessonName.trim(),
        onlyMine: role === "Student",
        userId: userId,
        role: role,
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

  const fetchCalendarEvents = useCallback(async () => {
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
            title: `${a.name} - ${a.description} - ${a.professorName} - ${a.bookedSeats}/${a.maxSeats} - ${a.id}`,
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
              lessonPhoto: a.lessonPhoto,
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

  const handleProfessorEventClick = useCallback(
    async (clickInfo: any) => {
      const { id, title } = clickInfo.event;
      const { isMine, lessonPhoto } = clickInfo.event.extendedProps;

      if (!isMine || role !== "Professor") return;

      try {
        const students = await apiGet<any[]>(
          `/booking/availabilities/${id}/students`,
        );
        setStudentsForAvailability(students || []);
        setSelectedAvailabilityTitle(title);

        const photo = lessonPhoto || students[0]?.lessonPhoto || null;

        setSelectedAvailability({
          id,
          title,
          lessonPhoto: photo,
        });

        setShowModal(true);
      } catch (err) {
        console.error(err);
        alert("Failed to load bookings");
      }
    },
    [role],
  );

  const handleStudentEventClick = (clickInfo: any) => {
    const event = clickInfo.event;
    const { bookedSeats, maxSeats, bookedByMe } = event.extendedProps;

    const eventDate = new Date(event.start);
    const now = new Date();

    if (eventDate < now) {
      alert("You can only book future availabilities");
      return;
    }

    if (bookedSeats >= maxSeats && !bookedByMe) {
      alert("No seats available");
      return;
    }

    if (bookedByMe) {
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
    const start = new Date(selectionInfo.startStr);
    const end = new Date(selectionInfo.endStr);
    const now = new Date();

    if (start < now) {
      alert("You can only add availability in the future");
      return;
    }

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
    if (!availabilityId) {
      console.error("No availabilityId provided");
      return;
    }

    try {
      await apiDelete(`/booking/availabilities/${availabilityId}`);

      setShowModal(false);
      setSelectedAvailability(null);
      fetchCalendarEvents();

      alert("Availability deleted successfully");
    } catch (err) {
      console.error("Error deleting availability:", err);
      alert("Failed to delete availability");
    }
  };

  const markBookingAsMine = (availabilityId: string, bookingId: string) => {
    setEvents((prev) =>
      prev.map((evt) =>
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
    );
  };

  const unmarkBookingAsMine = (availabilityId: string) => {
    setEvents((prev) =>
      prev.map((evt) =>
        evt.id === availabilityId
          ? {
              ...evt,
              extendedProps: {
                ...evt.extendedProps,
                bookedByMe: false,
              },
            }
          : evt,
      ),
    );
  };

  const lessonImageUrl = selectedAvailability?.lessonPhoto
    ? `https://localhost:7185${selectedAvailability.lessonPhoto}`
    : undefined;

  return (
    <div>
      <div className="calendar-container">
        <div className="calendar-header">
          <h2>Calendar of Availabilities and Bookings</h2>
        </div>
        <LessonSelection
          role={role}
          selectedLessonId={selectedLessonId}
          setSelectedLessonId={setSelectedLessonId}
          lessons={lessons}
        />
        <div className="calendar-wrapper">
          <BookingSearch
            searchEmail={searchEmail}
            setSearchEmail={setSearchEmail}
            searchMobilePhone={searchMobilePhone}
            setSearchMobilePhone={setSearchMobilePhone}
            searchId={searchId}
            setSearchId={setSearchId}
            searchLessonName={searchLessonName}
            setSearchLessonName={setSearchLessonName}
            handleSearch={handleSearch}
            userRole={user.role}
            showSearchResults={showSearchResults}
            setShowSearchResults={setShowSearchResults}
            searchResult={searchResult}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            cardsPerView={cardsPerView}
            isMobile={isMobile}
            qrCodes={qrCodes}
            handleDownloadQr={handleDownloadQr}
          />
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
              const eventStart = info.event.start;

              if (!eventStart) return;
              const eventDate = new Date(eventStart);
              const now = new Date();

              if (eventDate < now) {
                info.el.style.backgroundColor = "#f10b1b";
                info.el.style.opacity = "0.6";
                return;
              }

              if (bookedByMe) {
                info.el.style.backgroundColor = "#ffc107";
                info.el.style.color = "#000";
                return;
              }

              if (isMine && bookedSeats >= maxSeats) {
                info.el.style.backgroundColor = "#a59899";
                info.el.style.color = "#fff";
                if (role !== "Professor") info.el.style.pointerEvents = "none";
                return;
              }

              if (bookedSeats >= maxSeats) {
                info.el.style.backgroundColor = "#dc3545";
                info.el.style.color = "#fff";
                if (role !== "Professor") info.el.style.pointerEvents = "none";
                return;
              }

              if (isMine && role === "Professor") {
                info.el.style.backgroundColor = "#28a745";
                info.el.style.color = "#fff";
                return;
              }

              info.el.style.backgroundColor = "#28a745";
              info.el.style.color = "#fff";
            }}
          />
          {selectedAvailability && (
            <AvailabilityModal
              show={showModal}
              onClose={() => {
                setShowModal(false);
                setSelectedAvailability(null);
              }}
              title={selectedAvailabilityTitle}
              students={studentsForAvailability}
              availabilityId={selectedAvailability.id}
              onDelete={deleteAvailability}
              lessonImage={lessonImageUrl}
            />
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
              markBookingAsMine={markBookingAsMine}
            />
          )}
          {showCancelBookingModal && selectedAvailability && (
            <CancelBookingModal
              booking={selectedAvailability}
              onClose={() => {
                setShowCancelBookingModal(false);
                unmarkBookingAsMine(selectedAvailability.id);
                fetchCalendarEvents();
              }}
              refreshCalendar={fetchCalendarEvents}
              markBookingAsMine={markBookingAsMine}
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
