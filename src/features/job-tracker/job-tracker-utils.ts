import type { JobApplication, JobStatus } from "@/features/job-tracker/job-tracker-types";

export function formatApplicationDate(dateString: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

export function isInterviewStatus(status: JobStatus) {
  return status === "Interview Scheduled" || status === "Interview Completed";
}

export function isOfferStatus(status: JobStatus) {
  return status === "Selected";
}

export function isRejectionStatus(status: JobStatus) {
  return status === "Rejected";
}

export function countStatuses(applications: JobApplication[]) {
  return {
    total: applications.length,
    interviews: applications.filter((application) => isInterviewStatus(application.status)).length,
    offers: applications.filter((application) => isOfferStatus(application.status)).length,
    rejections: applications.filter((application) => isRejectionStatus(application.status)).length,
  };
}

export function groupByStatus(applications: JobApplication[]) {
  const statuses: JobStatus[] = [
    "Wishlist",
    "Applied",
    "OA Received",
    "OA Cleared",
    "Interview Scheduled",
    "Interview Completed",
    "Selected",
    "Rejected",
  ];

  return statuses.map((status) => ({
    status,
    items: applications.filter((application) => application.status === status),
  }));
}
