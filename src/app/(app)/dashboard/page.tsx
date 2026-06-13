"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

const ActivityChart = dynamic(
  () => import("@/components/dashboard/activity-chart").then((mod) => mod.ActivityChart),
  { ssr: false, loading: () => <div className="h-[240px] w-full animate-pulse bg-surface-raised rounded-lg border border-border" /> }
);

import { loadTimeTrackerState } from "@/features/time-tracker/time-tracker-storage";
import { buildDailySeries, toDateInputValue } from "@/features/time-tracker/time-tracker-utils";

import { loadDsaProblems } from "@/features/dsa-tracker/dsa-tracker-storage";

import { loadJobApplications } from "@/features/job-tracker/job-tracker-storage";
import { jobStatuses } from "@/features/job-tracker/job-tracker-types";

import { loadHabitTrackerState } from "@/features/habit-tracker/habit-tracker-storage";
import { getOverallStreak } from "@/features/habit-tracker/habit-tracker-utils";
import { useAuth } from "@/features/auth/auth-context";
import { mockTimeState, mockDsaProblems, mockJobs, mockHabits } from "@/lib/mock-data";

import type { TimeEntry } from "@/features/time-tracker/time-tracker-types";
import type { DsaProblem } from "@/features/dsa-tracker/dsa-tracker-types";
import type { JobApplication as JobApp } from "@/features/job-tracker/job-tracker-types";
import type { HabitLog } from "@/features/habit-tracker/habit-tracker-types";

