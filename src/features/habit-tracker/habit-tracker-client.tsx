"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Dumbbell, Flame, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  loadHabitTrackerState,
  saveHabitTrackerState,
} from "@/features/habit-tracker/habit-tracker-storage";
import {
  formatDayLabel,
  formatMonthLabel,
  getCurrentMonthGrid,
  getHeatmapCounts,
  getHabitCompletionRate,
  getHabitStreak,
  getOverallStreak,
  toDateKey,
} from "@/features/habit-tracker/habit-tracker-utils";
import type { Habit, HabitLog } from "@/features/habit-tracker/habit-tracker-types";
import { useAuth } from "@/features/auth/auth-context";

const presetHabits = [
  "DSA",
  "Gym",
  "Reading",
  "LinkedIn Post",
  "Water Intake",
  "Meditation",
] as const;

// Animation configurations
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } }
};

export function HabitTrackerClient() {
  const { user } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [newHabitName, setNewHabitName] = useState("");
  const [selectedHabitId, setSelectedHabitId] = useState<string>("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function init() {
      if (!user) return;
      const state = await loadHabitTrackerState(user.uid);
      if (state.habits.length) {
        setHabits(state.habits);
      } else {
        const now = new Date().toISOString();
        setHabits(
          presetHabits.map((name) => ({
            id: crypto.randomUUID(),
            name,
            createdAt: now,
            preset: true,
          })),
        );
      }

      setLogs(state.logs);
      setHydrated(true);
    }
    init();
  }, [user]);

  const todayKey = toDateKey();
  const todayLogs = logs.filter((log) => log.date === todayKey && log.completed);
  const todayCompletedIds = new Set(todayLogs.map((log) => log.habitId));
  const currentHabit = habits.find((habit) => habit.id === selectedHabitId) ?? habits[0];
  const selectedHabitMetrics = currentHabit ? getHabitStreak(currentHabit.id, logs) : { current: 0, longest: 0 };
  const overallStreak = getOverallStreak(logs);
  const heatmapCounts = getHeatmapCounts(logs);
  const gridDays = getCurrentMonthGrid();
  const pastSevenDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    date.setHours(0, 0, 0, 0);
    return date;
  });

  const filteredHabits = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return habits.filter((habit) => habit.name.toLowerCase().includes(normalized));
  }, [habits, search]);

  useEffect(() => {
    if (!selectedHabitId && habits[0]) {
      setSelectedHabitId(habits[0].id);
    }
  }, [habits, selectedHabitId]);

  function addHabit() {
    const name = newHabitName.trim();
    if (!name) {
      toast.error("Enter a habit name first.");
      return;
    }

    const habit: Habit = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
      preset: false,
    };

    const nextHabits = [habit, ...habits];
    setHabits(nextHabits);
    if (user) saveHabitTrackerState(user.uid, { habits: nextHabits, logs });

    setNewHabitName("");
    toast.success("Habit added.");
  }

  function removeHabit(id: string) {
    const nextHabits = habits.filter((habit) => habit.id !== id);
    const nextLogs = logs.filter((log) => log.habitId !== id);
    setHabits(nextHabits);
    setLogs(nextLogs);
    if (user) saveHabitTrackerState(user.uid, { habits: nextHabits, logs: nextLogs });
    toast.success("Habit removed.");
  }

  function toggleToday(habitId: string) {
    const nextLogs = logs.map(log => ({...log}));
    const existing = nextLogs.find((log) => log.habitId === habitId && log.date === todayKey);
    
    if (existing) {
      const filtered = nextLogs.filter((log) => log.id !== existing.id);
      setLogs(filtered);
      if (user) saveHabitTrackerState(user.uid, { habits, logs: filtered });
    } else {
      const next = {
        id: crypto.randomUUID(),
        habitId,
        date: todayKey,
        completed: true,
      };
      const updated = [next, ...nextLogs];
      setLogs(updated);
      if (user) saveHabitTrackerState(user.uid, { habits, logs: updated });
    }
  }

  function resetWorkspace() {
    const now = new Date().toISOString();
    const newHabits = presetHabits.map((name) => ({
      id: crypto.randomUUID(),
      name,
      createdAt: now,
      preset: true,
    }));
    setHabits(newHabits);
    setLogs([]);
    if (user) saveHabitTrackerState(user.uid, { habits: newHabits, logs: [] });
    setNewHabitName("");
    setSearch("");
    setSelectedHabitId("");
    toast.message("Habit tracker reset.");
  }

  if (!hydrated) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-surface animate-pulse rounded" />
        <div className="h-[300px] w-full bg-surface animate-pulse rounded-xl border border-border" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 pb-16">
      
      {/* ════════════ HEADER ════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <h1 className="text-[28px] font-medium tracking-tight text-text-primary">
            Habit Tracker
          </h1>
          <p className="mt-1 text-[15px] text-text-secondary">
            Daily consistency and long-term momentum.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-medium text-text-secondary">{habits.length} habits tracked</span>
          <span className="text-text-tertiary">|</span>
          <button 
            onClick={resetWorkspace} 
            className="flex items-center gap-2 text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>
      </motion.div>

      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex flex-col gap-10">
        
        {/* ════════════ TYPOGRAPHIC STATS ════════════ */}
        <motion.section variants={staggerItem} className="grid grid-cols-2 md:grid-cols-4 gap-8 py-6 border-y border-border">
          <div className="flex flex-col">
            <span className="text-[11px] text-text-tertiary uppercase tracking-widest font-medium mb-1">Today</span>
            <span className="text-[28px] text-text-primary font-medium tracking-tight">{todayLogs.length}<span className="text-[20px] text-text-tertiary">/{habits.length || 1}</span></span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-accent uppercase tracking-widest font-medium mb-1">Current Streak</span>
            <span className="text-[28px] text-text-primary font-medium tracking-tight">{selectedHabitMetrics.current}<span className="text-[20px] text-text-tertiary">d</span></span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-text-secondary uppercase tracking-widest font-medium mb-1">Longest Streak</span>
            <span className="text-[28px] text-text-primary font-medium tracking-tight">{selectedHabitMetrics.longest}<span className="text-[20px] text-text-tertiary">d</span></span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-text-secondary uppercase tracking-widest font-medium mb-1">Global Streak</span>
            <span className="text-[28px] text-text-primary font-medium tracking-tight">{overallStreak.current}<span className="text-[20px] text-text-tertiary">d</span></span>
          </div>
        </motion.section>

        {/* ════════════ TWO COLUMN LAYOUT ════════════ */}
        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-8">
          
          {/* LEFT: Check-ins & Heatmap */}
          <motion.div variants={staggerItem} className="flex flex-col gap-8">
            <section className="rounded-xl border border-border bg-surface p-6 shadow-card hover:border-border-hover transition-all duration-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[14px] font-medium text-text-primary">Today&apos;s Log</h2>
              </div>

              <div className="flex flex-col border-t border-border">
                <AnimatePresence initial={false}>
                  {filteredHabits.length ? (
                    filteredHabits.map((habit) => {
                      const completed = todayCompletedIds.has(habit.id);
                      const rate = getHabitCompletionRate(habit, logs);
                      const streak = getHabitStreak(habit.id, logs);

                      return (
                        <motion.div
                          key={habit.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="group flex flex-col py-4 border-b border-border last:border-0"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => toggleToday(habit.id)}
                                className={`flex items-center justify-center h-5 w-5 rounded border transition-colors ${
                                  completed 
                                    ? "bg-accent border-accent text-background" 
                                    : "border-border hover:border-accent hover:bg-accent/10 text-transparent"
                                }`}
                              >
                                <Check className="h-3 w-3" />
                              </button>
                              <div className="flex flex-col">
                                <span className={`text-[14px] font-medium transition-colors ${completed ? "text-text-primary" : "text-text-secondary"}`}>
                                  {habit.name}
                                </span>
                                <span className="text-[11px] text-text-tertiary mt-0.5">
                                  {rate}% · Streak: {streak.current}d
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              {!habit.preset && (
                                <button onClick={() => removeHabit(habit.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-text-tertiary hover:text-destructive">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="py-12 text-center text-[13px] text-text-tertiary">No habits tracked yet.</div>
                  )}
                </AnimatePresence>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-surface p-6 shadow-card hover:border-border-hover transition-all duration-200">
              <h2 className="text-[14px] font-medium text-text-primary mb-6">Activity Heatmap</h2>
              <div className="grid grid-cols-7 gap-2">
                {gridDays.map((date) => {
                  const key = toDateKey(date);
                  const count = heatmapCounts.get(key) ?? 0;
                  return (
                    <div
                      key={key}
                      className="group relative flex aspect-square items-center justify-center rounded-md border border-border text-[10px] text-text-secondary font-medium transition"
                      title={`${formatMonthLabel(date)} · ${count} completions`}
                      style={{
                        background:
                          count === 0
                            ? "transparent"
                            : count === 1
                              ? "rgba(203,163,101,0.16)"
                              : count === 2
                                ? "rgba(203,163,101,0.28)"
                                : "rgba(203,163,101,0.5)",
                      }}
                    >
                      <span>{date.getDate()}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          </motion.div>

          {/* RIGHT: Add Habit & Snapshot */}
          <motion.div variants={staggerItem} className="flex flex-col gap-8">
            <section className="rounded-xl border border-border bg-surface p-6 shadow-card hover:border-border-hover transition-all duration-200">
              <h2 className="text-[14px] font-medium text-text-primary mb-6">Manage Habits</h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[12px] font-medium text-text-secondary">New Habit</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 h-9 bg-background border border-border rounded-md px-3 text-[13px] text-text-primary focus:outline focus:outline-2 focus:outline-accent outline-offset-0 placeholder:text-text-tertiary transition-all"
                      placeholder="E.g., Read 10 pages"
                      value={newHabitName}
                      onChange={(e) => setNewHabitName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addHabit()}
                    />
                    <button onClick={addHabit} className="h-9 px-4 bg-accent text-background rounded-md text-[13px] font-semibold hover:opacity-90 transition-opacity">
                      Add
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-border space-y-2">
                  <label className="text-[12px] font-medium text-text-secondary">Search</label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                    <input
                      type="text"
                      className="w-full h-9 bg-background border border-border rounded-md pl-9 pr-3 text-[13px] text-text-primary focus:outline focus:outline-2 focus:outline-accent outline-offset-0 placeholder:text-text-tertiary transition-all"
                      placeholder="Filter habits..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] font-medium text-text-secondary">Focus Metrics</label>
                  <select
                    className="h-9 w-full bg-background border border-border rounded-md px-3 text-[13px] text-text-primary focus:outline focus:outline-2 focus:outline-accent outline-offset-0 transition-all"
                    value={selectedHabitId}
                    onChange={(e) => setSelectedHabitId(e.target.value)}
                  >
                    {habits.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-surface p-6 shadow-card hover:border-border-hover transition-all duration-200">
              <h2 className="text-[14px] font-medium text-text-primary mb-6">Weekly Progress</h2>
              
              <div className="space-y-4">
                {pastSevenDays.map((date) => {
                  const key = toDateKey(date);
                  const count = heatmapCounts.get(key) ?? 0;
                  const percent = habits.length ? (count / habits.length) * 100 : 0;
                  
                  return (
                    <div key={key} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-widest text-text-tertiary">
                        <span>{formatDayLabel(date)}</span>
                        <span>{count}/{habits.length}</span>
                      </div>
                      <div className="h-1.5 w-full bg-background rounded-full overflow-hidden border border-border">
                        <div 
                          className="h-full bg-accent rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
