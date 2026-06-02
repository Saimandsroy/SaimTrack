"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  BookOpenText,
  CalendarDays,
  GraduationCap,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  BadgeCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { toast } from "sonner";
import { z } from "zod";

import {
  buildDifficultySplit,
  buildTopicProgress,
  filterProblems,
  formatSolvedDate,
  getTopTopic,
} from "@/features/dsa-tracker/dsa-tracker-utils";
import {
  dsaDifficulties,
  dsaPlatforms,
  dsaTopics,
  type DsaDifficulty,
  type DsaPeriod,
  type DsaPlatform,
  type DsaProblem,
  type DsaTopic,
} from "@/features/dsa-tracker/dsa-tracker-types";
import { loadDsaProblems, saveDsaProblems } from "@/features/dsa-tracker/dsa-tracker-storage";
import { useAuth } from "@/features/auth/auth-context";

type DsaFormValues = {
  name: string;
  platform: DsaPlatform;
  difficulty: DsaDifficulty;
  topic: DsaTopic;
  solvedDate: string;
  notes?: string;
  revisionRequired?: boolean;
};

const dsaSchema = z.object({
  name: z.string().min(2, "Add the question name."),
  platform: z.enum(dsaPlatforms),
  difficulty: z.enum(dsaDifficulties),
  topic: z.enum(dsaTopics),
  solvedDate: z.string().min(1, "Pick the solved date."),
  notes: z.string().max(500, "Keep notes under 500 characters.").default(""),
  revisionRequired: z.boolean().default(false),
});

const periods: DsaPeriod[] = ["today", "week", "month", "total"];

// Opacity-scaled Monochromatic Theme (Grayscale safe)
const difficultyColors: Record<DsaDifficulty, string> = {
  Easy: "rgba(203,163,101,0.2)",
  Medium: "rgba(203,163,101,0.6)",
  Hard: "#CBA365",
};

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

