import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiDelete, apiGet, apiPut } from "../../../api/api";
import { handleBack } from "../../../shared/handleBack";
import "../Lesson.css";

interface UpdateLessonResponse {
  message: string;
  lessonPhoto: string | null;
}

export default function ViewLessonsPage() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [editPhoto, setEditPhoto] = useState<File | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const lessonsPerPage = 5;
  const totalPages = Math.ceil(lessons.length / lessonsPerPage);
  const indexOfLastLesson = currentPage * lessonsPerPage;
  const indexOfFirstLesson = indexOfLastLesson - lessonsPerPage;
  const currentLessons = lessons.slice(indexOfFirstLesson, indexOfLastLesson);
  const goBack = handleBack();

  const handleDelete = async (lessonId: string) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) {
      if (lessons.length - 1 <= (currentPage - 1) * lessonsPerPage) {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
      }
      return;
    }

    try {
      await apiDelete(`/lesson/${lessonId}`);
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
      name: lesson.name,
      description: lesson.description,
    });
  };

  const handleEditSave = async (lessonId: string) => {
    try {
      const formData = new FormData();
      formData.append("Name", editData.name);
      formData.append("Description", editData.description);
      formData.append("DurationMinutes", editData.durationMinutes.toString());
      formData.append("MaxSeats", editData.maxSeats.toString());
      if (editPhoto) {
        formData.append("LessonPhoto", editPhoto);
      }

      const updatedLesson = await apiPut<UpdateLessonResponse>(
        `/lesson/${lessonId}`,
        formData,
      );

      setLessons((prev) =>
        prev.map((l) =>
          l.id === lessonId
            ? {
                ...l,
                ...editData,
                lessonPhoto: updatedLesson.lessonPhoto || l.lessonPhoto,
              }
            : l,
        ),
      );

      setEditingId(null);
      setEditPhoto(null);
      setPreviewPhoto(null);

      alert("Lesson updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update lesson");
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditData({});
    setEditPhoto(null);
    setPreviewPhoto(null);
  };

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const data = await apiGet<any[]>("/lesson");
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

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (currentPage < 1) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  if (loading) {
    return (
      <div className="page-center">
        <div className="card">
          <h2>Loading lessons</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="page-center">
      <div className="card">
        <h2>Lessons</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {currentLessons.length === 0 ? (
          <p>No lessons created yet.</p>
        ) : (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #ccc" }}>
                  <th style={{ padding: "10px" }}>Level</th>
                  <th style={{ padding: "10px" }}>Lesson Name</th>
                  <th style={{ padding: "10px" }}>Description</th>
                  <th style={{ padding: "10px" }}>Duration (min)</th>
                  <th style={{ padding: "10px" }}>Max Seats</th>
                  <th style={{ padding: "10px" }}>Photo</th>
                  <th style={{ padding: "10px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentLessons.map((lesson) => (
                  <tr key={lesson.id}>
                    <td data-label="Level" style={{ padding: "10px" }}>
                      {lesson.level?.name}
                    </td>

                    <td data-label="Name" style={{ padding: "10px" }}>
                      {editingId === lesson.id ? (
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) =>
                            setEditData({ ...editData, name: e.target.value })
                          }
                        />
                      ) : (
                        lesson.name
                      )}
                    </td>

                    <td data-label="Description" style={{ padding: "10px" }}>
                      {editingId === lesson.id ? (
                        <input
                          type="text"
                          value={editData.description}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              description: e.target.value,
                            })
                          }
                        />
                      ) : (
                        lesson.description
                      )}
                    </td>

                    <td data-label="Duration (min)" style={{ padding: "10px" }}>
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

                    <td data-label="Max Seats" style={{ padding: "10px" }}>
                      {editingId === lesson.id ? (
                        <input
                          type="number"
                          value={editData.maxSeats}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              maxSeats: e.target.value,
                            })
                          }
                        />
                      ) : (
                        lesson.maxSeats
                      )}
                    </td>

                    <td data-label="Photo" style={{ padding: "10px" }}>
                      {editingId === lesson.id ? (
                        <>
                          <input
                            type="file"
                            onChange={(e) => {
                              if (!e.target.files) return;
                              const file = e.target.files[0];
                              setEditPhoto(file);
                              setPreviewPhoto(URL.createObjectURL(file));
                            }}
                          />

                          {(previewPhoto || lesson.lessonPhoto) && (
                            <img
                              src={
                                previewPhoto ||
                                `https://localhost:7185${lesson.lessonPhoto}`
                              }
                              alt="lesson"
                              style={{
                                width: "80px",
                                height: "60px",
                                objectFit: "cover",
                              }}
                            />
                          )}
                        </>
                      ) : (
                        lesson.lessonPhoto && (
                          <img
                            src={`https://localhost:7185${lesson.lessonPhoto}`}
                            alt="lesson"
                            style={{
                              width: "80px",
                              height: "60px",
                              objectFit: "cover",
                            }}
                          />
                        )
                      )}
                    </td>

                    <td data-label="Actions" style={{ padding: "10px" }}>
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
                          <Link
                            to={`/lessonEntries/${lesson.id}`}
                            style={{
                              background: "#b817ad",
                              color: "white",
                              padding: "5px 10px",
                              textDecoration: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            Entries
                          </Link>
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

            <div
              style={{
                marginTop: "20px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "15px",
              }}
            >
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                style={{
                  opacity: currentPage === 1 ? 0.5 : 1,
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                }}
              >
                Previous
              </button>
              <span style={{ whiteSpace: "nowrap" }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                style={{
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  cursor:
                    currentPage === totalPages ? "not-allowed" : "pointer",
                }}
              >
                Next
              </button>
            </div>
          </>
        )}

        <button onClick={() => navigate("/createLesson")}>
          Create New Lesson
        </button>

        <div>
          <button type="button" onClick={goBack}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
