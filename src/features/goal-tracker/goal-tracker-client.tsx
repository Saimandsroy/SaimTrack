"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarClock,
  CheckCircle2,
  FlagTriangleRight,
  Goal as GoalIcon,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type SelectHTMLAttributes } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  loadGoals,
  saveGoals,
} from "@/features/goal-tracker/goal-tracker-storage";
import { useAuth } from "@/features/auth/auth-context";
import {
  daysLeft,
  formatGoalDeadline,
  getGoalCompletionRate,
  getScopeProgress,
  isOverdue,
} from "@/features/goal-tracker/goal-tracker-utils";
import {
  goalScopes,
  type Goal,
  type GoalScope,
} from "@/features/goal-tracker/goal-tracker-types";

const goalSchema = z.object({
  title: z.string().min(2, "Add a goal title."),
  scope: z.enum(goalScopes),
  target: z.coerce.number().min(1, "Target must be at least 1."),
  progress: z.coerce.number().min(0, "Progress cannot be negative."),
  deadline: z.string().min(1, "Pick a deadline."),
  notes: z.string().max(500, "Keep notes under 500 characters.").default(""),
});

type GoalFormValues = z.output<typeof goalSchema>;

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

export function GoalTrackerClient() {
  const { user } = useAuth();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [search, setSearch] = useState("");
  const [scopeFilter, setScopeFilter] = useState<GoalScope | "all">("all");

  const form = useForm<z.input<typeof goalSchema>, unknown, GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: "",
      scope: "Monthly",
      target: 10,
      progress: 0,
      deadline: new Date().toISOString().slice(0, 10),
      notes: "",
    },
  });

  useEffect(() => {
    async function init() {
      if (!user) return;
      const stored = await loadGoals(user.uid);
      setGoals(stored);
      setHydrated(true);
    }
    init();
  }, [user]);

  const filteredGoals = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return goals
      .filter((goal) => (scopeFilter === "all" ? true : goal.scope === scopeFilter))
      .filter((goal) => {
        if (!normalized) return true;
        return [goal.title, goal.scope, goal.notes].some((value) =>
          value.toLowerCase().includes(normalized),
        );
      })
      .sort((left, right) => new Date(left.deadline).getTime() - new Date(right.deadline).getTime());
  }, [goals, scopeFilter, search]);

  const monthly = getScopeProgress(goals, "Monthly");
  const quarterly = getScopeProgress(goals, "Quarterly");
  const yearly = getScopeProgress(goals, "Yearly");
  const completionRate = getGoalCompletionRate(goals);

  function addGoal(values: GoalFormValues) {
    const goal: Goal = {
      id: crypto.randomUUID(),
      title: values.title,
      scope: values.scope,
      target: values.target,
      progress: values.progress,
      deadline: new Date(`${values.deadline}T09:00:00`).toISOString(),
      notes: values.notes ?? "",
      completed: values.progress >= values.target,
      createdAt: new Date().toISOString(),
    };

    const nextGoals = [goal, ...goals];
    setGoals(nextGoals);
    if (user) saveGoals(user.uid, nextGoals);

    form.reset({
      title: "",
      scope: values.scope,
      target: values.target,
      progress: values.progress,
      deadline: values.deadline,
      notes: "",
    });
    toast.success("Goal saved.");
  }

  function updateGoal(id: string, patch: Partial<Goal>) {
    const nextGoals = goals.map((goal) =>
      goal.id === id
        ? {
            ...goal,
            ...patch,
            completed: patch.completed ?? (patch.progress !== undefined ? patch.progress >= goal.target : goal.completed),
          }
        : goal,
    );
    setGoals(nextGoals);
    if (user) saveGoals(user.uid, nextGoals);
  }

  function removeGoal(id: string) {
    const nextGoals = goals.filter((goal) => goal.id !== id);
    setGoals(nextGoals);
    if (user) saveGoals(user.uid, nextGoals);
    toast.success("Goal removed.");
  }

  function resetWorkspace() {
    setGoals([]);
    if (user) saveGoals(user.uid, []);
    setSearch("");
    setScopeFilter("all");
    toast.message("Goal workspace cleared.");
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-[28px] font-medium tracking-tight text-text-primary">
              Goal Tracker
            </h1>
            <p className="mt-1 text-[15px] text-text-secondary">
              Set and execute on macro milestones.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/goals/completed" 
              className="text-[13px] font-medium text-text-secondary hover:text-success transition-colors border border-border bg-surface hover:bg-surface-raised px-4 py-1.5 rounded-md flex items-center gap-2"
            >
              <Trophy className="h-4 w-4" /> Trophy Room
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-medium text-text-secondary">{filteredGoals.length} goals</span>
              <span className="text-text-tertiary">|</span>
              <button 
                onClick={resetWorkspace} 
                className="flex items-center gap-2 text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex flex-col gap-10">
        
        {/* ════════════ TYPOGRAPHIC STATS ════════════ */}
        <motion.section variants={staggerItem} className="grid grid-cols-2 md:grid-cols-4 gap-8 py-6 border-y border-border">
          <div className="flex flex-col">
            <span className="text-[11px] text-text-tertiary uppercase tracking-widest font-medium mb-1">Monthly</span>
            <span className="text-[28px] text-text-primary font-medium tracking-tight">{monthly.completed}<span className="text-[20px] text-text-tertiary">/{monthly.total}</span></span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-accent uppercase tracking-widest font-medium mb-1">Quarterly</span>
            <span className="text-[28px] text-text-primary font-medium tracking-tight">{quarterly.completed}<span className="text-[20px] text-text-tertiary">/{quarterly.total}</span></span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-text-secondary uppercase tracking-widest font-medium mb-1">Yearly</span>
            <span className="text-[28px] text-text-primary font-medium tracking-tight">{yearly.completed}<span className="text-[20px] text-text-tertiary">/{yearly.total}</span></span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-text-secondary uppercase tracking-widest font-medium mb-1">Win Rate</span>
            <span className="text-[28px] text-text-primary font-medium tracking-tight">{completionRate}<span className="text-[20px] text-text-tertiary">%</span></span>
          </div>
        </motion.section>

        {/* ════════════ TWO COLUMN LAYOUT ════════════ */}
        <div className="grid grid-cols-1 xl:grid-cols-[0.8fr_1.2fr] gap-8">
          
          {/* LEFT: Add Goal */}
          <motion.div variants={staggerItem} className="flex flex-col gap-8">
            <section className="rounded-xl border border-border bg-surface p-6 shadow-card hover:border-border-hover transition-all duration-200">
              <h2 className="text-[14px] font-medium text-text-primary mb-6">Create Goal</h2>

              <form className="space-y-4" onSubmit={form.handleSubmit(addGoal)}>
                <div className="space-y-2">
                  <label className="text-[12px] font-medium text-text-secondary">Title</label>
                  <input type="text" {...form.register("title")} className="w-full h-9 bg-background border border-border rounded-md px-3 text-[13px] text-text-primary focus:outline focus:outline-2 focus:outline-accent outline-offset-0 placeholder:text-text-tertiary transition-all" placeholder="E.g., Complete 100 LeetCode" />
                  <FormError message={form.formState.errors.title?.message} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[12px] font-medium text-text-secondary">Scope</label>
                    <select {...form.register("scope")} className="w-full h-9 bg-background border border-border rounded-md px-3 text-[13px] text-text-primary focus:outline focus:outline-2 focus:outline-accent outline-offset-0 transition-all">
                      {goalScopes.map((scope) => <option key={scope} value={scope}>{scope}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-medium text-text-secondary">Deadline</label>
                    <input type="date" {...form.register("deadline")} className="w-full h-9 bg-background border border-border rounded-md px-3 text-[13px] text-text-primary focus:outline focus:outline-2 focus:outline-accent outline-offset-0 transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[12px] font-medium text-text-secondary">Target</label>
                    <input type="number" min={1} {...form.register("target")} className="w-full h-9 bg-background border border-border rounded-md px-3 text-[13px] text-text-primary focus:outline focus:outline-2 focus:outline-accent outline-offset-0 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-medium text-text-secondary">Progress</label>
                    <input type="number" min={0} {...form.register("progress")} className="w-full h-9 bg-background border border-border rounded-md px-3 text-[13px] text-text-primary focus:outline focus:outline-2 focus:outline-accent outline-offset-0 transition-all" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] font-medium text-text-secondary">Notes (Optional)</label>
                  <textarea {...form.register("notes")} className="w-full h-20 bg-background border border-border rounded-md px-3 py-2 text-[13px] text-text-primary focus:outline focus:outline-2 focus:outline-accent outline-offset-0 placeholder:text-text-tertiary transition-all resize-none" placeholder="Context..." />
                </div>

                <button type="submit" className="w-full h-9 mt-2 bg-accent text-background rounded-md text-[13px] font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                  <Plus className="h-4 w-4" /> Save Goal
                </button>
              </form>
            </section>
          </motion.div>

          {/* RIGHT: Goal List */}
          <motion.div variants={staggerItem} className="flex flex-col gap-8">
            <section className="rounded-xl border border-border bg-surface p-6 shadow-card hover:border-border-hover transition-all duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-[14px] font-medium text-text-primary">Master List</h2>
                
                <div className="flex gap-4 text-[12px] font-medium text-text-tertiary">
                  {["all", ...goalScopes].map((scope) => (
                    <button 
                      key={scope}
                      onClick={() => setScopeFilter(scope as GoalScope | "all")}
                      className={`transition-colors pb-1 ${scopeFilter === scope ? "text-text-primary border-b border-accent" : "hover:text-text-primary"}`}
                    >
                      {scope === "all" ? "All" : scope}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative mb-6">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="text"
                  className="w-full h-9 bg-background border border-border rounded-md pl-9 pr-3 text-[13px] text-text-primary focus:outline focus:outline-2 focus:outline-accent outline-offset-0 placeholder:text-text-tertiary transition-all"
                  placeholder="Search goals..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <div className="flex flex-col border-t border-border">
                <AnimatePresence initial={false}>
                  {filteredGoals.length ? (
                    filteredGoals.map((goal) => {
                      const left = daysLeft(goal.deadline);
                      const overdue = isOverdue(goal);
                      const percent = Math.min((goal.progress / goal.target) * 100, 100);

                      return (
                        <motion.div
                          key={goal.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          onClick={() => router.push(`/goals/${goal.id}`)}
                          className="group flex flex-col py-5 border-b border-border last:border-0 cursor-pointer hover:bg-white/[0.02] -mx-2 px-2 rounded-md transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-1 min-w-0 pr-4 flex-1">
                              <div className="flex items-center justify-between w-full">
                                <span className="text-[14px] font-medium text-text-primary">{goal.title}</span>
                                <span className="text-[11px] font-medium uppercase tracking-wider text-text-tertiary shrink-0">
                                  {goal.completed ? "Done" : overdue ? "Overdue" : `${left}d`}
                                </span>
                              </div>
                              <span className="text-[12px] text-text-secondary">{goal.scope}</span>
                              
                              <div className="flex items-center gap-3 mt-3">
                                <div className="h-1.5 flex-1 bg-background rounded-full overflow-hidden border border-border">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${goal.completed ? "bg-text-secondary" : overdue ? "bg-destructive" : "bg-accent"}`}
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                                <span className="text-[11px] font-medium text-text-primary shrink-0 w-8">{Math.round(percent)}%</span>
                              </div>

                              {goal.notes && (
                                <p className="text-[11px] text-text-tertiary mt-3 italic border-l-2 border-border pl-2 line-clamp-2">
                                  {goal.notes}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex flex-col items-end gap-2 shrink-0 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={(e) => { e.stopPropagation(); updateGoal(goal.id, { progress: Math.min(goal.target, goal.progress + 1) }) }} className="text-[11px] font-medium text-text-secondary hover:text-accent">
                                +1 Progress
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); updateGoal(goal.id, { completed: !goal.completed }) }} className="text-[11px] font-medium text-text-secondary hover:text-text-primary">
                                {goal.completed ? "Reopen" : "Complete"}
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); removeGoal(goal.id) }} className="text-[11px] font-medium text-text-secondary hover:text-destructive">
                                Delete
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="py-12 text-center text-[13px] text-text-tertiary">No goals found.</div>
                  )}
                </AnimatePresence>
              </div>
            </section>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-[11px] text-destructive mt-1">{message}</p>;
}
