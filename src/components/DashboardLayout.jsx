import React, { useState } from "react";
import { Menu } from "lucide-react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 dark:text-gray-100">
      <div className="flex min-h-screen">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="min-w-0 flex-1">
          <div className="sticky top-0 z-30 border-b border-white/50 bg-white/75 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-gray-950/65 lg:hidden">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 text-white shadow-lg shadow-indigo-500/25 transition duration-300 hover:-translate-y-0.5 hover:shadow-indigo-500/40"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="text-right">
                <p className="text-sm font-semibold">Momentum</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Productivity tracker
                </p>
              </div>
            </div>
          </div>

          <Header />

          <main className="mx-auto w-full max-w-7xl px-4 pb-8 pt-4 sm:px-5 lg:px-6 lg:pb-10">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
