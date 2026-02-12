const API_URL = "https://localhost:7185/api";

export async function apiGet<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`);
  if (!res.ok) throw new Error("API error");
  return res.json();
}

export async function apiPost<T>(endpoint: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
  if (!res.ok) throw new Error("API error");
  return res.json();
}
