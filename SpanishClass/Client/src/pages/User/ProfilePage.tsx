import { useEffect, useState } from "react";
import { apiPost } from "../../api/api";
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
  const [photo, setPhoto] = useState<File | null>(null);

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
      const form = new FormData();

      form.append("userId", user!.userId);
      form.append("name", formData.name || "");
      form.append("surname", formData.surname || "");

      if (formData.password) {
        form.append("password", formData.password);
      }

      if (photo) {
        form.append("photo", photo);
      }

      const res = await fetch(
        "https://localhost:7185/api/account/update-user",
        { method: "PUT", body: form },
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Update failed:", errorText);
        return;
      }

      const data = await res.json();

      setFormData({
        ...formData,
        profilePicture: data.profilePicture,
      });

      login({
        userId: user!.userId,
        role: user!.role,
        name: formData.name,
        surname: formData.surname,
        profilePicture: data.profilePicture,
      });
      console.log("Profile updated:", data.profilePicture);
      alert("Profile updated!");
    } catch (err) {
      console.error(err);
    }
  };

  //   const profileSrc = formData.profilePicture?.startsWith("/uploads/")
  //     ? formData.profilePicture
  //     : "/uploads/" + formData.profilePicture;

  const displayPhoto = photo
    ? URL.createObjectURL(photo)
    : formData.profilePicture
      ? `https://localhost:7185/uploads/${user?.profilePicture}`
      : null;

  return (
    <div className="page-center">
      <div className="card">
        <h2>Profile</h2>
        {displayPhoto && (
          <img
            src={displayPhoto}
            alt="profile"
            style={{
              width: "50%",
              height: "50%",
              borderRadius: "20%",
              objectFit: "cover",
              marginBottom: "20px",
            }}
          />
        )}
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
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files) {
                setPhoto(e.target.files[0]);
              }
            }}
          />
          <button type="submit">Update Profile</button>
        </form>
      </div>
    </div>
  );
}
