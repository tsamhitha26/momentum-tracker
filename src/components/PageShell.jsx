import React from "react";

export default function PageShell({ eyebrow, title, description, action, children }) {
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-white/60 bg-white/55 px-4 py-3 shadow-lg shadow-indigo-100/40 backdrop-blur-xl dark:border-white/10 dark:bg-white/10 dark:shadow-black/10 sm:px-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            {eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
                {eyebrow}
              </p>
            )}
            <h1 className="mt-1 text-2xl font-semibold text-gray-950 dark:text-white">
              {title}
            </h1>
            {description && (
              <p className="mt-1 max-w-2xl text-sm leading-5 text-gray-600 dark:text-gray-300">
                {description}
              </p>
            )}
          </div>
          {action}
        </div>
      </section>

      {children}
    </div>
  );
}
