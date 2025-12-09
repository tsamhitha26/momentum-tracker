// src/utils/sync.js

//----------------------------------------------------------
//  API BASE URL (Works on Netlify + Localhost)
//----------------------------------------------------------
export const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

//----------------------------------------------------------
//  STORAGE KEYS
//----------------------------------------------------------
const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_KEY = "auth_user";

function tasksKeyFor(userId) {
  return `momentum-tasks-${userId}`;
}
function sessionsKeyFor(userId) {
  return `momentum-sessions-${userId}`;
}

//----------------------------------------------------------
//  LOCAL STORAGE HELPERS
//----------------------------------------------------------
export function setToken(token) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}
export function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setUser(user) {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}
export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_USER_KEY) || "null");
  } catch {
    return null;
  }
}

export function getUserTasks() {
  const user = getUser();
  if (!user) return [];
  try {
    return JSON.parse(localStorage.getItem(tasksKeyFor(user.id)) || "[]");
  } catch {
    return [];
  }
}

export function getUserSessions() {
  const user = getUser();
  if (!user) return [];
  try {
    return JSON.parse(localStorage.getItem(sessionsKeyFor(user.id)) || "[]");
  } catch {
    return [];
  }
}

//----------------------------------------------------------
//  AUTH HELPERS (REGISTER + LOGIN)
//----------------------------------------------------------
export async function registerUser(username, password) {
  const res = await fetch(`${API}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Registration failed");

  setUser(data.user);
  setToken(data.token);

  localStorage.setItem(tasksKeyFor(data.user.id), JSON.stringify(data.tasks || []));
  localStorage.setItem(sessionsKeyFor(data.user.id), JSON.stringify(data.sessions || []));

  window.dispatchEvent(new Event("user-changed"));
  window.dispatchEvent(new Event("history-updated"));

  return data;
}

export async function loginUser(username, password) {
  const res = await fetch(`${API}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");

  setUser(data.user);
  setToken(data.token);

  localStorage.setItem(tasksKeyFor(data.user.id), JSON.stringify(data.tasks || []));
  localStorage.setItem(sessionsKeyFor(data.user.id), JSON.stringify(data.sessions || []));

  window.dispatchEvent(new Event("user-changed"));
  window.dispatchEvent(new Event("history-updated"));

  return data;
}

//----------------------------------------------------------
//  AUTH HEADER FOR SECURED ROUTES
//----------------------------------------------------------
function authHeader() {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

//----------------------------------------------------------
//  SYNC LOCAL → SERVER  (MOST IMPORTANT FIX)
//----------------------------------------------------------
export async function syncLocalToServer() {
  const user = getUser();
  if (!user) return null;

  const tasks = getUserTasks();
  const sessions = getUserSessions();

  const res = await fetch(`${API}/sync`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify({ tasks, sessions })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Sync failed");

  // Server returns canonical merged lists
  localStorage.setItem(tasksKeyFor(user.id), JSON.stringify(data.tasks || []));
  localStorage.setItem(sessionsKeyFor(user.id), JSON.stringify(data.sessions || []));

  // Trigger UI updates
  window.dispatchEvent(new Event("history-updated"));
  return data;
}

//----------------------------------------------------------
//  PUSH TASKS
//----------------------------------------------------------
export async function pushTasksToServer(tasks) {
  const user = getUser();
  if (!user) return;

  localStorage.setItem(tasksKeyFor(user.id), JSON.stringify(tasks));

  try {
    await fetch(`${API}/tasks`, {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify(tasks)
    });
  } catch (err) {
    console.warn("pushTasksToServer failed", err);
  }

  window.dispatchEvent(new Event("history-updated"));
}

//----------------------------------------------------------
//  PUSH SESSION (POMODORO COMPLETION)
//----------------------------------------------------------
export async function pushSessionToServer(session) {
  const user = getUser();
  if (!user) return;

  const key = sessionsKeyFor(user.id);
  const curr = getUserSessions();
  curr.unshift(session);

  localStorage.setItem(key, JSON.stringify(curr));

  try {
    await fetch(`${API}/sessions`, {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify(session)
    });
  } catch (err) {
    console.warn("pushSessionToServer failed", err);
  }

  window.dispatchEvent(new Event("history-updated"));
}

//----------------------------------------------------------
//  AUTO SYNC (ONLINE + USER CHANGE)
//----------------------------------------------------------
export function enableAutoSync() {
  window.addEventListener("online", async () => {
    try {
      await syncLocalToServer();
    } catch {}
  });

  window.addEventListener("user-changed", async () => {
    try {
      await syncLocalToServer();
    } catch {}
  });
}
