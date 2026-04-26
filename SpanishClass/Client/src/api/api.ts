const API_URL = "https://localhost:7185/api";

export async function apiGet<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error("API error");
  return res.json();
}

export async function apiPost<T>(endpoint: string, body: unknown): Promise<T> {
  const options: RequestInit = { method: "POST", credentials: "include" };

  if (body instanceof FormData) {
    options.body = body;
  } else {
    options.body = JSON.stringify(body);
    options.headers = { "Content-Type": "application/json" };
  }

  const res = await fetch(`${API_URL}${endpoint}`, options);

  if (!res.ok) throw new Error("API error");

  return res.json();
}

export async function apiDelete<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("API error");
  return res.json();
}

export async function apiPut<T>(endpoint: string, body: unknown): Promise<T> {
  const options: RequestInit = {
    method: "PUT",
    credentials: "include",
  };

  if (body instanceof FormData) {
    options.body = body;
  } else {
    options.body = JSON.stringify(body);
    options.headers = {
      "Content-Type": "application/json",
    };
  }

  const res = await fetch(`${API_URL}${endpoint}`, options);

  if (!res.ok) throw new Error("API error");

  return res.json() as Promise<T>;
}
