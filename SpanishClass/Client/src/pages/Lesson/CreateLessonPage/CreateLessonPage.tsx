import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../../../api/api";

export default function CreateLessonPage() {
  const [levels, setLevels] = useState<any[]>([]);
  const [levelId, setLevelId] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [maxSeats, setMaxSeats] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetch("https://localhost:7185/api/levels")
      .then((res) => res.json())
      .then((data) => setLevels(data))
      .catch((err) => console.error(err));
  }, []);

  const navigate = useNavigate();

  async function handleCreateLesson() {
    if (!levelId) {
      alert("Please select a level");
      return;
    }

    try {
      await apiPost("/lesson/lesson/lesson", {
        levelId,
        durationMinutes,
        maxSeats,
        name,
        description,
      });

      alert("Lesson created successfully");
      navigate("/viewLessons");
    } catch (err) {
      console.error(err);
      alert("Failed to create lesson");
    }
  }

  return (
    <div className="card">
      <h2>Create Lesson</h2>

      <label>Lesson Name</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label>Description</label>
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <label>Level</label>
      <select
        value={levelId}
        onChange={(e) => setLevelId(e.target.value)}
        disabled={levels.length === 0}
      >
        <option value="" disabled>
          Select Level
        </option>
        {levels.map((level) => (
          <option key={level.id} value={level.id}>
            {level.name}
          </option>
        ))}
      </select>

      <label>Duration (minutes)</label>
      <input
        type="number"
        value={durationMinutes}
        onChange={(e) => setDurationMinutes(Number(e.target.value))}
      />

      <label>Max Seats</label>
      <input
        type="number"
        value={maxSeats}
        onChange={(e) => setMaxSeats(Number(e.target.value))}
      />

      <button onClick={handleCreateLesson}>Create Lesson</button>
    </div>
  );
}
