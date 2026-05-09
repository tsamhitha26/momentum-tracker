// src/components/TimerSection.jsx
import React, { useEffect, useRef, useState } from "react";
import { pushSessionToServer } from "../utils/sync";
import {
  loadPreferences,
  PREFERENCES_UPDATED_EVENT,
} from "../utils/preferences";

export default function TimerSection({ initialMinutes, onComplete }) {
  const [preferences, setPreferences] = useState(loadPreferences);
  const [minutes, setMinutes] = useState(
    initialMinutes || preferences.focusDurations[0]
  );
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60);

  // Refs
  const endTsRef = useRef(null);
  const rafRef = useRef(null);
  const startedSecRef = useRef(0);
  const alarmRef = useRef(false); // <-- IMPORTANT: used as lock
  const audioRef = useRef(null);

  const durations = preferences.focusDurations;

  /** ----------------------------------------
   * On mount / reset
   -----------------------------------------*/
  useEffect(() => {
    const handlePreferences = () => {
      const next = loadPreferences();
      setPreferences(next);

      if (!running && !next.focusDurations.includes(minutes)) {
        const nextMinutes = initialMinutes || next.focusDurations[0];
        setMinutes(nextMinutes);
        setSecondsLeft(nextMinutes * 60);
      }
    };

    window.addEventListener(PREFERENCES_UPDATED_EVENT, handlePreferences);
    return () =>
      window.removeEventListener(PREFERENCES_UPDATED_EVENT, handlePreferences);
  }, [initialMinutes, minutes, running]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      stopAlarm();
    };
  }, []);

  /** ----------------------------------------
   * Tick loop
   -----------------------------------------*/
  const tick = () => {
    if (!endTsRef.current) return;

    const remaining = Math.max(
      0,
      Math.round((endTsRef.current - Date.now()) / 1000)
    );

    setSecondsLeft(remaining);

    if (remaining <= 0) {
      stopTimer(true); // may run twice WITHOUT our lock
    } else {
      rafRef.current = requestAnimationFrame(tick);
    }
  };

  /** ----------------------------------------
   * Start Timer
   -----------------------------------------*/
  const startTimer = (mins) => {
    const m = typeof mins === "number" ? mins : Number(minutes);
    const totalSec = Math.max(1, m * 60);

    alarmRef.current = false;                     // <-- reset lock
    startedSecRef.current = totalSec;

    endTsRef.current = Date.now() + totalSec * 1000;

    setRunning(true);
    setSecondsLeft(totalSec);

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  };

  /** ----------------------------------------
   * Stop Timer (FIXED)
   -----------------------------------------*/
  const stopTimer = (finished = false) => {
    // 🔥 FINAL FIX: Prevent stopTimer from firing twice
    if (alarmRef.current) return;
    alarmRef.current = true;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;

    setRunning(false);
    endTsRef.current = null;

    if (finished) {
      playAlarm();

      const minutesDone = Math.max(
        1,
        Math.round(startedSecRef.current / 60)
      );

      const sessionEntry = {
        duration: minutesDone,
        timestamp: new Date().toISOString(),
        sessionsCompleted: 1,
      };

      pushSessionToServer(sessionEntry);

      window.dispatchEvent(new Event("history-updated"));
      if (onComplete) onComplete(minutesDone, 1);
    }
  };

  /** ----------------------------------------
   * Reset Timer
   -----------------------------------------*/
  const resetTimer = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;

    alarmRef.current = false;
    setRunning(false);
    setSecondsLeft(Number(minutes) * 60);
    endTsRef.current = null;
    stopAlarm();
  };

  /** ----------------------------------------
   * Alarm
   -----------------------------------------*/
  const stopAlarm = () => {
    if (!audioRef.current) return;

    try {
      audioRef.current.osc.stop();
      audioRef.current.ctx.close();
    } catch {}

    audioRef.current = null;
  };

  const playAlarm = () => {
    if (!preferences.notifications.soundEnabled) return;

    const duration = Math.min(
      5000,
      Math.max(3000, Number(preferences.notifications.soundDurationMs) || 4000)
    );

    try {
      stopAlarm();
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      audioRef.current = { ctx, osc };

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        ctx.currentTime + duration / 1000
      );

      window.setTimeout(stopAlarm, duration);
    } catch {}
  };

  /** ----------------------------------------
   * UI Helpers
   -----------------------------------------*/
  const format = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(
      s % 60
    ).padStart(2, "0")}`;

  const progress = 1 - secondsLeft / (minutes * 60);

  return (
    <section className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-xl p-4 shadow-lg">
      <div className="flex flex-col md:flex-row items-center gap-4">
        
        {/* Clock */}
        <div className="relative">
          <svg width="132" height="132" viewBox="0 0 160 160">
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#667eea" />
                <stop offset="100%" stopColor="#f687b3" />
              </linearGradient>
            </defs>

            <g transform="translate(80,80)">
              <circle r="68" fill="none" stroke="#e6e8f2" strokeWidth="12" />
              <circle
                r="68"
                fill="none"
                stroke="url(#timerGradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${progress * 2 * Math.PI * 68} ${
                  2 * Math.PI * 68
                }`}
                transform="rotate(-90)"
                style={{ transition: "stroke-dasharray 0.25s linear" }}
              />
            </g>
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-mono font-semibold text-gray-800 dark:text-gray-100">
                {format(secondsLeft)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                {minutes} min
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 w-full">
          <div className="flex flex-wrap gap-2 mb-3">
            {durations.map((d) => (
              <button
                key={d}
                onClick={() => {
                  setMinutes(d);
                  if (!running) setSecondsLeft(d * 60);
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  minutes === d
                    ? "bg-indigo-500 text-white shadow-md"
                    : "bg-white/40 dark:bg-gray-700/40 text-gray-700 dark:text-gray-200"
                }`}
              >
                {d} min
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => (running ? stopTimer(false) : startTimer(minutes))}
              className={`px-3 py-2 rounded-lg text-sm font-semibold shadow-md ${
                running ? "bg-red-500 text-white" : "bg-indigo-500 text-white"
              }`}
            >
              {running ? "Pause" : "Start"}
            </button>

            <button
              onClick={resetTimer}
              className="px-3 py-2 rounded-lg text-sm bg-white/40 dark:bg-gray-700/40 text-gray-700 dark:text-gray-200"
            >
              Reset
            </button>

            <div className="ml-auto text-xs text-gray-500 dark:text-gray-300">
              Progress: {(progress * 100).toFixed(0)}%
            </div>
          </div>

          {alarmRef.current && (
            <div className="mt-4 text-sm text-green-600 dark:text-green-400 font-medium">
              Session complete — saved to history.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
