export const calendarEventTypes = [
  "Study",
  "DSA",
  "Jobs",
  "Learning",
  "Habits",
  "Goals",
  "Personal",
] as const;

export type CalendarEventType = (typeof calendarEventTypes)[number];

export type CalendarEvent = {
  id: string;
  title: string;
  type: CalendarEventType;
  date: string;
  startTime: string;
  endTime: string;
  notes: string;
  createdAt: string;
};

export type CalendarState = {
  events: CalendarEvent[];
};
