// src/api/tasks.js
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function auth() {
  return { Authorization: `Bearer ${localStorage.getItem("authToken")}` };
}

export async function getTasks() {
  const res = await fetch(`${API}/tasks`, { headers: auth() });
  if (!res.ok) throw new Error("Fetch tasks failed");
  return res.json();
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
  if (!res.ok) throw new Error("Create task failed");
  return res.json();
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
  if (!res.ok) throw new Error("Update task failed");
  return res.json();
}

export async function deleteTask(id) {
  const res = await fetch(`${API}/tasks/${id}`, {
    method: "DELETE",
    headers: auth(),
  });
  if (!res.ok) throw new Error("Delete task failed");
  return true;
}
