import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../../../api/api";
import { handleBack } from "../../../shared/handleBack";

export default function CreateLessonPage() {
  const [levels, setLevels] = useState<any[]>([]);
  const [levelId, setLevelId] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [maxSeats, setMaxSeats] = useState(30);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [lessonPhoto, setLessonPhoto] = useState<File | null>(null);
  const goBack = handleBack();

  useEffect(() => {
    fetch("https://localhost:7185/api/level")
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
      const formData = new FormData();

      formData.append("Name", name);
      formData.append("Description", description);
      formData.append("DurationMinutes", durationMinutes.toString());
      formData.append("MaxSeats", maxSeats.toString());
      formData.append("LevelId", levelId);

      if (lessonPhoto) {
        formData.append("LessonPhoto", lessonPhoto);
      }

      await apiPost("/lesson", formData);

      alert("Lesson created successfully");
      navigate("/viewLessons");
    } catch (err) {
      console.error(err);
      alert("Failed to create lesson");
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setLessonPhoto(e.target.files[0]);
  };

  return (
    <div className="page-center">
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

        <label>Lesson Photo</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />

        {lessonPhoto && (
          <img
            src={URL.createObjectURL(lessonPhoto)}
            alt="preview"
            style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: 8 }}
          />
        )}

        <button onClick={handleCreateLesson}>Create Lesson</button>

        <div>
          <button type="button" onClick={goBack}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
