import { doc, getDoc, setDoc } from "firebase/firestore";
import type { HabitTrackerState } from "@/features/habit-tracker/habit-tracker-types";
import { db } from "@/lib/firebase";

export async function loadHabitTrackerState(userId: string): Promise<HabitTrackerState> {
  if (!db || !userId) return { habits: [], logs: [] };
  try {
    const docRef = doc(db, "users", userId, "habit-tracker", "state");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as HabitTrackerState;
    }
  } catch (error) {
    console.error("Failed to load habit tracker from Firestore:", error);
  }
  return { habits: [], logs: [] };
}

export async function saveHabitTrackerState(userId: string, state: HabitTrackerState) {
  if (!db || !userId) return;
  try {
    const docRef = doc(db, "users", userId, "habit-tracker", "state");
    await setDoc(docRef, state, { merge: true });
  } catch (error) {
    console.error("Failed to save habit tracker to Firestore:", error);
  }
}
