export function getSessionMinutes(session) {
  return Number(session?.duration ?? session?.minutes ?? 0) || 0;
}

export function getSessionDate(session) {
  return new Date(session?.timestamp || session?.date || session?.createdAt);
}

export function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function startOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function dayKey(date) {
  return new Date(date).toISOString().slice(0, 10);
}

export function calculateStreak(sessions) {
  const dateSet = new Set(
    sessions
      .map(getSessionDate)
      .filter((date) => !Number.isNaN(date.getTime()))
      .map((date) => dayKey(date))
  );

  let streak = 0;
  const cursor = startOfDay();

  while (dateSet.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function calculateProductivityMetrics(
  sessions,
  { dailyGoal = 120, weeklyGoal = 600 } = {}
) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now);

  const validSessions = sessions
    .map((session) => ({
      ...session,
      date: getSessionDate(session),
      minutes: getSessionMinutes(session),
    }))
    .filter((session) => !Number.isNaN(session.date.getTime()));

  const totalMinutes = validSessions.reduce(
    (sum, session) => sum + session.minutes,
    0
  );
  const todaySessions = validSessions.filter((session) => session.date >= todayStart);
  const weekSessions = validSessions.filter((session) => session.date >= weekStart);
  const todayMinutes = todaySessions.reduce((sum, session) => sum + session.minutes, 0);
  const weekMinutes = weekSessions.reduce((sum, session) => sum + session.minutes, 0);
  const completedSessions = validSessions.length;
  const averageMinutes = completedSessions
    ? Math.round(totalMinutes / completedSessions)
    : 0;

  return {
    totalMinutes,
    todayMinutes,
    weekMinutes,
    completedSessions,
    todaySessions: todaySessions.length,
    weekSessions: weekSessions.length,
    streak: calculateStreak(validSessions),
    averageMinutes,
    dailyGoal,
    weeklyGoal,
    dailyProgress: Math.min(100, Math.round((todayMinutes / dailyGoal) * 100)),
    weeklyProgress: Math.min(100, Math.round((weekMinutes / weeklyGoal) * 100)),
  };
}
