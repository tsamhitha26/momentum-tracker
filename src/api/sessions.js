// src/api/sessions.js
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function auth() {
  return { Authorization: `Bearer ${localStorage.getItem("authToken")}` };
}

export async function getSessions() {
  const res = await fetch(`${API}/sessions`, { headers: auth() });
  if (!res.ok) throw new Error("Fetch sessions failed");
  return res.json();
}

export async function createSession(session) {
  const res = await fetch(`${API}/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...auth(),
    },
    body: JSON.stringify(session),
  });
  if (!res.ok) throw new Error("Create session failed");
  return res.json();
}
