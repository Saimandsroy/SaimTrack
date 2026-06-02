import { doc, getDoc, setDoc } from "firebase/firestore";
import type { Goal } from "@/features/goal-tracker/goal-tracker-types";
import { db } from "@/lib/firebase";

const STORAGE_KEY = "careeros.goal-tracker.v1";

export async function loadGoals(userId: string): Promise<Goal[]> {
  if (!db || !userId) return [];
  
  try {
    const docRef = doc(db, "users", userId, "goal-tracker", "state");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return Array.isArray(data.goals) ? (data.goals as Goal[]) : [];
    }
  } catch (error) {
    console.error("Failed to load goals from Firestore:", error);
  }
  
  return [];
}

export async function saveGoals(userId: string, goals: Goal[]) {
  if (!db || !userId) return;
  
  try {
    const docRef = doc(db, "users", userId, "goal-tracker", "state");
    await setDoc(docRef, { goals }, { merge: true });
  } catch (error) {
    console.error("Failed to save goals to Firestore:", error);
  }
}
