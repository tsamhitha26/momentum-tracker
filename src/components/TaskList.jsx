// src/components/TaskList.jsx
import React, { useEffect, useMemo, useState } from "react";
import { pushTasksToServer } from "../utils/sync";
import { getUser } from "../utils/sync";

const FALLBACK_PROFILE = "guest";

export default function TaskList() {
  /** ------------------------------------------------------------
   * PROFILE-BASED LOCAL STORAGE KEY (user.id → correct bucket)
   * ------------------------------------------------------------ */
  const user = getUser();
  const profileId = user?.id || FALLBACK_PROFILE;
  const STORAGE_KEY = `momentum-tasks-${profileId}`;

  /** ------------------------------------------------------------
   * LOAD LOCAL TASKS (fast)
   * ------------------------------------------------------------ */
  const [tasks, setTasks] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  /** ------------------------------------------------------------
   * SYNC ACROSS TABS
   * ------------------------------------------------------------ */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === STORAGE_KEY) {
        try {
          setTasks(JSON.parse(e.newValue || "[]"));
        } catch {
          setTasks([]);
        }
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [STORAGE_KEY]);

  /** ------------------------------------------------------------
   * PERSIST LOCAL + PUSH TO SERVER
   * ------------------------------------------------------------ */
  const persist = (updated) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setTasks(updated);

    // PUSH TO SERVER (if logged in; offline → auto sync later)
    pushTasksToServer(updated);

    // notify FocusSummary / HistoryChart
    window.dispatchEvent(new Event("history-updated"));
  };

  /** ------------------------------------------------------------
   * FORM STATE
   * ------------------------------------------------------------ */
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editMinutes, setEditMinutes] = useState("");

  const genLocalId = () =>
    `local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  /** ------------------------------------------------------------
   * ADD TASK
   * ------------------------------------------------------------ */
  const handleAdd = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask = {
      localId: genLocalId(),
      title: title.trim(),
      minutes: minutes ? Number(minutes) : null,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    persist([newTask, ...tasks]);
    setTitle("");
    setMinutes("");
  };

  /** ------------------------------------------------------------
   * TOGGLE COMPLETE
   * ------------------------------------------------------------ */
  const toggle = (task) => {
    const id = task._id || task.id || task.localId;
    persist(
      tasks.map((t) =>
        (t._id || t.id || t.localId) === id
          ? { ...t, completed: !t.completed }
          : t
      )
    );
  };

  /** ------------------------------------------------------------
   * EDIT TASK
   * ------------------------------------------------------------ */
  const startEdit = (task) => {
    const id = task._id || task.localId;
    setEditingId(id);
    setEditTitle(task.title);
    setEditMinutes(task.minutes != null ? String(task.minutes) : "");
  };

  const saveEdit = (task) => {
    const id = task._id || task.localId;

    const updatedTitle = editTitle.trim();
    const updatedMinutes =
      editMinutes.trim() === "" ? null : Number(editMinutes);

    persist(
      tasks.map((t) =>
        (t._id || t.localId) === id
          ? { ...t, title: updatedTitle, minutes: updatedMinutes }
          : t
      )
    );

    setEditingId(null);
  };

  /** ------------------------------------------------------------
   * DELETE TASK
   * ------------------------------------------------------------ */
  const remove = (task) => {
    const id = task._id || task.localId;
    persist(tasks.filter((t) => (t._id || t.localId) !== id));
  };

  /** ------------------------------------------------------------
   * UI (unchanged)
   * ------------------------------------------------------------ */
  return (
    <section className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-white/20">
      {/* Header */}
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Tasks</h2>
        <span className="text-xs text-gray-500">Profile: {user?.username || "Guest"}</span>
      </div>

      {/* Add Form */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-5">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg bg-white/40 dark:bg-gray-700/40 text-gray-800 dark:text-gray-200 outline-none"
          placeholder="New task..."
        />
        <input
          value={minutes}
          onChange={(e) => setMinutes(e.target.value.replace(/[^\d]/g, ""))}
          className="w-20 px-3 py-2 rounded-lg bg-white/40 dark:bg-gray-700/40 text-gray-800 dark:text-gray-200 outline-none"
          placeholder="min"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 text-white shadow-md hover:scale-105 transition"
        >
          Add
        </button>
      </form>

      {/* Task List */}
      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {tasks.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-300">
            No tasks yet — add one ✨
          </div>
        ) : (
          tasks.map((t, idx) => {
            const id = t._id || t.localId || `local-${idx}`;
            const isEdit = editingId === id;

            return (
              <div
                key={id}
                className="flex items-center gap-3 bg-white/40 dark:bg-gray-700/40 px-4 py-3 rounded-xl shadow-sm border border-white/10"
              >
                <input
                  type="checkbox"
                  checked={!!t.completed}
                  onChange={() => toggle(t)}
                  className="w-4 h-4 accent-indigo-500"
                />

                <div className="flex-1 min-w-0">
                  {!isEdit ? (
                    <div className="flex justify-between items-center">
                      <span
                        className={`truncate ${
                          t.completed
                            ? "line-through text-gray-400"
                            : "text-gray-800 dark:text-gray-100"
                        }`}
                      >
                        {t.title}
                      </span>
                      {t.minutes && (
                        <span className="text-xs text-gray-500 dark:text-gray-300">
                          {t.minutes}m
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        className="flex-1 px-2 py-1 rounded-md bg-white/40 dark:bg-gray-800/40 text-gray-700 dark:text-gray-300 outline-none"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                      <input
                        className="w-20 px-2 py-1 rounded-md bg-white/40 dark:bg-gray-800/40 text-gray-700 dark:text-gray-300 outline-none"
                        value={editMinutes}
                        onChange={(e) =>
                          setEditMinutes(e.target.value.replace(/[^\d]/g, ""))
                        }
                        placeholder="min"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!isEdit ? (
                    <>
                      <button
                        onClick={() => startEdit(t)}
                        className="text-xs px-2 py-1 rounded-md bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(t)}
                        className="text-xs px-2 py-1 rounded-md bg-red-100 text-red-600 hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => saveEdit(t)}
                        className="text-xs px-2 py-1 rounded-md bg-green-100 text-green-700 hover:bg-green-200"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
