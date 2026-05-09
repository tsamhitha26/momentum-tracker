export const PREFERENCES_KEY = "momentum-preferences";
export const PREFERENCES_UPDATED_EVENT = "momentum-preferences-updated";

export const DEFAULT_PREFERENCES = {
  focusDurations: [25, 50, 90],
  notifications: {
    soundEnabled: true,
    soundDurationMs: 4000,
  },
  appearance: {
    theme: "dark",
  },
  productivity: {
    dailyFocusGoal: 120,
    weeklyFocusGoal: 600,
  },
};

function normalizeDurations(value) {
  if (!Array.isArray(value)) return DEFAULT_PREFERENCES.focusDurations;

  const durations = [...new Set(value.map(Number))]
    .filter((item) => Number.isFinite(item) && item > 0)
    .sort((a, b) => a - b)
    .slice(0, 8);

  return durations.length ? durations : DEFAULT_PREFERENCES.focusDurations;
}

export function loadPreferences() {
  try {
    const saved = JSON.parse(localStorage.getItem(PREFERENCES_KEY) || "{}");
    const legacyDurations = JSON.parse(
      localStorage.getItem("momentum-durations") || "null"
    );

    return {
      ...DEFAULT_PREFERENCES,
      ...saved,
      focusDurations: normalizeDurations(
        saved.focusDurations || legacyDurations
      ),
      notifications: {
        ...DEFAULT_PREFERENCES.notifications,
        ...(saved.notifications || {}),
      },
      appearance: {
        ...DEFAULT_PREFERENCES.appearance,
        ...(saved.appearance || {}),
      },
      productivity: {
        ...DEFAULT_PREFERENCES.productivity,
        ...(saved.productivity || {}),
      },
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(nextPreferences) {
  const normalized = {
    ...DEFAULT_PREFERENCES,
    ...nextPreferences,
    focusDurations: normalizeDurations(nextPreferences.focusDurations),
    notifications: {
      ...DEFAULT_PREFERENCES.notifications,
      ...(nextPreferences.notifications || {}),
    },
    appearance: {
      ...DEFAULT_PREFERENCES.appearance,
      ...(nextPreferences.appearance || {}),
    },
    productivity: {
      ...DEFAULT_PREFERENCES.productivity,
      ...(nextPreferences.productivity || {}),
    },
  };

  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(normalized));
  localStorage.setItem(
    "momentum-durations",
    JSON.stringify(normalized.focusDurations)
  );
  localStorage.setItem("momentum-theme", normalized.appearance.theme);
  document.documentElement.classList.toggle(
    "dark",
    normalized.appearance.theme === "dark"
  );
  window.dispatchEvent(new Event(PREFERENCES_UPDATED_EVENT));

  return normalized;
}