export default function DashboardPage() {
  const { user } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  
  // States
  const [timeState, setTimeState] = useState<{ entries: TimeEntry[] }>({ entries: [] });
  const [dsaProblems, setDsaProblems] = useState<DsaProblem[]>([]);
  const [jobApplications, setJobApplications] = useState<JobApp[]>([]);
  const [habitState, setHabitState] = useState<{ habits: unknown[]; logs: HabitLog[] }>({ habits: [], logs: [] });

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      
      if (user.email === "demo@saimtrack.com") {
        setTimeState(mockTimeState);
        setDsaProblems(mockDsaProblems);
        setJobApplications(mockJobs);
        setHabitState(mockHabits);
      } else {
        const timeTracker = await loadTimeTrackerState(user.uid);
        const dsa = await loadDsaProblems(user.uid);
        const jobs = await loadJobApplications(user.uid);
        const habits = await loadHabitTrackerState(user.uid);

        setTimeState(timeTracker);
        setDsaProblems(dsa);
        setJobApplications(jobs);
        setHabitState(habits);
      }
      
      setHydrated(true);
    }
    
    loadData();
  }, [user]);

  // Custom Time greeting
  const hour = new Date().getHours();
  let greeting = "Good evening";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";

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

  // --- Derived Metrics ---

  const todayStr = toDateInputValue(new Date());

  // Top Metrics
  const streak = useMemo(() => getOverallStreak(habitState.logs).current, [habitState.logs]);
  const hoursToday = useMemo(() => {
    const todayEntries = timeState.entries.filter((e: TimeEntry) => e.date === todayStr);
    const ms = todayEntries.reduce((sum: number, e: TimeEntry) => sum + e.duration, 0);
    return Number((ms / 36e5).toFixed(1));
  }, [timeState.entries, todayStr]);
  const dsaSolvedToday = useMemo(() => {
    return dsaProblems.filter((p: DsaProblem) => p.solvedDate === todayStr).length;
  }, [dsaProblems, todayStr]);

  // Hero Analytics
  const activityData = useMemo(() => buildDailySeries(timeState.entries), [timeState.entries]);
  const lifetimeTotal = useMemo(() => {
    const ms = timeState.entries.reduce((sum: number, e: TimeEntry) => sum + e.duration, 0);
    return Number((ms / 36e5).toFixed(1));
  }, [timeState.entries]);

  // DSA Mission Control
  const totalDsaSolved = dsaProblems.length;
  const DSA_TARGET = 450;
  
  const dsaTopicCounts = useMemo(() => {
    const counts = {} as Record<string, number>;
    dsaProblems.forEach((p: DsaProblem) => {
      counts[p.topic] = (counts[p.topic] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [dsaProblems]);
  
  const currentDsaTopic = dsaProblems.length > 0 
    ? [...dsaProblems].sort((a: DsaProblem, b: DsaProblem) => new Date(b.solvedDate).getTime() - new Date(a.solvedDate).getTime())[0].topic 
    : "None";

  // Job Pipeline
  const jobPipeline = useMemo(() => {
    // We group by status and count them
    const stages = [
      { name: "Applied", filter: ["Applied"], color: "text-text-secondary" },
      { name: "OA", filter: ["OA Received", "OA Cleared"], color: "text-text-primary" },
      { name: "Interview", filter: ["Interview Scheduled", "Interview Completed"], color: "text-accent" },
      { name: "Offer", filter: ["Selected"], color: "text-success" },
      { name: "Rejected", filter: ["Rejected"], color: "text-destructive opacity-60" }
    ];

    return stages.map(stage => {
      const stageApps = jobApplications.filter((app: JobApp) => stage.filter.includes(app.status));
      return {
        ...stage,
        count: stageApps.length,
        apps: stageApps
      };
    });
  }, [jobApplications]);

  // Find upcoming interviews for the Job card
  const upcomingInterviews = useMemo(() => {
    return jobApplications.filter((app: JobApp) => app.status === "Interview Scheduled");
  }, [jobApplications]);

  // Habit Consistency
  const habitConsistencyPercent = useMemo(() => {
    if (habitState.habits.length === 0) return 0;
    // Let's just calculate it over the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyStr = toDateInputValue(thirtyDaysAgo);
    
    const recentLogs = habitState.logs.filter((log: HabitLog) => log.date >= thirtyStr);
    const expected = 30 * habitState.habits.length;
    if (expected === 0) return 0;
    return Math.round((recentLogs.length / expected) * 100);
  }, [habitState.habits, habitState.logs]);

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-12 pb-16">
        <div className="h-10 w-48 bg-surface animate-pulse rounded" />
        <div className="h-[300px] w-full bg-surface animate-pulse rounded-xl border border-border" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 pb-16">
      
      {/* ════════════ ZONE 1: EDITORIAL WELCOME ════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
      >
        <h1 className="text-[28px] font-medium tracking-tight text-text-primary">
          {greeting}, {user?.displayName?.split(' ')[0] || "there"}.
        </h1>
        <p className="mt-1 text-[15px] text-text-secondary">
          {streak > 0 ? `You're on a ${streak}-day streak. Keep the momentum.` : "Time to build momentum."}
        </p>
        
        {/* Inline typography metrics */}
        <div className="mt-5 flex items-center flex-wrap gap-4 text-[13px] text-text-secondary">
          <div className="flex items-center gap-1.5"><span className="text-accent font-medium">🔥 {streak}</span> day streak</div>
          <span className="text-text-tertiary">·</span>
          <div className="flex items-center gap-1.5"><span className="text-accent font-medium">⏱ {hoursToday}</span> hrs today</div>
          <span className="text-text-tertiary">·</span>
          <div className="flex items-center gap-1.5"><span className="text-accent font-medium">✓ {dsaSolvedToday}/5</span> DSA target</div>
        </div>
      </motion.div>

      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex flex-col gap-10">
        
        {/* ════════════ HERO ANALYTICS ════════════ */}
        <motion.section variants={staggerItem} className="rounded-xl border border-border bg-surface p-6 shadow-card hover:border-border-hover hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h3 className="text-[12px] font-medium text-text-tertiary uppercase tracking-[0.06em]">Lifetime Study Hours</h3>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-[56px] font-semibold text-text-primary tracking-tight leading-[1.1]">{lifetimeTotal.toFixed(1)}</span>
                {/* Simplified trend text since we only load current state */}
                <span className="text-[12px] text-text-tertiary">total logged across all time</span>
              </div>
            </div>
            
            <div className="flex gap-4 text-[12px] font-medium text-text-tertiary">
              <button className="text-text-primary border-b border-accent pb-1">Lifetime</button>
            </div>
          </div>
          
          <ActivityChart data={activityData} />
        </motion.section>

        {/* ════════════ GRID LAYOUT ════════════ */}
        <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-8">
          
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-8">
            
            {/* DSA Mission Control */}
            <motion.section variants={staggerItem} className="rounded-xl border border-border bg-surface p-6 shadow-card hover:border-border-hover hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex flex-col md:flex-row items-center gap-10">
                {/* Arc Vis */}
                <div className="relative flex shrink-0 items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-[160px] h-[160px] -rotate-90">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="var(--surface-raised)" strokeWidth="4" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="var(--accent)" 
                      strokeWidth="4" 
                      strokeDasharray="282.7" 
                      strokeDashoffset={282.7 - (282.7 * Math.min(totalDsaSolved / DSA_TARGET, 1))} 
                      className="transition-all duration-1000 ease-out" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[28px] font-semibold text-text-primary leading-none tracking-tight">{totalDsaSolved}</span>
                    <span className="text-[11px] text-text-tertiary mt-1">/ {DSA_TARGET}</span>
                  </div>
                </div>

                <div className="flex-1 w-full">
                  <h2 className="text-[14px] font-medium text-text-primary mb-4">Topic Completion</h2>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {dsaTopicCounts.slice(0, 4).map(([topic, count]) => (
                      <span key={topic} className="h-5 px-2 rounded flex items-center text-[11px] font-medium bg-surface-raised text-text-secondary border border-border tracking-[0.04em]">
                        {topic} ({count})
                      </span>
                    ))}
                    {dsaTopicCounts.length === 0 && (
                      <span className="text-[12px] text-text-tertiary italic">No topics solved yet.</span>
                    )}
                  </div>
                  
                  <div className="w-full bg-accent-subtle border-l-[3px] border-accent p-3 rounded-r-md">
                    <p className="text-[13px] font-medium text-text-primary">Currently studying: {currentDsaTopic}</p>
                    <p className="text-[12px] text-text-tertiary mt-0.5">{Math.max(5 - dsaSolvedToday, 0)} problems to solve today</p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Job Pipeline */}
            <motion.section variants={staggerItem} className="rounded-xl border border-border bg-surface p-6 shadow-card hover:border-border-hover hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[14px] font-medium text-text-primary">Application Pipeline</h2>
              </div>

              <div className="flex gap-5 overflow-x-auto pb-4 no-scrollbar">
                {jobPipeline.map((stage) => (
                  <div key={stage.name} className="flex-1 min-w-[150px] flex flex-col">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
                      <span className={`text-[11px] font-medium uppercase tracking-[0.06em] ${stage.color}`}>{stage.name}</span>
                      <span className="bg-surface-raised border border-border px-1.5 py-0.5 rounded text-[10px] text-text-secondary font-medium">{stage.count}</span>
                    </div>

                    {stage.name === "Interview" && upcomingInterviews.length > 0 ? (
                      upcomingInterviews.slice(0, 2).map((app: JobApp) => (
                        <div key={app.id} className="rounded-lg bg-background border border-border p-3 shadow-sm hover:border-border-hover transition-colors mb-2">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[13px] font-medium text-text-primary truncate">{app.companyName}</span>
                            <span className="text-[10px] text-text-secondary whitespace-nowrap bg-surface px-1.5 py-0.5 rounded ml-2 border border-border">{app.role}</span>
                          </div>
                          <div className="text-[11px] text-text-secondary truncate">{app.role}</div>
                          <div className="mt-2 text-[10px] text-text-tertiary italic truncate">{app.notes || "No notes"}</div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-lg border border-border border-dashed h-[64px] flex items-center justify-center text-[11px] text-text-tertiary">
                        {stage.count > 0 ? `${stage.count} total` : "No items"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.section>

          </div>

          {/* RIGHT COLUMN (Context Panel) */}
          <div className="flex flex-col gap-8">
            
            {/* Habits Contribution Graph */}
            <motion.section variants={staggerItem} className="rounded-xl border border-border bg-surface p-6 shadow-card hover:border-border-hover hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[14px] font-medium text-text-primary">Habit Consistency (Past 30 Days)</h2>
              </div>
              
              <div className="flex justify-center w-full overflow-x-hidden mb-6">
                <div className="flex gap-[3px]">
                  {/* Render last 24 days as simple squares to simulate a GitHub graph but purely for aesthetics based on real data logs. */}
                  {Array.from({ length: 24 }).map((_, col) => (
                    <div key={col} className="flex flex-col gap-[3px]">
                      {Array.from({ length: 7 }).map((_, row) => {
                        // We simulate the data mapping by mapping cell index to recent dates
                        const cellDate = new Date();
                        cellDate.setDate(cellDate.getDate() - (168 - (col * 7 + row))); // 168 = 24 * 7
                        const dateStr = toDateInputValue(cellDate);
                        
                        const logsOnDate = habitState.logs.filter((l: HabitLog) => l.date === dateStr);
                        const level = Math.min(logsOnDate.length, 4);

                        return (
                          <div 
                            key={row} 
                            className="w-[10px] h-[10px] rounded-[2px] transition-transform hover:scale-110 cursor-pointer" 
                            style={{ backgroundColor: level === 0 ? 'rgba(255,255,255,0.04)' : `rgba(203,163,101,${level * 0.25})` }} 
                            title={level > 0 ? `${level} habits completed on ${dateStr}` : "No activity"}
                          />
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-5">
                <div>
                  <div className="text-[28px] font-semibold text-text-primary leading-none tracking-tight">{habitConsistencyPercent}%</div>
                  <div className="text-[12px] text-text-tertiary mt-1">Consistency this month</div>
                </div>
                <div className="text-right">
                  <div className="text-[14px] font-medium text-text-primary">{getOverallStreak(habitState.logs).longest} Days</div>
                  <div className="text-[12px] text-text-tertiary mt-0.5">Longest streak</div>
                </div>
              </div>
            </motion.section>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
