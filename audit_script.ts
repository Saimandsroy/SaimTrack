import fs from "fs";
import path from "path";

// Helper function definitions exactly as they are in the codebase
type TimeTrackerPeriod = "today" | "week" | "month" | "year" | "lifetime";

function getPeriodStart(period: TimeTrackerPeriod, now = new Date()) {
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
  } else if (period === "year") {
    date.setMonth(0, 1);
    date.setHours(0, 0, 0, 0);
  } else {
    date.setFullYear(1970, 0, 1);
    date.setHours(0, 0, 0, 0);
  }
  return date;
}

function isWithinPeriod(dateValue: string, period: TimeTrackerPeriod) {
  if (period === "lifetime") return true;
  const entryDate = new Date(dateValue);
  return entryDate >= getPeriodStart(period);
}

function filterEntries(entries: any[], period: TimeTrackerPeriod) {
  return entries.filter((entry) => isWithinPeriod(entry.date, period));
}

function sumDuration(entries: any[]) {
  return entries.reduce((total, entry) => total + entry.duration, 0);
}

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((v) => String(v).padStart(2, "0")).join(":");
}

function runAudit() {
  const filePath = path.join(process.cwd(), "audit_data.json");
  if (!fs.existsSync(filePath)) {
    console.error("audit_data.json not found! Please run the extraction first.");
    return;
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const entries = data.state.entries || [];
  
  console.log("========================================");
  console.log(`TOTAL SESSIONS FOUND: ${entries.length}`);
  console.log("========================================");

  let missingEnd = 0;
  let missingStart = 0;
  let zeroDuration = 0;
  let negativeDuration = 0;
  let corruptedTimestamps = 0;
  let duplicates = 0;
  const ids = new Set();

  entries.forEach((entry: any) => {
    if (!entry.startTime) missingStart++;
    if (!entry.endTime) missingEnd++;
    if (entry.duration === 0) zeroDuration++;
    if (entry.duration < 0) negativeDuration++;
    if (isNaN(new Date(entry.startTime).getTime()) || isNaN(new Date(entry.endTime).getTime())) {
      corruptedTimestamps++;
    }
    if (ids.has(entry.id)) duplicates++;
    ids.add(entry.id);
  });

  console.log("\n--- DATA INTEGRITY REPORT ---");
  console.log(`Missing Start Times: ${missingStart}`);
  console.log(`Missing End Times: ${missingEnd}`);
  console.log(`Zero Durations: ${zeroDuration}`);
  console.log(`Negative Durations: ${negativeDuration}`);
  console.log(`Corrupted Timestamps: ${corruptedTimestamps}`);
  console.log(`Duplicate IDs: ${duplicates}`);

  console.log("\n--- AGGREGATION TOTALS ---");
  
  const periods: TimeTrackerPeriod[] = ["today", "week", "month", "year", "lifetime"];
  periods.forEach(p => {
    const filtered = filterEntries(entries, p);
    const sum = sumDuration(filtered);
    const hours = (sum / 36e5).toFixed(2);
    console.log(`${p.toUpperCase().padEnd(10)} : ${hours} hours | ${formatDuration(sum)}`);
  });

  console.log("\n--- DASHBOARD DISCREPANCY ANALYSIS ---");
  console.log("The Dashboard defaults to 'Weekly' view.");
  const weekSum = sumDuration(filterEntries(entries, "week"));
  const lifeSum = sumDuration(filterEntries(entries, "lifetime"));
  
  console.log(`Weekly Display : ${(weekSum / 36e5).toFixed(2)} hours`);
  console.log(`Actual Total   : ${(lifeSum / 36e5).toFixed(2)} hours`);
  console.log(`Difference     : ${((lifeSum - weekSum) / 36e5).toFixed(2)} hours`);
  
  console.log("\nAudit script complete.");
}

runAudit();
