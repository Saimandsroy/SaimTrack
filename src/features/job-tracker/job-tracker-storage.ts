import { doc, getDoc, setDoc } from "firebase/firestore";
import type { JobApplication } from "@/features/job-tracker/job-tracker-types";
import { db } from "@/lib/firebase";

export async function loadJobApplications(userId: string): Promise<JobApplication[]> {
  if (!db || !userId) return [];
  try {
    const docRef = doc(db, "users", userId, "job-tracker", "state");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data().applications || [];
    }
  } catch (error) {
    console.error("Failed to load job applications from Firestore:", error);
  }
  return [];
}

export async function saveJobApplications(userId: string, applications: JobApplication[]) {
  if (!db || !userId) return;
  try {
    const docRef = doc(db, "users", userId, "job-tracker", "state");
    await setDoc(docRef, { applications }, { merge: true });
  } catch (error) {
    console.error("Failed to save job applications to Firestore:", error);
  }
}
