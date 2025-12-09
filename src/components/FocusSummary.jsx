// src/components/FocusSummary.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getUser, getUserSessions } from "../utils/sync";

/**
 * FocusSummary (Hybrid Sync Version)
 * - Loads sessions from server if logged-in
 * - Falls back to local per-user sessions
 * - Shows Today, This Week, Streak
 * - Auto-refreshes when timer finishes or user logs in
 */

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay(); // 0..6
  const diff = (day + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function FocusSummary() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  /** Load sessions (Server → Local fallback) */
  async function loadSessions() {
    setLoading(true);
    try {
      const list = await getUserSessions(); // ← unified logic from sync.js
      setSessions(Array.isArray(list) ? list : []);
    } catch {
      setSessions([]);
    }
    setLoading(false);
  }

  /** Load on mount */
  useEffect(() => {
    loadSessions();

    const refresh = () => loadSessions();
    window.addEventListener("history-updated", refresh);
    window.addEventListener("user-changed", refresh);

    return () => {
      window.removeEventListener("history-updated", refresh);
      window.removeEventListener("user-changed", refresh);
    };
  }, []);

  /** Compute Today, Week, Streak */
  const totals = useMemo(() => {
    const now = new Date();
    const dayStart = startOfDay(now);
    const weekStart = startOfWeek(now);

    let today = 0;
    let week = 0;

    // Sort most recent → oldest
    const sorted = [...sessions].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    // Calculate totals
    sorted.forEach((s) => {
      const when = new Date(s.timestamp);
      const mins = Number(s.duration ?? s.minutes ?? 0) || 0;

      if (when >= dayStart) today += mins;
      if (when >= weekStart) week += mins;
    });

    // Streak calculation
    let streak = 0;
    if (sorted.length > 0) {
      const dateSet = new Set(
        sorted.map((s) =>
          new Date(s.timestamp).toISOString().slice(0, 10)
        )
      );

      let d = startOfDay();
      while (true) {
        const key = d.toISOString().slice(0, 10);
        if (dateSet.has(key)) {
          streak++;
          d.setDate(d.getDate() - 1);
        } else {
          break;
        }
      }
    }

    return { today, week, streak };
  }, [sessions]);

  return (
    <section className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Today's Progress
        </h3>
        <div className="text-sm text-gray-500">
          {loading ? "Loading…" : "Live"}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        {/* Today */}
        <div className="p-3 rounded-xl bg-white/40 dark:bg-gray-700/40">
          <div className="text-xs text-gray-500">Today</div>
          <div className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            {totals.today}
          </div>
          <div className="text-xs text-gray-500">min</div>
        </div>

        {/* This Week */}
        <div className="p-3 rounded-xl bg-white/40 dark:bg-gray-700/40">
          <div className="text-xs text-gray-500">This Week</div>
          <div className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            {totals.week}
          </div>
          <div className="text-xs text-gray-500">min</div>
        </div>

        {/* Streak */}
        <div className="p-3 rounded-xl bg-white/40 dark:bg-gray-700/40">
          <div className="text-xs text-gray-500">Streak</div>
          <div className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            {totals.streak}
          </div>
          <div className="text-xs text-gray-500">days</div>
        </div>
      </div>
    </section>
  );
}
