// src/api/users.js
// Use VITE_API_URL (should include "/api" suffix in production)
// e.g. VITE_API_URL=https://momentum-tracker-n277.onrender.com/api
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function register(username, password) {
  if (!username || !password) throw new Error("Username and password are required");

  const res = await fetch(`${API}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Registration failed");
  }

  return res.json();
}

export async function login(username, password) {
  if (!username || !password) throw new Error("Username and password are required");

  const res = await fetch(`${API}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Login failed");
  }

  const data = await res.json();
  localStorage.setItem("authToken", data.token);
  localStorage.setItem("username", data.user.username);

  return data;
}

export async function getProfile() {
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("No auth token found");

  const res = await fetch(`${API}/users/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Profile fetch failed");
  }

  return res.json();
}
