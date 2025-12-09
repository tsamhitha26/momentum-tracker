// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import TimerSection from "../components/TimerSection";
import TaskList from "../components/TaskList";
import FocusSummary from "../components/FocusSummary";
import HistoryChart from "../components/HistoryChart";
import SettingsModal from "../components/SettingsModal";

import {
  getUser,
  pushTasksToServer,
  enableAutoSync,
} from "../utils/sync";

/* ---------------------------------------------------------
   FIXED: getUserData() was missing → added below
--------------------------------------------------------- */
async function getUserData() {
  const user = getUser();
  if (!user) return { user: null, tasks: [], sessions: [] };

  // Load user's tasks from localStorage
  let tasks = [];
  try {
    const raw = localStorage.getItem("momentum-tasks-" + user.id);
    tasks = raw ? JSON.parse(raw) : [];
  } catch {
    tasks = [];
  }

  // Load sessions (TimerSection + sync.js writes these)
  let sessions = [];
  try {
    const raw = localStorage.getItem("momentum-sessions-" + user.id);
    sessions = raw ? JSON.parse(raw) : [];
  } catch {
    sessions = [];
  }

  return { user, tasks, sessions };
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);

  /* ---------------------------------------------------------
     Load user + tasks on mount / user change
  --------------------------------------------------------- */
  async function load() {
    const data = await getUserData();
    if (data?.user) setUser(data.user);
    if (Array.isArray(data?.tasks)) setTasks(data.tasks);
  }

  useEffect(() => {
    enableAutoSync();
    load();

    const reload = () => load();
    window.addEventListener("user-changed", reload);

    return () => {
      window.removeEventListener("user-changed", reload);
    };
  }, []);

  /* ---------------------------------------------------------
     Task Handlers
  --------------------------------------------------------- */
  const addTask = (title, minutes) => {
    const newTask = {
      title,
      minutes: minutes || null,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const next = [newTask, ...tasks];
    setTasks(next);
    pushTasksToServer(next);
  };

  const updateTask = (id, updates) => {
    const next = tasks.map((t) =>
      (t._id || t.id) === id ? { ...t, ...updates } : t
    );

    setTasks(next);
    pushTasksToServer(next);
  };

  const deleteTask = (id) => {
    const next = tasks.filter((t) => (t._id || t.id) !== id);
    setTasks(next);
    pushTasksToServer(next);
  };

  /* ---------------------------------------------------------
     FIXED: onComplete MUST NOT save sessions again.
     TimerSection already saves them.
  --------------------------------------------------------- */
  const saveSession = () => {
    // Only notify UI
    window.dispatchEvent(new Event("history-updated"));
  };

  /* ---------------------------------------------------------
     UI Layout (unchanged)
  --------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            <div className="glass p-6">
              <h2 className="text-xl font-semibold mb-4">Your Tasks</h2>
              <TaskList
                tasks={tasks}
                onAdd={addTask}
                onUpdate={updateTask}
                onDelete={deleteTask}
              />
            </div>

            <div className="glass p-6">
              <h2 className="text-xl font-semibold mb-4">Focus Timer</h2>
              <TimerSection 
                initialMinutes={25}
                onComplete={saveSession} // <-- FIX: No saving here
              />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            <div className="glass p-6">
              <h2 className="text-xl font-semibold mb-4">Today's Progress</h2>
              <FocusSummary />
            </div>

            <div className="glass p-6">
              <h2 className="text-xl font-semibold mb-4">Focus History</h2>
              <HistoryChart />
            </div>

            <div className="glass p-6">
              <h2 className="text-xl font-semibold mb-4">Settings</h2>
              <SettingsModal />
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
