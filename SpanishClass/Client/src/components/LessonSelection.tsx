type Props = {
  role: string;
  selectedLessonId: string;
  setSelectedLessonId: (id: string) => void;
  lessons: any[];
};

export default function LessonSelection({
  role,
  selectedLessonId,
  setSelectedLessonId,
  lessons,
}: Props) {
  if (role !== "Professor") {
    return (
      <p style={{ marginBottom: 12, fontSize: 20 }}>
        Click on an event to book a seat.
        <br />
        Green means available, red means fully booked. Yellow means you have
        booked a seat, blue means it's your own current availability.
      </p>
    );
  }

  return (
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
            {l.name} - {l.level?.name} - {l.durationMinutes}min
          </option>
        ))}
      </select>
    </div>
  );
}
