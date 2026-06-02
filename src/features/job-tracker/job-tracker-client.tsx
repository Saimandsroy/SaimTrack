"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { BriefcaseBusiness, ExternalLink, Kanban, List, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, type SelectHTMLAttributes } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import {
  countStatuses,
  formatApplicationDate,
  groupByStatus,
} from "@/features/job-tracker/job-tracker-utils";
import {
  jobStatuses,
  type JobApplication,
  type JobStatus,
  type JobView,
} from "@/features/job-tracker/job-tracker-types";
import {
  loadJobApplications,
  saveJobApplications,
} from "@/features/job-tracker/job-tracker-storage";
import { useAuth } from "@/features/auth/auth-context";

type JobFormValues = {
  companyName: string;
  role: string;
  applicationDate: string;
  link?: string;
  status: JobStatus;
  notes?: string;
};

const jobSchema = z.object({
  companyName: z.string().min(2, "Company name is required."),
  role: z.string().min(2, "Role is required."),
  applicationDate: z.string().min(1, "Pick a date."),
  link: z.string().url("Add a valid application link.").optional().or(z.literal("")),
  status: z.enum(jobStatuses),
  notes: z.string().max(500, "Keep notes under 500 characters.").default(""),
});

const statusTone: Record<JobStatus, string> = {
  Wishlist: "text-text-secondary",
  Applied: "text-text-primary",
  "OA Received": "text-accent",
  "OA Cleared": "text-accent",
  "Interview Scheduled": "text-accent font-medium",
  "Interview Completed": "text-accent font-medium",
  Selected: "text-text-primary font-bold",
  Rejected: "text-text-tertiary line-through",
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

export function JobTrackerClient() {
  const { user } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [view, setView] = useState<JobView>("table");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      companyName: "",
      role: "",
      applicationDate: new Date().toISOString().slice(0, 10),
      link: "",
      status: "Wishlist",
      notes: "",
    },
  });

  useEffect(() => {
    async function init() {
      if (!user) return;
      const stored = await loadJobApplications(user.uid);
      setApplications(stored);
      setHydrated(true);
    }
    init();
  }, [user]);

  const counts = useMemo(() => countStatuses(applications), [applications]);
  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return applications
      .filter((application) =>
        statusFilter === "all" ? true : application.status === statusFilter,
      )
      .filter((application) => {
        if (!normalized) return true;
        return [
          application.companyName,
          application.role,
          application.status,
          application.notes,
          application.link,
        ].some((value) => value.toLowerCase().includes(normalized));
      })
      .sort((left, right) => new Date(right.applicationDate).getTime() - new Date(left.applicationDate).getTime());
  }, [applications, search, statusFilter]);

  const grouped = useMemo(() => groupByStatus(filtered), [filtered]);

  function addApplication(values: JobFormValues) {
    const application: JobApplication = {
      id: crypto.randomUUID(),
      companyName: values.companyName,
      role: values.role,
      applicationDate: new Date(`${values.applicationDate}T09:00:00`).toISOString(),
      link: values.link ?? "",
      status: values.status,
      notes: values.notes ?? "",
    };

    const nextApps = [application, ...applications];
    setApplications(nextApps);
    if (user) saveJobApplications(user.uid, nextApps);

    form.reset({
      companyName: "",
      role: "",
      applicationDate: values.applicationDate,
      link: "",
      status: values.status,
      notes: "",
    });
    toast.success("Application saved.");
  }

  function handleUpdateStatus(id: string, status: JobStatus) {
    const nextApps = applications.map((app) => (app.id === id ? { ...app, status } : app));
    setApplications(nextApps);
    if (user) saveJobApplications(user.uid, nextApps);
  }

  function deleteApplication(id: string) {
    const nextApps = applications.filter((application) => application.id !== id);
    setApplications(nextApps);
    if (user) saveJobApplications(user.uid, nextApps);
    toast.success("Application removed.");
  }

  function resetWorkspace() {
    setApplications([]);
    if (user) saveJobApplications(user.uid, []);
    setSearch("");
    setStatusFilter("all");
    setView("table");
    toast.message("Job tracker cleared.");
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
            Job Applications
          </h1>
          <p className="mt-1 text-[15px] text-text-secondary">
            Manage your pipeline without the visual noise.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-medium text-text-secondary">{filtered.length} visible</span>
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
            <span className="text-[11px] text-text-tertiary uppercase tracking-widest font-medium mb-1">Total Pipeline</span>
            <span className="text-[28px] text-text-primary font-medium tracking-tight">{counts.total}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-accent uppercase tracking-widest font-medium mb-1">Interviews</span>
            <span className="text-[28px] text-text-primary font-medium tracking-tight">{counts.interviews}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-text-secondary uppercase tracking-widest font-medium mb-1">Offers</span>
            <span className="text-[28px] text-text-primary font-medium tracking-tight">{counts.offers}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-text-tertiary uppercase tracking-widest font-medium mb-1">Rejections</span>
            <span className="text-[28px] text-text-secondary font-medium tracking-tight">{counts.rejections}</span>
          </div>
        </motion.section>

        {/* ════════════ TWO COLUMN LAYOUT ════════════ */}
        <div className="grid grid-cols-1 xl:grid-cols-[0.8fr_1.2fr] gap-8">
          
          {/* LEFT: Add Application Form */}
          <motion.div variants={staggerItem} className="flex flex-col gap-8">
            <section className="rounded-xl border border-border bg-surface p-6 shadow-card hover:border-border-hover transition-all duration-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[14px] font-medium text-text-primary">New Application</h2>
              </div>

              <form className="space-y-4" onSubmit={form.handleSubmit(addApplication)}>
                <div className="space-y-2">
                  <label className="text-[12px] font-medium text-text-secondary">Company</label>
                  <input type="text" {...form.register("companyName")} className="w-full h-9 bg-background border border-border rounded-md px-3 text-[13px] text-text-primary focus:outline focus:outline-2 focus:outline-accent outline-offset-0 placeholder:text-text-tertiary transition-all" placeholder="Stripe" />
                  <FormError message={form.formState.errors.companyName?.message} />
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] font-medium text-text-secondary">Role</label>
                  <input type="text" {...form.register("role")} className="w-full h-9 bg-background border border-border rounded-md px-3 text-[13px] text-text-primary focus:outline focus:outline-2 focus:outline-accent outline-offset-0 placeholder:text-text-tertiary transition-all" placeholder="Software Engineer" />
                  <FormError message={form.formState.errors.role?.message} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[12px] font-medium text-text-secondary">Date</label>
                    <input type="date" {...form.register("applicationDate")} className="w-full h-9 bg-background border border-border rounded-md px-3 text-[13px] text-text-primary focus:outline focus:outline-2 focus:outline-accent outline-offset-0 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-medium text-text-secondary">Status</label>
                    <select {...form.register("status")} className="w-full h-9 bg-background border border-border rounded-md px-3 text-[13px] text-text-primary focus:outline focus:outline-2 focus:outline-accent outline-offset-0 transition-all">
                      {jobStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] font-medium text-text-secondary">Link (Optional)</label>
                  <input type="url" {...form.register("link")} className="w-full h-9 bg-background border border-border rounded-md px-3 text-[13px] text-text-primary focus:outline focus:outline-2 focus:outline-accent outline-offset-0 placeholder:text-text-tertiary transition-all" placeholder="https://..." />
                  <FormError message={form.formState.errors.link?.message} />
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] font-medium text-text-secondary">Notes (Optional)</label>
                  <textarea {...form.register("notes")} className="w-full h-20 bg-background border border-border rounded-md px-3 py-2 text-[13px] text-text-primary focus:outline focus:outline-2 focus:outline-accent outline-offset-0 placeholder:text-text-tertiary transition-all resize-none" placeholder="Referral details..." />
                </div>

                <button type="submit" className="w-full h-9 mt-2 bg-accent text-background rounded-md text-[13px] font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                  <Plus className="h-4 w-4" /> Save
                </button>
              </form>
            </section>
          </motion.div>

          {/* RIGHT: Pipeline */}
          <motion.div variants={staggerItem} className="flex flex-col gap-8">
            <section className="rounded-xl border border-border bg-surface p-6 shadow-card hover:border-border-hover transition-all duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-[14px] font-medium text-text-primary">Pipeline</h2>
                
                <div className="flex gap-4 text-[12px] font-medium text-text-tertiary">
                  <button 
                    onClick={() => setView("table")}
                    className={`transition-colors pb-1 ${view === "table" ? "text-text-primary border-b border-accent" : "hover:text-text-primary"}`}
                  >
                    Table
                  </button>
                  <button 
                    onClick={() => setView("kanban")}
                    className={`transition-colors pb-1 ${view === "kanban" ? "text-text-primary border-b border-accent" : "hover:text-text-primary"}`}
                  >
                    Kanban
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                  <input
                    type="text"
                    className="w-full h-9 bg-background border border-border rounded-md pl-9 pr-3 text-[13px] text-text-primary focus:outline focus:outline-2 focus:outline-accent outline-offset-0 placeholder:text-text-tertiary transition-all"
                    placeholder="Search company, role..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
                <select
                  className="h-9 w-full sm:w-48 bg-background border border-border rounded-md px-3 text-[13px] text-text-primary focus:outline focus:outline-2 focus:outline-accent outline-offset-0 transition-all"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as JobStatus | "all")}
                >
                  <option value="all">All Statuses</option>
                  {jobStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Views */}
              {view === "table" ? (
                <div className="flex flex-col border-t border-border">
                  <AnimatePresence initial={false}>
                    {filtered.length ? (
                      filtered.map((application) => (
                        <motion.div
                          key={application.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="group flex flex-col py-4 border-b border-border last:border-0"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-1 min-w-0 pr-4">
                              <div className="flex items-center gap-2">
                                <span className="text-[14px] font-medium text-text-primary">{application.companyName}</span>
                                {application.link && (
                                  <Link href={application.link} target="_blank" className="text-text-tertiary hover:text-accent">
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </Link>
                                )}
                              </div>
                              <span className="text-[12px] text-text-secondary">{application.role}</span>
                              {application.notes && (
                                <p className="text-[11px] text-text-tertiary mt-2 italic border-l-2 border-border pl-2 line-clamp-2">
                                  {application.notes}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-end shrink-0 gap-2">
                              <span className={`text-[11px] uppercase tracking-wider ${statusTone[application.status]}`}>
                                {application.status}
                              </span>
                              <div className="flex items-center gap-3">
                                <span className="text-[11px] text-text-tertiary">{formatApplicationDate(application.applicationDate)}</span>
                                <button onClick={() => deleteApplication(application.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-text-tertiary hover:text-destructive">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="py-12 text-center text-[13px] text-text-tertiary">No matching applications.</div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                  {grouped.map((column) => {
                    if (!column.items.length) return null;
                    return (
                      <div key={column.status} className="flex flex-col gap-3">
                        <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-widest text-text-tertiary mb-2">
                          <span>{column.status}</span>
                          <span>{column.items.length}</span>
                        </div>
                        {column.items.map((app) => (
                          <div key={app.id} className="group relative flex flex-col p-4 rounded-lg border border-border bg-background shadow-sm hover:border-border-hover transition-colors">
                            <div className="flex justify-between items-start">
                              <span className="text-[13px] font-medium text-text-primary">{app.companyName}</span>
                              <button onClick={() => deleteApplication(app.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-text-tertiary hover:text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <span className="text-[11px] text-text-secondary mt-1">{app.role}</span>
                            {app.link && (
                              <Link href={app.link} target="_blank" className="mt-3 text-[11px] font-medium text-accent hover:underline flex items-center gap-1">
                                Open Link <ExternalLink className="h-3 w-3" />
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
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
