"use client";

import { motion } from "framer-motion";
import { ChevronLeft, Trophy, Target, CalendarDays, Award, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/features/auth/auth-context";
import { loadGoals } from "@/features/goal-tracker/goal-tracker-storage";
import type { Goal } from "@/features/goal-tracker/goal-tracker-types";
import { formatDate } from "@/features/time-tracker/time-tracker-utils";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
};
const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const } }
};

export default function CompletedGoalsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    async function init() {
      if (!user) return;
      const stored = await loadGoals(user.uid);
      setGoals(stored);
      setHydrated(true);
    }
    init();
  }, [user]);

  const completedGoals = goals.filter(g => g.completed).sort((a, b) => {
    const timeA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
    const timeB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
    return timeB - timeA; // Newest completed first
  });

  const activeCount = goals.length - completedGoals.length;
  const completionRate = goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0;

  // Calculate average completion time in days
  let avgDays = 0;
  if (completedGoals.length > 0) {
    let totalDays = 0;
    let validCount = 0;
    completedGoals.forEach(g => {
      if (g.createdAt && g.completedAt) {
        const ms = new Date(g.completedAt).getTime() - new Date(g.createdAt).getTime();
        totalDays += ms / (1000 * 60 * 60 * 24);
        validCount++;
      }
    });
    if (validCount > 0) avgDays = Math.round(totalDays / validCount);
  }

  if (!hydrated) {
    return (
      <div className="space-y-6 pb-16">
        <div className="h-10 w-48 bg-surface animate-pulse rounded" />
        <div className="h-[200px] w-full bg-surface animate-pulse rounded-xl border border-border" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 pb-16">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col gap-4">
        <Link href="/goals" className="inline-flex items-center gap-2 text-[13px] font-medium text-text-tertiary hover:text-text-primary transition-colors w-fit">
          <ChevronLeft className="h-4 w-4" /> Back to Active Goals
        </Link>
        <div>
          <h1 className="text-[28px] font-medium tracking-tight text-text-primary">Trophy Room</h1>
          <p className="mt-1 text-[15px] text-text-secondary">An archive of your completed goals and achievements. Never deleted.</p>
        </div>
      </motion.div>

      {/* Analytics Summary */}
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Completed Goals", value: completedGoals.length, icon: Trophy, color: "text-accent" },
          { label: "Active Goals", value: activeCount, icon: Target, color: "text-text-primary" },
          { label: "Completion Rate", value: `${completionRate}%`, icon: Award, color: "text-success" },
          { label: "Avg. Time to Finish", value: `${avgDays} Days`, icon: Clock, color: "text-[#CBA365]" },
        ].map((stat, i) => (
          <motion.div key={i} variants={staggerItem} className="bg-surface border border-border rounded-xl p-5 flex flex-col justify-between hover:border-border-hover transition-colors">
            <div className="flex items-center justify-between text-text-tertiary mb-3">
              <span className="text-[12px] font-medium uppercase tracking-wider">{stat.label}</span>
              <stat.icon className="h-4 w-4" />
            </div>
            <span className={`text-[24px] font-semibold tracking-tight ${stat.color}`}>{stat.value}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Grid of Completed Goals */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {completedGoals.map((goal) => (
            <div 
              key={goal.id} 
              onClick={() => router.push(`/goals/${goal.id}`)}
              className="group bg-surface rounded-xl border border-border p-6 shadow-sm hover:border-accent/50 hover:shadow-[0_0_20px_rgba(var(--accent-rgb),0.05)] cursor-pointer transition-all duration-300 flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="h-10 w-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-accent" />
                </div>
                <span className="text-[11px] font-medium text-text-tertiary bg-surface-raised px-2 py-0.5 rounded border border-border uppercase tracking-wider">
                  {goal.scope}
                </span>
              </div>
              
              <h3 className="text-[16px] font-medium text-text-primary mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                {goal.title}
              </h3>
              
              <p className="text-[13px] text-text-tertiary line-clamp-2 mb-6 flex-1">
                {goal.notes || "No additional notes."}
              </p>
              
              <div className="pt-4 border-t border-border flex items-center justify-between text-[12px] text-text-secondary">
                <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> Achieved</span>
                <span className="font-medium text-text-primary">{goal.completedAt ? formatDate(goal.completedAt) : "Unknown Date"}</span>
              </div>
            </div>
          ))}
        </div>
        
        {completedGoals.length === 0 && (
          <div className="bg-surface border border-border border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-surface-raised flex items-center justify-center mb-4">
              <Trophy className="h-6 w-6 text-text-tertiary opacity-50" />
            </div>
            <h3 className="text-[15px] font-medium text-text-primary mb-1">No Completed Goals Yet</h3>
            <p className="text-[13px] text-text-secondary max-w-sm">
              Keep pushing forward! When you mark an active goal as complete, it will be immortalized here forever.
            </p>
            <Link href="/goals" className="mt-6 h-9 px-5 rounded-md bg-accent text-background hover:opacity-90 inline-flex items-center text-[13px] font-semibold transition-opacity">
              Go to Active Goals
            </Link>
          </div>
        )}
      </motion.div>

    </div>
  );
}
