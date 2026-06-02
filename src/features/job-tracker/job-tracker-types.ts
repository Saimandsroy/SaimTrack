export const jobStatuses = [
  "Wishlist",
  "Applied",
  "OA Received",
  "OA Cleared",
  "Interview Scheduled",
  "Interview Completed",
  "Selected",
  "Rejected",
] as const;

export type JobStatus = (typeof jobStatuses)[number];

export type JobApplication = {
  id: string;
  companyName: string;
  role: string;
  applicationDate: string;
  link: string;
  status: JobStatus;
  notes: string;
};

export type JobView = "table" | "kanban";
