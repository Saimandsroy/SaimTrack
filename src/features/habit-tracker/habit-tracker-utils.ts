import type { Habit, HabitLog } from "@/features/habit-tracker/habit-tracker-types";

export function toDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getPastDays(days: number) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - index));
    date.setHours(0, 0, 0, 0);
    return date;
  });
}

export function formatDayLabel(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
  }).format(date);
}

export function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function getLogMap(logs: HabitLog[]) {
  const map = new Map<string, HabitLog[]>();
  for (const log of logs) {
    const list = map.get(log.date) ?? [];
    map.set(log.date, [...list, log]);
  }
  return map;
}

export function getHabitLogsForDate(habitId: string, date: string, logs: HabitLog[]) {
  return logs.find((log) => log.habitId === habitId && log.date === date);
}

export function getHabitCompletionRate(habit: Habit, logs: HabitLog[]) {
  const completed = logs.filter((log) => log.habitId === habit.id && log.completed).length;
  const total = logs.filter((log) => log.habitId === habit.id).length;
  return total ? Math.round((completed / total) * 100) : 0;
}

export function getHabitStreak(habitId: string, logs: HabitLog[]) {
  const completedDates = new Set(
    logs.filter((log) => log.habitId === habitId && log.completed).map((log) => log.date),
  );

  let current = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let offset = 0; offset < 365; offset += 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - offset);
    if (completedDates.has(toDateKey(date))) {
      current += 1;
    } else {
      break;
    }
  }

  let longest = 0;
  let running = 0;
  let previousKey: string | null = null;
  for (const key of Array.from(completedDates).sort()) {
    if (previousKey) {
      const previousDate = new Date(`${previousKey}T00:00:00`);
      const currentDate = new Date(`${key}T00:00:00`);
      const dayDifference = Math.round(
        (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      running = dayDifference === 1 ? running + 1 : 1;
    } else {
      running = 1;
    }

    longest = Math.max(longest, running);
    previousKey = key;
  }

  return {
    current,
    longest,
  };
}

export function getOverallStreak(logs: HabitLog[]) {
  const completedDates = new Set(logs.filter((log) => log.completed).map((log) => log.date));

  let current = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let offset = 0; offset < 365; offset += 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - offset);
    if (completedDates.has(toDateKey(date))) {
      current += 1;
    } else {
      break;
    }
  }

  let longest = 0;
  let running = 0;
  let previousKey: string | null = null;
  for (const key of Array.from(completedDates).sort()) {
    if (previousKey) {
      const previousDate = new Date(`${previousKey}T00:00:00`);
      const currentDate = new Date(`${key}T00:00:00`);
      const dayDifference = Math.round(
        (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      running = dayDifference === 1 ? running + 1 : 1;
    } else {
      running = 1;
    }

    longest = Math.max(longest, running);
    previousKey = key;
  }

  return { current, longest };
}

export function getHeatmapCounts(logs: HabitLog[]) {
  const counts = new Map<string, number>();
  for (const log of logs) {
    if (!log.completed) {
      continue;
    }

    counts.set(log.date, (counts.get(log.date) ?? 0) + 1);
  }
  return counts;
}

export function getCurrentMonthGrid() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const start = new Date(firstDay);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));

  const cells = Array.from({ length: 35 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    date.setHours(0, 0, 0, 0);
    return date;
  });

  return cells;
}
