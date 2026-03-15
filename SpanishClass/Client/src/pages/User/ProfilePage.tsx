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
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    oldPassword: "",
    newPassword: "",
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
          oldPassword: "",
          newPassword: "",
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
    setError("");

    try {
      const form = new FormData();

      form.append("userId", user!.userId);
      form.append("name", formData.name || "");
      form.append("surname", formData.surname || "");

      form.append("oldPassword", formData.oldPassword || "");
      if (formData.newPassword) {
        form.append("newPassword", formData.newPassword);
      }

      if (photo) {
        form.append("photo", photo);
      }

      const res = await fetch(
        "https://localhost:7185/api/account/update-user",
        { method: "PUT", body: form },
      );

      if (!res.ok) {
        const errorData = await res.json();

        if (errorData[0]?.code === "PasswordMismatch") {
          setError(
            "The current password is incorrect. Profile was not updated.",
          );
        } else {
          setError(errorData[0]?.description || "Update failed.");
        }

        return;
      }

      const data = await res.json();

      setFormData({
        ...formData,
        profilePicture: data.profilePicture,
        oldPassword: "",
        newPassword: "",
      });

      login({
        userId: user!.userId,
        role: user!.role,
        name: formData.name,
        surname: formData.surname,
        profilePicture: data.profilePicture,
      });
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
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
            name="oldPassword"
            type="password"
            placeholder="Current Password"
            value={formData.oldPassword}
            onChange={handleChange}
          />

          <input
            name="newPassword"
            type="password"
            placeholder="New Password"
            value={formData.newPassword}
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
          {error && <p style={{ color: "red" }}>{error}</p>}

          <button type="submit">Update Profile</button>
        </form>
      </div>
    </div>
  );
}
