export type Habit = {
  id: string;
  name: string;
  createdAt: string;
  preset: boolean;
};

export type HabitLog = {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
};

export type HabitTrackerState = {
  habits: Habit[];
  logs: HabitLog[];
};
