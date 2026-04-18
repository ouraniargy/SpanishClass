import "./LessonSelection.css";

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
    <div className="lesson-select">
      <label>Select Lesson:</label>

      <select
        value={selectedLessonId}
        onChange={(e) => setSelectedLessonId(e.target.value)}
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
