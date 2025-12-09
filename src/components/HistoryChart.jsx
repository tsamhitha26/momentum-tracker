// src/components/HistoryChart.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getUserSessions } from "../utils/sync";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";


/**
 * HistoryChart (Hybrid Sync Version)
 * - Fetches sessions from server if logged in
 * - Falls back to local per-user history
 * - Daily (30 days) + Weekly (12 weeks)
 * - Updates automatically when sessions change
 */

function dayKey(d) {
  return new Date(d).toISOString().slice(0, 10);
}

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diff = (day + 6) % 7; // Monday=0
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function HistoryChart() {
  const [history, setHistory] = useState([]);
  const [view, setView] = useState("daily");
  const [loading, setLoading] = useState(false);

  /** Load sessions from unified sync source */
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

  /** Load when mounted + listen for updates */
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

  /** DAILY — last 30 days */
  const daily = useMemo(() => {
    const result = {};
    const today = new Date();

    // Initialize last 30 days with 0
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const key = dayKey(d);
      result[key] = 0;
    }

    // Sum minutes per day
    (history || []).forEach((s) => {
      try {
        const k = dayKey(s.timestamp || s.date || s.createdAt);
        if (k in result)
          result[k] += Number(s.duration ?? s.minutes ?? 0) || 0;
      } catch {}
    });

    return Object.keys(result).map((dateStr) => ({
      date: dateStr,
      label: new Date(dateStr).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      minutes: result[dateStr],
    }));
  }, [history]);

  /** WEEKLY — last 12 weeks */
  const weekly = useMemo(() => {
    const buckets = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i * 7);
      const start = getStartOfWeek(d);
      const key = start.toISOString().slice(0, 10);
      buckets.push({ key, start, minutes: 0 });
    }

    (history || []).forEach((s) => {
      try {
        const wkStart = getStartOfWeek(
          new Date(s.timestamp || s.date || s.createdAt)
        )
          .toISOString()
          .slice(0, 10);

        const bucket = buckets.find((b) => b.key === wkStart);
        if (bucket) {
          bucket.minutes += Number(s.duration ?? s.minutes ?? 0) || 0;
        }
      } catch {}
    });

    return buckets.map((b) => ({
      ...b,
      label: b.start.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
    }));
  }, [history]);

  const maxVal = Math.max(
    1,
    ...daily.map((d) => d.minutes),
    ...weekly.map((w) => w.minutes)
  );

  return (
    <section className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            History
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Daily & Weekly focus summary
          </p>
        </div>

        {/* Switcher */}
        <div className="flex gap-2">
          <button
            onClick={() => setView("daily")}
            className={`px-3 py-1 rounded-md text-sm ${
              view === "daily"
                ? "bg-indigo-500 text-white"
                : "bg-white/40 dark:bg-gray-700/40 text-gray-700 dark:text-gray-200"
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setView("weekly")}
            className={`px-3 py-1 rounded-md text-sm ${
              view === "weekly"
                ? "bg-indigo-500 text-white"
                : "bg-white/40 dark:bg-gray-700/40 text-gray-700 dark:text-gray-200"
            }`}
          >
            Weekly
          </button>
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: "100%", height: 240 }}>
        {loading ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-500 dark:text-gray-300">
            Loading…
          </div>
        ) : history.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-500 dark:text-gray-300">
            No history yet — complete a session to populate charts.
          </div>
        ) : view === "daily" ? (
          <ResponsiveContainer>
            <BarChart
              data={daily}
              margin={{ top: 10, right: 10, left: -10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e6e6e6" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis
                allowDecimals={false}
                domain={[0, Math.max(...daily.map((d) => d.minutes), 1)]}
              />
              <Tooltip formatter={(value) => `${value} min`} />

              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#667eea" stopOpacity={1} />
                  <stop offset="100%" stopColor="#f687b3" stopOpacity={1} />
                </linearGradient>
              </defs>

              <Bar dataKey="minutes" fill="url(#g1)" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer>
            <LineChart
              data={weekly}
              margin={{ top: 10, right: 10, left: -10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e6e6e6" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis
                allowDecimals={false}
                domain={[0, Math.max(...weekly.map((d) => d.minutes), 1)]}
              />
              <Tooltip formatter={(value) => `${value} min`} />
              <Line
                type="monotone"
                dataKey="minutes"
                stroke="#667eea"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 text-sm text-gray-500 dark:text-gray-300">
        Showing last {view === "daily" ? "30 days" : "12 weeks"} • Max:{" "}
        {maxVal} min
      </div>
    </section>
  );
}
