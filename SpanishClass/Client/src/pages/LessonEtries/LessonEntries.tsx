import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiGet } from "../../api/api";

type EntryLog = {
  studentName: string;
  entryTime: string;
  seatNumber: number;
};

export default function LessonEntries() {
  const [entries, setEntries] = useState<EntryLog[]>([]);
  const { lessonId } = useParams<{ lessonId: string }>();

  useEffect(() => {
    if (!lessonId) return;

    const fetchEntries = async () => {
      try {
        const res = await apiGet<EntryLog[]>(`/lesson/${lessonId}/entries`);

        setEntries(res);
      } catch (err) {
        console.error("Failed to load entries:", err);
      }
    };

    fetchEntries();
  }, [lessonId]);

  return (
    <div className="page-center">
      <div className="card">
        <h2>Validated Tickets</h2>

        {!lessonId ? (
          <p>Invalid lesson</p>
        ) : entries.length === 0 ? (
          <p>No entries yet</p>
        ) : (
          <ul>
            {entries.map((e, i) => (
              <li key={i}>
                <b>{e.studentName}</b> — Seat {e.seatNumber} —{" "}
                {new Date(e.entryTime).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
