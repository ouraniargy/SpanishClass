import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiDelete, apiGet, apiPut } from "../../../api/api";
import "../../sharedStyles.css";

export default function ViewLessonsPage() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const navigate = useNavigate();

  const handleDelete = async (lessonId: string) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) {
      return;
    }

    try {
      await apiDelete(`/lesson/lesson/${lessonId}`);
      setLessons(lessons.filter((l) => l.id !== lessonId));
      alert("Lesson deleted successfully");
    } catch (err) {
      alert("Failed to delete lesson");
    }
  };

  const handleEditStart = (lesson: any) => {
    setEditingId(lesson.id);
    setEditData({
      durationMinutes: lesson.durationMinutes,
      maxSeats: lesson.maxSeats,
      lessonName: lesson.lessonName,
    });
  };

  const handleEditSave = async (lessonId: string) => {
    try {
      await apiPut(`/lesson/lesson/${lessonId}`, editData);
      setLessons(
        lessons.map((l) => (l.id === lessonId ? { ...l, ...editData } : l)),
      );
      setEditingId(null);
      alert("Lesson updated successfully");
    } catch (err) {
      console.error("Error updating lesson:", err);
      alert("Failed to update lesson");
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const data = await apiGet<any[]>("/lesson/lesson");
        setLessons(data);
        setError(null);
      } catch (err) {
        setError("Failed to load lessons");
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  if (loading) {
    return (
      <div className="card">
        <h2>Loading lessons</h2>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Lessons</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {lessons.length === 0 ? (
        <p>No lessons created yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #ccc" }}>
              <th style={{ padding: "10px" }}>Level</th>
              <th style={{ padding: "10px" }}>Lesson Name</th>
              <th style={{ padding: "10px" }}>Duration (min)</th>
              <th style={{ padding: "10px" }}>Max Seats</th>
              <th style={{ padding: "10px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((lesson) => (
              <tr key={lesson.id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "10px" }}>{lesson.levelName}</td>
                <td style={{ padding: "10px" }}>
                  {editingId === lesson.id ? (
                    <input
                      type="text"
                      value={editData.lessonName}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          lessonName: e.target.value,
                        })
                      }
                    />
                  ) : (
                    lesson.lessonName
                  )}
                </td>
                <td style={{ padding: "10px" }}>
                  {editingId === lesson.id ? (
                    <input
                      type="number"
                      value={editData.durationMinutes}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          durationMinutes: Number(e.target.value),
                        })
                      }
                    />
                  ) : (
                    lesson.durationMinutes
                  )}
                </td>
                <td style={{ padding: "10px" }}>
                  {editingId === lesson.id ? (
                    <input
                      type="number"
                      value={editData.maxSeats}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          maxSeats: Number(e.target.value),
                        })
                      }
                    />
                  ) : (
                    lesson.maxSeats
                  )}
                </td>
                <td style={{ padding: "10px" }}>
                  {editingId === lesson.id ? (
                    <>
                      <button
                        onClick={() => handleEditSave(lesson.id)}
                        style={{
                          background: "#28a745",
                          color: "white",
                          border: "none",
                          padding: "5px 10px",
                          cursor: "pointer",
                          marginRight: "5px",
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={handleEditCancel}
                        style={{
                          background: "#6c757d",
                          color: "white",
                          border: "none",
                          padding: "5px 10px",
                          cursor: "pointer",
                          marginRight: "5px",
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditStart(lesson)}
                        style={{
                          background: "#007bff",
                          color: "white",
                          border: "none",
                          padding: "5px 10px",
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(lesson.id)}
                        style={{
                          background: "#dc3545",
                          color: "white",
                          border: "none",
                          padding: "5px 10px",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button onClick={() => navigate("/createLesson")}>
        Create New Lesson
      </button>
    </div>
  );
}
