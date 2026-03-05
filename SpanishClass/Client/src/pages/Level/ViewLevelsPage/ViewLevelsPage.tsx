import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiDelete, apiGet, apiPut } from "../../../api/api";
import { handleBack } from "../../../shared/handleBack";
import "../../sharedStyles.css";

export default function ViewLevelsPage() {
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const levelsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(levels.length / levelsPerPage));
  const indexOfLastLevel = currentPage * levelsPerPage;
  const indexOfFirstLevel = indexOfLastLevel - levelsPerPage;
  const currentLevels = levels.slice(indexOfFirstLevel, indexOfLastLevel);
  const goBack = handleBack();

  const handleDelete = async (levelId: string) => {
    if (!window.confirm("Are you sure you want to delete this level?")) {
      if (levels.length - 1 <= (currentPage - 1) * levelsPerPage) {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
      }
      return;
    }

    try {
      await apiDelete(`/Level/${levelId}`);
      setLevels(levels.filter((l) => l.id !== levelId));
      alert("Level deleted successfully");
    } catch (err) {
      alert("Failed to delete level");
    }
  };

  const handleEditStart = (level: any) => {
    setEditingId(level.id);
    setEditData({
      price: level.price,
      name: level.name,
      description: level.description,
    });
  };

  const handleEditSave = async (levelId: string) => {
    try {
      await apiPut(`/Level/${levelId}`, editData);
      setLevels(
        currentLevels.map((l) =>
          l.id === levelId ? { ...l, ...editData } : l,
        ),
      );
      setEditingId(null);
      alert("Level updated successfully");
    } catch (err) {
      console.error("Error updating level:", err);
      alert("Failed to update level");
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        setLoading(true);
        const data = await apiGet<any[]>("/Level");
        setLevels(data);
        setError(null);
      } catch (err) {
        setError("Failed to load levels");
      } finally {
        setLoading(false);
      }
    };

    fetchLevels();
  }, []);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (loading) {
    return (
      <div className="page-center">
        <div className="card">
          <h2>Loading levels</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="page-center">
      <div className="card">
        <h2>Levels</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {currentLevels.length === 0 ? (
          <p>No levels created yet.</p>
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
                  <th style={{ padding: "10px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentLevels.map((level) => (
                  <tr key={level.id} style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: "10px" }}>{level.levelName}</td>
                    <td style={{ padding: "10px" }}>
                      {editingId === level.id ? (
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              name: e.target.value,
                            })
                          }
                        />
                      ) : (
                        level.name
                      )}
                    </td>
                    <td style={{ padding: "10px" }}>
                      {editingId === level.id ? (
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
                        level.description
                      )}
                    </td>
                    <td style={{ padding: "10px" }}>
                      {editingId === level.id ? (
                        <input
                          type="number"
                          value={editData.price}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              price: Number(e.target.value),
                            })
                          }
                        />
                      ) : (
                        level.price
                      )}
                    </td>
                    <td style={{ padding: "10px" }}>
                      {editingId === level.id ? (
                        <>
                          <button
                            onClick={() => handleEditSave(level.id)}
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
                            onClick={() => handleEditStart(level)}
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
                            onClick={() => handleDelete(level.id)}
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
              >
                Next
              </button>
            </div>
          </>
        )}

        <button onClick={() => navigate("/createLevel")}>
          Create New Level
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
