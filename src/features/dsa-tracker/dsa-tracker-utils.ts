import {
  dsaTopics,
  type DsaDifficulty,
  type DsaPeriod,
  type DsaProblem,
  type DsaTopic,
} from "@/features/dsa-tracker/dsa-tracker-types";

export function formatSolvedDate(dateString: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

export function getPeriodStart(period: DsaPeriod, now = new Date()) {
  const date = new Date(now);
  if (period === "today") {
    date.setHours(0, 0, 0, 0);
  } else if (period === "week") {
    const day = date.getDay();
    const offset = day === 0 ? 6 : day - 1;
    date.setDate(date.getDate() - offset);
    date.setHours(0, 0, 0, 0);
  } else if (period === "month") {
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
  }

  return date;
}

export function isInPeriod(dateValue: string, period: DsaPeriod) {
  if (period === "total") {
    return true;
  }

  return new Date(dateValue) >= getPeriodStart(period);
}

export function filterProblems(problems: DsaProblem[], period: DsaPeriod) {
  return problems.filter((problem) => isInPeriod(problem.solvedDate, period));
}

export function buildTopicProgress(problems: DsaProblem[]) {
  const solvedByTopic = new Map<DsaTopic, number>();
  for (const problem of problems) {
    solvedByTopic.set(problem.topic, (solvedByTopic.get(problem.topic) ?? 0) + 1);
  }

  return dsaTopics.map((topic) => ({
    topic,
    solved: solvedByTopic.get(topic) ?? 0,
  }));
}

export function buildDifficultySplit(problems: DsaProblem[]) {
  const counts = new Map<DsaDifficulty, number>([
    ["Easy", 0],
    ["Medium", 0],
    ["Hard", 0],
  ]);

  for (const problem of problems) {
    counts.set(problem.difficulty, (counts.get(problem.difficulty) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
}

export function getTopTopic(problems: DsaProblem[]) {
  const totals = buildTopicProgress(problems);
  return totals.reduce(
    (winner, entry) => (entry.solved > winner.solved ? entry : winner),
    totals[0] ?? { topic: "Arrays", solved: 0 },
  );
}
