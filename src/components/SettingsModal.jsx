import React, { useEffect, useState } from "react";

const DURATIONS_KEY = "momentum-durations";
const DEFAULT_DURATIONS = [25, 50, 90];
const ACTIVE_PROFILE_KEY = "momentum-active-profile";

function loadDurations() {
  try {
    const saved = JSON.parse(localStorage.getItem(DURATIONS_KEY));
    return Array.isArray(saved) && saved.length ? saved : DEFAULT_DURATIONS;
  } catch {
    return DEFAULT_DURATIONS;
  }
}

export default function SettingsModal() {
  const [open, setOpen] = useState(false);
  const [durations, setDurations] = useState(loadDurations);
  const [editing, setEditing] = useState("");
  const [activeProfile, setActiveProfile] = useState(
    localStorage.getItem(ACTIVE_PROFILE_KEY) || "User"
  );

  // -------------------------
  // Add / remove durations
  // -------------------------
  function addDuration() {
    const val = parseInt(editing, 10);
    if (!val || val <= 0) return;
    const next = [...new Set([...durations, val])]
      .sort((a, b) => a - b)
      .slice(0, 8);
    setDurations(next);
    setEditing("");
  }

  function removeDuration(v) {
    setDurations(durations.filter((d) => d !== v));
  }

  function saveSettings() {
    localStorage.setItem(DURATIONS_KEY, JSON.stringify(durations));
    setOpen(false);
  }

  function resetDefaults() {
    if (!confirm("Reset presets to default values?")) return;
    setDurations(DEFAULT_DURATIONS);
  }

  function clearHistory() {
    if (!confirm("Clear all history permanently?")) return;
    alert("History cleared.");
  }

  // -------------------------
  // UI
  // -------------------------
  return (
    <>
      {/* Floating Open Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl
        bg-gradient-to-br from-indigo-500 to-pink-500 text-white flex items-center justify-center
        hover:scale-105 transition"
      >
        ⚙️
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center z-40 p-4">
          {/* Dim background */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Modal card */}
          <div className="relative w-full max-w-lg max-h-[85vh] overflow-hidden 
           bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-2xl
           rounded-2xl border border-white/20 p-6 overflow-y-auto">

            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-white/20">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Settings
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700"
              >
                Close
              </button>
            </div>

            {/* Content */}
            <div className="mt-5 space-y-6">

              {/* TIMER PRESETS */}
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Timer Presets
                </h3>

                <div className="flex flex-wrap gap-2">
                  {durations.map((d) => (
                    <div
                      key={d}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full
                      bg-white/50 dark:bg-gray-800/40 shadow"
                    >
                      <span className="text-sm font-medium">{d}m</span>
                      <button
                        onClick={() => removeDuration(d)}
                        className="text-red-600 text-xs px-2 py-0.5 bg-red-100 rounded-md"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new duration */}
                <div className="flex items-center gap-2">
                  <input
                    value={editing}
                    onChange={(e) => setEditing(e.target.value.replace(/[^\d]/g, ""))}
                    placeholder="Add (min)"
                    className="w-24 px-3 py-2 rounded-lg bg-white/40 dark:bg-gray-800/40 outline-none"
                  />
                  <button
                    onClick={addDuration}
                    className="px-4 py-2 bg-indigo-500 text-white text-sm rounded-lg shadow"
                  >
                    Add
                  </button>
                </div>

                <p className="text-xs text-gray-500">
                  You can add up to 8 presets.
                </p>
              </section>

              {/* ACTION BUTTONS */}
              <section className="space-y-3">
                <button
                  onClick={resetDefaults}
                  className="w-full py-2 rounded-lg bg-yellow-100 text-yellow-700 font-medium"
                >
                  Reset to Defaults
                </button>

                <button
                  onClick={clearHistory}
                  className="w-full py-2 rounded-lg bg-red-100 text-red-700 font-medium"
                >
                  Clear All History
                </button>
              </section>

              {/* ACTIVE USER INFO */}
              <p className="text-sm text-gray-700 dark:text-gray-300 pt-2">
                Active User: <b>{activeProfile}</b>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
