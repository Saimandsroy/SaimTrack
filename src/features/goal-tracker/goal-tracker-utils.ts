import type { Goal, GoalScope } from "@/features/goal-tracker/goal-tracker-types";

export function formatGoalDeadline(dateString: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

export function getScopeProgress(goals: Goal[], scope: GoalScope) {
  const scopedGoals = goals.filter((goal) => goal.scope === scope);
  const total = scopedGoals.length;
  const completed = scopedGoals.filter((goal) => goal.completed).length;
  const overallProgress = total
    ? Math.round(
        scopedGoals.reduce((sum, goal) => sum + Math.min((goal.progress / goal.target) * 100, 100), 0) /
          total,
      )
    : 0;

  return {
    total,
    completed,
    overallProgress,
  };
}

export function isOverdue(goal: Goal) {
  return !goal.completed && new Date(goal.deadline).getTime() < Date.now();
}

export function daysLeft(dateString: string) {
  const deadline = new Date(dateString);
  deadline.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getGoalCompletionRate(goals: Goal[]) {
  if (!goals.length) {
    return 0;
  }

  return Math.round((goals.filter((goal) => goal.completed).length / goals.length) * 100);
}
