import { useState } from "react";

export default function AdminAssignPage() {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("Student");

  const handleAssign = async () => {
    try {
      const res = await fetch(
        "https://localhost:7185/api/account/assign-role",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            userId,
            role,
          }),
        },
      );

      if (res.status === 403) {
        alert("You are not authorized to assign roles.");
        return;
      }

      if (res.status === 401) {
        alert("You must be logged in.");
        return;
      }

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
      }

      alert("Role assigned successfully!");
    } catch (err) {
      alert("Error: " + (err instanceof Error ? err.message : err));
    }
  };

  return (
    <div className="page-center">
      <div className="card">
        <h2>Assign Role (Admin)</h2>

        <h4>User ID</h4>
        <input
          placeholder="Enter user ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />

        <h4>Role</h4>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="Student">Student</option>
          <option value="Professor">Professor</option>
          <option value="Admin">Admin</option>
        </select>

        <button onClick={handleAssign}>Assign Role</button>
      </div>
    </div>
  );
}
