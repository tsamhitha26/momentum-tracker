import React, { useEffect, useMemo, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getUserSessions } from "../utils/sync";
import {
  dayKey,
  getSessionDate,
  getSessionMinutes,
  startOfWeek,
} from "../utils/productivity";

function makeDailyBuckets(sessions) {
  const result = {};
  const today = new Date();

  for (let index = 13; index >= 0; index -= 1) {
    const date = new Date();
    date.setDate(today.getDate() - index);
    const key = dayKey(date);
    result[key] = {
      key,
      label: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      minutes: 0,
      sessions: 0,
    };
  }

  sessions.forEach((session) => {
    const date = getSessionDate(session);
    const key = dayKey(date);
    if (!result[key]) return;
    result[key].minutes += getSessionMinutes(session);
    result[key].sessions += 1;
  });

  return Object.values(result);
}

function makeWeeklyBuckets(sessions) {
  const buckets = {};
  const today = new Date();

  for (let index = 7; index >= 0; index -= 1) {
    const date = new Date();
    date.setDate(today.getDate() - index * 7);
    const start = startOfWeek(date);
    const key = dayKey(start);
    buckets[key] = {
      key,
      label: start.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      minutes: 0,
      sessions: 0,
    };
  }

  sessions.forEach((session) => {
    const date = getSessionDate(session);
    if (Number.isNaN(date.getTime())) return;
    const key = dayKey(startOfWeek(date));
    if (!buckets[key]) return;
    buckets[key].minutes += getSessionMinutes(session);
    buckets[key].sessions += 1;
  });

  return Object.values(buckets);
}

export default function HistoryChart() {
  const [history, setHistory] = useState([]);
  const [view, setView] = useState("daily");
  const [loading, setLoading] = useState(false);

  async function loadHistory() {
    setLoading(true);
    try {
      const sessions = await getUserSessions();
      setHistory(Array.isArray(sessions) ? sessions : []);
    } catch {
      setHistory([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadHistory();

    const refresh = () => loadHistory();
    window.addEventListener("history-updated", refresh);
    window.addEventListener("user-changed", refresh);

    return () => {
      window.removeEventListener("history-updated", refresh);
      window.removeEventListener("user-changed", refresh);
    };
  }, []);

  const daily = useMemo(() => makeDailyBuckets(history), [history]);
  const weekly = useMemo(() => makeWeeklyBuckets(history), [history]);
  const data = view === "daily" ? daily : weekly;
  const totalMinutes = data.reduce((sum, item) => sum + item.minutes, 0);
  const totalSessions = data.reduce((sum, item) => sum + item.sessions, 0);

  return (
    <section className="rounded-xl bg-white/60 p-4 shadow-lg backdrop-blur-md dark:bg-gray-800/60">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
            Focus history
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-300">
            Minutes and completed sessions by {view === "daily" ? "day" : "week"}.
          </p>
        </div>

        <div className="flex gap-2">
          {["daily", "weekly"].map((item) => (
            <button
              key={item}
              onClick={() => setView(item)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize ${
                view === item
                  ? "bg-indigo-500 text-white"
                  : "bg-white/40 text-gray-700 dark:bg-gray-700/40 dark:text-gray-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/40 p-3 dark:bg-gray-700/40">
          <div className="text-xs text-gray-500">Focus minutes</div>
          <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {totalMinutes}
          </div>
        </div>
        <div className="rounded-xl bg-white/40 p-3 dark:bg-gray-700/40">
          <div className="text-xs text-gray-500">Completed sessions</div>
          <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {totalSessions}
          </div>
        </div>
      </div>

      <div style={{ width: "100%", height: 240 }}>
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-300">
            Loading...
          </div>
        ) : history.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-300">
            Complete a focus session to build your history.
          </div>
        ) : (
          <ResponsiveContainer>
            <ComposedChart data={data} margin={{ top: 10, right: 8, left: -14, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6e6e6" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="minutes" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis
                yAxisId="sessions"
                orientation="right"
                allowDecimals={false}
                tick={{ fontSize: 11 }}
              />
              <Tooltip />
              <defs>
                <linearGradient id="historyMinutes" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#d946ef" />
                </linearGradient>
              </defs>
              <Bar
                yAxisId="minutes"
                dataKey="minutes"
                name="Minutes"
                fill="url(#historyMinutes)"
                radius={[8, 8, 0, 0]}
              />
              <Line
                yAxisId="sessions"
                type="monotone"
                dataKey="sessions"
                name="Sessions"
                stroke="#7c3aed"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
