export const goalScopes = ["Monthly", "Quarterly", "Yearly"] as const;

export type GoalScope = (typeof goalScopes)[number];

export type Goal = {
  id: string;
  title: string;
  scope: GoalScope;
  target: number;
  progress: number;
  deadline: string;
  notes: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  milestones?: { id: string; title: string; completed: boolean }[];
};
