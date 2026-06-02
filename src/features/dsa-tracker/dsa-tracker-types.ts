export const dsaTopics = [
  "Arrays",
  "Strings",
  "Linked List",
  "Queue",
  "Stack",
  "Trees",
  "BST",
  "Heap",
  "Graph",
  "DP",
  "Greedy",
  "Backtracking",
  "HashMap",
  "Binary Search",
] as const;

export const dsaPlatforms = [
  "LeetCode",
  "GeeksforGeeks",
  "CodeChef",
  "Codeforces",
  "HackerRank",
  "InterviewBit",
  "Other",
] as const;

export const dsaDifficulties = ["Easy", "Medium", "Hard"] as const;

export type DsaTopic = (typeof dsaTopics)[number];
export type DsaPlatform = (typeof dsaPlatforms)[number];
export type DsaDifficulty = (typeof dsaDifficulties)[number];

export type DsaProblem = {
  id: string;
  name: string;
  platform: DsaPlatform;
  difficulty: DsaDifficulty;
  topic: DsaTopic;
  solvedDate: string;
  notes: string;
  revisionRequired: boolean;
};

export type DsaPeriod = "today" | "week" | "month" | "total";
