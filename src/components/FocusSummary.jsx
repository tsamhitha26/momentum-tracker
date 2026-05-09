import React, { useEffect, useMemo, useState } from "react";
import { getUserSessions } from "../utils/sync";
import { calculateProductivityMetrics } from "../utils/productivity";
import {
  loadPreferences,
  PREFERENCES_UPDATED_EVENT,
} from "../utils/preferences";

export default function FocusSummary() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState(loadPreferences);

  async function loadSessions() {
    setLoading(true);
    try {
      const list = await getUserSessions();
      setSessions(Array.isArray(list) ? list : []);
    } catch {
      setSessions([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadSessions();

    const refresh = () => loadSessions();
    const refreshPreferences = () => setPreferences(loadPreferences());

    window.addEventListener("history-updated", refresh);
    window.addEventListener("user-changed", refresh);
    window.addEventListener(PREFERENCES_UPDATED_EVENT, refreshPreferences);

    return () => {
      window.removeEventListener("history-updated", refresh);
      window.removeEventListener("user-changed", refresh);
      window.removeEventListener(PREFERENCES_UPDATED_EVENT, refreshPreferences);
    };
  }, []);

  const metrics = useMemo(
    () =>
      calculateProductivityMetrics(sessions, {
        dailyGoal: preferences.productivity.dailyFocusGoal,
        weeklyGoal: preferences.productivity.weeklyFocusGoal,
      }),
    [sessions, preferences]
  );

  const statCards = [
    { label: "Today", value: metrics.todayMinutes, suffix: "min" },
    { label: "This week", value: metrics.weekMinutes, suffix: "min" },
    { label: "Sessions", value: metrics.completedSessions, suffix: "done" },
    { label: "Streak", value: metrics.streak, suffix: "days" },
    { label: "Average", value: metrics.averageMinutes, suffix: "min" },
    { label: "All time", value: metrics.totalMinutes, suffix: "min" },
  ];

  return (
    <section className="rounded-xl bg-white/60 p-4 shadow-lg backdrop-blur-md dark:bg-gray-800/60">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
          Productivity
        </h3>
        <div className="text-xs text-gray-500">
          {loading ? "Loading..." : "Live"}
        </div>
      </div>

      <div className="mb-3 space-y-2">
        <div>
          <div className="mb-1 flex justify-between text-xs text-gray-500 dark:text-gray-300">
            <span>Daily goal</span>
            <span>{metrics.dailyProgress}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/50 dark:bg-gray-700/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
              style={{ width: `${metrics.dailyProgress}%` }}
            />
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-xs text-gray-500 dark:text-gray-300">
            <span>Weekly goal</span>
            <span>{metrics.weeklyProgress}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/50 dark:bg-gray-700/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500"
              style={{ width: `${metrics.weeklyProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-3">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl bg-white/40 p-3 dark:bg-gray-700/40"
          >
            <div className="text-xs text-gray-500">{card.label}</div>
            <div className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              {card.value}
            </div>
            <div className="text-xs text-gray-500">{card.suffix}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
