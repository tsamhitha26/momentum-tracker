// src/api/tasks.js
import { API_BASE_URL, parseJsonResponse } from "./config";

const API = API_BASE_URL;

function auth() {
  const token = localStorage.getItem("auth_token") || localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getTasks() {
  const res = await fetch(`${API}/tasks`, { headers: auth() });
  return parseJsonResponse(res, "Fetch tasks failed");
}

export async function createTask(task) {
  const res = await fetch(`${API}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...auth(),
    },
    body: JSON.stringify(task),
  });
  return parseJsonResponse(res, "Create task failed");
}

export async function updateTask(id, updates) {
  const res = await fetch(`${API}/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...auth(),
    },
    body: JSON.stringify(updates),
  });
  return parseJsonResponse(res, "Update task failed");
}

export async function deleteTask(id) {
  const res = await fetch(`${API}/tasks/${id}`, {
    method: "DELETE",
    headers: auth(),
  });
  if (!res.ok) throw new Error("Delete task failed");
  return true;
}
