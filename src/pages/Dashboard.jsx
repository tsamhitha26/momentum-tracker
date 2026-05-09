import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChartBar,
  CheckSquare,
  Clock3,
  ListChecks,
  Notebook,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import PageShell from "../components/PageShell";
import { useAuth } from "../context/AuthContext";
import { getUser, getUserSessions } from "../utils/sync";
import { calculateProductivityMetrics } from "../utils/productivity";

const FALLBACK_PROFILE = "guest";

function getProfileId(user) {
  return user?.id || FALLBACK_PROFILE;
}

function taskStorageKey(profileId) {
  return `momentum-tasks-${profileId}`;
}

function noteStorageKey(profileId) {
  return `momentum-notes-${profileId}`;
}

function loadTasks(user) {
  const profileId = getProfileId(user);
  try {
    return JSON.parse(localStorage.getItem(taskStorageKey(profileId)) || "[]");
  } catch {
    return [];
  }
}

function loadNotes(user) {
  const profileId = getProfileId(user);
  try {
    return JSON.parse(localStorage.getItem(noteStorageKey(profileId)) || "[]");
  } catch {
    return [];
  }
}

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(() => getUser());
  const [sessions, setSessions] = useState(() => getUserSessions());
  const [tasks, setTasks] = useState(() => loadTasks(getUser()));
  const [notes, setNotes] = useState(() => loadNotes(getUser()));

  useEffect(() => {
    const refresh = () => {
      const nextUser = getUser();
      setProfile(nextUser);
      setSessions(getUserSessions());
      setTasks(loadTasks(nextUser));
      setNotes(loadNotes(nextUser));
    };

    const storageHandler = (event) => {
      if (!event.key) return;
      if (event.key.startsWith("momentum-")) {
        refresh();
      }
    };

    window.addEventListener("history-updated", refresh);
    window.addEventListener("user-changed", refresh);
    window.addEventListener("storage", storageHandler);

    return () => {
      window.removeEventListener("history-updated", refresh);
      window.removeEventListener("user-changed", refresh);
      window.removeEventListener("storage", storageHandler);
    };
  }, []);

  const metrics = useMemo(
    () => calculateProductivityMetrics(sessions),
    [sessions]
  );

  const openTasks = useMemo(
    () => tasks.filter((task) => !task.completed),
    [tasks]
  );

  const recentNotes = useMemo(
    () => notes.slice(0, 3),
    [notes]
  );

  const summaryCards = [
    {
      title: "Today",
      value: `${metrics.todayMinutes} min`,
      note: `${metrics.todaySessions} sessions`,
      icon: Clock3,
      accent: "from-indigo-400 to-violet-500",
    },
    {
      title: "Streak",
      value: `${metrics.streak} days`,
      note: "Keep the momentum",
      icon: Sparkles,
      accent: "from-pink-400 to-orange-400",
    },
    {
      title: "Open tasks",
      value: `${openTasks.length}`,
      note: `${tasks.length} total tasks`,
      icon: ListChecks,
      accent: "from-cyan-400 to-blue-500",
    },
    {
      title: "Focus pace",
      value: `${metrics.dailyProgress}%`,
      note: `${metrics.weeklyProgress}% weekly`,
      icon: CheckSquare,
      accent: "from-emerald-400 to-teal-500",
    },
  ];

  return (
    <PageShell
      eyebrow="Overview"
      title="Momentum"
      description="A compact productivity pulse with the essentials for today."
      action={
        <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20">
          {user?.username || "Personal"}
        </div>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => {
              const Icon = card.icon;
              return (
                <article
                  key={card.title}
                  className="rounded-3xl border border-white/60 bg-white/60 p-5 shadow-[0_24px_80px_-48px_rgba(59,130,246,0.75)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {card.title}
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                        {card.value}
                      </p>
                    </div>
                    <span
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accent} text-white shadow-lg shadow-slate-300/30`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <p className="mt-4 text-xs leading-5 text-gray-500 dark:text-gray-400">
                    {card.note}
                  </p>
                </article>
              );
            })}
          </div>

          <section className="rounded-[2rem] border border-white/60 bg-white/65 p-5 shadow-2xl shadow-slate-200/50 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Quick actions
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Jump to any workspace without losing your flow.
                </p>
              </div>
              <Sparkles className="h-6 w-6 text-violet-500" />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Link
                to="/focus"
                className="group inline-flex items-center justify-between rounded-3xl border border-indigo-200/80 bg-indigo-50/80 px-4 py-4 text-left transition hover:-translate-y-0.5 hover:bg-indigo-100/90 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/15"
              >
                <div>
                  <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-200">
                    Start focus
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Launch a session fast.
                  </p>
                </div>
                <Clock3 className="h-5 w-5 text-indigo-700 dark:text-indigo-200" />
              </Link>

              <Link
                to="/tasks"
                className="group inline-flex items-center justify-between rounded-3xl border border-sky-200/80 bg-sky-50/80 px-4 py-4 text-left transition hover:-translate-y-0.5 hover:bg-sky-100/90 dark:border-sky-500/20 dark:bg-sky-500/10 dark:hover:bg-sky-500/15"
              >
                <div>
                  <p className="text-sm font-semibold text-sky-700 dark:text-sky-200">
                    Manage tasks
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Review, edit or add priorities.
                  </p>
                </div>
                <ListChecks className="h-5 w-5 text-sky-700 dark:text-sky-200" />
              </Link>

              <Link
                to="/analytics"
                className="group inline-flex items-center justify-between rounded-3xl border border-fuchsia-200/80 bg-fuchsia-50/80 px-4 py-4 text-left transition hover:-translate-y-0.5 hover:bg-fuchsia-100/90 dark:border-fuchsia-500/20 dark:bg-fuchsia-500/10 dark:hover:bg-fuchsia-500/15"
              >
                <div>
                  <p className="text-sm font-semibold text-fuchsia-700 dark:text-fuchsia-200">
                    Review stats
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    See progress and streak momentum.
                  </p>
                </div>
                <ChartBar className="h-5 w-5 text-fuchsia-700 dark:text-fuchsia-200" />
              </Link>

              <Link
                to="/notes"
                className="group inline-flex items-center justify-between rounded-3xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-4 text-left transition hover:-translate-y-0.5 hover:bg-emerald-100/90 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/15"
              >
                <div>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-200">
                    Add notes
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Capture ideas without breaking flow.
                  </p>
                </div>
                <Notebook className="h-5 w-5 text-emerald-700 dark:text-emerald-200" />
              </Link>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/60 bg-white/60 p-5 shadow-2xl shadow-slate-200/50 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  Productivity snapshot
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Progress bars keep the current streak visible at a glance.
                </p>
              </div>
              <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200">
                {metrics.completedSessions} sessions
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="mb-3 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Daily goal</span>
                  <span>{metrics.dailyProgress}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200/70 dark:bg-slate-700/50">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    style={{ width: `${metrics.dailyProgress}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Weekly goal</span>
                  <span>{metrics.weeklyProgress}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200/70 dark:bg-slate-700/50">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500"
                    style={{ width: `${metrics.weeklyProgress}%` }}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-white/70 p-4 text-sm text-slate-700 dark:bg-slate-800/60 dark:text-slate-100">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Avg focus</p>
                  <p className="mt-2 text-xl font-semibold">{metrics.averageMinutes} min</p>
                </div>
                <div className="rounded-3xl bg-white/70 p-4 text-sm text-slate-700 dark:bg-slate-800/60 dark:text-slate-100">
                  <p className="text-xs text-gray-500 dark:text-gray-400">This week</p>
                  <p className="mt-2 text-xl font-semibold">{metrics.weekMinutes} min</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-[2rem] border border-white/60 bg-white/60 p-5 shadow-2xl shadow-slate-200/50 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  Upcoming tasks
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  The next priorities to finish today.
                </p>
              </div>
              <Link
                to="/tasks"
                className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-200"
              >
                Manage
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {openTasks.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/30 dark:text-slate-400">
                  No open tasks — create a new priority from the Tasks page.
                </div>
              ) : (
                openTasks.slice(0, 4).map((task) => (
                  <div
                    key={task._id || task.localId || task.id}
                    className="flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white/70 p-4 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-950/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900 dark:text-white">
                        {task.title}
                      </p>
                      {task.minutes ? (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {task.minutes} min focus
                        </p>
                      ) : null}
                    </div>
                    <div className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">
                      Next
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/60 bg-white/60 p-5 shadow-2xl shadow-slate-200/50 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  Recent notes
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Capture ideas, references, and quick reminders.
                </p>
              </div>
              <Link
                to="/notes"
                className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-200"
              >
                Open
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentNotes.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/30 dark:text-slate-400">
                  No notes yet — jot something down in Notes.
                </div>
              ) : (
                recentNotes.map((note) => (
                  <article
                    key={note.id}
                    className="rounded-3xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-200"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>{new Date(note.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        Note
                      </span>
                    </div>
                    <p className="leading-6 text-slate-900 dark:text-slate-100">
                      {note.text}
                    </p>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
