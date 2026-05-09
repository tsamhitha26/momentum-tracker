import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import PageShell from "../components/PageShell";
import { getUser } from "../utils/sync";

function getNotesKey() {
  const user = getUser();
  return `momentum-notes-${user?.id || "guest"}`;
}

function loadNotes() {
  try {
    const raw = localStorage.getItem(getNotesKey());
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function Notes() {
  const [notes, setNotes] = useState(loadNotes);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");

  function persist(next) {
    setNotes(next);
    localStorage.setItem(getNotesKey(), JSON.stringify(next));
  }

  function addNote(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;

    persist([
      {
        id: `note-${Date.now()}`,
        text,
        createdAt: new Date().toISOString(),
      },
      ...notes,
    ]);
    setDraft("");
  }

  function deleteNote(id) {
    persist(notes.filter((note) => note.id !== id));
  }

  // Reload notes when user changes (login/logout)
  useEffect(() => {
    const reloadNotes = () => {
      setNotes(loadNotes());
    };

    window.addEventListener("user-changed", reloadNotes);
    return () => window.removeEventListener("user-changed", reloadNotes);
  }, []);

  const filteredNotes = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return notes;
    return notes.filter((note) => note.text.toLowerCase().includes(needle));
  }, [notes, query]);

  return (
    <PageShell
      eyebrow="Notes"
      title="Quick notes"
      description="Capture small thoughts without interrupting your focus flow."
      action={
        <div className="rounded-xl bg-white/60 px-3 py-2 text-xs font-medium text-gray-600 shadow-sm dark:bg-white/10 dark:text-gray-300">
          {notes.length} saved
        </div>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.85fr)_320px]">
        <section className="rounded-xl bg-white/60 p-4 shadow-lg backdrop-blur-md dark:bg-gray-800/60">
          <form onSubmit={addNote} className="space-y-3">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="min-h-36 w-full resize-y rounded-xl bg-white/50 p-3 text-sm leading-6 text-gray-800 outline-none ring-1 ring-indigo-100 placeholder:text-gray-400 focus:ring-indigo-300 dark:bg-gray-900/35 dark:text-gray-100 dark:ring-white/10"
              placeholder="Write a quick note..."
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Saved locally for the active profile.
              </p>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
              >
                <Plus className="h-4 w-4" />
                Add note
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-xl bg-white/60 p-4 shadow-lg backdrop-blur-md dark:bg-gray-800/60">
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full rounded-xl bg-white/50 py-2 pl-9 pr-3 text-sm outline-none ring-1 ring-indigo-100 focus:ring-indigo-300 dark:bg-gray-900/35 dark:text-gray-100 dark:ring-white/10"
              placeholder="Search notes"
            />
          </div>

          <div className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
            {filteredNotes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/60 p-4 text-sm text-gray-500 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-gray-300">
                No notes yet.
              </div>
            ) : (
              filteredNotes.map((note) => (
                <article
                  key={note.id}
                  className="rounded-xl bg-white/45 p-3 text-sm shadow-sm dark:bg-gray-900/30"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <time className="text-xs text-gray-400">
                      {new Date(note.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                    <button
                      type="button"
                      onClick={() => deleteNote(note.id)}
                      className="rounded-lg p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-400/10"
                      aria-label="Delete note"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="whitespace-pre-wrap leading-6 text-gray-700 dark:text-gray-200">
                    {note.text}
                  </p>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
