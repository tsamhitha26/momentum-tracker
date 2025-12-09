import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth(); // get logged-in user + logout
  const THEME_KEY = "momentum-theme";

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) || "dark";
    } catch {
      return "dark";
    }
  });

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === "dark" ? "light" : "dark"));

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 18
      ? "Good afternoon"
      : "Good evening";

  return (
    <header className="sticky top-4 z-30 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="backdrop-blur-2xl bg-white/20 dark:bg-gray-900/30 rounded-3xl p-4 flex items-center justify-between gap-4 shadow-lg border border-white/10">

        {/* LEFT — Branding */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white shadow-2xl ring-4 ring-indigo-400/20">
            <span className="font-bold text-lg">M</span>
          </div>

          <div>
            <div className="text-sm text-gray-700 dark:text-gray-200 font-medium">Momentum</div>
            <div className="text-xs text-gray-600 dark:text-gray-300">
              Focus. Flow. Finish.
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {greeting}, {user?.username || "User"} 👋
            </div>
          </div>
        </div>

        {/* RIGHT — Theme + Logout */}
        <div className="flex items-center gap-3">

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-full bg-white/20 dark:bg-gray-800/25 hover:scale-105 transition"
          >
            {theme === "dark" ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 3.5a.75.75 0 01.75-.75h0A.75.75 0 0111.5 3.5V5a.75.75 0 01-1.5 0V3.5zM10 15a5 5 0 100-10 5 5 0 000 10z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 116.707 2.707a7 7 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

          {/* Logout button */}
          <button
            onClick={logout}
            className="px-4 py-1.5 rounded-full bg-red-500/80 text-white text-sm hover:bg-red-600 transition shadow-md"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
