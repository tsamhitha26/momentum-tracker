// src/api/users.js
import { API_BASE_URL, parseJsonResponse } from "./config";

const API = API_BASE_URL;

export async function register(username, password) {
  if (!username || !password) throw new Error("Username and password are required");

  const res = await fetch(`${API}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  return parseJsonResponse(res, "Registration failed");
}

export async function login(username, password) {
  if (!username || !password) throw new Error("Username and password are required");

  const res = await fetch(`${API}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await parseJsonResponse(res, "Login failed");
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

  return parseJsonResponse(res, "Profile fetch failed");
}
