// src/api/sessions.js
import { API_BASE_URL, parseJsonResponse } from "./config";

const API = API_BASE_URL;

function auth() {
  const token = localStorage.getItem("auth_token") || localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getSessions() {
  const res = await fetch(`${API}/sessions`, { headers: auth() });
  return parseJsonResponse(res, "Fetch sessions failed");
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
  return parseJsonResponse(res, "Create session failed");
}
