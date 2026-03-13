import { useEffect, useState } from "react";
import { apiPost, apiPut } from "../../api/api";
import { useAuth } from "../../components/AuthContext";

interface UserProfile {
  name: string;
  surname: string;
  email: string;
  profilePicture?: string;
}

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    profilePicture: "",
  });

  useEffect(() => {
    if (!user?.userId) return;

    async function fetchProfile() {
      try {
        const data = await apiPost<UserProfile>("/account/get-user", {
          userId: user?.userId,
        });

        setFormData({
          name: data.name,
          surname: data.surname,
          email: data.email,
          password: "",
          profilePicture: data.profilePicture || "",
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    }

    fetchProfile();
  }, [user?.userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await apiPut("/account/update-user", {
        userId: user?.userId,
        name: formData.name,
        surname: formData.surname,
        password: formData.password,
      });

      login({
        userId: user!.userId,
        role: user!.role,
        name: formData.name,
        surname: formData.surname,
      });

      alert("Profile updated!");
    } catch (err) {
      alert(
        "Update failed: " + (err instanceof Error ? err.message : String(err)),
      );
    }
  };

  return (
    <div className="page-center">
      <div className="card">
        <h2>Profile</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
          />
          <input
            name="surname"
            placeholder="Surname"
            value={formData.surname}
            onChange={handleChange}
          />
          <input
            name="email"
            placeholder="Email"
            readOnly
            value={formData.email}
            onChange={handleChange}
          />
          <input
            name="password"
            type="password"
            placeholder="New Password"
            value={formData.password}
            onChange={handleChange}
          />
          <input
            name="profilePicture"
            placeholder="Profile Picture URL"
            value={formData.profilePicture}
            onChange={handleChange}
          />
          <button type="submit">Update Profile</button>
        </form>
      </div>
    </div>
  );
}