export function DsaTrackerClient() {
  const { user } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  const [problems, setProblems] = useState<DsaProblem[]>([]);
  const [period, setPeriod] = useState<DsaPeriod>("week");
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState<DsaTopic | "all">("all");

  const form = useForm<DsaFormValues>({
    resolver: zodResolver(dsaSchema),
    defaultValues: {
      name: "",
      platform: "LeetCode",
      difficulty: "Medium",
      topic: "Arrays",
      solvedDate: new Date().toISOString().slice(0, 10),
      notes: "",
      revisionRequired: true,
    },
  });

  useEffect(() => {
    async function init() {
      if (!user) return;
      const stored = await loadDsaProblems(user.uid);
      setProblems(stored);
      setHydrated(true);
    }
    init();
  }, [user]);

  const scopedProblems = useMemo(() => filterProblems(problems, period), [period, problems]);
  const totalCount = scopedProblems.length;
  const revisionCount = scopedProblems.filter((problem) => problem.revisionRequired).length;
  const solvedToday = filterProblems(problems, "today").length;
  const solvedWeek = filterProblems(problems, "week").length;

  const filteredProblems = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return scopedProblems
      .filter((problem) => topicFilter === "all" ? true : problem.topic === topicFilter)
      .filter((problem) => {
        if (!normalized) return true;
        return [problem.name, problem.platform, problem.difficulty, problem.topic, problem.notes]
          .some((value) => value.toLowerCase().includes(normalized));
      })
      .sort((left, right) => new Date(right.solvedDate).getTime() - new Date(left.solvedDate).getTime());
  }, [scopedProblems, search, topicFilter]);

  const topicProgress = buildTopicProgress(scopedProblems);
  const difficultySplit = buildDifficultySplit(scopedProblems);
  const topTopic = getTopTopic(scopedProblems);

  function addProblem(values: DsaFormValues) {
    const problem: DsaProblem = {
      id: crypto.randomUUID(),
      name: values.name,
      platform: values.platform,
      difficulty: values.difficulty,
      topic: values.topic,
      solvedDate: new Date(`${values.solvedDate}T09:00:00`).toISOString(),
      notes: values.notes ?? "",
      revisionRequired: Boolean(values.revisionRequired),
    };
    const nextProblems = [problem, ...problems];
    setProblems(nextProblems);
    if (user) saveDsaProblems(user.uid, nextProblems);

    form.reset({
      name: "",
      platform: values.platform,
      difficulty: values.difficulty,
      topic: values.topic,
      solvedDate: values.solvedDate,
      notes: "",
      revisionRequired: Boolean(values.revisionRequired),
    });
    toast.success("Problem saved.");
  }

  function deleteProblem(id: string) {
    const nextProblems = problems.filter((problem) => problem.id !== id);
    setProblems(nextProblems);
    if (user) saveDsaProblems(user.uid, nextProblems);
    toast.success("Problem removed.");
  }

  function resetWorkspace() {
    setProblems([]);
    if (user) saveDsaProblems(user.uid, []);
    setSearch("");
    setTopicFilter("all");
    setPeriod("week");
    toast.message("DSA workspace cleared.");
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
            DSA Tracker
          </h1>
          <p className="mt-1 text-[15px] text-text-secondary">
            Log solved questions, analyze topic spread, and manage revisions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-medium text-text-secondary">{totalCount} in scope</span>
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
        
        {/* ════════════ TWO COLUMN LAYOUT ════════════ */}
        <div className="grid grid-cols-1 xl:grid-cols-[0.8fr_1.2fr] gap-8">
          
          {/* LEFT: Add Problem Form */}
          <motion.div variants={staggerItem} className="flex flex-col gap-8">
            <section className="rounded-xl border border-border bg-surface p-6 shadow-card hover:border-border-hover transition-all duration-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[14px] font-medium text-text-primary">Add Solved Problem</h2>
              </div>

              <form className="space-y-4" onSubmit={form.handleSubmit(addProblem)}>
                <div className="space-y-2">
                  <label className="text-[12px] font-medium text-text-secondary">Question Name</label>
                  <input type="text" {...form.register("name")} className="w-full h-9 bg-background border border-border rounded-md px-3 text-[13px] text-text-primary focus:outline focus:outline-2 focus:outline-accent outline-offset-0 placeholder:text-text-tertiary transition-all" placeholder="Two Sum" />
                  <FormError message={form.formState.errors.name?.message} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[12px] font-medium text-text-secondary">Platform</label>
                    <select {...form.register("platform")} className="w-full h-9 bg-background border border-border rounded-md px-3 text-[13px] text-text-primary focus:outline focus:outline-2 focus:outline-accent outline-offset-0 transition-all">
                      {dsaPlatforms.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-medium text-text-secondary">Difficulty</label>
                    <select {...form.register("difficulty")} className="w-full h-9 bg-background border border-border rounded-md px-3 text-[13px] text-text-primary focus:outline focus:outline-2 focus:outline-accent outline-offset-0 transition-all">
                      {dsaDifficulties.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[12px] font-medium text-text-secondary">Topic</label>
                    <select {...form.register("topic")} className="w-full h-9 bg-background border border-border rounded-md px-3 text-[13px] text-text-primary focus:outline focus:outline-2 focus:outline-accent outline-offset-0 transition-all">
                      {dsaTopics.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-medium text-text-secondary">Solved Date</label>
                    <input type="date" {...form.register("solvedDate")} className="w-full h-9 bg-background border border-border rounded-md px-3 text-[13px] text-text-primary focus:outline focus:outline-2 focus:outline-accent outline-offset-0 transition-all" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] font-medium text-text-secondary">Notes (Optional)</label>
                  <textarea {...form.register("notes")} className="w-full h-20 bg-background border border-border rounded-md px-3 py-2 text-[13px] text-text-primary focus:outline focus:outline-2 focus:outline-accent outline-offset-0 placeholder:text-text-tertiary transition-all resize-none" placeholder="Short observation or pattern idea" />
                </div>

                <label className="flex items-center gap-3 py-2">
                  <input type="checkbox" {...form.register("revisionRequired")} className="h-4 w-4 rounded border-border text-accent focus:ring-accent" />
                  <span className="text-[13px] text-text-secondary">Mark for future revision</span>
                </label>

                <button type="submit" className="w-full h-9 mt-2 bg-accent text-background rounded-md text-[13px] font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                  <Plus className="h-4 w-4" /> Save Problem
                </button>
              </form>
            </section>
          </motion.div>

          {/* RIGHT: Analytics & Logs */}
          <motion.div variants={staggerItem} className="flex flex-col gap-8">
            
            <section className="rounded-xl border border-border bg-surface p-6 shadow-card hover:border-border-hover transition-all duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <h2 className="text-[14px] font-medium text-text-primary">Progress Analytics</h2>
                
                <div className="flex gap-4 text-[12px] font-medium text-text-tertiary">
                  {periods.map((p) => (
                    <button 
                      key={p} 
                      onClick={() => setPeriod(p)}
                      className={`transition-colors pb-1 ${period === p ? "text-text-primary border-b border-accent" : "hover:text-text-primary"}`}
                    >
                      {p === "total" ? "Lifetime" : p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-2">
                {/* Difficulty Pie Chart */}
                <div className="flex flex-col">
                  <h3 className="text-[12px] font-medium uppercase tracking-[0.06em] text-text-tertiary mb-4">Difficulty Split</h3>
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                        <Pie data={difficultySplit} innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value" nameKey="name">
                          {difficultySplit.map((entry) => (
                            <Cell key={entry.name} fill={difficultyColors[entry.name as DsaDifficulty]} stroke="rgba(255,255,255,0.06)" />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid rgba(255,255,255,0.10)", background: "#1A1A1E", color: "#F2F2F3", boxShadow: "0 8px 24px rgba(0,0,0,0.5)", fontSize: "12px", padding: "8px 12px" }} itemStyle={{ color: "#F2F2F3" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Topic Bar Chart */}
                <div className="flex flex-col">
                  <h3 className="text-[12px] font-medium uppercase tracking-[0.06em] text-text-tertiary mb-4">Topic Spread</h3>
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topicProgress.slice(0, 5)} layout="vertical" margin={{ left: -10, right: 0, top: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="0" horizontal={false} stroke="rgba(255,255,255,0.04)" />
                        <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "#505055", fontSize: 10 }} />
                        <YAxis type="category" dataKey="topic" width={80} tickLine={false} axisLine={false} tick={{ fill: "#8A8A8F", fontSize: 11 }} />
                        <Tooltip cursor={{ fill: "rgba(255,255,255,0.02)" }} contentStyle={{ borderRadius: "8px", border: "1px solid rgba(255,255,255,0.10)", background: "#1A1A1E", color: "#F2F2F3", boxShadow: "0 8px 24px rgba(0,0,0,0.5)", fontSize: "12px", padding: "8px 12px" }} itemStyle={{ color: "#CBA365" }} />
                        <Bar dataKey="solved" fill="#CBA365" radius={[0, 4, 4, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-surface p-6 shadow-card hover:border-border-hover transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[14px] font-medium text-text-primary">Problem Log</h2>
                <div className="flex gap-2 text-[11px] font-medium">
                  <span className="text-warning bg-warning/10 px-2 py-0.5 rounded border border-warning/20">{revisionCount} Revision</span>
                  <span className="text-text-secondary bg-surface-raised px-2 py-0.5 rounded border border-border">{filteredProblems.length} Total</span>
                </div>
              </div>

              {/* Dense List View */}
              <div className="flex flex-col">
                <AnimatePresence initial={false}>
                  {filteredProblems.length ? (
                    filteredProblems.slice(0, 10).map((problem) => (
                      <motion.div
                        key={problem.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="group flex flex-col py-3 border-b border-border last:border-0"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex flex-col gap-1 min-w-0 pr-4">
                            <div className="flex items-center gap-2">
                              {problem.revisionRequired && <div className="h-1.5 w-1.5 rounded-full bg-warning shrink-0" title="Needs Revision" />}
                              <span className="text-[13px] font-medium text-text-primary truncate">{problem.name}</span>
                            </div>
                            <span className="text-[11px] text-text-secondary truncate">
                              {problem.platform} · <span className={
                                problem.difficulty === "Easy" ? "text-text-secondary" : 
                                problem.difficulty === "Medium" ? "text-accent" : "text-destructive"
                              }>{problem.difficulty}</span> · {problem.topic}
                            </span>
                            {problem.notes && (
                              <p className="text-[11px] text-text-tertiary mt-1 italic truncate border-l-2 border-border pl-2">
                                &quot;{problem.notes}&quot;
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end shrink-0 gap-2">
                            <span className="text-[10px] uppercase tracking-wider text-text-tertiary">
                              {formatSolvedDate(problem.solvedDate)}
                            </span>
                            <button onClick={() => deleteProblem(problem.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-text-tertiary hover:text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-8 text-center flex flex-col items-center text-[12px] text-text-tertiary">
                      <BookOpenText className="h-8 w-8 mb-3 opacity-50" />
                      No DSA problems logged yet.
                    </div>
                  )}
                </AnimatePresence>
                {filteredProblems.length > 10 && <div className="pt-3 text-[12px] text-accent text-center cursor-pointer">View all ({filteredProblems.length}) →</div>}
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
