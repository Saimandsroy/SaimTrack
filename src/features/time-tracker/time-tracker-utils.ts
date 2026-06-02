import type { TimeCategory, TimeEntry, TimeTrackerPeriod } from "@/features/time-tracker/time-tracker-types";

export function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export function formatTime(dateString: string) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateString));
}

export function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

export function formatMonthLabel(dateString: string) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

export function formatDayLabel(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
  }).format(date);
}

export function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function toTimeInputValue(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function combineDateAndTime(dateValue: string, timeValue: string) {
  return new Date(`${dateValue}T${timeValue}:00`).toISOString();
}

export function periodLabel(period: TimeTrackerPeriod) {
  switch (period) {
    case "today":
      return "Today";
    case "week":
      return "Weekly";
    case "month":
      return "Monthly";
    case "year":
      return "Yearly";
    case "lifetime":
      return "Lifetime";
  }
}

export function getPeriodStart(period: TimeTrackerPeriod, now = new Date()) {
  const date = new Date(now);
  if (period === "today") {
    date.setHours(0, 0, 0, 0);
  } else if (period === "week") {
    const day = date.getDay();
    const offset = day === 0 ? 6 : day - 1;
    date.setDate(date.getDate() - offset);
    date.setHours(0, 0, 0, 0);
  } else if (period === "month") {
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
  } else if (period === "year") {
    date.setMonth(0, 1);
    date.setHours(0, 0, 0, 0);
  } else {
    date.setFullYear(1970, 0, 1);
    date.setHours(0, 0, 0, 0);
  }

  return date;
}

export function isWithinPeriod(dateValue: string, period: TimeTrackerPeriod) {
  if (period === "lifetime") {
    return true;
  }

  const entryDate = new Date(dateValue);
  return entryDate >= getPeriodStart(period);
}

export function filterEntries(entries: TimeEntry[], period: TimeTrackerPeriod) {
  return entries.filter((entry) => isWithinPeriod(entry.date, period));
}

export function sumDuration(entries: TimeEntry[]) {
  return entries.reduce((total, entry) => total + entry.duration, 0);
}

export function averageDuration(entries: TimeEntry[]) {
  return entries.length ? sumDuration(entries) / entries.length : 0;
}

export function mostActiveCategory(entries: TimeEntry[]) {
  const totals = new Map<TimeCategory, number>();
  for (const entry of entries) {
    totals.set(entry.category, (totals.get(entry.category) ?? 0) + entry.duration);
  }

  let winner: TimeCategory = "Other";
  let max = 0;
  for (const [category, total] of totals.entries()) {
    if (total > max) {
      winner = category;
      max = total;
    }
  }

  return winner;
}

export function buildDailySeries(entries: TimeEntry[]) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    date.setHours(0, 0, 0, 0);

    return {
      date,
      label: formatDayLabel(date),
      total: 0,
    };
  });

  for (const entry of entries) {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);

    const bucket = days.find((day) => day.date.getTime() === entryDate.getTime());
    if (bucket) {
      bucket.total += entry.duration;
    }
  }

  return days.map(({ label, total }) => ({
    name: label,
    hours: Number((total / 36e5).toFixed(1)),
  }));
}

export function buildWeeklySeries(entries: TimeEntry[]) {
  const weeks = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    const currentDay = date.getDay() || 7;
    date.setDate(date.getDate() - (currentDay - 1) - (5 - index) * 7);
    date.setHours(0, 0, 0, 0);

    return {
      date,
      label: `W${index + 1}`,
      total: 0,
    };
  });

  for (const entry of entries) {
    const entryDate = new Date(entry.date);
    const currentDay = entryDate.getDay() || 7;
    entryDate.setDate(entryDate.getDate() - (currentDay - 1));
    entryDate.setHours(0, 0, 0, 0);

    const bucket = weeks.find((week) => week.date.getTime() === entryDate.getTime());
    if (bucket) {
      bucket.total += entry.duration;
    }
  }

  return weeks.map(({ label, total }) => ({
    name: label,
    hours: Number((total / 36e5).toFixed(1)),
  }));
}

export function buildMonthlySeries(entries: TimeEntry[]) {
  const months = Array.from({ length: 12 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - index), 1);
    date.setHours(0, 0, 0, 0);

    return {
      date,
      label: formatMonthLabel(date.toISOString()),
      total: 0,
    };
  });

  for (const entry of entries) {
    const entryDate = new Date(entry.date);
    entryDate.setDate(1);
    entryDate.setHours(0, 0, 0, 0);

    const bucket = months.find((month) => month.date.getTime() === entryDate.getTime());
    if (bucket) {
      bucket.total += entry.duration;
    }
  }

  return months.map(({ label, total }) => ({
    name: label,
    hours: Number((total / 36e5).toFixed(1)),
  }));
}

export function buildCategorySeries(entries: TimeEntry[]) {
  const totals = new Map<TimeCategory, number>();
  for (const entry of entries) {
    totals.set(entry.category, (totals.get(entry.category) ?? 0) + entry.duration);
  }

  return Array.from(totals.entries()).map(([name, value]) => ({
    name,
    value: Number((value / 36e5).toFixed(1)),
  }));
}
