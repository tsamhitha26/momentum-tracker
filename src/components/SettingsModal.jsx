import React, { useState } from "react";
import { Bell, Palette, RotateCcw, SlidersHorizontal, Target } from "lucide-react";
import {
  DEFAULT_PREFERENCES,
  loadPreferences,
  savePreferences,
} from "../utils/preferences";
import { getUser } from "../utils/sync";

function PreferenceSection({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-2xl border border-white/50 bg-white/45 p-4 shadow-sm dark:border-white/10 dark:bg-white/10">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-white/10 dark:text-indigo-300">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-950 dark:text-white">
            {title}
          </h2>
          <p className="text-sm leading-5 text-gray-500 dark:text-gray-300">
            {description}
          </p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function SettingsModal() {
  const [preferences, setPreferences] = useState(loadPreferences);
  const [editingDuration, setEditingDuration] = useState("");
  const [saved, setSaved] = useState(false);
  const user = getUser();

  function updatePreferences(updater) {
    setPreferences((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;
      return savePreferences(next);
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1400);
  }

  function addDuration() {
    const value = Number(editingDuration);
    if (!Number.isFinite(value) || value <= 0) return;

    updatePreferences((current) => ({
      ...current,
      focusDurations: [...current.focusDurations, value],
    }));
    setEditingDuration("");
  }

  function removeDuration(duration) {
    updatePreferences((current) => ({
      ...current,
      focusDurations: current.focusDurations.filter((item) => item !== duration),
    }));
  }

  function resetDefaults() {
    if (!confirm("Reset Momentum preferences to defaults?")) return;
    updatePreferences(DEFAULT_PREFERENCES);
  }

  function clearHistory() {
    if (!confirm("Clear focus history for this profile?")) return;
    if (user?.id) {
      localStorage.setItem(`momentum-sessions-${user.id}`, "[]");
      window.dispatchEvent(new Event("history-updated"));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl border border-white/50 bg-white/45 px-4 py-3 text-sm shadow-sm dark:border-white/10 dark:bg-white/10">
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {user?.username || "Guest profile"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Preferences save locally and update the app immediately.
          </p>
        </div>
        {saved && (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
            Saved
          </span>
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <PreferenceSection
          icon={SlidersHorizontal}
          title="Focus"
          description="Choose the session presets shown in the timer."
        >
          <div className="flex flex-wrap gap-2">
            {preferences.focusDurations.map((duration) => (
              <span
                key={duration}
                className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-200"
              >
                {duration} min
                <button
                  type="button"
                  onClick={() => removeDuration(duration)}
                  className="rounded-full px-1 text-indigo-500 transition hover:bg-indigo-100 hover:text-red-500 dark:hover:bg-white/10"
                  aria-label={`Remove ${duration} minute preset`}
                >
                  x
                </button>
              </span>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <input
              value={editingDuration}
              onChange={(event) =>
                setEditingDuration(event.target.value.replace(/[^\d]/g, ""))
              }
              className="w-28 rounded-xl bg-white/60 px-3 py-2 text-sm outline-none ring-1 ring-indigo-100 focus:ring-indigo-300 dark:bg-gray-900/40 dark:ring-white/10"
              placeholder="Minutes"
            />
            <button
              type="button"
              onClick={addDuration}
              className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
            >
              Add
            </button>
          </div>
        </PreferenceSection>

        <PreferenceSection
          icon={Bell}
          title="Notifications"
          description="Control the short session-end sound."
        >
          <label className="flex items-center justify-between rounded-xl bg-white/45 px-3 py-2 text-sm dark:bg-gray-900/25">
            <span className="font-medium text-gray-700 dark:text-gray-200">
              Session-end sound
            </span>
            <input
              type="checkbox"
              checked={preferences.notifications.soundEnabled}
              onChange={(event) =>
                updatePreferences((current) => ({
                  ...current,
                  notifications: {
                    ...current.notifications,
                    soundEnabled: event.target.checked,
                  },
                }))
              }
              className="h-4 w-4 accent-indigo-500"
            />
          </label>

          <label className="mt-3 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Sound length
            <select
              value={preferences.notifications.soundDurationMs}
              onChange={(event) =>
                updatePreferences((current) => ({
                  ...current,
                  notifications: {
                    ...current.notifications,
                    soundDurationMs: Number(event.target.value),
                  },
                }))
              }
              className="mt-2 w-full rounded-xl bg-white/60 px-3 py-2 text-sm outline-none ring-1 ring-indigo-100 dark:bg-gray-900/40 dark:ring-white/10"
            >
              <option value={3000}>3 seconds</option>
              <option value={4000}>4 seconds</option>
              <option value={5000}>5 seconds</option>
            </select>
          </label>
        </PreferenceSection>

        <PreferenceSection
          icon={Palette}
          title="Appearance"
          description="Match Momentum to your preferred workspace tone."
        >
          <div className="grid grid-cols-2 gap-2">
            {["light", "dark"].map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() =>
                  updatePreferences((current) => ({
                    ...current,
                    appearance: { ...current.appearance, theme },
                  }))
                }
                className={`rounded-xl px-3 py-2 text-sm font-medium capitalize transition ${
                  preferences.appearance.theme === theme
                    ? "bg-indigo-500 text-white shadow-sm"
                    : "bg-white/50 text-gray-700 hover:bg-indigo-50 dark:bg-gray-900/30 dark:text-gray-200 dark:hover:bg-white/10"
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </PreferenceSection>

        <PreferenceSection
          icon={Target}
          title="Productivity"
          description="Set the goals used by analytics."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Daily goal
              <input
                value={preferences.productivity.dailyFocusGoal}
                onChange={(event) =>
                  updatePreferences((current) => ({
                    ...current,
                    productivity: {
                      ...current.productivity,
                      dailyFocusGoal: Number(event.target.value) || 1,
                    },
                  }))
                }
                className="mt-2 w-full rounded-xl bg-white/60 px-3 py-2 text-sm outline-none ring-1 ring-indigo-100 dark:bg-gray-900/40 dark:ring-white/10"
              />
            </label>

            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Weekly goal
              <input
                value={preferences.productivity.weeklyFocusGoal}
                onChange={(event) =>
                  updatePreferences((current) => ({
                    ...current,
                    productivity: {
                      ...current.productivity,
                      weeklyFocusGoal: Number(event.target.value) || 1,
                    },
                  }))
                }
                className="mt-2 w-full rounded-xl bg-white/60 px-3 py-2 text-sm outline-none ring-1 ring-indigo-100 dark:bg-gray-900/40 dark:ring-white/10"
              />
            </label>
          </div>
        </PreferenceSection>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={resetDefaults}
          className="inline-flex items-center gap-2 rounded-xl bg-white/60 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-white dark:bg-white/10 dark:text-gray-200"
        >
          <RotateCcw className="h-4 w-4" />
          Reset defaults
        </button>
        <button
          type="button"
          onClick={clearHistory}
          className="rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-100 dark:bg-red-400/10 dark:text-red-300"
        >
          Clear focus history
        </button>
      </div>
    </div>
  );
}
