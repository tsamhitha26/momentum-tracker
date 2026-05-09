import React from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  CheckSquare,
  Gauge,
  LayoutDashboard,
  NotebookText,
  Settings,
  Timer,
  X,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard, end: true },
  { label: "Tasks", to: "/tasks", icon: CheckSquare },
  { label: "Focus", to: "/focus", icon: Timer },
  { label: "Analytics", to: "/analytics", icon: BarChart3 },
  { label: "Notes", to: "/notes", icon: NotebookText },
  { label: "Settings", to: "/settings", icon: Settings },
];

function SidebarContent({ onNavigate, onClose }) {
  return (
    <div className="flex h-full flex-col bg-white/80 text-gray-800 shadow-2xl shadow-indigo-950/10 backdrop-blur-2xl dark:bg-gray-950/75 dark:text-gray-100 lg:bg-white/55 lg:dark:bg-gray-950/45">
      <div className="flex items-center justify-between px-5 py-5">
        <NavLink
          to="/"
          onClick={onNavigate}
          className="group flex items-center gap-3 rounded-2xl transition-transform duration-300 hover:scale-[1.02]"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 text-base font-bold text-white shadow-lg shadow-indigo-500/30">
            M
          </span>
          <span>
            <span className="block text-sm font-semibold tracking-wide text-gray-950 dark:text-white">
              Momentum
            </span>
            <span className="block text-xs text-gray-500 dark:text-gray-400">
              Focus workspace
            </span>
          </span>
        </NavLink>

        <button
          type="button"
          onClick={onClose}
          className="rounded-xl p-2 text-gray-500 transition hover:bg-indigo-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white lg:hidden"
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2" aria-label="Primary navigation">
        {navItems.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={label}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                  : "text-gray-600 hover:-translate-y-0.5 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-md hover:shadow-indigo-100/80 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white dark:hover:shadow-none"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-300 ${
                    isActive
                      ? "bg-white/20"
                      : "bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-indigo-600 dark:bg-white/10 dark:text-gray-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 pb-5">
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm dark:bg-gray-950 dark:text-indigo-300">
              <Gauge className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Stay in flow
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Plan, focus, review.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ open, onClose }) {
  const handleNavigate = () => {
    if (onClose) onClose();
  };

  return (
    <>
      <aside className="hidden h-screen w-72 shrink-0 border-r border-white/40 dark:border-white/10 lg:sticky lg:top-0 lg:block">
        <SidebarContent onNavigate={handleNavigate} />
      </aside>

      <div
        className={`fixed inset-0 z-40 bg-gray-950/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform border-r border-white/30 transition-transform duration-300 ease-out dark:border-white/10 lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent onNavigate={handleNavigate} onClose={onClose} />
      </aside>
    </>
  );
}
