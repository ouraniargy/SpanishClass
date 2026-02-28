import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../../../api/api";
import { handleBack } from "../../../shared/handleBack";

export default function CreateLevelPage() {
  const [price, setPrice] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const goBack = handleBack();
  const navigate = useNavigate();

  async function handleCreateLevel() {
    try {
      await apiPost("/Level", {
        price,
        name,
        description,
      });

      alert("Level created successfully");
      navigate("/viewLevels");
    } catch (err) {
      console.error(err);
      alert("Failed to create level");
    }
  }

  return (
    <div className="card">
      <h2>Create Level</h2>

      <label>Level Name</label>
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

      <label>Price (euros)</label>
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
      />

      <button onClick={handleCreateLevel}>Create Level</button>

      <div>
        <button type="button" onClick={goBack}>
          Back
        </button>
      </div>
    </div>
  );
}
