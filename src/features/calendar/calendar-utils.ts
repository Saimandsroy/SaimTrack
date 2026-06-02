import type { CalendarEvent, CalendarEventType } from "@/features/calendar/calendar-types";

const weekdayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });
const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});
const shortMonthDayFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

export type CalendarGridDay = {
  date: Date;
  key: string;
  inCurrentMonth: boolean;
  isToday: boolean;
};

export function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function toTimeInputValue(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function formatMonthTitle(date: Date) {
  return monthFormatter.format(date);
}

export function formatShortDate(date: string) {
  return shortMonthDayFormatter.format(new Date(date));
}

export function formatWeekday(date: Date) {
  return weekdayFormatter.format(date);
}

export function formatDateTime(date: string, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const dateTime = new Date(date);
  dateTime.setHours(hours, minutes, 0, 0);
  return dateTime;
}

export function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function buildCalendarGrid(referenceDate: Date): CalendarGridDay[] {
  const firstDay = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const start = new Date(firstDay);
  start.setDate(start.getDate() - start.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);

    return {
      date,
      key: toDateInputValue(date),
      inCurrentMonth: date.getMonth() === referenceDate.getMonth(),
      isToday: isSameDay(date, new Date()),
    };
  });
}

export function groupEventsByDate(events: CalendarEvent[]) {
  return events.reduce<Record<string, CalendarEvent[]>>((groups, event) => {
    groups[event.date] ??= [];
    groups[event.date].push(event);
    groups[event.date].sort((left, right) => {
      const leftTime = `${left.startTime}`;
      const rightTime = `${right.startTime}`;
      return leftTime.localeCompare(rightTime);
    });
    return groups;
  }, {});
}

export function createSeedEvents(referenceDate: Date): CalendarEvent[] {
  const base = new Date(referenceDate);
  const offsets: Array<{
    offset: number;
    title: string;
    type: CalendarEventType;
    startTime: string;
    endTime: string;
    notes: string;
  }> = [
    {
      offset: 0,
      title: "Weekly planning",
      type: "Goals",
      startTime: "09:00",
      endTime: "09:30",
      notes: "Review priorities and set a calm plan for the week.",
    },
    {
      offset: 1,
      title: "DSA practice block",
      type: "DSA",
      startTime: "18:30",
      endTime: "20:00",
      notes: "Arrays and two pointers refresher.",
    },
    {
      offset: 2,
      title: "Application sprint",
      type: "Jobs",
      startTime: "11:00",
      endTime: "12:15",
      notes: "Tailor resume bullets and send 3 applications.",
    },
    {
      offset: 4,
      title: "Learning journal review",
      type: "Learning",
      startTime: "20:15",
      endTime: "20:45",
      notes: "Summarize one article and capture takeaways.",
    },
  ];

  return offsets.map((item) => {
    const date = new Date(base);
    date.setDate(base.getDate() + item.offset);

    return {
      id: crypto.randomUUID(),
      title: item.title,
      type: item.type,
      date: toDateInputValue(date),
      startTime: item.startTime,
      endTime: item.endTime,
      notes: item.notes,
      createdAt: new Date().toISOString(),
    };
  });
}
