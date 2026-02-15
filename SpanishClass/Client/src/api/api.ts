const API_URL = "https://localhost:7185/api";

export async function apiGet<T>(endpoint: string): Promise<T> {
  const userId = localStorage.getItem("userId");
  const headers: Record<string, string> = {};
  if (userId) {
    headers["X-User-Id"] = userId;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    headers,
    credentials: "include",
  });
  if (!res.ok) throw new Error("API error");
  return res.json();
}

export async function apiPost<T>(endpoint: string, body: unknown): Promise<T> {
  const userId = localStorage.getItem("userId");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (userId) {
    headers["X-User-Id"] = userId;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    credentials: "include",
  });
  if (!res.ok) throw new Error("API error");
  return res.json();
}

export async function apiDelete<T>(endpoint: string): Promise<T> {
  const userId = localStorage.getItem("userId");
  const headers: Record<string, string> = {};
  if (userId) {
    headers["X-User-Id"] = userId;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "DELETE",
    headers,
    credentials: "include",
  });
  if (!res.ok) throw new Error("API error");
  return res.json();
}

export async function apiPut<T>(endpoint: string, body: unknown): Promise<T> {
  const userId = localStorage.getItem("userId");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (userId) {
    headers["X-User-Id"] = userId;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
    credentials: "include",
  });
  if (!res.ok) throw new Error("API error");
  return res.json();
}
