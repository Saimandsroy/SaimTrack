import { toDateInputValue } from "@/features/time-tracker/time-tracker-utils";
import type { TimeEntry } from "@/features/time-tracker/time-tracker-types";
import type { DsaProblem } from "@/features/dsa-tracker/dsa-tracker-types";
import type { JobApplication as JobApp } from "@/features/job-tracker/job-tracker-types";
import type { HabitLog } from "@/features/habit-tracker/habit-tracker-types";

function generateMockTimeState(): { entries: TimeEntry[] } {
  const entries: TimeEntry[] = [];
  let currentId = 1;
  const today = new Date();
  
  // We need ~188 hours total. 
  // Let's do 4 hours a day for the past 40 days, and 5 hours for the past 7 days.
  for (let i = 47; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = toDateInputValue(d);
    
    // Add 4 hours
    entries.push({
      id: String(currentId++),
      date: dateStr,
      duration: 4 * 3600000,
      title: "Deep Work",
      category: "Development",
      startTime: "09:00",
      endTime: "13:00"
    });
  }
  
  return { entries };
}

function generateMockDsaProblems(): DsaProblem[] {
  const problems: DsaProblem[] = [];
  const topics = ["Arrays & Hashing", "Two Pointers", "Sliding Window", "Stack", "Binary Search", "Linked List", "Trees", "Tries", "Heap / Priority Queue", "Backtracking", "Graphs", "1-D DP", "2-D DP", "Greedy", "Intervals", "Math & Geometry", "Bit Manipulation"];
  const difficulties = ["Easy", "Medium", "Hard"];
  const today = new Date();
  
  for (let i = 1; i <= 323; i++) {
    const topic = topics[i % topics.length];
    const difficulty = i % 5 === 0 ? "Hard" : (i % 2 === 0 ? "Medium" : "Easy");
    
    const solvedDate = new Date(today);
    solvedDate.setDate(solvedDate.getDate() - Math.floor(Math.random() * 100)); // random date in past 100 days
    
    problems.push({
      id: `mock-prob-${i}`,
      name: `LeetCode Problem ${i}`,
      platform: "LeetCode" as const,
      difficulty: difficulty as DsaProblem["difficulty"],
      topic: topic as DsaProblem["topic"],
      solvedDate: toDateInputValue(solvedDate),
      notes: "",
      revisionRequired: false
    });
  }
  return problems;
}

function generateMockJobApplications(): JobApp[] {
  return [
    {
      id: "job-1", companyName: "Google", role: "Software Engineer L3", status: "Interview Scheduled", link: "", notes: "Onsite next week", applicationDate: "2024-01-15"
    },
    {
      id: "job-2", companyName: "Stripe", role: "Backend Engineer", status: "Interview Scheduled", link: "", notes: "System design round", applicationDate: "2024-01-20"
    },
    {
      id: "job-3", companyName: "Meta", role: "Frontend Engineer", status: "OA Cleared", link: "", notes: "", applicationDate: "2024-01-22"
    },
    {
      id: "job-4", companyName: "Netflix", role: "Software Engineer", status: "Selected", link: "", notes: "Offer received!", applicationDate: "2024-01-10"
    },
    {
      id: "job-5", companyName: "Apple", role: "SWE", status: "Applied", link: "", notes: "", applicationDate: "2024-02-01"
    },
    {
      id: "job-6", companyName: "Amazon", role: "SDE I", status: "Applied", link: "", notes: "", applicationDate: "2024-02-05"
    }
  ];
}

function generateMockHabitState(): { habits: unknown[]; logs: HabitLog[] } {
  const habits = [
    { id: "h1", name: "Gym", category: "Fitness", createdAt: "2023-01-01T00:00:00.000Z" },
    { id: "h2", name: "Read 10 pages", category: "Mind", createdAt: "2023-01-01T00:00:00.000Z" },
    { id: "h3", name: "LeetCode Daily", category: "Career", createdAt: "2023-01-01T00:00:00.000Z" }
  ];
  const logs: HabitLog[] = [];
  const today = new Date();
  
  // 100 day streak
  for (let i = 100; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = toDateInputValue(d);
    
    logs.push({ id: `log-h1-${dateStr}`, habitId: "h1", date: dateStr, completed: true });
    logs.push({ id: `log-h2-${dateStr}`, habitId: "h2", date: dateStr, completed: true });
    logs.push({ id: `log-h3-${dateStr}`, habitId: "h3", date: dateStr, completed: true });
  }
  
  return { habits, logs };
}

export const mockTimeState = generateMockTimeState();
export const mockDsaProblems = generateMockDsaProblems();
export const mockJobs = generateMockJobApplications();
export const mockHabits = generateMockHabitState();
